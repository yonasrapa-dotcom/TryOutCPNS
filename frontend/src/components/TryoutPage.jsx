import { useState, useEffect } from 'react';
import { getTryoutQuestions, submitTryoutAnswers } from '../api.js';

function TryoutPage({ token, user }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes

  useEffect(() => {
    if (!token) return;

    const loadQuestions = async () => {
      try {
        // For demo, we'll use tryout ID 1
        const { questions: data } = await getTryoutQuestions(1);
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setLoading(false);
      }
    };

    loadQuestions();
  }, [token]);

  useEffect(() => {
    if (timeLeft > 0 && !result) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, result]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);

    try {
      const answerArray = Object.entries(answers).map(([questionId, selected_answer]) => ({
        question_id: parseInt(questionId),
        selected_answer
      }));

      const { result: submissionResult } = await submitTryoutAnswers(1, { answers: answerArray });
      setResult(submissionResult);
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!token) {
    return (
      <section className="panel">
        <h2>Try Out</h2>
        <p>Silakan login terlebih dahulu untuk mengakses try out.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="panel">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Memuat soal...</p>
        </div>
      </section>
    );
  }

  if (result) {
    return (
      <section className="panel">
        <h2>Hasil Try Out</h2>
        <div className="result-summary">
          <div className="score-card">
            <h3>Total Score</h3>
            <div className="score-value">{result.total_score}</div>
          </div>
          <div className="score-breakdown">
            <div>TIU: {result.score_tiu}</div>
            <div>TWK: {result.score_twk}</div>
            <div>TKP: {result.score_tkp}</div>
          </div>
        </div>
        <button className="primary-button" onClick={() => window.location.reload()}>
          Kerjakan Lagi
        </button>
      </section>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <section className="panel">
      <div className="tryout-header">
        <h2>TO 1 - Try Out CPNS</h2>
        <div className="timer">Waktu: {formatTime(timeLeft)}</div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">
        Soal {currentQuestion + 1} dari {questions.length}
      </div>

      {currentQ && (
        <div className="question-card">
          <h3>Soal {currentQuestion + 1}</h3>
          <p className="question-text">{currentQ.question_text}</p>

          <div className="options">
            {['A', 'B', 'C', 'D', 'E'].map(option => (
              <label key={option} className="option">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={() => handleAnswerChange(currentQ.id, option)}
                />
                <span className="option-text">
                  {option}. {currentQ[`option_${option.toLowerCase()}`]}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="navigation">
        <button
          className="secondary-button"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Sebelumnya
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            className="primary-button"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
          >
            Selanjutnya
          </button>
        ) : (
          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Mengirim...' : 'Selesai'}
          </button>
        )}
      </div>
    </section>
  );
}

export default TryoutPage;