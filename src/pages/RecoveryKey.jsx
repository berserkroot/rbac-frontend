import { useState } from 'react';
import { useToast } from '../context/ToastContext';

const RecoveryKey = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateKey = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/generate-recovery-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recovery_key'; // sin extensión
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      addToast('Archivo de recuperación generado. Guárdalo en un lugar seguro.', 'info', 5000);
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Archivo de recuperación</h2>
      <p>Genera un archivo único que podrás usar para restablecer tu contraseña si la olvidas.</p>
      <button onClick={generateKey} className="btn btn-primary" disabled={loading}>
        {loading ? 'Generando...' : 'Generar archivo de recuperación'}
      </button>
    </div>
  );
};

export default RecoveryKey;