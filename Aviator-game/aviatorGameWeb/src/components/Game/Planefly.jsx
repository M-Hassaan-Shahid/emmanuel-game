import { useState, useEffect, useRef } from "react";
import socket from "../../services/socket";
import soundManager from "../../services/soundManager";
import { updateBalance, getUserId } from "../../services/userService";
import { toast } from "react-toastify";
import "./../../assets/styles/Game.css";

function AviatorGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  // Outside the animation loop (declare refs once)
  const descentStartRef = useRef(null);

  const descentCompleteRef = useRef(false);
  const introCompletedRef = useRef(false); // Add this with other refs
  const [betAmount, setBetAmount] = useState(5);
  const [betAmount2, setBetAmount2] = useState(5);
  const [multiplier, setMultiplier] = useState("1.00");
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [isBetPlaced2, setIsBetPlaced2] = useState(false);
  const [, setIsBettingOpen] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [winnings2, setWinnings2] = useState(0);
  const [cashOutMultiplier, setCashOutMultiplier] = useState("");
  const [cashOutMultiplier2, setCashOutMultiplier2] = useState("");
  const [betId1, setBetId1] = useState(null);
  const [betId2, setBetId2] = useState(null);

  // Auto-bet states
  const [isAutoBet, setIsAutoBet] = useState(false);
  const [isAutoBet2, setIsAutoBet2] = useState(false);
  const [autoCashOutMultiplier, setAutoCashOutMultiplier] = useState(2.0);
  const [autoCashOutMultiplier2, setAutoCashOutMultiplier2] = useState(2.0);
  const [planePosition, setPlanePosition] = useState({
    x: 0,
    y: 0,
    rotation: 0,
  });
  const [showPlane, setShowPlane] = useState(false);
  const [gameStatus, setGameStatus] = useState("WAITING");
  const [gameSettings, setGameSettings] = useState({
    minBetAmount: 1,
    maxBetAmount: 10000,
    gameStatus: 1,
  });

  // Animation state
  const animationIdRef = useRef(null);
  const tickRefRef = useRef(0);
  const payoutRef = useRef(1.0);
  const ontoCornerRef = useRef(0);
  const planeXRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const gameStatusRef = useRef("WAITING");
  const crashPointRef = useRef(0);
  const hoverTimeRef = useRef(0); // For hover animation timing

  // Intro animation states
  const introPhaseRef = useRef(false); // Changed to ref for synchronous updates
  const introProgressRef = useRef(0);
  const previousAmplitudeRef = useRef(1); // Track previous amplitude for multiplier calculation

  // Crash sound effect
  const crashSoundRef = useRef(null);
  // Applause sound effect for wins
  const applauseSoundRef = useRef(null);

  // Cleanup function to stop all sounds
  const stopAllSounds = () => {
    if (applauseSoundRef.current && !applauseSoundRef.current.paused) {
      applauseSoundRef.current.pause();
      applauseSoundRef.current.currentTime = 0;
    }
    if (crashSoundRef.current && !crashSoundRef.current.paused) {
      crashSoundRef.current.pause();
      crashSoundRef.current.currentTime = 0;
    }
  };

  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 630 });
  const [scale, setScale] = useState(1); // Scale factor for responsive sizing

  // Moving stars background state
  const starsRef = useRef([]);
  const starsInitialized = useRef(false);

  // ============================================
  // ARC CURVE CONFIGURATION
  // ============================================

  // Arc Curve Shape
  const [arcCurveFactor] = useState(0.0007); // Curve steepness (higher = steeper curve)
  const [arcCurvePower] = useState(1.9); // Curve power (affects curve acceleration)

  // Arc Curve Size
  const [arcWidthMultiplier] = useState(0.65); // Arc width scale (0.5 = 50% of canvas width)
  const [arcHeightMultiplier] = useState(1.0); // Arc height scale (1.0 = 100%)

  // Arc Curve Position (Padding from edges)
  const [arcPaddingPercent] = useState(0.02); // Padding as percentage of canvas (0.02 = 2%)
  const [arcMinPadding] = useState(20); // Minimum padding in pixels

  // Arc Curve Line Style
  const [arcLineWidth] = useState(4); // Thickness of the arc line

  // Arc Hover Animation (Pulsing Effect)
  const [arcHoverEnabled] = useState(true); // Enable/disable hover animation
  const [arcHoverAmplitude] = useState(0.03); // Pulse size (0.015 = 1.5% change)
  const [arcHoverSpeed] = useState(0.03); // Pulse speed (higher = faster)

  // ============================================
  // PLANE CONFIGURATION
  // ============================================

  // Plane Size (responsive based on screen width)
  const [planeWidth] = useState(window.innerWidth < 768 ? 500 : 275); // Mobile: 150px, Desktop: 275px
  const [planeHeight, setPlaneHeight] = useState(0); // Auto-calculated from image ratio

  // Plane Movement Speed
  const [planeSpeed] = useState(3); // Horizontal speed in pixels per frame

  // Plane Position Offset (fine-tune plane position on the curve)
  const [planeOffsetX] = useState(90); // Horizontal offset from curve position
  const [planeOffsetY] = useState(-50); // Vertical offset from curve position

  // Build ARC_CONFIG
  const ARC_CONFIG = {
    paddingPercent: arcPaddingPercent,
    minPadding: arcMinPadding,
    widthMultiplier: arcWidthMultiplier,
    heightMultiplier: arcHeightMultiplier,
    curveFactor: arcCurveFactor,
    curvePower: arcCurvePower,
    lineWidth: arcLineWidth,
    hoverEnabled: arcHoverEnabled,
    hoverAmplitude: arcHoverAmplitude,
    hoverSpeed: arcHoverSpeed,
  };

  const planeImageRef = useRef(null);

  // Load plane image and calculate height
  useEffect(() => {
    const img = new Image();
    img.src = "/plane.gif";
    img.onload = () => {
      planeImageRef.current = img;
      // Calculate plane height based on image aspect ratio if not set
      if (planeHeight === 0) {
        const calculatedHeight = (img.height / img.width) * planeWidth;
        setPlaneHeight(calculatedHeight);
      }
    };

    // Initialize crash sound
    crashSoundRef.current = new Audio("/crash.mp3");
    crashSoundRef.current.preload = "auto";
    crashSoundRef.current.load();
    soundManager.register("crashSound", crashSoundRef.current, "sound");

    // Initialize applause sound
    applauseSoundRef.current = new Audio("/applause.mp3");
    applauseSoundRef.current.preload = "auto";
    applauseSoundRef.current.load();
    soundManager.register("applauseSound", applauseSoundRef.current, "sound");

    console.log("Crash sound initialized:", crashSoundRef.current);
    console.log("Applause sound initialized:", applauseSoundRef.current);

    // Cleanup on component unmount
    return () => {
      stopAllSounds();
    };
  }, [planeWidth, planeHeight]);

  // Stop sounds when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopAllSounds();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllSounds();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopAllSounds();
      // Unregister sounds from sound manager
      soundManager.unregister("crashSound");
      soundManager.unregister("applauseSound");
    };
  }, []);

  // Curve function for arc path
  const curveFunction = (x, dim) => {
    return (
      (ARC_CONFIG.curveFactor *
        Math.pow(x, ARC_CONFIG.curvePower) *
        dim.height *
        ARC_CONFIG.heightMultiplier) /
      1500
    );
  };

  // Initialize random stars
  const initializeStars = (width, height) => {
    if (starsInitialized.current) return;

    const stars = [];
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * width * 1.5, // Start from right side
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5, // Random size between 0.5 and 2.5
        speed: Math.random() * 2 + 1, // Random speed between 1 and 3
        opacity: Math.random() * 0.5 + 0.3, // Random opacity between 0.3 and 0.8
      });
    }
    starsRef.current = stars;
    starsInitialized.current = true;
  };

  // Draw moving stars background (right to left diagonal)
  const drawMovingStars = (ctx, width, height) => {
    // Initialize stars if not done
    if (!starsInitialized.current) {
      initializeStars(width, height);
    }

    // Update and draw each star
    starsRef.current.forEach((star) => {
      // Move star diagonally (right to left, slightly downward)
      star.x -= star.speed;
      star.y += star.speed * 0.3; // Slight downward movement

      // Reset star position when it goes off screen
      if (star.x < -10) {
        star.x = width + 10;
        star.y = Math.random() * height;
      }
      if (star.y > height + 10) {
        star.y = -10;
        star.x = Math.random() * width;
      }

      // Draw star
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Update plane position for HTML overlay
  const updatePlanePosition = (x, y, rotation) => {
    setPlanePosition({ x, y, rotation });
  };

  // Start new round - now controlled by backend
  const startNewRound = () => {
    // Reset local state only - backend controls the game flow
    tickRefRef.current = 0;
    payoutRef.current = 1.0;
    ontoCornerRef.current = 0;
    planeXRef.current = 0;
    hoverTimeRef.current = 0;
    introProgressRef.current = 0;
    introPhaseRef.current = false;
    introCompletedRef.current = false;
    previousAmplitudeRef.current = 1;
    setMultiplier("1.00");

    // Backend will emit betting_open event to start the round
    console.log("⏳ Waiting for backend to start new round...");
  };
  // Main animation loop
  const animate = (currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const delta = (currentTime - lastTimeRef.current) / 16.67;
    lastTimeRef.current = currentTime;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const dimension = { width: canvasSize.width, height: canvasSize.height };

    // Draw moving stars background
    drawMovingStars(ctx, dimension.width, dimension.height);

    if (gameStatusRef.current === "ANIM_STARTED") {
      // Use backend multiplier (payoutRef is updated by socket events)
      tickRefRef.current += delta * 0.02;

      // Update hover animation time (only after intro completes)
      if (ARC_CONFIG.hoverEnabled && introCompletedRef.current) {
        hoverTimeRef.current += delta * ARC_CONFIG.hoverSpeed;
      }

      // Calculate hover scale (pulsing effect - only after intro)
      const hoverScale =
        ARC_CONFIG.hoverEnabled && !introPhaseRef.current
          ? 1 + Math.sin(hoverTimeRef.current) * ARC_CONFIG.hoverAmplitude
          : 1;
      // Calculate responsive padding using ARC_CONFIG
      const padding = Math.max(
        dimension.width * ARC_CONFIG.paddingPercent,
        ARC_CONFIG.minPadding
      );

      const gameDim = {
        width: (dimension.width - padding * 2) * ARC_CONFIG.widthMultiplier,
        height: (dimension.height - padding * 2) * ARC_CONFIG.heightMultiplier,
      };

      // Show plane at start of animation
      setShowPlane(true);

      // Calculate plane X position with smooth variable speed
      const currentProgress = planeXRef.current / gameDim.width;
      let currentSpeed = planeSpeed;

      // Smooth slowdown during descent phase (90% → 100%)
      if (currentProgress >= 0.9 && currentProgress < 1.0) {
        // Smooth transition from 100% speed to 60% speed
        const descentProgress = (currentProgress - 0.9) / 0.1; // 0 to 1
        const speedMultiplier = 1.0 - descentProgress * 0.4; // 1.0 → 0.6
        currentSpeed = planeSpeed * speedMultiplier;
      }

      planeXRef.current += currentSpeed * delta;

      // Limit plane movement to gameDim.width (prevents going off-screen)
      if (planeXRef.current > gameDim.width) {
        planeXRef.current = gameDim.width;
      }

      // Multiplier is now controlled by backend via socket events
      // No need to calculate or check crash point here

      // Calculate base Y using the EXACT curve function (ALWAYS FIXED AT BOTTOM)
      const baseY = dimension.height - padding;
      // Calculate curve amplitude based on plane progress
      let curveAmplitudeMultiplier = 1;
      const curveProgress = Math.min(planeXRef.current / gameDim.width, 1);

      // 🚀 Intro phase (rise until 90%, then start hovering)
      if (introPhaseRef.current) {
        const progress = curveProgress; // 0 → 1 (0% → 100%)

        // ✈️ 0% → 90% → Smooth rise using ease-out quadratic
        if (progress < 0.9) {
          const riseEase = progress / 0.9; // normalize to 0–1
          curveAmplitudeMultiplier = 1 + Math.pow(riseEase, 2) * 1.5; // rising strength (matches hover max)
        }
        // 🟢 Mark intro complete at 90% and start hovering
        else if (progress >= 0.9) {
          descentCompleteRef.current = true;
          introPhaseRef.current = false;
          introCompletedRef.current = true;
          descentStartRef.current = performance.now();
          console.log("Intro phase complete at 90% — starting hover.");
          // Set initial amplitude to 2.5 (matches rise peak and hover max)
          curveAmplitudeMultiplier = 2.5;
        }
      }
      // 🌈 Hover phase: start at 3 (up/90%), go down to 1, then oscillate
      else if (introCompletedRef.current) {
        const hoverElapsed =
          (performance.now() - descentStartRef.current) / 1000;
        const hoverSpeed = 1.1; // how fast the hover cycles (slower = smoother)

        // Start at 3 (up/90%), go down to 1 (down/100%), using cos for proper phase
        // cos starts at 1 (amplitude 3), goes to -1 (amplitude 1)
        const oscillation = Math.cos(hoverElapsed * hoverSpeed); // 1 to -1 to 1
        // Map 1→-1 to 3→1: (oscillation + 1) / 2 gives 1→0, then scale to 3→1
        curveAmplitudeMultiplier = 1 + ((oscillation + 1) / 2) * 1.5; // 3 → 1 → 3

        // Calculate if plane is going up or down based on amplitude change
        const amplitudeDelta =
          curveAmplitudeMultiplier - previousAmplitudeRef.current;

        // Update multiplier based on plane direction
        if (amplitudeDelta > 0) {
          // Plane going UP - increase multiplier
          payoutRef.current += delta * 0.002; // Increase rate
          // Ensure multiplier doesn't go above 3.00
          if (payoutRef.current > 3.0) {
            payoutRef.current = 3.0;
          }
        } else if (amplitudeDelta < 0) {
          // Plane going DOWN - decrease multiplier
          payoutRef.current -= delta * 0.001; // Decrease rate (slower than increase)
          // Ensure multiplier doesn't go below 1.00
          if (payoutRef.current < 1.0) {
            payoutRef.current = 1.0;
          }
        }

        // Store current amplitude for next frame comparison
        previousAmplitudeRef.current = curveAmplitudeMultiplier;
      }
      // Draw the curve trail behind the plane
      ctx.save();

      // Apply hover scale transformation (only after intro)
      if (ARC_CONFIG.hoverEnabled && !introPhaseRef.current) {
        ctx.translate(padding, baseY);
        ctx.scale(hoverScale, 1 + (1 - hoverScale) * 0.5);
        ctx.translate(-padding, -baseY);
      }

      ctx.strokeStyle = "#22c55e"; // Green
      ctx.lineWidth = ARC_CONFIG.lineWidth;
      ctx.beginPath();

      const curvePoints = [];
      for (let x = 0; x <= planeXRef.current; x += 10) {
        const curveY = curveFunction(x, gameDim) * curveAmplitudeMultiplier;
        const y = baseY - curveY; // Base stays fixed, curve rises
        curvePoints.push({ x: padding + x, y: y });
      }

      ctx.moveTo(padding, baseY);
      for (let i = 0; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(34, 197, 94, 0.3)"; // Green with transparency
      ctx.beginPath();
      ctx.moveTo(padding, baseY);
      for (let i = 0; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
      ctx.lineTo(curvePoints[curvePoints.length - 1].x, baseY);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      const planeCurveY =
        curveFunction(planeXRef.current, gameDim) * curveAmplitudeMultiplier;
      let planeY = baseY - planeCurveY; // Plane follows the steep curve during intro
      let planeX = padding + planeXRef.current;

      if (ARC_CONFIG.hoverEnabled && !introPhaseRef.current) {
        const scaledX = (planeX - padding) * hoverScale + padding;
        const heightScale = 1 + (1 - hoverScale) * 0.5;
        const scaledY = (planeY - baseY) * heightScale + baseY;
        planeX = scaledX;
        planeY = scaledY;
      }
      // Calculate rotation angle based on curve tangent WITH amplitude multiplier
      const dx = 10;
      const nextCurveY =
        curveFunction(planeXRef.current + dx, gameDim) *
        curveAmplitudeMultiplier;
      const prevCurveY =
        curveFunction(Math.max(0, planeXRef.current - dx), gameDim) *
        curveAmplitudeMultiplier;
      const dy = nextCurveY - prevCurveY;
      const planeRotation = (Math.atan2(-dy, dx) * 100) / Math.PI;
      // Set plane position for HTML overlay (with offsets)
      const planeData = {
        x: planeX + planeOffsetX,
        y: planeY + planeOffsetY,
        rotation: planeRotation,
      };

      updatePlanePosition(planeData.x, planeData.y, planeData.rotation);

      setMultiplier(payoutRef.current.toFixed(2));
    } else if (gameStatusRef.current === "ANIM_CRASHED") {
      ontoCornerRef.current++;

      // Calculate responsive padding
      const padding = Math.max(
        dimension.width * ARC_CONFIG.paddingPercent,
        ARC_CONFIG.minPadding
      );

      const gameDim = {
        width: (dimension.width - padding * 2) * ARC_CONFIG.widthMultiplier,
        height: (dimension.height - padding * 2) * ARC_CONFIG.heightMultiplier,
      };

      const baseY = dimension.height - padding;

      // Show plane during crash animation (first 120 frames - much slower animation)
      if (ontoCornerRef.current <= 120) {
        setShowPlane(true);

        // Animate plane flying away after crash using EXACT curve position
        const planeCurveY = curveFunction(planeXRef.current, gameDim);
        const crashPlaneY =
          baseY - planeCurveY - ontoCornerRef.current * 12.5 + planeOffsetY; // Reduced from 25 to 12.5
        const crashPlaneX =
          padding +
          planeXRef.current +
          ontoCornerRef.current * 37.5 + // Reduced from 75 to 37.5
          planeOffsetX;

        // Calculate rotation based on curve tangent and add spinning effect
        const dx = 10;
        const nextCurveY = curveFunction(planeXRef.current + dx, gameDim);
        const prevCurveY = curveFunction(
          Math.max(0, planeXRef.current - dx),
          gameDim
        );
        const dy = nextCurveY - prevCurveY;
        const crashRotation =
          (Math.atan2(-dy, dx) * 180) / Math.PI - ontoCornerRef.current * 0.75; // Reduced from 1.5 to 0.75

        const crashPlaneData = {
          x: crashPlaneX,
          y: crashPlaneY,
          rotation: crashRotation,
        };

        updatePlanePosition(
          crashPlaneData.x,
          crashPlaneData.y,
          crashPlaneData.rotation
        );
      } else {
        // Hide plane after flying away
        setShowPlane(false);

        // Stop crash sound when animation ends
        if (crashSoundRef.current && !crashSoundRef.current.paused) {
          crashSoundRef.current.pause();
          crashSoundRef.current.currentTime = 0;
        }
      }

      // After crash animation completes, transition to WAITING
      if (ontoCornerRef.current > 120) {
        gameStatusRef.current = "WAITING";
        setGameStatus("WAITING");
        console.log("🔄 Crash animation complete - Waiting for next round");
      }
    } else if (gameStatusRef.current === "WAITING") {
      // WAITING state - loading image and text are shown via HTML overlay
      // Canvas is already cleared and stars are drawn at the top of animate()
    } else if (gameStatusRef.current === "BETTING") {
      // Show betting open message
      ctx.fillStyle = "#22c55e";
      ctx.font = "70px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Place Your Bets!",
        canvasSize.width / 2,
        canvasSize.height / 2
      );
    }

    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Socket event handlers for backend sync
  useEffect(() => {
    socket.on("bet_placed", (data) => {
      console.log("✅ Bet placed successfully:", data);
      // Update local balance after bet
      if (data.newBalance !== undefined) {
        updateBalance(data.newBalance);
      }

      // Store betId for the correct panel (only for current user)
      const currentUserId = localStorage.getItem("userId");
      if (data.userId === currentUserId && data.betId && data.panelId) {
        console.log(`💾 Storing betId ${data.betId} for panel ${data.panelId}`);
        if (data.panelId === 1) {
          setBetId1(data.betId);
        } else if (data.panelId === 2) {
          setBetId2(data.betId);
        }
      }
    });

    socket.on("bet_error", (data) => {
      console.error("❌ Bet error:", data.message);
      toast.error(data.message, {
        position: "top-center",
        autoClose: 3000,
      });
      // Reset bet states on error
      setIsBetPlaced(false);
      setIsBetPlaced2(false);
    });

    socket.on("cash_out_success", (data) => {
      console.log("💰 Cash out successful:", data);
      // Update winnings from server response
      const cashOutAmount = parseFloat(data.winnings);

      // Update local balance after cash out
      if (data.newBalance !== undefined) {
        updateBalance(data.newBalance);
      }

      // Determine which bet panel cashed out based on current state
      if (isBetPlaced && !isBetPlaced2) {
        setWinnings(cashOutAmount);
        setCashOutMultiplier(data.message);
        setIsBetPlaced(false);
      } else if (isBetPlaced2 && !isBetPlaced) {
        setWinnings2(cashOutAmount);
        setCashOutMultiplier2(data.message);
        setIsBetPlaced2(false);
      }
    });

    // Listen to backend game events
    socket.on("game_disabled", (data) => {
      console.log("🔴 Game is disabled");
      setGameStatus("WAITING");
      gameStatusRef.current = "WAITING";

      // Show toast notification to user
      toast.warning(
        "⚠️ Game has been disabled by the administrator. Please check back later.",
        {
          position: "top-center",
          autoClose: 5000,
        }
      );

      // Refetch settings to update UI
      const fetchSettings = async () => {
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:8000";
          const response = await fetch(`${API_URL}/api/getAllSetting`);
          const settingsData = await response.json();
          if (
            settingsData.success &&
            settingsData.result &&
            settingsData.result.length > 0
          ) {
            const settings = settingsData.result[0];
            setGameSettings({
              minBetAmount: settings.minBetAmount || 1,
              maxBetAmount: settings.maxBetAmount || 10000,
              gameStatus: settings.gameStatus || 1,
            });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      };
      fetchSettings();
    });

    socket.on("betting_open", (data) => {
      console.log("🎰 Betting is now open");
      setIsBettingOpen(true);
      gameStatusRef.current = "BETTING";
      setGameStatus("BETTING");
    });

    socket.on("betting_close", (data) => {
      console.log("🚫 Betting is now closed - Starting animation");
      setIsBettingOpen(false);

      // Reset all animation states
      planeXRef.current = 20; // Start with small offset so plane and arc are visible immediately
      tickRefRef.current = 0;
      hoverTimeRef.current = 0;
      introProgressRef.current = 0;
      introPhaseRef.current = true;
      introCompletedRef.current = false;
      descentCompleteRef.current = false;
      previousAmplitudeRef.current = 1;

      // Start the animation
      gameStatusRef.current = "ANIM_STARTED";
      setGameStatus("ANIM_STARTED");
      setShowPlane(true);
      setMultiplier("1.00");
      payoutRef.current = 1.0;
    });

    socket.on("multiplier_update", (data) => {
      const serverMultiplier = parseFloat(data.multiplier);
      payoutRef.current = serverMultiplier;
      setMultiplier(serverMultiplier.toFixed(2));
    });

    socket.on("plane_crash", (data) => {
      console.log("💥 Plane crashed at:", data.crashPoint);
      crashPointRef.current = parseFloat(data.crashPoint);
      gameStatusRef.current = "ANIM_CRASHED";
      setGameStatus("ANIM_CRASHED");
      ontoCornerRef.current = 0;
      // Keep plane visible for crash animation - it will be hidden after 120 frames

      // Play crash sound
      if (crashSoundRef.current) {
        console.log("Playing crash sound...");
        crashSoundRef.current.currentTime = 0;
        soundManager.play("crashSound");
      }

      // Reset bets for players who didn't cash out
      if (isBetPlaced) {
        setWinnings(0);
        setCashOutMultiplier("");
        setIsBetPlaced(false);
      }
      if (isBetPlaced2) {
        setWinnings2(0);
        setCashOutMultiplier2("");
        setIsBetPlaced2(false);
      }
    });

    socket.on("multiplier_reset", (data) => {
      console.log("🔄 Game reset - Waiting for next round");
      gameStatusRef.current = "WAITING";
      setGameStatus("WAITING");
      setMultiplier("1.00");
      payoutRef.current = 1.0;
      setShowPlane(false);
      planeXRef.current = 0;
      tickRefRef.current = 0;
      ontoCornerRef.current = 0;
      introPhaseRef.current = false;
      introCompletedRef.current = false;
      descentCompleteRef.current = false;
    });

    return () => {
      socket.off("bet_placed");
      socket.off("bet_error");
      socket.off("cash_out_success");
      socket.off("betting_open");
      socket.off("betting_close");
      socket.off("multiplier_update");
      socket.off("plane_crash");
      socket.off("multiplier_reset");
      socket.off("game_disabled");
    };
  }, [isBetPlaced, isBetPlaced2]);

  // Fetch game settings
  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_URL}/api/getAllSetting`);
        const data = await response.json();

        if (data.success && data.result && data.result.length > 0) {
          const settings = data.result[0];
          setGameSettings({
            minBetAmount: settings.minBetAmount || 1,
            maxBetAmount: settings.maxBetAmount || 10000,
            gameStatus: settings.gameStatus || 1,
          });
          console.log("✅ Game settings loaded:", settings);
        }
      } catch (error) {
        console.error("❌ Error fetching game settings:", error);
      }
    };

    fetchGameSettings();
  }, []);

  // Initialize canvas and start demo loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = gameRef.current;

    if (canvas && container) {
      // Use FIXED canvas size to prevent changes on code reload
      const FIXED_WIDTH = 1920;
      const FIXED_HEIGHT = 600;

      // Calculate scale based on container width
      const updateCanvasSize = () => {
        const containerWidth = container.offsetWidth;
        const calculatedScale = Math.min(containerWidth / FIXED_WIDTH, 1);
        setScale(calculatedScale);
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);

      setCanvasSize({
        width: FIXED_WIDTH,
        height: FIXED_HEIGHT,
      });

      canvas.width = FIXED_WIDTH;
      canvas.height = FIXED_HEIGHT;

      lastTimeRef.current = performance.now();

      // Backend will control game start - just start animation loop
      console.log("🎮 Game initialized - waiting for backend to start round");
      animate(lastTimeRef.current);

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }
  }, []);

  const handlePlaceBet = () => {
    if (betAmount > 0 && !isBetPlaced) {
      // Validate bet amount against settings
      if (betAmount < gameSettings.minBetAmount) {
        toast.error(
          `Minimum bet amount is ⭐${gameSettings.minBetAmount} Stars`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }
      if (betAmount > gameSettings.maxBetAmount) {
        toast.error(
          `Maximum bet amount is ⭐${gameSettings.maxBetAmount} Stars`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }

      // Get userId from localStorage or session using userService
      const userId = getUserId();

      if (!userId) {
        toast.error("User not authenticated. Please login again.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      console.log("🎲 Placing bet:", {
        betAmount,
        userId,
        socketConnected: socket.connected,
      });

      // Send bet to backend (backend will validate if betting is open)
      socket.emit("place_bet", {
        betAmount: betAmount,
        userId: userId,
        panelId: 1, // Identify which panel this bet is from
      });

      setIsBetPlaced(true);

      // Stop applause sound when placing a new bet
      if (applauseSoundRef.current && !applauseSoundRef.current.paused) {
        applauseSoundRef.current.pause();
        applauseSoundRef.current.currentTime = 0;
      }
    }
  };

  const handlePlaceBet2 = () => {
    if (betAmount2 > 0 && !isBetPlaced2) {
      // Validate bet amount against settings
      if (betAmount2 < gameSettings.minBetAmount) {
        toast.error(
          `Minimum bet amount is ⭐${gameSettings.minBetAmount} Stars`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }
      if (betAmount2 > gameSettings.maxBetAmount) {
        toast.error(
          `Maximum bet amount is ⭐${gameSettings.maxBetAmount} Stars`,
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return;
      }

      // Get userId from localStorage or session using userService
      const userId = getUserId();

      if (!userId) {
        toast.error("User not authenticated. Please login again.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      console.log("🎲 Placing bet 2:", {
        betAmount: betAmount2,
        userId,
        socketConnected: socket.connected,
      });

      // Send bet to backend (backend will validate if betting is open)
      socket.emit("place_bet", {
        betAmount: betAmount2,
        userId: userId,
        panelId: 2, // Identify which panel this bet is from
      });

      setIsBetPlaced2(true);

      // Stop applause sound when placing a new bet
      if (applauseSoundRef.current && !applauseSoundRef.current.paused) {
        applauseSoundRef.current.pause();
        applauseSoundRef.current.currentTime = 0;
      }
    }
  };

  const handleCashOut = () => {
    if (isBetPlaced && gameStatusRef.current === "ANIM_STARTED") {
      const currentMultiplier = parseFloat(multiplier);

      // Send cash out to backend with multiplier and betId
      socket.emit("cash_out", {
        multiplier: currentMultiplier,
        betId: betId1, // Specify which bet to cash out (Panel 1)
      });

      const winAmount = betAmount * currentMultiplier;
      setWinnings(winAmount);
      setCashOutMultiplier(`${currentMultiplier.toFixed(2)}x`);
      setIsBetPlaced(false);

      // Play applause sound on win
      if (applauseSoundRef.current) {
        applauseSoundRef.current.currentTime = 0;
        soundManager.play("applauseSound");
      }
    }
  };

  const handleCashOut2 = () => {
    if (isBetPlaced2 && gameStatusRef.current === "ANIM_STARTED") {
      const currentMultiplier = parseFloat(multiplier);

      // Send cash out to backend with multiplier and betId
      socket.emit("cash_out", {
        multiplier: currentMultiplier,
        betId: betId2, // Specify which bet to cash out (Panel 2)
      });

      const winAmount = betAmount2 * currentMultiplier;
      setWinnings2(winAmount);
      setCashOutMultiplier2(`${currentMultiplier.toFixed(2)}x`);
      setIsBetPlaced2(false);

      // Play applause sound on win
      if (applauseSoundRef.current) {
        applauseSoundRef.current.currentTime = 0;
        soundManager.play("applauseSound");
      }
    }
  };

  // Auto-bet logic - automatically place bets when game starts
  useEffect(() => {
    if (gameStatus === "BETTING" && isAutoBet && !isBetPlaced) {
      handlePlaceBet();
    }
  }, [gameStatus, isAutoBet, isBetPlaced]);

  useEffect(() => {
    if (gameStatus === "BETTING" && isAutoBet2 && !isBetPlaced2) {
      handlePlaceBet2();
    }
  }, [gameStatus, isAutoBet2, isBetPlaced2]);

  // Auto cash-out logic - automatically cash out at target multiplier
  useEffect(() => {
    if (isAutoBet && isBetPlaced && gameStatusRef.current === "ANIM_STARTED") {
      const currentMultiplier = parseFloat(multiplier);
      if (currentMultiplier >= autoCashOutMultiplier) {
        handleCashOut();
      }
    }
  }, [multiplier, isAutoBet, isBetPlaced, autoCashOutMultiplier]);

  useEffect(() => {
    if (
      isAutoBet2 &&
      isBetPlaced2 &&
      gameStatusRef.current === "ANIM_STARTED"
    ) {
      const currentMultiplier = parseFloat(multiplier);
      if (currentMultiplier >= autoCashOutMultiplier2) {
        handleCashOut2();
      }
    }
  }, [multiplier, isAutoBet2, isBetPlaced2, autoCashOutMultiplier2]);

  // Show game disabled message if gameStatus is 0
  if (gameSettings.gameStatus === 0) {
    return (
      <div className="game-container rounded-lg relative w-full max-w-7xl mx-auto min-h-[600px] flex items-center justify-center">
        <div className="bg-gradient-to-br from-red-900 via-purple-900 to-red-950 rounded-2xl p-16 text-center shadow-2xl border-4 border-red-600 animate-pulse">
          <div className="text-8xl mb-6 animate-bounce">🚫</div>
          <h2 className="text-5xl font-bold text-white mb-6 uppercase tracking-wider">
            Game Disabled
          </h2>
          <div className="bg-black/30 rounded-lg p-6 mb-4">
            <p className="text-red-400 text-2xl font-semibold mb-2">
              ⚠️ Temporarily Unavailable
            </p>
            <p className="text-gray-300 text-lg">
              The game has been disabled by the administrator.
            </p>
          </div>
          <p className="text-gray-400 text-md mt-4">
            Please check back later or contact support for more information.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container rounded-lg relative w-full max-w-7xl mx-auto">
      <div
        className="game w-full md:w-[75vw] lg:w-[70vw] mx-auto"
        ref={gameRef}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%)",
            borderRadius: "10px",
          }}
        />

        {/* Animated Plane GIF Overlay */}
        {showPlane &&
          (gameStatus === "ANIM_STARTED" || gameStatus === "ANIM_CRASHED") && (
            <img
              src="/plane.gif"
              alt="plane"
              className="absolute pointer-events-none z-40"
              style={{
                left: `${(planePosition.x / canvasSize.width) * 100}%`,
                top: `${(planePosition.y / canvasSize.height) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${planePosition.rotation}deg) scale(${scale})`,
                width: `${planeWidth}px`,
                height: planeHeight > 0 ? `${planeHeight}px` : "auto",
                filter: "hue-rotate(90deg) saturate(1.5) brightness(2.7)",
                transformOrigin: "center center",
              }}
            />
          )}

        {/* Multiplier Display */}
        {gameStatus === "ANIM_STARTED" && (
          <div
            className="absolute top-1/3.5 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 font-extrabold text-[#22c55e] pointer-events-none"
            style={{
              fontSize: `clamp(2rem, ${7 * scale}rem, 7rem)`,
            }}
          >
            {multiplier}x
          </div>
        )}

        {/* Crash Message */}
        {gameStatus === "ANIM_CRASHED" && (
          <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 pointer-events-none">
            <div
              className="font-bold text-[#ef4444] text-center animate-pulse"
              style={{
                fontSize: `clamp(1.5rem, ${5 * scale}rem, 5rem)`,
              }}
            >
              FLEW AWAY!
            </div>
            <div
              className="text-[#ef4444] font-bold text-center mt-2"
              style={{
                fontSize: `clamp(2rem, ${6 * scale}rem, 6rem)`,
              }}
            >
              {crashPointRef.current.toFixed(2)}x
            </div>
          </div>
        )}

        {/* Loading Screen - Rotating loading.png with "Next Round" text */}
        {gameStatus === "WAITING" && (
          <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 z-50 pointer-events-none flex flex-col items-center">
            <img
              src="/loading.png"
              alt="loading"
              style={{
                width: `clamp(60px, ${96 * scale}px, 96px)`,
                height: `clamp(60px, ${96 * scale}px, 96px)`,
              }}
              className="animate-spin"
            />
            <div
              className="font-bold text-[#ef4444] mt-4"
              style={{
                fontSize: `clamp(1.5rem, ${3 * scale}rem, 3rem)`,
              }}
            >
              Next Round
            </div>
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className="bet flex justify-center items-center w-full gap-2">
        {/* Bet Panel 1 */}
        <div className="bg-[#191A1B] md:w-1/2 p-4">
          <div className="w-full flex justify-center my-2">
            <span className="border rounded-full border-gray-700 w-2/6 flex">
              <span
                onClick={() => setIsAutoBet(false)}
                className={`rounded-full text-white text-xs p-1 px-5 w-1/2 text-center cursor-pointer ${
                  !isAutoBet ? "bg-[#2C2D30]" : ""
                }`}
              >
                Bet
              </span>
              <span
                onClick={() => setIsAutoBet(true)}
                className={`border-gray-700 rounded-full text-white px-5 w-1/2 text-center text-xs p-1 cursor-pointer ${
                  isAutoBet ? "bg-[#2C2D30]" : ""
                }`}
              >
                Auto
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 w-1/3">
              <div className="border border-gray-600 rounded-full bg-black text-white flex">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="px-2 bg-black rounded-full w-2/3 outline-none text-center"
                />
                <button
                  onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
                  className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1"
                >
                  -
                </button>
                <button
                  onClick={() => setBetAmount(betAmount + 10)}
                  className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1"
                >
                  +
                </button>
              </div>
              {isAutoBet && (
                <div className="border border-gray-600 rounded-full bg-black text-white flex mt-2">
                  <input
                    type="number"
                    step="0.1"
                    value={autoCashOutMultiplier}
                    onChange={(e) =>
                      setAutoCashOutMultiplier(Number(e.target.value))
                    }
                    className="px-2 bg-black rounded-full w-2/3 outline-none text-center text-xs"
                    placeholder="Auto @"
                  />
                  <span className="text-xs text-gray-400 flex items-center pr-2">
                    x
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-1 my-1">
                <button
                  onClick={() => setBetAmount(100)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  100
                </button>
                <button
                  onClick={() => setBetAmount(200)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  200
                </button>
              </div>
              <div className="flex justify-between gap-1 my-1">
                <button
                  onClick={() => setBetAmount(500)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  500
                </button>
                <button
                  onClick={() => setBetAmount(1000)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  1000
                </button>
              </div>
            </div>
            <button
              onClick={
                isAutoBet
                  ? () => setIsAutoBet(false)
                  : isBetPlaced
                  ? handleCashOut
                  : handlePlaceBet
              }
              disabled={
                !isAutoBet &&
                isBetPlaced &&
                gameStatusRef.current !== "ANIM_STARTED"
              }
              className={`w-full rounded-lg p-3 text-xl font-semibold text-white ${
                isAutoBet
                  ? "bg-blue-600"
                  : isBetPlaced && gameStatusRef.current === "ANIM_STARTED"
                  ? "bg-[#28A909]"
                  : isBetPlaced && gameStatusRef.current === "BETTING"
                  ? "bg-yellow-600"
                  : gameStatusRef.current === "ANIM_CRASHED"
                  ? "bg-[#de3232]"
                  : "bg-[#28A909]"
              } disabled:opacity-50`}
            >
              {isAutoBet
                ? isBetPlaced
                  ? `Auto: Cash @ ${autoCashOutMultiplier}x`
                  : "Auto Bet Active"
                : isBetPlaced && gameStatusRef.current === "ANIM_STARTED"
                ? `Cash Out ${multiplier}x`
                : isBetPlaced && gameStatusRef.current === "BETTING"
                ? "Bet Placed"
                : gameStatusRef.current === "ANIM_CRASHED"
                ? `Crashed`
                : "Place Bet"}
            </button>
          </div>
          {winnings > 0 && (
            <div className="text-white text-center mt-2">
              Winnings: {winnings} at {cashOutMultiplier}
            </div>
          )}
        </div>

        {/* Bet Panel 2 */}
        <div className="bg-[#191A1B] md:w-1/2 p-4">
          <div className="w-full flex justify-center my-2">
            <span className="border rounded-full border-gray-700 w-2/6 flex">
              <span
                onClick={() => setIsAutoBet2(false)}
                className={`rounded-full text-white text-xs p-1 px-5 w-1/2 text-center cursor-pointer ${
                  !isAutoBet2 ? "bg-[#2C2D30]" : ""
                }`}
              >
                Bet
              </span>
              <span
                onClick={() => setIsAutoBet2(true)}
                className={`border-gray-700 rounded-full text-white px-5 w-1/2 text-center text-xs p-1 cursor-pointer ${
                  isAutoBet2 ? "bg-[#2C2D30]" : ""
                }`}
              >
                Auto
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 w-1/3">
              <div className="border border-gray-600 rounded-full bg-black text-white flex">
                <input
                  type="number"
                  value={betAmount2}
                  onChange={(e) => setBetAmount2(Number(e.target.value))}
                  className="px-2 bg-black rounded-full w-2/3 outline-none text-center"
                />
                <button
                  onClick={() => setBetAmount2(Math.max(1, betAmount2 - 10))}
                  className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1"
                >
                  -
                </button>
                <button
                  onClick={() => setBetAmount2(betAmount2 + 10)}
                  className="bg-gray-600 w-7 h-6 text-black rounded-full flex justify-center items-center text-lg m-1"
                >
                  +
                </button>
              </div>
              {isAutoBet2 && (
                <div className="border border-gray-600 rounded-full bg-black text-white flex mt-2">
                  <input
                    type="number"
                    step="0.1"
                    value={autoCashOutMultiplier2}
                    onChange={(e) =>
                      setAutoCashOutMultiplier2(Number(e.target.value))
                    }
                    className="px-2 bg-black rounded-full w-2/3 outline-none text-center text-xs"
                    placeholder="Auto @"
                  />
                  <span className="text-xs text-gray-400 flex items-center pr-2">
                    x
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-1 my-1">
                <button
                  onClick={() => setBetAmount2(100)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  100
                </button>
                <button
                  onClick={() => setBetAmount2(200)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  200
                </button>
              </div>
              <div className="flex justify-between gap-1 my-1">
                <button
                  onClick={() => setBetAmount2(500)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  500
                </button>
                <button
                  onClick={() => setBetAmount2(1000)}
                  className="border border-gray-600 rounded-full px-2 w-full text-gray-500 hover:bg-gray-700"
                >
                  1000
                </button>
              </div>
            </div>
            <button
              onClick={
                isAutoBet2
                  ? () => setIsAutoBet2(false)
                  : isBetPlaced2
                  ? handleCashOut2
                  : handlePlaceBet2
              }
              disabled={
                !isAutoBet2 &&
                isBetPlaced2 &&
                gameStatusRef.current !== "ANIM_STARTED"
              }
              className={`w-full rounded-lg p-3 text-xl font-semibold text-white ${
                isAutoBet2
                  ? "bg-blue-600"
                  : isBetPlaced2 && gameStatusRef.current === "ANIM_STARTED"
                  ? "bg-[#28A909]"
                  : isBetPlaced2 && gameStatusRef.current === "BETTING"
                  ? "bg-yellow-600"
                  : gameStatusRef.current === "ANIM_CRASHED"
                  ? "bg-[#de3232]"
                  : "bg-[#28A909]"
              } disabled:opacity-50`}
            >
              {isAutoBet2
                ? isBetPlaced2
                  ? `Auto: Cash @ ${autoCashOutMultiplier2}x`
                  : "Auto Bet Active"
                : isBetPlaced2 && gameStatusRef.current === "ANIM_STARTED"
                ? `Cash Out ${multiplier}x`
                : isBetPlaced2 && gameStatusRef.current === "BETTING"
                ? "Bet Placed"
                : gameStatusRef.current === "ANIM_CRASHED"
                ? `Crashed`
                : "Place Bet"}
            </button>
          </div>
          {winnings2 > 0 && (
            <div className="text-white text-center mt-2">
              Winnings: {winnings2} at {cashOutMultiplier2}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AviatorGame;
