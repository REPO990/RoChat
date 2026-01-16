import { useState, useEffect, useCallback } from 'react';
import { RobloxService } from '../services/roblox.service';
import { GamePresence } from '../types/index';

export const useGameDetection = (token: string | null) => {
  const [presence, setPresence] = useState<GamePresence>({
    placeId: null,
    jobId: null,
    isOnline: false,
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const detectGame = useCallback(async () => {
    if (!token) return;

    try {
      const newPresence = await RobloxService.getUserPresence(token);
      setPresence(newPresence);

      // Determine room ID
      if (newPresence.placeId) {
        let roomId: string;
        if (newPresence.jobId) {
          // Server-specific chat
          roomId = `server:${newPresence.placeId}:${newPresence.jobId}`;
        } else {
          // Global game chat
          roomId = `global:${newPresence.placeId}`;
        }
        setCurrentRoom(roomId);
      } else {
        setCurrentRoom(null);
      }
    } catch (error) {
      console.error('Game detection error:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Initial detection
    detectGame();

    // Poll every 5 seconds
    const interval = setInterval(detectGame, 5000);

    return () => clearInterval(interval);
  }, [token, detectGame]);

  return { presence, currentRoom };
};