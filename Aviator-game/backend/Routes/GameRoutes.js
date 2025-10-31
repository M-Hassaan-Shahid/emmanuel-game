const { gameLogic } = require('../Controllers/GameControllerEnhanced');
const express = require('express');
const router = express.Router();

// Use a single route for socket connection
router.post('/start-game', (req, res) => {
  // This endpoint could be used to initialize game logic
  // Here, you could emit an event to start the game if needed
  res.status(200).send('Game started');
});

module.exports = (io) => {
  gameLogic(io); // Call game logic with the io instance
  return router; // Return the router
}
