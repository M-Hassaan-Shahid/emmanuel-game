const Player = require('../Models/Players');
const placeBet = async (req, res) => {
    const { playerId, betAmount, cashoutMultiplier } = req.body;

    // Generate crash multiplier
    let lambda = 0.1;
    let crashMultiplier = generateCrashMultiplier(lambda);
    console.log(cashoutMultiplier)
    console.log(crashMultiplier);
    // Check if player cashed out before crash
    let playerWon = cashoutMultiplier <= crashMultiplier;
    let winnings = 0;
    // console.log(playerWon);

    if (playerWon) {
        winnings = betAmount * cashoutMultiplier;
      //  await Player.findByIdAndUpdate(playerId, { $inc: { balance: winnings } });
    } else {
        // Player loses, deduct the bet
      //  await Player.findByIdAndUpdate(playerId, { $inc: { balance: -betAmount } });
    }

    res.json({
        crashMultiplier,
        playerWon,
        winnings
    });
};

// Random crash multiplier generator
function generateCrashMultiplier(lambda) {
    const randomValue = Math.random(); // Random number between 0 and 1
    const crashMultiplier = -Math.log(randomValue) / lambda; // Exponential distribution
    return Math.max(1.01, crashMultiplier.toFixed(2)); // Ensure multiplier is >= 1.01
}


module.exports = {
    placeBet,
}