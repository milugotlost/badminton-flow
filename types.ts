export interface User {
  id: string;
  displayName: string;
  photoURL: string;
  checkInTime: number;
  status: 'queueing' | 'playing';
}

export interface Court {
  id: string;
  name: string;
  status: 'empty' | 'occupied';
  matchStartTime: number | null;
  currentPlayers: User[];
}

export interface QueueItem extends User {
  status: 'queueing';
}

export interface AppState {
  courts: Court[];
  queue: QueueItem[];
  isAdmin: boolean;
  isAutoMatch: boolean;
  isDarkMode: boolean;
}

export type Theme = 'light' | 'dark';