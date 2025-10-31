const PlaneCrash = require('../Models/PlaneCrash');
const bcrypt = require('bcrypt');
const insertplanecrash = async (req, res) => {
    try {
        console.log(req.body)
        const newbet = new PlaneCrash(req.body);
        await newbet.save();
        res.status(201).json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: "Error inserting plane percentage", error: err.message });
    }
};

const updateplanecrash = async (req, res) => {
    const updatedata = req.body;
    const id = updatedata.id;
    try {
        const result = await PlaneCrash.updateOne(
            { _id: id },
            {
                $set: updatedata.oldData
            }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "plane crash record not found" });
        }
        return res.status(200).json({ success: true, result: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: "error in updating the plane crash record", error: err.message });

    }
}



const getAllplanecrash = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.limit);
        const page = parseInt(req.query.page);
        const search = req.query.search;

        const query = {
            deleted_at: null,
        };
        if (search) {
            query.crashPercentage = { $regex: search, $options: "i" };
        }

        const result = await PlaneCrash.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        const count = await PlaneCrash.find(query).countDocuments();
        res.status(200).json({ success: true, result, count });

    } catch (error) {
        res.status(500).json({ success: false, message: "error inserting plane crash" });
    }
}
const getSingleplanecrash = async (req, res) => {
    const { id } = req.body;
    try {

        const result = await PlaneCrash.findOne({ _id: id });
        if (!result) {
            return res.status(404).json({ success: false, message: "plane crash record not found" });
        }
        return res.status(200).json({ success: true, result: result });
    } catch (error) {
        return res.status(500).json({ success: false, message: "error fetching plane crash record" });
    }
}

const deleteplanecrash = async (req, res) => {
    try {
        const { id } = req.body;
        const result = await PlaneCrash.findByIdAndUpdate(
            id,
            { deleted_at: new Date() },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ success: false, message: "Plane Crash record not found" });
        }
        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "error fetching plane percentage" });
    }
}
module.exports = {
    insertplanecrash,
    updateplanecrash,
    getAllplanecrash,
    getSingleplanecrash,
    deleteplanecrash,

}