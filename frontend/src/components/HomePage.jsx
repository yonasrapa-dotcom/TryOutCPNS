function HomePage() {
  return (
    <section className="panel">
      <h1>Selamat datang di TryOut CPNS</h1>
      <p>
        Demo preview aplikasi TryOut CPNS. Fitur yang ditampilkan meliputi autentikasi,
        paket subscription, dan preview tryout.
      </p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Autentikasi JWT</h3>
          <p>Register & login dengan role user/admin.</p>
        </div>
        <div className="feature-card">
          <h3>Paket Subscription</h3>
          <p>Limited dan unlimited dengan sistem kuota dan masa aktif.</p>
        </div>
        <div className="feature-card">
          <h3>Upload Soal</h3>
          <p>Upload soal CSV/XLSX hanya untuk admin.</p>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
