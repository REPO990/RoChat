import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/index';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      {messages.length === 0 ? (
        <div style={styles.empty}>No messages yet. Be the first to say hi! 👋</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} style={styles.message}>
            <img
              src={msg.avatar_url || 'https://via.placeholder.com/40'}
              alt={msg.username}
              style={styles.avatar}
            />
            <div style={styles.messageContent}>
              <div style={styles.header}>
                <span style={styles.username}>{msg.username}</span>
                <span style={styles.time}>{formatTime(msg.created_at)}</span>
              </div>
              <div style={styles.text}>{msg.message}</div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '50px',
    fontSize: '14px',
  },
  message: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  },
  messageContent: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '10px 15px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
  },
  username: {
    fontWeight: 'bold',
    color: '#3498db',
    fontSize: '14px',
  },
  time: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  text: {
    color: 'white',
    fontSize: '14px',
    wordWrap: 'break-word',
  },
};

export default MessageList;