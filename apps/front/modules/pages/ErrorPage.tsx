import React from 'react';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
  const handleGoBack = () => {
    if (resetError) {
      resetError();
    } else {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ 
      padding: 32, 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>😔 Что-то пошло не так</h1>
      <p>Произошла непредвиденная ошибка</p>
      
      {error && (
        <details style={{ margin: '20px 0', textAlign: 'left' }}>
          <summary>Детали ошибки</summary>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 16, 
            borderRadius: 4,
            overflow: 'auto',
            maxWidth: '600px'
          }}>
            {error.message}
          </pre>
        </details>
      )}
      
      <div style={{ marginTop: 32 }}>
        <button 
          onClick={handleGoBack}
          style={{ 
            marginRight: 16,
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Назад
        </button>
        <button 
          onClick={handleGoHome}
          style={{ 
            padding: '12px 24px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          На главную
        </button>
      </div>
    </div>
  );
}; 