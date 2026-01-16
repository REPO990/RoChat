import React, { useState, useEffect } from 'react';
import LoginScreen from './components/Auth/LoginScreen';
import ChatWindow from './components/Chat/ChatWindow';
import SettingsPanel from './components/Settings/SettingsPanel';
import { useGameDetection } from './hooks/useGameDetection';
import { useChat } from './hooks/useChat';
import { RobloxService } from './services/roblox.service';
import { Settings, User } from './types/index';
import './styles/App.css';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    position: 'bottom-right',
    alwaysOnTop: false,
    opacity: 0.9,
    keybind: 'Ctrl+Shift+C',
    isDraggable: true,
  });

  // ========== ADD THIS NEW useEffect ==========
  useEffect(() => {
    // Listen for OAuth callback from Electron
    if (window.electron && window.electron.onOAuthCallback) {
      window.electron.onOAuthCallback(({ accessToken, refreshToken }) => {
        console.log('🎯 OAuth callback received in React app');
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem('roblox_chat_access_token', accessToken);
        localStorage.setItem('roblox_chat_refresh_token', refreshToken);
      });
    }
  }, []);
  // ========== END OF NEW CODE ==========

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessTokenFromUrl = urlParams.get('accessToken');
    const refreshTokenFromUrl = urlParams.get('refreshToken');

    if (accessTokenFromUrl && refreshTokenFromUrl) {
      setAccessToken(accessTokenFromUrl);
      setRefreshToken(refreshTokenFromUrl);
      localStorage.setItem('roblox_chat_access_token', accessTokenFromUrl);
      localStorage.setItem('roblox_chat_refresh_token', refreshTokenFromUrl);
      window.history.replaceState({}, document.title, '/');
    } else {
      const savedAccessToken = localStorage.getItem('roblox_chat_access_token');
      const savedRefreshToken = localStorage.getItem('roblox_chat_refresh_token');
      if (savedAccessToken) {
        setAccessToken(savedAccessToken);
        setRefreshToken(savedRefreshToken);
      }
    }
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken) return;

      const userData = await RobloxService.verifyToken(accessToken);
      if (userData) {
        setUser(userData);
      } else {
        // Try to refresh the token
        if (refreshToken) {
          try {
            const response = await fetch('http://localhost:3001/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });
            
            if (response.ok) {
              const data = await response.json();
              setAccessToken(data.accessToken);
              localStorage.setItem('roblox_chat_access_token', data.accessToken);
            } else {
              // Both tokens are invalid, logout
              setAccessToken(null);
              setRefreshToken(null);
              localStorage.removeItem('roblox_chat_access_token');
              localStorage.removeItem('roblox_chat_refresh_token');
            }
          } catch (error) {
            // Logout on error
            setAccessToken(null);
            setRefreshToken(null);
            localStorage.removeItem('roblox_chat_access_token');
            localStorage.removeItem('roblox_chat_refresh_token');
          }
        } else {
          // No refresh token, logout
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem('roblox_chat_access_token');
          localStorage.removeItem('roblox_chat_refresh_token');
        }
      }
    };

    verifyToken();
  }, [accessToken, refreshToken]);

  const { presence, currentRoom } = useGameDetection(accessToken);
  const { messages, sendMessage } = useChat(currentRoom, accessToken);

  useEffect(() => {
    if (window.electron) {
      window.electron.setAlwaysOnTop(settings.alwaysOnTop);
      window.electron.setOpacity(settings.opacity);
    }
  }, [settings.alwaysOnTop, settings.opacity]);

  // Resize window when minimized/expanded
  useEffect(() => {
    if (window.electron && window.electron.resizeTo) {
      if (isMinimized) {
        window.electron.resizeTo(340, 65);
      } else {
        window.electron.resizeTo(350, 550);
      }
    }
  }, [isMinimized]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        setIsMinimized(!isMinimized);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setShowSettings(!showSettings);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMinimized, showSettings]);

  if (!accessToken || !user) {
    return <LoginScreen />;
  }

  return (
    <div className="app">
      <ChatWindow
        messages={messages}
        onSendMessage={sendMessage}
        currentRoom={currentRoom}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        position={settings.position}
        opacity={settings.opacity}
      />

      {!isMinimized && (
        <>
          <button onClick={() => setShowSettings(true)} style={styles.settingsButton}>
            ⚙️
          </button>

          <div style={styles.userInfo}>
            <img src={user.avatarUrl} alt={user.username} style={styles.avatar} />
            <span style={styles.username}>{user.username}</span>
            {presence.isOnline && <span style={styles.onlineIndicator}>🟢</span>}
          </div>
        </>
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  settingsButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(52, 152, 219, 0.8)',
    border: 'none',
    color: 'white',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  userInfo: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '10px 15px',
    borderRadius: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backdropFilter: 'blur(10px)',
    zIndex: 999,
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid white',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  onlineIndicator: {
    fontSize: '12px',
  },
};

export default App;