const db = require('../db');

async function deviceCheck(req, res, next) {
  const user = req.user;
  const deviceId = req.headers['x-device-id'] || req.body.device_id || req.query.device_id;

  if (!deviceId) {
    return res.status(400).json({ message: 'Device ID required' });
  }

  if (user.device_id && user.device_id !== deviceId) {
    return res.status(403).json({ message: 'Akun sudah terdaftar di device lain' });
  }

  await db('users').where({ id: user.id }).update({ device_id: deviceId });
  next();
}

module.exports = deviceCheck;
