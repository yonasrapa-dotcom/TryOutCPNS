const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
router.use(authMiddleware);

router.post('/create', async (req, res, next) => {
  try {
    const { package_id } = req.body;
    const pkg = await db('packages').where({ id: package_id }).first();
    if (!pkg) return res.status(404).json({ message: 'Package tidak ditemukan' });

    const paymentId = uuidv4();
    const qrCodeUrl = `https://example.com/qrcode/${paymentId}`;

    const [payment] = await db('payments').insert({
      id: paymentId,
      user_id: req.user.id,
      package_id,
      amount: pkg.price,
      qr_code_url: qrCodeUrl,
      status: 'pending',
      created_at: new Date()
    }).returning(['id', 'package_id', 'amount', 'qr_code_url', 'status']);

    return res.json({ payment, gateway: config.paymentGateway });
  } catch (error) {
    next(error);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const { transaction_id, status } = req.body;
    const payment = await db('payments').where({ id: transaction_id }).first();
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const newStatus = status === 'capture' || status === 'settlement' ? 'paid' : 'expired';
    await db.transaction(async (trx) => {
      await trx('payments').where({ id: payment.id }).update({ status: newStatus, updated_at: new Date() });
      if (newStatus === 'paid') {
        const packageRecord = await trx('packages').where({ id: payment.package_id }).first();
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + packageRecord.duration_days);
        await trx('user_subscriptions').insert({
          user_id: payment.user_id,
          package_id: packageRecord.id,
          remaining_quota: packageRecord.quota,
          expired_at: expireAt,
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        });
        await trx('users').where({ id: payment.user_id }).update({ subscription_status: 'active' });
      }
    });

    return res.json({ message: 'Webhook processed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
