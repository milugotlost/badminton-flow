import React, { useEffect, useState } from 'react';
import { Clock, User as UserIcon, Trash2, StopCircle, PlayCircle } from 'lucide-react';
import { Court } from '../types';
import Button from './Button';
import { MAX_PLAYERS_PER_COURT } from '../constants';

interface CourtCardProps {
  court: Court;
  isAdmin: boolean;
  queueLength: number;
  onEndMatch: (id: string) => void;
  onRemoveCourt: (id: string) => void;
  onManualStart: (id: string) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, isAdmin, queueLength, onEndMatch, onRemoveCourt, onManualStart }) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');

  useEffect(() => {
    let interval: number;
    if (court.status === 'occupied' && court.matchStartTime) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - court.matchStartTime!) / 1000);
        const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      setElapsedTime('00:00');
    }
    return () => clearInterval(interval);
  }, [court.status, court.matchStartTime]);

  const canManualStart = isAdmin && court.status === 'empty' && queueLength >= MAX_PLAYERS_PER_COURT;

  return (
    <div className={`
      relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all
      ${court.status === 'occupied' 
        ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }
    `}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {court.name}
            {court.status === 'occupied' && (
              <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            {court.status === 'occupied' ? '比賽中' : '場地空閒'}
          </p>
        </div>
        
        {court.status === 'occupied' && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">{elapsedTime}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 min-h-[160px]">
        {court.status === 'occupied' ? (
          <div className="grid grid-cols-2 gap-3">
            {court.currentPlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-2 bg-white/60 dark:bg-gray-700/50 p-2 rounded-lg">
                <img 
                  src={player.photoURL} 
                  alt={player.displayName} 
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {player.displayName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-2 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-full">
              <UserIcon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">等待球員中...</span>
            <span className="text-xs">尚需 {MAX_PLAYERS_PER_COURT} 人即可開場</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2 justify-between items-center">
           <div>
            {court.status === 'empty' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveCourt(court.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="刪除場地"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
           </div>
           <div className="flex gap-2">
            {canManualStart && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={<PlayCircle className="w-4 h-4" />}
                  onClick={() => onManualStart(court.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  手動開場
                </Button>
              )}
              {court.status === 'occupied' && (
                <Button 
                  variant="danger" 
                  size="sm" 
                  icon={<StopCircle className="w-4 h-4" />}
                  onClick={() => onEndMatch(court.id)}
                >
                  結束比賽
                </Button>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default CourtCard;