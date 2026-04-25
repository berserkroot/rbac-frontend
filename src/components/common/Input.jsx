const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  textarea = false,
  rows = 3,
  ...props
}) => {
  const inputStyles = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${error ? '#dc2626' : 'var(--border)'}`,
    borderRadius: '6px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text-h)',
    outline: 'none',
    fontFamily: 'inherit'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--accent)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = error ? '#dc2626' : 'var(--border)';
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label 
          style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '14px', 
            fontWeight: '500',
            color: 'var(--text-h)'
          }}
        >
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          style={{ ...inputStyles, resize: 'vertical', minHeight: '80px' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      )}
      
      {error && (
        <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;