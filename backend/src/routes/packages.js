const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const packages = await db('packages').select('id', 'name', 'type', 'quota', 'duration_days', 'price', 'label');
    return res.json({ packages });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
