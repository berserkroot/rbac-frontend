const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s',
    opacity: disabled ? '0.6' : '1'
  };

  const variants = {
    primary: { background: 'var(--accent)', color: 'white' },
    secondary: { background: 'var(--code-bg)', color: 'var(--text-h)', border: '1px solid var(--border)' },
    danger: { background: '#dc2626', color: 'white' },
    ghost: { background: 'transparent', color: 'var(--text)' }
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '16px' },
    icon: { padding: '8px', width: '36px', height: '36px' }
  };

  const style = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <button
      type={type}
      style={style}
      disabled={disabled}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;