const express = require('express');
const router = express.Router();
const {
  getChatSession,
  sendChatMessage,
  resetChatSession,
  getDietHistory,
  getDietPlan,
  deleteDietPlan,
  generateDirect,
  regenerateDietPlan,
  quickQA
} = require('../controllers/dietController');
const { protect } = require('../middleware/auth');

// All diet routes are protected
router.use(protect);

router.post('/generate', generateDirect);
router.get('/history', getDietHistory);
router.get('/chat', getChatSession);
router.post('/chat/message', sendChatMessage);
router.post('/chat/reset', resetChatSession);
router.post('/quick-qa', quickQA);
router.get('/:id', getDietPlan);
router.delete('/:id', deleteDietPlan);
router.post('/:id/regenerate', regenerateDietPlan);

module.exports = router;
