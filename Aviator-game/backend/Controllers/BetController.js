const Bet = require('../Models/Bet');
const bcrypt = require('bcrypt');
const insertbet = async (req, res) => {
    try {
        const level = req.body.bet_level;
        const line = req.body.bet_line;
        const size = req.body.bet_size;
        const bet_amount = level * line * size;
        const newbet = new Bet({ ...req.body, bet_amount: bet_amount });
        await newbet.save();
        res.status(201).json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: "Error inserting bet", error: err.message });
    }
};

const updatebet = async (req, res) => {
    const updatedata = req.body;
    const id = updatedata.id;
    try {
        // console.log(updatedata.oldData)
        const level = updatedata.oldData.bet_level;
        const line = updatedata.oldData.bet_line;
        const size = updatedata.oldData.bet_size;
        const bet_amount = level * line * size;
        const result = await Bet.updateOne(
            { _id: id },
            {
                $set: {
                    ...updatedata.oldData,
                    bet_amount: bet_amount
                }
            }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "bet not found" });
        }
        return res.status(201).json({ success: true, result: result });
    } catch (err) {
        res.status(500).json({ success: false, message: "error in updating the bet", error: err.message });

    }
}



const getAllbet = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const search = req.query.search;

        const query = {
            deleted_at: null,
        };
        if (search) {
            query.bet_level = { $regex: search, $options: "i" };
        }

        const result = await Bet.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        const count = await Bet.find(query).countDocuments();
        res.status(200).json({ success: true, result, count });

    } catch (error) {
        res.status(500).json({ success: false, message: "error inserting bet" });
    }
}
const getSinglebet = async (req, res) => {
    const { id, userId } = req.body;
    try {
        let result;

        if (userId) {
            // Get all bets for a user
            result = await Bet.find({ userId: userId }).sort({ createdAt: -1 });
            console.log(`📊 Found ${result.length} bets for user ${userId}`);
        } else if (id) {
            // Get single bet by ID
            result = await Bet.findOne({ _id: id });
        } else {
            return res.status(400).json({ success: false, message: "id or userId required" });
        }

        if (!result || (Array.isArray(result) && result.length === 0)) {
            return res.status(200).json({ success: true, result: [] });
        }

        return res.status(200).json({ success: true, result: result });
    } catch (error) {
        console.error('❌ Error fetching bets:', error);
        return res.status(500).json({ success: false, message: "error fetching bet" });
    }
}

const deletebet = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await Bet.findByIdAndUpdate(
            id,
            { deleted_at: new Date() },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "bet not found" });
        }
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching bet" });
    }
}

// Get recent bets for display in bet list
const getRecentBets = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;

        const bets = await Bet.find({ deleted_at: null })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'username email')
            .lean();

        // Format bets for frontend
        const formattedBets = bets.map(bet => ({
            id: bet._id,
            userId: bet.userId?._id,
            username: bet.userId?.username || 'Anonymous',
            bet: bet.bet_amount,
            mult: bet.cashout_multiplier ? `${bet.cashout_multiplier.toFixed(2)}X` : '',
            cashout: bet.winnings || '',
            status: bet.status,
            createdAt: bet.createdAt
        }));

        res.status(200).json({
            success: true,
            bets: formattedBets
        });
    } catch (error) {
        console.error('❌ Error fetching recent bets:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching recent bets",
            error: error.message
        });
    }
};

module.exports = {
    insertbet,
    updatebet,
    getAllbet,
    getSinglebet,
    deletebet,
    getRecentBets,
}