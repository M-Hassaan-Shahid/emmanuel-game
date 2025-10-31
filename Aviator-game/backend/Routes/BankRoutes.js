const { updatebankdetails ,getbankdetails} = require('../Controllers/BankController');
const express = require('express')

const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => { 
    if (file.mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only certain files are allowed!'), false);
    }
  }
});
router.put('/updatebankdetails',upload.single('QrCode'),updatebankdetails);
router.get('/getbankdetails',getbankdetails);


module.exports =router;