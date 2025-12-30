import React, { useState, useEffect } from 'react';
import { X, QrCode, RefreshCw } from 'lucide-react';
import Button from './Button';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, avatarSeed: string) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAvatarSeed(Math.random().toString(36).substring(7));
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), avatarSeed);
      onClose();
    }
  };

  const refreshAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 transition-transform">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-24 h-24 relative mb-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
              alt="Avatar Preview"
              className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700"
            />
            <button
              type="button"
              onClick={refreshAvatar}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="更換頭像"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">球員報到</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            請輸入您的稱呼並選擇喜歡的頭像。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              顯示名稱
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：王小明"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-lg"
            disabled={!name.trim()}
          >
            加入排隊
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;