export interface User {
  id: number;
  robloxId: number;
  username: string;
  avatarUrl: string;
}

export interface Message {
  id: number;
  room_id: string;
  user_id: number;
  username: string;
  avatar_url: string;
  message: string;
  created_at: string;
}

export interface GamePresence {
  placeId: number | null;
  jobId: string | null;
  isOnline: boolean;
}

export interface Settings {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'roblox-style';
  alwaysOnTop: boolean;
  opacity: number;
  keybind: string;
  isDraggable: boolean;
}