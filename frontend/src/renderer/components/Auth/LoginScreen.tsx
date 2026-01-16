import React from 'react';
import { RobloxService } from '../../services/roblox.service';

const LoginScreen: React.FC = () => {
  const handleLogin = () => {
    const authUrl = RobloxService.getAuthUrl();
    
    if (window.electron && window.electron.openExternal) {
      window.electron.openExternal(authUrl);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎮 Roblox Chat Overlay</h1>
        <p style={styles.subtitle}>Connect with players across servers!</p>
        
        <button style={styles.button} onClick={handleLogin}>
          🔐 Login with Roblox
        </button>
        
        <p style={styles.info}>
          You'll be redirected to Roblox to authorize.
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '40px',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '400px',
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
  },
  button: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    fontSize: '18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
    width: '100%',
  },
  info: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#999',
  },
};

export default LoginScreen;