const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const tryoutRoutes = require('./routes/tryout');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const packageRoutes = require('./routes/packages');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tryouts', tryoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`TryOut CPNS backend running on http://localhost:${config.port}`);
});
