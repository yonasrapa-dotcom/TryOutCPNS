import { useState } from 'react';
import { uploadQuestions } from '../api.js';

function AdminUpload({ token, user }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const fileSelected = event.target.files[0];
    setFile(fileSelected);
    setPreview(null);
    setStatus('');
    if (!fileSelected) return;

    if (fileSelected.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = () => {
        const rows = reader.result.split('\n').slice(0, 4);
        setPreview(rows.join('\n'));
      };
      reader.readAsText(fileSelected);
    } else {
      setPreview(`File siap diunggah: ${fileSelected.name}`);
    }
  };

  const handleUpload = async () => {
    if (!token || !file) {
      setStatus('Pilih file terlebih dahulu.');
      return;
    }
    setLoading(true);
    setStatus('Mengunggah...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const { imported } = await uploadQuestions(token, formData);
      setStatus(`Berhasil import ${imported} soal.`);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="panel">
        <h2>Admin Upload</h2>
        <p>Silakan login sebagai admin untuk mengakses halaman upload soal.</p>
      </section>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <section className="panel">
        <h2>Admin Upload</h2>
        <p>Hanya admin yang boleh mengakses halaman ini.</p>
      </section>
    );
  }

  const templateText = 'tryout,category,question,A,B,C,D,E,answer,explanation\nTO 1,TIU,Contoh soal,A,B,C,D,E,A,Penjelasan lengkap';
  const downloadUrl = URL.createObjectURL(new Blob([templateText], { type: 'text/csv' }));

  return (
    <section className="panel">
      <h2>Upload Soal Admin</h2>
      <p>Unggah file CSV atau XLSX dengan format header:</p>
      <pre className="code-box">tryout,category,question,A,B,C,D,E,answer,explanation</pre>
      <div className="upload-row">
        <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
        <a href={downloadUrl} download="template-soal.csv" className="secondary-button">
          Download Template
        </a>
      </div>

      {preview && (
        <div className="preview-box">
          <strong>Preview:</strong>
          <pre>{preview}</pre>
        </div>
      )}

      <button onClick={handleUpload} className="primary-button" disabled={loading}>
        {loading ? 'Mengunggah...' : 'Import Soal'}
      </button>
      {status && <p className="form-status">{status}</p>}
    </section>
  );
}

export default AdminUpload;
