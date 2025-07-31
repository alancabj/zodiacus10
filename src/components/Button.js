import colors from '../styles/colors';

const Button = ({ children, onClick }) => {
  return (
    <button
      style={{
        backgroundColor: colors.primary,
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;