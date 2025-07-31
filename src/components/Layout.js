import colors from '../styles/colors';

const Layout = ({ children }) => {
  return (
    <div>
      <header style={{ backgroundColor: colors.secondary, padding: '1rem' }}>
        <h1 style={{ color: colors.primary, margin: 0 }}>Zodiacus</h1>
      </header>
      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;