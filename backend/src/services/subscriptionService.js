function evaluateTryoutResult(answers, questions) {
  let score_tiu = 0;
  let score_twk = 0;
  let score_tkp = 0;

  const questionMap = new Map(questions.map((q) => [q.id, q]));

  answers.forEach((answer) => {
    const question = questionMap.get(answer.question_id);
    if (!question) return;

    const correct = question.correct_answer;
    const selected = answer.selected_answer;
    const isCorrect = selected === correct;
    const points = question.category_id === 3 ? scoreTkp(selected) : isCorrect ? 5 : 0;

    if (question.category_id === 1) score_tiu += points;
    if (question.category_id === 2) score_twk += points;
    if (question.category_id === 3) score_tkp += points;
  });

  return {
    score_tiu,
    score_twk,
    score_tkp,
    total_score: score_tiu + score_twk + score_tkp,
    time_used_seconds: 0
  };
}

function scoreTkp(selectedAnswer) {
  const scale = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'E': 1
  };
  return scale[selectedAnswer] || 0;
}

async function consumeQuota(trx, userId, subscriptionStatus, tryoutId) {
  const activeSubscription = await trx('user_subscriptions')
    .where({ user_id: userId, status: 'active' })
    .orderBy('created_at', 'desc')
    .first();

  if (!activeSubscription) {
    throw new Error('Tidak ada subscription aktif');
  }

  if (activeSubscription.expired_at && new Date(activeSubscription.expired_at) < new Date()) {
    await trx('user_subscriptions').where({ id: activeSubscription.id }).update({ status: 'expired' });
    throw new Error('Subscription sudah kadaluarsa');
  }

  if (activeSubscription.remaining_quota !== null) {
    if (activeSubscription.remaining_quota <= 0) {
      throw new Error('Kuota Try Out habis');
    }

    await trx('user_subscriptions')
      .where({ id: activeSubscription.id })
      .update({ remaining_quota: activeSubscription.remaining_quota - 1, updated_at: new Date() });
  }
}

async function updateRanking(trx, tryoutId) {
  // Get all results for this tryout ordered by total_score desc, then by created_at asc
  const results = await trx('results')
    .join('users', 'results.user_id', 'users.id')
    .where({ 'results.tryout_id': tryoutId })
    .select(
      'results.user_id',
      'results.total_score',
      'results.created_at',
      'users.name'
    )
    .orderBy('results.total_score', 'desc')
    .orderBy('results.created_at', 'asc');

  // Delete existing rankings for this tryout
  await trx('rankings').where({ tryout_id: tryoutId }).del();

  // Insert new rankings
  const rankings = results.map((result, index) => ({
    user_id: result.user_id,
    tryout_id: tryoutId,
    rank: index + 1,
    score: result.total_score,
    created_at: new Date()
  }));

  if (rankings.length > 0) {
    await trx('rankings').insert(rankings);
  }
}

module.exports = { evaluateTryoutResult, consumeQuota, updateRanking };
