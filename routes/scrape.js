const express = require('express');
const router = express.Router();
const scrapeController = require('../controller/scrape');
router.post('/gb', scrapeController.runScraper);
module.exports = router;