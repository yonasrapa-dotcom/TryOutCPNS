const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, device_id } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password required' });
    }

    const existing = await db('users').where({ email }).first();
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db('users').insert({
      name,
      email,
      password: hashed,
      role: 'user',
      device_id: device_id || null,
      subscription_status: 'none',
      created_at: new Date()
    }).returning(['id', 'name', 'email', 'role', 'device_id', 'subscription_status']);

    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, device_id } = req.body;
    if (!email || !password || !device_id) {
      return res.status(400).json({ message: 'email, password, device_id required' });
    }

    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (user.device_id && user.device_id !== device_id) {
      return res.status(403).json({ message: 'Login dari device lain ditolak' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: '30d'
    });

    await db('users').where({ id: user.id }).update({ device_id, subscription_status: user.subscription_status || 'none' });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, subscription_status: user.subscription_status } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
