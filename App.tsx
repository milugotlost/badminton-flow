import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  MinusCircle,
  Shield,
  ShieldCheck,
  Sun,
  Moon,
  QrCode,
  Zap,
  Settings,
  Trash2,
  Lock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Court, QueueItem } from './types';
import * as db from './services/dataService';
import * as speech from './services/speechService';
import CourtCard from './components/CourtCard';
import QueueList from './components/QueueList';
import Button from './components/Button';
import CheckInModal from './components/CheckInModal';
import AdminLoginModal from './components/AdminLoginModal';
import ConfirmModal from './components/ConfirmModal';
import AccessCodeModal from './components/AccessCodeModal';

function App() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [readyQueue, setReadyQueue] = useState<QueueItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAutoFillReady, setIsAutoFillReady] = useState(false);
  const [isAutoStartMatch, setIsAutoStartMatch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // 檢查訪問權限
  useEffect(() => {
    const accessGranted = sessionStorage.getItem('access_granted');
    if (accessGranted === 'true') {
      setIsAccessGranted(true);
    }
  }, []);

  // 初始化語音播報設定
  useEffect(() => {
    const voicePref = localStorage.getItem('voice_enabled');
    if (voicePref === 'true') {
      setIsVoiceEnabled(true);
    }
  }, []);

  // 初始化深色模式
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 數據訂閱
  useEffect(() => {
    const unsubCourts = db.subscribeToCourts(setCourts);
    const unsubQueue = db.subscribeToQueue(setQueue);
    const unsubReady = db.subscribeToReady(setReadyQueue);
    return () => {
      unsubCourts();
      unsubQueue();
      unsubReady();
    };
  }, []);

  // 自動化邏輯觸發
  useEffect(() => {
    if (isAdmin && (isAutoFillReady || isAutoStartMatch)) {
      const timer = setTimeout(() => {
        db.runAutoMatchmaking(isAutoFillReady, isAutoStartMatch);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [courts, queue, readyQueue, isAutoFillReady, isAutoStartMatch, isAdmin]);

  const handleAdminToggleClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLogin = (password: string) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '8888'; // Default fallback
    if (password === adminPassword) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleVoice = () => {
    const newValue = !isVoiceEnabled;
    setIsVoiceEnabled(newValue);
    localStorage.setItem('voice_enabled', String(newValue));
  };

  const handleClearSchedule = () => {
    db.clearTodaySchedule();
    setIsConfirmResetOpen(false);
  };

  const handleManualStart = async (courtId: string) => {
    const success = await db.assignReadyToCourt(courtId);

    if (success && isVoiceEnabled) {
      // 找到對應場地並播報
      const court = courts.find(c => c.id === courtId);
      if (court && court.currentPlayers.length > 0) {
        speech.announceCourtAssignment(court.name, court.currentPlayers);
      }
    }
  };

  // 如果未通過驗證，顯示通行碼畫面
  if (!isAccessGranted) {
    return <AccessCodeModal onAccessGranted={() => setIsAccessGranted(true)} />;
  }

  return (
    <div className="min-h-screen pb-12 transition-colors duration-200">

      {/* 導覽列 */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 rounded-lg p-1.5 text-white">
                <Zap className="w-5 h-5" fill="currentColor" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BadmintonFlow
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="切換主題"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-colors ${isVoiceEnabled
                  ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                title={isVoiceEnabled ? '語音播報：開啟' : '語音播報：關閉'}
              >
                {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none active:scale-95 ${isAdmin
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                  : 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                onClick={handleAdminToggleClick}
              >
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span className="text-xs font-semibold hidden sm:inline">
                  {isAdmin ? '管理者模式' : '切換管理端'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 管理者控制面板 */}
        {isAdmin && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in ring-2 ring-indigo-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Settings className="w-5 h-5" />
                <h2 className="font-bold">管理者控制台</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setIsConfirmResetOpen(true)}
                  className="bg-red-500 hover:bg-red-600 border-none shadow-md shadow-red-500/20"
                >
                  重置今日名單
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsAdmin(false)}>
                  登出管理
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 items-start justify-between">
              <div className="flex flex-wrap gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isAutoFillReady ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isAutoFillReady ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={isAutoFillReady} onChange={(e) => setIsAutoFillReady(e.target.checked)} className="hidden" />
                  <div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">自動遞補準備區</span>
                    <span className="text-[10px] text-gray-500 uppercase">自動從等候區抓人</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isAutoStartMatch ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isAutoStartMatch ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <input type="checkbox" checked={isAutoStartMatch} onChange={(e) => setIsAutoStartMatch(e.target.checked)} className="hidden" />
                  <div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">自動輔助上場</span>
                    <span className="text-[10px] text-gray-500 uppercase">準備區滿 4 人自動尋場</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col mr-4">
                  <span className="text-xs font-bold text-gray-400">場地管理</span>
                  <span className="text-sm font-bold">共 {courts.length} 個</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="h-10 w-10 !p-0" onClick={() => db.removeLastCourt()} disabled={courts.length === 0 || courts.every(c => c.status === 'occupied')}>
                    <MinusCircle className="w-5 h-5" />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-10 w-10 !p-0" onClick={() => db.addCourt()}>
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左側：場地列表 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">即時場地狀態</h2>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {courts.filter(c => c.status === 'empty').length} 個空場
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <CourtCard
                  key={court.id}
                  court={court}
                  isAdmin={isAdmin}
                  queueLength={readyQueue.length}
                  onEndMatch={db.endMatch}
                  onRemoveCourt={db.removeCourt}
                  onManualStart={handleManualStart}
                />
              ))}
            </div>
          </div>

          {/* 右側：等候名單 */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <Button
                className="w-full py-4 shadow-lg shadow-blue-500/20 text-lg font-bold transition-transform active:scale-95"
                size="lg"
                onClick={() => setIsCheckInOpen(true)}
                icon={<QrCode className="w-5 h-5" />}
              >
                我要報到 (含管理者)
              </Button>

              <QueueList
                queue={queue}
                readyQueue={readyQueue}
                courts={courts}
                isAdmin={isAdmin}
                isAutoFillReady={isAutoFillReady}
                onMoveToReady={db.moveToReady}
                onMoveBackToQueue={db.moveBackToQueue}
                onCancel={db.cancelPlayer}
                onAssignToCourt={db.assignReadyToCourt}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 所有的 Modals */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSubmit={db.checkInUser}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={handleAdminLogin}
      />

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        title="確定要重置名單嗎？"
        message="這將清除所有球員排隊、準備區與場地狀態，且無法還原。"
        confirmText="確定清除"
        cancelText="不，留著"
        variant="danger"
        onConfirm={handleClearSchedule}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </div>
  );
}

export default App;