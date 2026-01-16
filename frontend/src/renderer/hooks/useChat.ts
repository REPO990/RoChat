import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socket.service';
import { LocalStorageService } from '../services/localStorage.service';
import { Message } from '../types/index';

export const useChat = (roomId: string | null, token: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef<Message[]>([]);
  const processing = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  // Update ref when messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Batch message updates for better performance
  const processMessageQueue = useCallback(() => {
    if (messageQueue.current.length === 0 || processing.current) return;
    
    processing.current = true;
    
    requestAnimationFrame(() => {
      setMessages(prev => {
        const newMessages = [...prev, ...messageQueue.current];
        // Keep only last 200 messages to prevent memory issues
        if (newMessages.length > 200) {
          return newMessages.slice(-200);
        }
        return newMessages;
      });
      
      messageQueue.current = [];
      processing.current = false;
    });
  }, []);

  // Clear old messages on mount
  useEffect(() => {
    LocalStorageService.clearOldMessages();
  }, []);

  useEffect(() => {
    if (!token) return;

    // Connect socket
    socketService.connect(token);
    setIsConnected(true);

    // Setup listeners
    socketService.onRoomHistory((msgs) => {
      setMessages(msgs);
      if (roomId) {
        LocalStorageService.saveMessages(roomId, msgs);
      }
    });

    socketService.onNewMessage((msg) => {
      messageQueue.current.push(msg);
      processMessageQueue();
      
      // Update local storage
      if (roomId) {
        const updatedMessages = [...messagesRef.current, msg];
        if (updatedMessages.length > 200) {
          updatedMessages.slice(-200);
        }
        LocalStorageService.saveMessages(roomId, updatedMessages);
      }
    });

    socketService.onMessageBlocked((data) => {
      console.log('Message blocked:', data);
      // You could show a notification to the user here
    });

    socketService.onUserJoined((data) => {
      console.log(`${data.username} joined the chat`);
    });

    socketService.onUserLeft((data) => {
      console.log(`${data.username} left the chat`);
    });

    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [token, processMessageQueue]);

  useEffect(() => {
    if (!roomId || !isConnected) {
      setMessages([]);
      return;
    }

    // Load messages from local storage while waiting for server
    const cachedMessages = LocalStorageService.getMessages(roomId);
    setMessages(cachedMessages);

    // Join new room
    socketService.joinRoom(roomId);

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected]);

  const sendMessage = (message: string) => {
    if (roomId && message.trim()) {
      socketService.sendMessage(roomId, message);
    }
  };

  return { messages, sendMessage, isConnected };
};