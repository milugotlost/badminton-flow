export const MAX_PLAYERS_PER_COURT = 4;
export const PRIORITY_BUMP_TIME_MS = 60000; // 1 分鐘
export const AVATAR_API_BASE = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

// 初始場地設定
export const INITIAL_COURTS = [
  { id: 'c1', name: '1 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
  { id: 'c2', name: '2 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
  { id: 'c3', name: '3 號場', status: 'empty', matchStartTime: null, currentPlayers: [] },
] as const;

export const DEMO_QUEUE_NAMES = [
  '小明', '阿華', '小紅', '大強', '阿龍', '志玲', '家豪', '淑惠'
];