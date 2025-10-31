# Plane Animation Demo - Quick Start

## ✅ Demo Mode is Now Active!

The plane animation will now run automatically in **DEMO MODE** without needing the backend server.

## How to See the Animation:

### Option 1: Run Frontend Only (Recommended)

```bash
cd aviatorGameWeb
npm run dev
```

Then open: `http://localhost:5173/home`

### Option 2: Direct Component Test

Navigate to any page that includes the `<Planefly />` component.

## What You'll See:

1. **Animated Background**

   - Purple to black gradient
   - Moving grid lines
   - Twinkling stars

2. **Plane Movement**

   - Plane starts from bottom-left
   - Smooth curved diagonal movement
   - Glowing orange trail behind plane
   - Plane rotates based on trajectory
   - Hovering effect at the end

3. **Multiplier**

   - Starts at 1.00x
   - Increases continuously (0.01x every 100ms)
   - Color changes: Green → Yellow → Orange
   - Pulsing animation

4. **Crash Effect**
   - Random crash between 1.5x - 10.0x
   - "Flew away" message
   - Red crash point display
   - Auto-restarts after 3 seconds

## Demo Loop:

```
Start → Plane flies → Multiplier increases → Random crash → Wait 3s → Repeat
```

## Customization:

Edit `aviatorGameWeb/src/components/Game/Planefly.jsx`:

- **Crash range**: Line ~35 `(Math.random() * 8.5 + 1.5)`
- **Speed**: Line ~48 `demoMultiplier += 0.01` (increase for faster)
- **Restart delay**: Line ~58 `setTimeout(..., 3000)` (milliseconds)

## Troubleshooting:

**Plane not visible?**

- Check if `plane.png` exists in `aviatorGameWeb/public/`
- Open browser console (F12) for errors

**Animation choppy?**

- Close other browser tabs
- Check CPU usage

**Want to disable demo mode?**

- Comment out the `startDemoAnimation()` call in the first `useEffect`
- The game will wait for backend socket events instead

---

**Note**: This is a visual demo. To connect real betting functionality, you need to run the backend server and connect via Socket.io.
