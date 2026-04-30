import { useState } from 'react';
import { login, register } from '../api.js';

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const device_id = window.navigator.userAgent || 'web-preview';
        const { token, user } = await login({ email: form.email, password: form.password, device_id });
        onAuthSuccess({ token, user });
      } else {
        const device_id = window.navigator.userAgent || 'web-preview';
        const { user } = await register({ name: form.name, email: form.email, password: form.password, device_id });
        const { token, user: loggedUser } = await login({ email: form.email, password: form.password, device_id });
        onAuthSuccess({ token, user: loggedUser });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <div className="auth-toggle">
        <button onClick={() => setMode('login')} className={mode === 'login' ? 'active' : ''}>
          Login
        </button>
        <button onClick={() => setMode('register')} className={mode === 'register' ? 'active' : ''}>
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'register' && (
          <label>
            Nama lengkap
            <input name="name" type="text" value={form.name} onChange={handleChange} required />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Sedang memproses...' : mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      {mode === 'login' && (
        <div className="demo-account">
          <p><strong>Demo Account:</strong></p>
          <p>Admin: admin@tryoutcpns.test / admin123</p>
          <p>User: register akun baru</p>
        </div>
      )}
    </section>
  );
}

export default AuthPage;
