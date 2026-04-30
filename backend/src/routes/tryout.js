const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const subscriptionService = require('../services/subscriptionService');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const tryouts = await db('tryouts').select('*').orderBy('id', 'asc');
    return res.json({ tryouts });
  } catch (error) {
    next(error);
  }
});

router.get('/:tryoutId/questions', async (req, res, next) => {
  try {
    const { tryoutId } = req.params;
    const questions = await db('questions')
      .where({ tryout_id: tryoutId })
      .select('id', 'category_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e');
    return res.json({ questions });
  } catch (error) {
    next(error);
  }
});

router.post('/:tryoutId/submit', async (req, res, next) => {
  try {
    const { tryoutId } = req.params;
    const answers = req.body.answers || [];
    const questionIds = answers.map((item) => item.question_id);
    const questions = await db('questions')
      .whereIn('id', questionIds)
      .select('id', 'category_id', 'correct_answer');

    const result = subscriptionService.evaluateTryoutResult(answers, questions);

    await db.transaction(async (trx) => {
      await Promise.all(
        answers.map((answer) =>
          trx('user_answers').insert({
            user_id: req.user.id,
            question_id: answer.question_id,
            selected_answer: answer.selected_answer,
            created_at: new Date()
          })
        )
      );

      await trx('results').insert({
        user_id: req.user.id,
        tryout_id: tryoutId,
        score_tiu: result.score_tiu,
        score_twk: result.score_twk,
        score_tkp: result.score_tkp,
        total_score: result.total_score,
        time_used_seconds: result.time_used_seconds || 0,
        created_at: new Date()
      });

      await subscriptionService.consumeQuota(trx, req.user.id, req.user.subscription_status, tryoutId);
      await subscriptionService.updateRanking(trx, tryoutId);
    });

    return res.json({ result });
  } catch (error) {
    next(error);
  }
});

router.get('/:tryoutId/results', async (req, res, next) => {
  try {
    const { tryoutId } = req.params;
    const result = await db('results')
      .where({ user_id: req.user.id, tryout_id: tryoutId })
      .first();
    return res.json({ result });
  } catch (error) {
    next(error);
  }
});

router.get('/:tryoutId/ranking', async (req, res, next) => {
  try {
    const { tryoutId } = req.params;
    const rankings = await db('rankings')
      .where({ tryout_id: tryoutId })
      .orderBy('rank', 'asc')
      .limit(10);
    const myRank = await db('rankings')
      .where({ tryout_id: tryoutId, user_id: req.user.id })
      .first();
    return res.json({ rankings, myRank });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
