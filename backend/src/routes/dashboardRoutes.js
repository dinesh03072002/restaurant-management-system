const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET daily summary
router.get('/daily-summary', dashboardController.getDailySummary);

// GET revenue chart data
router.get('/revenue-chart', dashboardController.getRevenueChart);


module.exports = router;