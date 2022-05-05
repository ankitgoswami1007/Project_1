const express = require('express');
const { route } = require('express/lib/application');
const router = express.Router();

const collegeController = require('../controllers/collegeController')
const internController = require('../controllers/internController')


router.post('/functionup/colleges', collegeController.createCollege)
router.post('/functionup/interns', internController.registerIntern)
router.get('/functionup/collegeDetails', collegeController.getCollegeDetails)


module.exports = router;