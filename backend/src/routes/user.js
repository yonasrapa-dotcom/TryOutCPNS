const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/me', async (req, res) => {
  const { id, name, email, role, device_id, subscription_status } = req.user;
  return res.json({ user: { id, name, email, role, device_id, subscription_status } });
});

router.get('/results', async (req, res, next) => {
  try {
    const results = await db('results')
      .join('tryouts', 'results.tryout_id', 'tryouts.id')
      .where({ 'results.user_id': req.user.id })
      .select(
        'results.id',
        'results.score_tiu',
        'results.score_twk',
        'results.score_tkp',
        'results.total_score',
        'results.time_used_seconds',
        'results.created_at',
        'tryouts.name as tryout_name'
      )
      .orderBy('results.created_at', 'desc');
    return res.json({ results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
