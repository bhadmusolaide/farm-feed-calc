function Error({ statusCode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#fef3c7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#d97706'
        }}>
          {statusCode || '?'}
        </div>
        
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.75rem'
        }}>
          {statusCode
            ? `A ${statusCode} error occurred on server`
            : 'An error occurred on client'}
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          {statusCode === 404
            ? 'This page could not be found.'
            : 'Sorry, something went wrong. Please try again later.'}
        </p>
        
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;