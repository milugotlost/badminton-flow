import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from './Button';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (password: string) => boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (success) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 rotate-12">
            <Lock className="w-8 h-8 -rotate-12" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">管理員登入</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            請輸入管理密碼以解鎖進階功能
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              placeholder="輸入密碼 (預設: 8888)"
              className={`w-full px-5 py-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
                error 
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' 
                : 'border-gray-100 dark:border-gray-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
              }`}
              autoFocus
            />
            {error && (
              <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-xs font-bold animate-shake">
                <AlertCircle className="w-3 h-3" />
                密碼錯誤，請再試一次
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full py-4 text-md font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/30"
            disabled={!password.trim()}
          >
            立即解鎖
          </Button>
          
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            BADMINTON FLOW SECURE ACCESS
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;