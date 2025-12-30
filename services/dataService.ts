import { supabase } from '../lib/supabase';
import { Court, QueueItem } from '../types';
import { MAX_PLAYERS_PER_COURT } from '../constants';

// --- Types for DB mapping ---
interface DBCourt {
  id: string;
  name: string;
  status: 'empty' | 'occupied';
  match_start_time: number | null;
}

interface DBPlayer {
  id: string;
  display_name: string;
  photo_url: string;
  status: 'queueing' | 'ready' | 'playing';
  court_id: string | null;
  check_in_time: number;
}

// --- Subscription management ---
// We keep track of cleanups to avoid memory leaks if re-initialized
let courtsSubscription: any = null;
let playersSubscription: any = null;

export const subscribeToCourts = (callback: (courts: Court[]) => void) => {
  const fetchAndNotify = async () => {
    const { data } = await supabase
      .from('courts')
      .select('*')
      .order('name', { ascending: true });

    if (data) {
      // Need to fetch current players for each court to match frontend type
      // But for efficiency, we can just fetch all playing players and map them
      const { data: playingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('status', 'playing');

      const mappedCourts: Court[] = data.map((c: DBCourt) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        matchStartTime: c.match_start_time,
        currentPlayers: (playingPlayers as DBPlayer[] || [])
          .filter(p => p.court_id === c.id)
          .map(p => ({
            id: p.id,
            displayName: p.display_name,
            photoURL: p.photo_url,
            checkInTime: p.check_in_time,
            status: 'playing'
          }))
      }));
      callback(mappedCourts);
    }
  };

  fetchAndNotify();

  // Subscribe to changes
  courtsSubscription = supabase
    .channel('courts_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courts' }, fetchAndNotify)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchAndNotify) // Players change affects court.currentPlayers
    .subscribe();

  return () => {
    if (courtsSubscription) supabase.removeChannel(courtsSubscription);
  };
};

export const subscribeToQueue = (callback: (queue: QueueItem[]) => void) => {
  const fetchAndNotify = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('status', 'queueing')
      .order('check_in_time', { ascending: true });

    if (data) {
      const mappedQueue: QueueItem[] = data.map((p: DBPlayer) => ({
        id: p.id,
        displayName: p.display_name,
        photoURL: p.photo_url,
        checkInTime: p.check_in_time,
        status: 'queueing'
      }));
      callback(mappedQueue);
    }
  };

  fetchAndNotify();

  // We reuse a channel if possible, or create new. 
  // For simplicity here, we create separate subscriptions but in prod often merge them.
  const sub = supabase
    .channel('queue_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchAndNotify)
    .subscribe();

  return () => {
    supabase.removeChannel(sub);
  };
};

export const subscribeToReady = (callback: (ready: QueueItem[]) => void) => {
  const fetchAndNotify = async () => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('status', 'ready')
      .order('check_in_time', { ascending: true });

    if (data) {
      const mappedReady: QueueItem[] = data.map((p: DBPlayer) => ({
        id: p.id,
        displayName: p.display_name,
        photoURL: p.photo_url,
        checkInTime: p.check_in_time,
        status: 'queueing'
      }));
      callback(mappedReady);
    }
  };

  fetchAndNotify();

  const sub = supabase
    .channel('ready_channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchAndNotify)
    .subscribe();

  return () => supabase.removeChannel(sub);
};

// --- Actions ---

export const addCourt = async () => {
  const { count } = await supabase.from('courts').select('*', { count: 'exact' });
  const nextNum = (count || 0) + 1;

  await supabase.from('courts').insert({
    id: `c-${Date.now()}`,
    name: `${nextNum} 號場`,
    status: 'empty',
    match_start_time: null
  });
};

export const removeLastCourt = async () => {
  // Logic: Find last empty court (sorted by creation or name?)
  // For simplicity, find *any* empty court with highest number or created_at?
  // Frontend logic was: reverse find empty.

  const { data: courts } = await supabase
    .from('courts')
    .select('*')
    .eq('status', 'empty')
    .order('name', { ascending: false })
    .limit(1);

  if (courts && courts.length > 0) {
    await supabase.from('courts').delete().eq('id', courts[0].id);
  }
};

export const removeCourt = async (courtId: string) => {
  await supabase.from('courts').delete().eq('id', courtId).eq('status', 'empty');
};

export const clearTodaySchedule = async () => {
  // Clear all players
  await supabase.from('players').delete().neq('id', 'keep_none');
  // Reset courts
  await supabase.from('courts').update({
    status: 'empty',
    match_start_time: null
  }).neq('id', 'placeholder');
};

export const checkInUser = async (displayName: string, avatarSeed?: string) => {
  await supabase.from('players').insert({
    id: `u-${Date.now()}`,
    display_name: displayName,
    photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || displayName}`,
    check_in_time: Date.now(),
    status: 'queueing'
  });
};

export const moveToReady = async (userId: string) => {
  // Check limit (optional, frontend handles it usually)
  const { count } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'ready');
  // @ts-ignore
  if (count >= MAX_PLAYERS_PER_COURT) return;

  await supabase.from('players').update({
    status: 'ready'
  }).eq('id', userId);
};

export const moveBackToQueue = async (userId: string) => {
  await supabase.from('players').update({
    status: 'queueing'
  }).eq('id', userId);
};

export const cancelPlayer = async (userId: string, from: 'queue' | 'ready') => {
  await supabase.from('players').delete().eq('id', userId);
};

export const endMatch = async (courtId: string) => {
  // 1. Find players on this court
  const { data: players } = await supabase.from('players').select('id').eq('court_id', courtId);

  if (players) {
    // 2. Update players back to queue
    const ids = players.map(p => p.id);
    await supabase.from('players').update({
      status: 'queueing',
      court_id: null,
      check_in_time: Date.now() // Re-queue at current time
    }).in('id', ids);
  }

  // 3. Set court to empty
  await supabase.from('courts').update({
    status: 'empty',
    match_start_time: null
  }).eq('id', courtId);
};

export const assignReadyToCourt = async (courtId: string) => {
  // 1. Get ready players (fetch full data for voice announcement)
  const { data: readyPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'ready')
    .order('check_in_time', { ascending: true })
    .limit(MAX_PLAYERS_PER_COURT);

  if (!readyPlayers || readyPlayers.length < MAX_PLAYERS_PER_COURT) return null;

  const playerIds = readyPlayers.map(p => p.id);

  // 2. Set players to playing
  await supabase.from('players').update({
    status: 'playing',
    court_id: courtId
  }).in('id', playerIds);

  // 3. Set court to occupied
  await supabase.from('courts').update({
    status: 'occupied',
    match_start_time: Date.now()
  }).eq('id', courtId);

  // 回傳球員資料供語音播報使用
  return readyPlayers.map((p: any) => ({
    id: p.id,
    displayName: p.display_name,
    photoURL: p.photo_url,
    checkInTime: p.check_in_time,
    status: 'playing' as const
  }));
};

// Automation logic (running on client is tricky if multiple admins are open, race conditions possible)
// But for this simple app, we can just let whoever is admin run it.
export const runAutoMatchmaking = async (isAutoFillReady: boolean, isAutoStartMatch: boolean) => {
  // This is much harder to implement purely stateless on client without causing loops.
  // We'll reimplement basic logic: One-off checks.

  // 1. Auto Fill Ready
  if (isAutoFillReady) {
    const { count: readyCount } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'ready');
    // @ts-ignore
    if (readyCount < MAX_PLAYERS_PER_COURT) {
      // Get next queue player
      const { data: nextParams } = await supabase
        .from('players')
        .select('id')
        .eq('status', 'queueing')
        .order('check_in_time', { ascending: true })
        .limit(1);

      if (nextParams && nextParams.length > 0) {
        await moveToReady(nextParams[0].id);
      }
    }
  }

  // 2. Auto Start Match
  if (isAutoStartMatch) {
    const { count: readyCount } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'ready');
    // @ts-ignore
    if (readyCount >= MAX_PLAYERS_PER_COURT) {
      // Find empty court
      const { data: emptyCourts } = await supabase.from('courts').select('id').eq('status', 'empty').limit(1);
      if (emptyCourts && emptyCourts.length > 0) {
        await assignReadyToCourt(emptyCourts[0].id);
      }
    }
  }
};