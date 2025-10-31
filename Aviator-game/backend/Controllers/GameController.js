const express = require('express');
const router = express.Router();
const PlaneCrash = require('../Models/PlaneCrash');
const User = require('../Models/User');
const Bet = require('../Models/Bet');
const Setting = require('../Models/Setting');
const GameRound = require('../Models/GameRoundSchema');

const gameLogic = async (io) => {
  let users = {};
  let multiplier = 0;
  let crashPoint = 0;
  let crashRanges = [];
  let currentRoundId = Date.now().toString();
  let gameActive = false;
  let bettingOpen = false;

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
    // Game loop disabled - frontend controls the game animation
    // Backend only handles bet placement and cash out
    console.log('🎮 Backend ready - Frontend controls game loop');

    // Keep betting always open for client-side game
    bettingOpen = true;
    gameActive = true;
  };

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    users[socket.id] = {
      betAmount: 0,
      hasCashedOut: false,
      betPlaced: false,
      userId: null
    };

    socket.on('place_bet', async (data) => {
      try {
        const betAmount = typeof data === 'object' ? data.betAmount : data;
        const userId = typeof data === 'object' ? data.userId : null;

        if (betAmount <= 0) {
          socket.emit('bet_error', { message: 'Invalid bet amount' });
          return;
        }

        const settings = await Setting.findOne();
        if (!settings) {
          socket.emit('bet_error', { message: 'Game settings not found' });
          return;
        }

        if (settings.gameStatus !== 1) {
          socket.emit('bet_error', { message: 'Game is currently disabled' });
          return;
        }

        if (betAmount < settings.minBetAmount || betAmount > settings.maxBetAmount) {
          socket.emit('bet_error', {
            message: `Bet must be between ${settings.minBetAmount} and ${settings.maxBetAmount}`
          });
          return;
        }

        if (userId) {
          const user = await User.findById(userId);
          if (!user) {
            socket.emit('bet_error', { message: 'User not found' });
            return;
          }

          if (user.balance < betAmount) {
            socket.emit('bet_error', { message: 'Insufficient balance' });
            return;
          }

          user.balance -= betAmount;
          await user.save();

          const bet = new Bet({
            bet_amount: betAmount,
            bet_size: betAmount,
            bet_level: 1,
            bet_line: 1
          });
          await bet.save();

          users[socket.id].userId = userId;

          console.log(`💰 User ${socket.id} (${user.username}) placed bet: ${betAmount} | Balance: ${user.balance}`);
        } else {
          console.log(`💰 Guest ${socket.id} placed bet: ${betAmount} (no database save)`);
        }

        users[socket.id].betAmount = betAmount;
        users[socket.id].hasCashedOut = false;
        users[socket.id].betPlaced = true;

        socket.emit('bet_placed', { betAmount });

      } catch (error) {
        console.error('❌ Error placing bet:', error);
        socket.emit('bet_error', { message: 'Failed to place bet' });
      }
    });

    socket.on('cash_out', async (data) => {
      try {
        if (users[socket.id].hasCashedOut || !users[socket.id].betPlaced) {
          return;
        }

        const cashOutMultiplier = typeof data === 'object' ? data.multiplier : 1.0;
        const winnings = users[socket.id].betAmount * cashOutMultiplier;

        if (users[socket.id].userId) {
          const user = await User.findById(users[socket.id].userId);
          if (user) {
            user.balance += winnings;
            await user.save();
            console.log(`💸 User ${socket.id} (${user.username}) cashed out: ${winnings.toFixed(2)} at ${cashOutMultiplier.toFixed(2)}x | Balance: ${user.balance}`);
          }
        } else {
          console.log(`💸 Guest ${socket.id} cashed out: ${winnings.toFixed(2)} at ${cashOutMultiplier.toFixed(2)}x (no database save)`);
        }

        io.to(socket.id).emit('cash_out_success', {
          winnings: winnings.toFixed(2),
          message: `${cashOutMultiplier.toFixed(2)}x`
        });

        users[socket.id].hasCashedOut = true;

      } catch (error) {
        console.error('❌ Error cashing out:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
      delete users[socket.id];
    });
  });

  await startGame();
};

module.exports = {
  gameLogic
};
