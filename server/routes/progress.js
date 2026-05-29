const express = require('express');
const router = express.Router();
const { logProgress, getProgressHistory } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', logProgress);
router.get('/', getProgressHistory);

module.exports = router;
