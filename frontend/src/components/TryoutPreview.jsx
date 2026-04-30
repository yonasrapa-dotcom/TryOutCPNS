const tryoutData = {
  title: 'TO 1 - CPNS Simulasi',
  sections: [
    { name: 'TIU', count: 10, scorePerQuestion: 5 },
    { name: 'TWK', count: 10, scorePerQuestion: 5 },
    { name: 'TKP', count: 10, scorePerQuestion: 5 }
  ]
};

function TryoutPreview() {
  return (
    <section className="panel">
      <h2>Preview Try Out</h2>
      <div className="tryout-card">
        <h3>{tryoutData.title}</h3>
        <p>Struktur TO terdiri dari TIU, TWK, dan TKP.</p>
        <div className="tryout-grid">
          {tryoutData.sections.map((section) => (
            <div key={section.name} className="tryout-section">
              <h4>{section.name}</h4>
              <p>Jumlah soal: {section.count}</p>
              <p>Skor benar: {section.scorePerQuestion}</p>
            </div>
          ))}
        </div>
        <div className="tryout-notes">
          <p>Skor TIU & TWK: benar = 5, salah = 0.</p>
          <p>Skor TKP akan dihitung dengan skala sesuai pilihan.</p>
        </div>
      </div>
    </section>
  );
}

export default TryoutPreview;
