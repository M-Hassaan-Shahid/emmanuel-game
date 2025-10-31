const {  insertUserBank,
    updateUserBank,
    getAllUserBank,
    getSingleUserBank,
    deleteUserBank,updatekycstatus,getSingleUserBankID} = require('../Controllers/KycController');
const express = require('express');
const router = express.Router();

router.post('/insertUserBank',insertUserBank);
router.put('/updateUserBank',updateUserBank,);
router.get('/getAllUserBank',getAllUserBank);
router.get('/getSingleUserBankID/:id',getSingleUserBankID);
router.post('/updatekycstatus/:id',updatekycstatus);
router.post('/getSingleUserBank',getSingleUserBank);
router.delete('/deleteUserBank',deleteUserBank);



module.exports=router;
