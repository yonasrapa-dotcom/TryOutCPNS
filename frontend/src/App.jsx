import { useMemo, useState } from 'react';
import HomePage from './components/HomePage.jsx';
import PackageCards from './components/PackageCards.jsx';
import TryoutPreview from './components/TryoutPreview.jsx';
import AuthPage from './components/AuthPage.jsx';
import AdminUpload from './components/AdminUpload.jsx';
import TryoutPage from './components/TryoutPage.jsx';
import ResultsPage from './components/ResultsPage.jsx';

const initialToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

function App() {
  const [page, setPage] = useState('home');
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const isAdmin = user?.role === 'admin';
  const userName = user?.name || 'Guest';

  const authButtons = useMemo(() => {
    if (token && user) {
      return (
        <>
          <button onClick={() => setPage('tryout')}>Kerjakan TO</button>
          <button onClick={() => setPage('results')}>Hasil & Ranking</button>
          {isAdmin && <button onClick={() => setPage('admin')}>Admin Upload</button>}
          <button onClick={() => { setToken(null); setUser(null); setPage('home'); localStorage.removeItem('token'); localStorage.removeItem('user'); }}>
            Logout
          </button>
        </>
      );
    }

    return <button onClick={() => setPage('auth')}>Login / Register</button>;
  }, [token, user, isAdmin]);

  const handleAuthSuccess = ({ token: authToken, user: authUser }) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setPage('home');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">TryOut CPNS</div>
        <nav>
          <button onClick={() => setPage('home')}>Beranda</button>
          <button onClick={() => setPage('packages')}>Paket</button>
          <button onClick={() => setPage('preview')}>Preview TO</button>
          {authButtons}
        </nav>
      </header>

      <main>
        <div className="status-bar">
          <span>Login status: {token ? `Masuk sebagai ${userName}` : 'Belum login'}</span>
        </div>

        {page === 'home' && <HomePage />}
        {page === 'packages' && <PackageCards />}
        {page === 'preview' && <TryoutPreview />}
        {page === 'tryout' && <TryoutPage token={token} user={user} />}
        {page === 'results' && <ResultsPage token={token} user={user} />}
        {page === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {page === 'admin' && <AdminUpload token={token} user={user} />}
      </main>

      <footer className="footer">Demo preview aplikasi TryOut CPNS.</footer>
    </div>
  );
}

export default App;
