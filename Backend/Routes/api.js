const express = require('express');
const router = express.Router();
const { 
  extractText, 
  normalizeTests, 
  generateSummary,
  processComplete 
} = require('../controllers/medicalController');

// Individual APIs
router.post('/extract-text', extractText);
router.post('/normalize-tests', normalizeTests);
router.post('/generate-summary', generateSummary);

// Complete pipeline API
router.post('/process-complete', processComplete);

module.exports = router;