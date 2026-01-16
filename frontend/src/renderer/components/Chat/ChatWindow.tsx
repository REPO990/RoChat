import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '../../types/index';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentRoom: string | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  position: string;
  opacity: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  currentRoom,
  isMinimized,
  onToggleMinimize,
  position,
  opacity,
}) => {
  const handleClose = () => {
    if (window.electron) {
      window.electron.close();
    }
  };

  const getRoomName = () => {
    if (!currentRoom) return 'Not in game';
    
    if (currentRoom.startsWith('global:')) {
      const placeId = currentRoom.split(':')[1];
      return `🌍 Global Chat - Game ${placeId}`;
    } else if (currentRoom.startsWith('server:')) {
      const [, placeId] = currentRoom.split(':');
      return `🖥️ Server Chat - Game ${placeId}`;
    }
    
    return 'Chat';
  };

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      width: '320px',
      opacity,
    };

    // When minimized, always snap to bottom
    if (isMinimized) {
      switch (position) {
        case 'top-left':
        case 'bottom-left':
          return { ...baseStyles, bottom: '10px', left: '10px', height: '45px' };
        case 'top-right':
        case 'bottom-right':
        default:
          return { ...baseStyles, bottom: '10px', right: '10px', height: '45px' };
      }
    }

    // When expanded
    const expandedHeight = '450px';
    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '10px', left: '10px', height: expandedHeight };
      case 'top-right':
        return { ...baseStyles, top: '10px', right: '10px', height: expandedHeight };
      case 'bottom-left':
        return { ...baseStyles, bottom: '10px', left: '10px', height: expandedHeight };
      case 'bottom-right':
        return { ...baseStyles, bottom: '10px', right: '10px', height: expandedHeight };
      case 'roblox-style':
        return { ...baseStyles, bottom: '10px', left: '10px', width: '350px', height: '280px' };
      default:
        return { ...baseStyles, bottom: '10px', right: '10px', height: expandedHeight };
    }
  };

  return (
    <div style={{ ...styles.container, ...getPositionStyles() }}>
      <div style={styles.header} className="draggable-header">
        <span style={styles.title}>{getRoomName()}</span>
        <div style={styles.controls}>
          <button onClick={onToggleMinimize} style={styles.controlButton}>
            {isMinimized ? '▲' : '▼'}
          </button>
          <button onClick={handleClose} style={styles.closeButton}>
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <MessageList messages={messages} />
          <MessageInput onSendMessage={onSendMessage} disabled={!currentRoom} />
        </>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(15px)',
    borderRadius: '15px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    background: 'rgba(52, 152, 219, 0.3)',
    padding: '12px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'move',
    userSelect: 'none',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  controls: {
    display: 'flex',
    gap: '8px',
  },
  controlButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    background: 'rgba(231, 76, 60, 0.8)',
    border: 'none',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
};

export default ChatWindow;