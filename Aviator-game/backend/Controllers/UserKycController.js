const UserBank = require('../Models/UserBankDetails');
const bcrypt = require('bcrypt');
const insertUserBank = async (req, res) => {
    try {

        const newUserBank = new UserBank(req.body);
        await newUserBank.save();
        res.status(201).json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: "Error inserting User Bank details", error: err.message });
    }
};

const updateUserBank = async (req, res) => {
    const updatedata = req.body;
    const id = updatedata.id;
    try {
        // console.log(updatedata.oldData)       
        const result = await UserBank.updateOne(
            { _id: id },
            {
                $set: updatedata.oldData,
            }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "UserBank not found" });
        }
        return res.status(200).json({ success: true, result: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: "error in updating the User Bank", error: err.message });

    }
}



const getAllUserBank = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const search = req.query.search;
        const kycstatus = req.query.kycstatus;

        const query = {
            deleted_at: null,
        };
        if (search) {
            query.bankName = { $regex: search, $options: "i" };
        }
        if (kycstatus) {
            query.kycstatus = kycstatus; // Add transactionType if it exists
        }

        const result = await UserBank.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        const count = await UserBank.find(query).countDocuments();
        res.status(200).json({ success: true, result, count });

    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching UserBank" });
    }
}
const getSingleUserBank = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await UserBank.findOne({ _id: id });
        if (!result) {
            return res.status(404).json({ success: false, message: "UserBank not found" });
        }
        return res.status(200).json({ success: true, result: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: "error fetching UserBank" });
    }
}
const getSingleUserBankID = async (req, res) => {
    const { id } = req.params;
    try {
        const query = {
            id: id,
        };
        const result = await UserBank.find({ _id: id });
        if (!result) {
            return res.status(404).json({ success: false, message: "UserBank not found" });
        }
        return res.status(200).json({ success: true, result });
    } catch (error) {
        return res.status(500).json({ success: false, message: "error fetching UserBank" });
    }
}

const deleteUserBank = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await UserBank.findByIdAndUpdate(
            id,
            { deleted_at: new Date() },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "UserBank not found" });
        }
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching UserBank" });
    }
}

const updatekycstatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = req.body.status;
        console.log(status);
        const UserBanknew = await UserBank.findById(id);
        UserBanknew.kycstatus = status;
        await UserBanknew.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res
            .status(500)
            .json({
                success: false,
                message: "error fetching bank details",
                error: err.message,
            });
    }
};
module.exports = {
    insertUserBank,
    updateUserBank,
    getAllUserBank,
    getSingleUserBank,
    deleteUserBank,
    updatekycstatus,
    getSingleUserBankID

}