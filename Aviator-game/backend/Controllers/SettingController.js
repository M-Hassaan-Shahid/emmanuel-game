const Setting = require('../Models/Setting');
const getsetting = async (req, res) => {
  try {
    const result = await Setting.find(); // Update the first document found
    if (!result) {
      return res.status(404).json({ success: false, message: "No files present" });
    }

    res.status(200).json({ success: true, result: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error in get setting", error: err.message });
  }
}
const updatesetting = async (req, res) => {
  try {
    console.log('📝 Update Setting Request Body:', req.body);

    // Find the first setting document (assuming singleton pattern)
    const existingSetting = await Setting.findOne();
    console.log('🔍 Existing Setting:', existingSetting ? 'Found' : 'Not Found');

    if (!existingSetting) {
      // If no setting exists, create one
      console.log('✨ Creating new setting...');
      const newSetting = new Setting(req.body);
      const savedSetting = await newSetting.save();
      console.log('✅ Setting created successfully:', savedSetting._id);
      return res.status(201).json({ success: true, message: "Setting created successfully", result: savedSetting });
    }

    // Update the existing setting
    console.log('🔄 Updating existing setting with ID:', existingSetting._id);
    const result = await Setting.findByIdAndUpdate(
      existingSetting._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!result) {
      console.log('❌ Update failed - no result returned');
      return res.status(404).json({ success: false, message: "No changes made to the setting." });
    }

    console.log('✅ Setting updated successfully');
    res.status(200).json({ success: true, message: "Setting updated successfully", result: result });
  } catch (err) {
    console.error('❌ Error updating setting:', err);
    res.status(500).json({ success: false, message: "Error in updating the setting", error: err.message });
  }
}
const insertsetting = async (req, res) => {
  try {
    const newbet = new Setting({ ...req.body });
    await newbet.save();
    res.status(201).json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: "Error inserting setting", error: err.message });
  }
};

module.exports = {
  updatesetting,
  getsetting,
  insertsetting
}