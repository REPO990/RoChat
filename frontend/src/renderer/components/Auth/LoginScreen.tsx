import React from 'react';
import { RobloxService } from '../../services/roblox.service';

const LoginScreen: React.FC = () => {
 const handleLogin = () => {
  const authUrl = RobloxService.getAuthUrl();
  
  // Use Electron's shell module via the preload bridge
  if (window.electron && window.electron.openExternal) {
    window.electron.openExternal(authUrl); // This will use shell.openExternal
  } else {
    // Fallback for web version (though your app is Electron)
    console.error('Electron API not available');
  }
};

  // NEW: Test function to open URL in default browser
  const testOpenExternal = () => {
    const testUrl = 'https://google.com';
    console.log('Testing external browser open with URL:', testUrl);
    
    // Use Electron's openExternal if available
    if (window.electron && window.electron.openExternal) {
      console.log('Using electron.openExternal');
      window.electron.openExternal(testUrl);
    } else {
      console.warn('Electron API not available. Test would fall back to window.open');
      // Fallback for testing in non-Electron environment
      window.open(testUrl, '_blank');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎮 Roblox Chat Overlay</h1>
        <p style={styles.subtitle}>Connect with players across servers!</p>
        
        {/* Main Login Button (Red) */}
        <button style={styles.button} onClick={handleLogin}>
          🔐 Login with Roblox
        </button>
        
        {/* NEW: Test Button (Green) */}
        <button 
          style={styles.testButton} 
          onClick={testOpenExternal}
          title="Test if opening in default browser works"
        >
          🧪 Test: Open Google in Browser
        </button>
        
        <p style={styles.info}>
          You'll be redirected to Roblox to authorize.
        </p>
        <p style={styles.testInfo}>
          <small>Use the green test button first to verify external browser functionality</small>
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
    marginBottom: '15px', // Added spacing for test button
    width: '100%',
  },
  // NEW: Test button style
  testButton: {
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
    width: '100%',
    marginBottom: '15px',
  },
  info: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#999',
  },
  // NEW: Test info style
  testInfo: {
    marginTop: '10px',
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic',
  },
};

export default LoginScreen;