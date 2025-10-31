const {  insertplanecrash,
    updateplanecrash,
    getAllplanecrash,
    getSingleplanecrash,
    deleteplanecrash,} = require('../Controllers/PlaneCrashController');
    const express = require('express')
    const router = express.Router();
    

router.post('/insertplanecrash',insertplanecrash);
router.put('/updateplanecrash',updateplanecrash);
router.get('/getAllplanecrash',getAllplanecrash);
router.post('/getSingleplanecrash',getSingleplanecrash);
router.delete('/deleteplanecrash',deleteplanecrash);

module.exports = router;
