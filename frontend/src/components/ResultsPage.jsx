import { useState, useEffect } from 'react';
import { getTryoutRanking, getUserResults } from '../api.js';

function ResultsPage({ token, user }) {
  const [results, setResults] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        // Load user results
        const resultsData = await getUserResults(token);
        setResults(resultsData);

        // Load ranking for TO 1
        const rankingData = await getTryoutRanking(1);
        setRanking(rankingData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (!token) {
    return (
      <section className="panel">
        <h2>Hasil & Ranking</h2>
        <p>Silakan login terlebih dahulu untuk melihat hasil.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Memuat data...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Hasil & Ranking Try Out</h2>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          Hasil Saya
        </button>
        <button
          className={`tab-button ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          Ranking TO 1
        </button>
      </div>

      {activeTab === 'results' && (
        <div className="results-section">
          <h3>Riwayat Try Out</h3>
          {results.length === 0 ? (
            <p className="no-data">Belum ada hasil try out.</p>
          ) : (
            <div className="results-grid">
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <h4>{result.tryout_title}</h4>
                    <span className="result-date">
                      {new Date(result.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="score-breakdown">
                    <div className="score-item">
                      <span className="score-label">TIU</span>
                      <span className="score-value">{result.score_tiu}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">TWK</span>
                      <span className="score-value">{result.score_twk}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">TKP</span>
                      <span className="score-value">{result.score_tkp}</span>
                    </div>
                    <div className="score-item total">
                      <span className="score-label">Total</span>
                      <span className="score-value">{result.total_score}</span>
                    </div>
                  </div>
                  <div className="result-time">
                    Waktu: {Math.floor(result.time_used_seconds / 60)}:{(result.time_used_seconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="ranking-section">
          <h3>Ranking Try Out 1</h3>
          {ranking.length === 0 ? (
            <p className="no-data">Belum ada ranking tersedia.</p>
          ) : (
            <div className="ranking-list">
              {ranking.slice(0, 10).map((rank, index) => (
                <div key={rank.user_id} className={`ranking-item ${rank.user_id === user.id ? 'current-user' : ''}`}>
                  <div className="rank-number">
                    {index + 1}
                  </div>
                  <div className="rank-info">
                    <div className="rank-name">{rank.user_name}</div>
                    <div className="rank-score">Skor: {rank.total_score}</div>
                  </div>
                  <div className="rank-medal">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ResultsPage;