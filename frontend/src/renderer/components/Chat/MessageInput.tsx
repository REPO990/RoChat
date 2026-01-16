import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? 'Join a game to chat...' : 'Type a message...'}
        disabled={disabled}
        style={styles.input}
      />
      <button onClick={handleSend} disabled={disabled} style={styles.button}>
        ➤
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    gap: '8px',
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '10px 20px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background 0.2s',
  },
};

export default MessageInput;