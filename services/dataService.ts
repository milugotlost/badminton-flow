import { Court, QueueItem, User } from '../types';
import { MAX_PLAYERS_PER_COURT } from '../constants';

let courtsSubscribers: ((courts: Court[]) => void)[] = [];
let queueSubscribers: ((queue: QueueItem[]) => void)[] = [];
let readySubscribers: ((ready: QueueItem[]) => void)[] = [];

// 從 localStorage 載入或初始化
const STORAGE_KEY = 'badminton_flow_store';

const getInitialState = () => ({
  courts: [
    { id: '1', name: '1 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
    { id: '2', name: '2 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
    { id: '3', name: '3 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
  ],
  queue: [],
  readyQueue: []
});

const loadStore = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load store", e);
    }
  }
  return getInitialState();
};

let store = loadStore();

const saveStore = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const notifyAll = () => {
  saveStore();
  courtsSubscribers.forEach(cb => cb([...store.courts]));
  queueSubscribers.forEach(cb => cb([...store.queue]));
  readySubscribers.forEach(cb => cb([...store.readyQueue]));
};

export const subscribeToCourts = (callback: (courts: Court[]) => void) => {
  courtsSubscribers.push(callback);
  callback([...store.courts]);
  return () => { courtsSubscribers = courtsSubscribers.filter(cb => cb !== callback); };
};

export const subscribeToQueue = (callback: (queue: QueueItem[]) => void) => {
  queueSubscribers.push(callback);
  callback([...store.queue]);
  return () => { queueSubscribers = queueSubscribers.filter(cb => cb !== callback); };
};

export const subscribeToReady = (callback: (ready: QueueItem[]) => void) => {
  readySubscribers.push(callback);
  callback([...store.readyQueue]);
  return () => { readySubscribers = readySubscribers.filter(cb => cb !== callback); };
};

export const addCourt = async () => {
  store.courts.push({
    id: `new-${Date.now()}`,
    name: `${store.courts.length + 1} 號場`,
    status: 'empty',
    matchStartTime: null,
    currentPlayers: []
  });
  notifyAll();
};

export const removeLastCourt = async () => {
  if (store.courts.length === 0) return;
  const lastEmptyIndex = [...store.courts].reverse().findIndex(c => c.status === 'empty');
  if (lastEmptyIndex !== -1) {
    const actualIndex = store.courts.length - 1 - lastEmptyIndex;
    store.courts.splice(actualIndex, 1);
    store.courts.forEach((c, idx) => { c.name = `${idx + 1} 號場`; });
    notifyAll();
  }
};

export const removeCourt = async (courtId: string) => {
  const index = store.courts.findIndex(c => c.id === courtId);
  if (index !== -1 && store.courts[index].status === 'empty') {
    store.courts.splice(index, 1);
    store.courts.forEach((c, idx) => { c.name = `${idx + 1} 號場`; });
    notifyAll();
  }
};

export const clearTodaySchedule = async () => {
  // 徹底重置 store 變數內容
  const initialState = getInitialState();
  store.queue = initialState.queue;
  store.readyQueue = initialState.readyQueue;
  store.courts = initialState.courts;
  
  // 清除 localStorage 並重新儲存
  localStorage.removeItem(STORAGE_KEY);
  notifyAll();
};

export const checkInUser = async (displayName: string) => {
  const newItem: QueueItem = {
    id: `u-${Date.now()}`,
    displayName,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
    checkInTime: Date.now(),
    status: 'queueing'
  };
  store.queue.push(newItem);
  store.queue.sort((a, b) => a.checkInTime - b.checkInTime);
  notifyAll();
};

export const moveToReady = async (userId: string) => {
  if (store.readyQueue.length >= MAX_PLAYERS_PER_COURT) return;
  const user = store.queue.find(u => u.id === userId);
  if (user) {
    store.queue = store.queue.filter(u => u.id !== userId);
    store.readyQueue.push(user);
    notifyAll();
  }
};

export const moveBackToQueue = async (userId: string) => {
  const user = store.readyQueue.find(u => u.id === userId);
  if (user) {
    store.readyQueue = store.readyQueue.filter(u => u.id !== userId);
    store.queue.push(user);
    store.queue.sort((a, b) => a.checkInTime - b.checkInTime);
    notifyAll();
  }
};

export const cancelPlayer = async (userId: string, from: 'queue' | 'ready') => {
  if (from === 'queue') {
    store.queue = store.queue.filter(u => u.id !== userId);
  } else {
    store.readyQueue = store.readyQueue.filter(u => u.id !== userId);
  }
  notifyAll();
};

export const endMatch = async (courtId: string) => {
  const courtIndex = store.courts.findIndex(c => c.id === courtId);
  if (courtIndex === -1) return;

  const court = store.courts[courtIndex];
  const players = court.currentPlayers;

  players.forEach(p => {
    store.queue.push({
      ...p,
      checkInTime: Date.now(),
      status: 'queueing'
    });
  });

  store.courts[courtIndex] = {
    ...court,
    status: 'empty',
    matchStartTime: null,
    currentPlayers: []
  };

  store.queue.sort((a, b) => a.checkInTime - b.checkInTime);
  notifyAll();
};

export const assignReadyToCourt = async (courtId: string) => {
  const courtIdx = store.courts.findIndex(c => c.id === courtId);
  if (courtIdx === -1 || store.courts[courtIdx].status !== 'empty' || store.readyQueue.length === 0) {
    return false;
  }

  const players = [...store.readyQueue];
  store.readyQueue = [];

  store.courts[courtIdx] = {
    ...store.courts[courtIdx],
    status: 'occupied',
    matchStartTime: Date.now(),
    currentPlayers: players.map(p => ({ ...p, status: 'playing' }))
  };

  notifyAll();
  return true;
};

export const runAutoMatchmaking = async (isAutoFillReady: boolean, isAutoStartMatch: boolean) => {
  let changed = false;

  if (isAutoFillReady && store.readyQueue.length < MAX_PLAYERS_PER_COURT && store.queue.length > 0) {
    while (store.readyQueue.length < MAX_PLAYERS_PER_COURT && store.queue.length > 0) {
      const nextUser = store.queue[0];
      store.queue = store.queue.slice(1);
      store.readyQueue.push(nextUser);
      changed = true;
    }
  }

  if (isAutoStartMatch && store.readyQueue.length >= MAX_PLAYERS_PER_COURT) {
    const emptyCourt = store.courts.find(c => c.status === 'empty');
    if (emptyCourt) {
      await assignReadyToCourt(emptyCourt.id);
      changed = true;
    }
  }

  if (changed) {
    notifyAll();
  }
};