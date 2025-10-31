const { placeBet } = require('../Controllers/PlayerController');
const express = require('express')
const router = express.Router();

router.post('/placeBet',placeBet);

module.exports =router;