import { useEffect, useState } from 'react';
import { getPackages } from '../api.js';

function PackageCards() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log('Fetching packages...');
        const response = await getPackages();
        console.log('Packages response:', response);
        setPackages(response.packages || []);
        setError('');
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(`Gagal memuat paket: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <section className="panel">
        <h2>Paket Subscription</h2>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Memuat paket...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Paket Subscription</h2>
        <div className="text-center">
          <p className="form-error">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Pastikan backend server berjalan di http://localhost:4000
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Paket Subscription</h2>
      {packages.length === 0 ? (
        <p className="text-center text-gray-600">Tidak ada paket tersedia</p>
      ) : (
        <div className="package-grid">
          {packages.map((pkg) => (
            <article key={pkg.id} className="package-card">
              <div className="package-label">{pkg.label}</div>
              <h3>{pkg.name}</h3>
              <p className="package-price">Rp{pkg.price.toLocaleString()}</p>
              <p>Kuota: {pkg.quota || 'Unlimited'}</p>
              <button className="primary-button">Pilih Paket</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PackageCards;

