import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { passwordPolicy } from '../../services/api';

const PasswordPolicy = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSymbol: true,
    expiryDays: 90,
    historyLimit: 20
  });

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      const data = await passwordPolicy.get();
      setPolicy({
        minLength: parseInt(data.password_min_length) || 8,
        requireUppercase: data.password_require_uppercase === 'true',
        requireNumber: data.password_require_number === 'true',
        requireSymbol: data.password_require_symbol === 'true',
        expiryDays: parseInt(data.password_expiry_days) || 90,
        historyLimit: parseInt(data.password_history_limit) || 20
      });
    } catch (err) {
      addToast('Error al cargar políticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await passwordPolicy.update({
        minLength: policy.minLength,
        requireUppercase: policy.requireUppercase,
        requireNumber: policy.requireNumber,
        requireSymbol: policy.requireSymbol,
        expiryDays: policy.expiryDays,
        historyLimit: policy.historyLimit
      });
      addToast('Políticas actualizadas correctamente', 'success');
    } catch (err) {
      addToast('Error al actualizar políticas', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="card">Cargando...</div>;

  return (
    <div className="profile-container">
      <h1 className="profile-title">Políticas de contraseña</h1>
      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Longitud mínima</label>
            <input type="number" name="minLength" value={policy.minLength} onChange={handleChange} min="1" max="20" className="form-input" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" name="requireUppercase" checked={policy.requireUppercase} onChange={handleChange} /> Requerir mayúscula
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" name="requireNumber" checked={policy.requireNumber} onChange={handleChange} /> Requerir número
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" name="requireSymbol" checked={policy.requireSymbol} onChange={handleChange} /> Requerir símbolo
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">Días de expiración (0 = nunca)</label>
            <input type="number" name="expiryDays" value={policy.expiryDays} onChange={handleChange} min="0" max="365" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Historial (últimas N contraseñas a evitar)</label>
            <input type="number" name="historyLimit" value={policy.historyLimit} onChange={handleChange} min="1" max="50" className="form-input" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Guardar cambios</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPolicy;