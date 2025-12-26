import React from 'react';
import { QueueItem, Court } from '../types';
import { UserPlus, UserMinus, X, Users, Crown, Play, Trash2, ArrowLeftRight, Zap, ZapOff } from 'lucide-react';
import Button from './Button';
import { MAX_PLAYERS_PER_COURT } from '../constants';

interface QueueListProps {
  queue: QueueItem[];
  readyQueue: QueueItem[];
  courts: Court[];
  isAdmin: boolean;
  isAutoFillReady?: boolean;
  onMoveToReady: (id: string) => void;
  onMoveBackToQueue: (id: string) => void;
  onCancel: (id: string, from: 'queue' | 'ready') => void;
  onAssignToCourt: (courtId: string) => void;
}

const QueueList: React.FC<QueueListProps> = ({ 
  queue, 
  readyQueue,
  courts,
  isAdmin, 
  isAutoFillReady = false,
  onMoveToReady,
  onMoveBackToQueue,
  onCancel,
  onAssignToCourt 
}) => {
  const availableCourts = courts.filter(c => c.status === 'empty');

  return (
    <div className="space-y-6">
      {/* 準備上場區 (Ready Area) */}
      <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300 ${
        readyQueue.length === MAX_PLAYERS_PER_COURT 
          ? 'bg-gradient-to-br from-green-600 to-emerald-700' 
          : 'bg-gradient-to-br from-blue-600 to-indigo-700'
      }`}>
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Crown className={`w-5 h-5 ${readyQueue.length === MAX_PLAYERS_PER_COURT ? 'text-yellow-300 animate-bounce' : 'text-white/70'}`} />
                <h2 className="text-lg font-bold">準備上場區</h2>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm">
                  {readyQueue.length} / {MAX_PLAYERS_PER_COURT}
                </span>
              </div>
              {isAutoFillReady && (
                <div className="flex items-center gap-1 text-[10px] text-white/70 font-medium">
                  <Zap className="w-3 h-3 fill-current text-yellow-300" />
                  自動遞補中
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 mb-4">
            {readyQueue.length === 0 ? (
              <div className="text-center py-6 text-white/50 bg-white/5 rounded-xl border border-white/10 border-dashed">
                <p className="text-xs">
                  {isAutoFillReady ? '等待球員加入隊列...' : '請從下方名單選取球員上場'}
                </p>
              </div>
            ) : (
              readyQueue.map((user, idx) => (
                <div key={user.id} className="group flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full bg-white/20 border border-white/30" />
                    <div>
                      <p className="font-semibold text-sm">{user.displayName}</p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => onMoveBackToQueue(user.id)} 
                        className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
                        title="移回等候區"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5"/>
                      </button>
                      <button 
                        onClick={() => onCancel(user.id, 'ready')} 
                        className="p-1.5 hover:bg-red-500/30 rounded-lg text-red-200 transition-colors"
                        title="取消報到"
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {isAdmin && readyQueue.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-white/10">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">分配至場地</p>
              {availableCourts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableCourts.map(court => (
                    <button
                      key={court.id}
                      onClick={() => onAssignToCourt(court.id)}
                      className="bg-white text-indigo-700 hover:bg-yellow-400 hover:text-indigo-900 font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {court.name} 上場
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-white/50 italic bg-black/10 p-2 rounded">
                  目前無空場地，請等待比賽結束
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 一般等候名單 */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <Users className="w-5 h-5" />
            <h3 className="font-bold">等候名單</h3>
          </div>
          <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            共 {queue.length} 人
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 shadow-sm overflow-hidden">
          {queue.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              目前沒有球員在等候。
            </div>
          ) : (
            queue.map((user, idx) => (
              <div key={user.id} className="p-3 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-mono text-xs w-4 text-center">
                    {idx + 1}
                  </span>
                  <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full bg-gray-100" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName}</p>
                    <p className="text-[10px] text-gray-500">已等候: {Math.floor((Date.now() - user.checkInTime) / 60000)}m</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => onMoveToReady(user.id)}
                      className="!px-2 !py-1 bg-blue-500 hover:bg-blue-600 shadow-none"
                      disabled={readyQueue.length >= MAX_PLAYERS_PER_COURT}
                      title="加入準備區"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onCancel(user.id, 'queue')}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="取消報到"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueList;