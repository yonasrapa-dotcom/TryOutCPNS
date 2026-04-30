const express = require('express');
const multer = require('multer');
const db = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const csvImporter = require('../utils/csvImporter');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/upload-questions', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'File required' });

    const rows = await csvImporter.parseFile(file.path);
    const errors = csvImporter.validateQuestionRows(rows);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Format file tidak valid', errors });
    }

    const insertPayload = [];
    for (const row of rows) {
      const tryout = await db('tryouts').where({ title: row.tryout }).first();
      const category = await db('categories').where({ name: row.category }).first();
      if (!tryout || !category) continue;

      insertPayload.push({
        tryout_id: tryout.id,
        category_id: category.id,
        question_text: row.question,
        option_a: row.A,
        option_b: row.B,
        option_c: row.C,
        option_d: row.D,
        option_e: row.E,
        correct_answer: row.answer,
        explanation: row.explanation,
        created_at: new Date()
      });
    }

    await db('questions').insert(insertPayload);
    return res.json({ imported: insertPayload.length });
  } catch (error) {
    next(error);
  }
});

router.post('/users/:userId/reset-device', async (req, res, next) => {
  try {
    const { userId } = req.params;
    await db('users').where({ id: userId }).update({ device_id: null });
    return res.json({ message: 'Device reset berhasil' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
