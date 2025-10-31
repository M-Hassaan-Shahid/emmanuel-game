// Controllers/GameController.js - Enhanced with bet persistence

const PlaneCrash = require('../Models/PlaneCrash');
const User = require('../Models/User');
const Bet = require('../Models/Bet');
const Setting = require('../Models/Setting');

const gameLogic = async (io) => {
    let users = {}; // Store user data and their bets
    let multiplier = 0; // Starting multiplier
    let crashPoint = 0; // Where the plane crashes
    let crashRanges = []; // Array to store crash ranges from DB
    let currentRoundId = Date.now().toString();
    let gameEnabled = true; // Track if game is enabled

    // Function to check if game is enabled
    const checkGameStatus = async () => {
        try {
            const settings = await Setting.findOne();
            if (settings) {
                gameEnabled = settings.gameStatus === 1;
                console.log(`🎮 Game status: ${gameEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}`);
                return gameEnabled;
            }
            return true; // Default to enabled if no settings found
        } catch (error) {
            console.error('Error checking game status:', error);
            return true; // Default to enabled on error
        }
    };

    // Function to fetch crash ranges from the database
    const fetchCrashRanges = async () => {
        try {
            const ranges = await PlaneCrash.find({ deleted_at: null }).exec();
            crashRanges = ranges.map(range => ({
                range: [parseFloat(range.firstValue), parseFloat(range.secondValue)],
                probability: parseFloat(range.crashPercentage) / 100,
            }));
        } catch (error) {
            console.error('Error fetching crash ranges from database:', error);
        }
    };

    // Function to select a crash range based on weighted probabilities
    const selectCrashRange = () => {
        const random = Math.random();
        let cumulativeProbability = 0;

        for (let i = 0; i < crashRanges.length; i++) {
            cumulativeProbability += crashRanges[i].probability;
            if (random <= cumulativeProbability) {
                return crashRanges[i].range;
            }
        }

        return crashRanges[crashRanges.length - 1].range;
    };

    const startGame = async () => {
        // Check if game is enabled before starting
        const isEnabled = await checkGameStatus();

        if (!isEnabled) {
            console.log('🔴 Game is DISABLED - Waiting 10 seconds before checking again...');
            io.emit('game_disabled', { message: 'Game is currently disabled' });
            setTimeout(() => {
                startGame(); // Check again after 10 seconds
            }, 10000);
            return;
        }

        console.log('🎮 Game started - Round ID:', Date.now());
        currentRoundId = Date.now().toString();

        await fetchCrashRanges();

        if (crashRanges.length === 0) {
            console.log('⚠️ No crash ranges in database, using default range [1.5, 3.0]');
            crashRanges = [{ range: [1.5, 3.0], probability: 1.0 }];
        }

        // Generate random crash point
        crashPoint = Math.random() * (4 - 1) + 1;
        console.log(`🎯 Crash point set at: ${crashPoint.toFixed(2)}x`);

        multiplier = 1;
        console.log('📡 Emitting multiplier_reset');
        io.emit('multiplier_reset', { multiplier: 0 });

        console.log('📡 Emitting betting_open');
        io.emit('betting_open', { isBettingOpen: true });
        console.log('🎰 Betting is now open for 5 seconds');

        setTimeout(() => {
            console.log('🚫 Betting closed - Starting plane animation');
            io.emit('betting_close', { isBettingOpen: false });

            let gameInterval = setInterval(() => {
                multiplier += 0.02; // Increased increment for smoother animation
                io.emit('multiplier_update', { multiplier: multiplier.toFixed(2) });

                if (multiplier >= crashPoint) {
                    clearInterval(gameInterval);
                    console.log(`💥 Plane crashed at ${crashPoint.toFixed(2)}x`);
                    io.emit('plane_crash', { crashPoint: crashPoint.toFixed(2) });

                    // Mark all uncashed bets as lost
                    Object.keys(users).forEach(async (socketId) => {
                        if (users[socketId].bets && users[socketId].bets.length > 0) {
                            users[socketId].bets.forEach(async (bet) => {
                                if (!bet.hasCashedOut) {
                                    await Bet.findByIdAndUpdate(bet.betId, {
                                        status: 'lost',
                                        crash_multiplier: crashPoint
                                    });
                                }
                            });
                        }
                    });

                    setTimeout(() => {
                        console.log('⏳ Starting new round in 5 seconds...');
                        startGame();
                    }, 5000);
                }
            }, 100); // Increased from 80ms to 100ms for smoother updates
        }, 5000);
    };

    io.on('connection', async (socket) => {
        console.log('👤 User connected:', socket.id);

        users[socket.id] = {
            bets: [], // Array to store multiple bets
            userId: null
        };

        // Send current active bets to newly connected user
        try {
            const activeBets = await Bet.find({
                roundId: currentRoundId,
                status: { $in: ['active', 'cashed_out'] }
            }).populate('userId', 'user_id profileImage');

            if (activeBets.length > 0) {
                console.log(`📤 Sending ${activeBets.length} active bets to new user`);
                activeBets.forEach(bet => {
                    socket.emit('bet_placed', {
                        userId: bet.userId?._id,
                        user_id: bet.userId?.user_id || 'Unknown',
                        photo_url: bet.userId?.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg',
                        betAmount: bet.bet_amount,
                        betId: bet._id.toString(),
                        socketId: socket.id
                    });
                });
            }
        } catch (error) {
            console.error('❌ Error sending active bets:', error);
        }

        socket.on('authenticate', (userId) => {
            users[socket.id].userId = userId;
            console.log(`User ${userId} authenticated with socket ${socket.id}`);
        });

        socket.on('place_bet', async (data) => {
            console.log('📥 Received place_bet event:', data);
            const { betAmount, userId, panelId } = data;

            if (betAmount > 0) {
                try {  // Check if game is enabled
                    if (!gameEnabled) {
                        socket.emit('bet_error', { message: 'Game is currently disabled' });
                        return;
                    }

                    const user = await User.findById(userId);
                    console.log('👤 User found:', user ? user.user_id : 'NOT FOUND');
                    if (!user) {
                        socket.emit('bet_error', { message: 'User not found' });
                        return;
                    }

                    if (user.balance < betAmount) {
                        socket.emit('bet_error', { message: 'Insufficient Stars balance' });
                        return;
                    }

                    // Deduct Stars from user balance
                    user.balance -= betAmount;
                    await user.save();

                    const bet = new Bet({
                        bet_amount: betAmount,
                        bet_size: betAmount,
                        userId: userId,
                        roundId: currentRoundId,
                        status: 'active'
                    });
                    await bet.save();
                    console.log('💾 Bet saved to database:', bet._id, 'for user:', user.user_id);

                    // Store bet in array to support multiple bets
                    users[socket.id].userId = userId;
                    users[socket.id].bets.push({
                        betId: bet._id,
                        betAmount: betAmount,
                        hasCashedOut: false
                    });

                    const betPlacedData = {
                        userId: userId,
                        user_id: user.user_id,
                        photo_url: user.profileImage || 'https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg',
                        betAmount: betAmount,
                        betId: bet._id.toString(),
                        socketId: socket.id,
                        newBalance: user.balance,
                        panelId: panelId // Include panel identifier
                    };

                    io.emit('bet_placed', betPlacedData);
                    console.log('📡 Emitted bet_placed event to all clients:', betPlacedData);
                    console.log(`✅ User ${userId} placed a bet of ${betAmount} Stars`);
                } catch (error) {
                    console.error('❌ Error placing bet:', error);
                    socket.emit('bet_error', { message: 'Failed to place bet: ' + error.message });
                }
            } else {
                socket.emit('bet_error', { message: 'Invalid bet amount' });
            }
        });

        socket.on('cash_out', async (data) => {
            const cashOutMultiplier = data?.multiplier || multiplier;
            const betIdToCashOut = data?.betId; // Optional: specify which bet to cash out

            try {
                const userId = users[socket.id].userId;
                if (!userId) {
                    socket.emit('cashout_error', { message: 'User not found' });
                    return;
                }

                // Find the first uncashed bet (or specific bet if betId provided)
                const betIndex = users[socket.id].bets.findIndex(bet =>
                    !bet.hasCashedOut && (!betIdToCashOut || bet.betId.toString() === betIdToCashOut)
                );

                if (betIndex === -1 || multiplier <= 0) {
                    socket.emit('cashout_error', { message: 'No active bet to cash out' });
                    return;
                }

                const betData = users[socket.id].bets[betIndex];
                const winnings = betData.betAmount * cashOutMultiplier;

                const user = await User.findById(userId);
                if (!user) {
                    socket.emit('cashout_error', { message: 'User not found' });
                    return;
                }

                // Add Stars winnings to user balance
                user.balance += winnings;
                await user.save();

                // Update bet in database
                await Bet.findByIdAndUpdate(betData.betId, {
                    cashout_multiplier: cashOutMultiplier,
                    winnings: winnings,
                    status: 'cashed_out'
                });

                // Mark bet as cashed out
                users[socket.id].bets[betIndex].hasCashedOut = true;

                io.to(socket.id).emit('cash_out_success', {
                    winnings: winnings.toFixed(2),
                    multiplier: cashOutMultiplier.toFixed(2),
                    message: `${cashOutMultiplier.toFixed(2)}x`,
                    newBalance: user.balance,
                    betId: betData.betId
                });

                io.emit('bet_cashed_out', {
                    betId: betData.betId,
                    socketId: socket.id,
                    cashout: winnings.toFixed(2),
                    multiplier: `${cashOutMultiplier.toFixed(2)}x`
                });

                console.log(`💰 User ${userId} cashed out ${winnings.toFixed(2)} Stars at ${cashOutMultiplier.toFixed(2)}x`);
            } catch (error) {
                console.error('❌ Error cashing out:', error);
                socket.emit('cashout_error', { message: 'Failed to cash out: ' + error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            delete users[socket.id];
        });
    });

    await startGame();
};

module.exports = {
    gameLogic
};
