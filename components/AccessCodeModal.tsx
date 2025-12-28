import React, { useState } from 'react';
import { Key, AlertCircle, Shield } from 'lucide-react';
import Button from './Button';

interface AccessCodeModalProps {
    onAccessGranted: () => void;
}

const AccessCodeModal: React.FC<AccessCodeModalProps> = ({ onAccessGranted }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const correctCode = import.meta.env.VITE_ACCESS_CODE || 'DEMO2025';

        if (code.trim() === correctCode) {
            // 儲存驗證狀態到 sessionStorage (關閉瀏覽器後失效)
            sessionStorage.setItem('access_granted', 'true');
            onAccessGranted();
        } else {
            setError(true);
            setCode('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">

                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-3xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 animate-bounce-slow">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                        BadmintonFlow
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        請輸入社團通行碼以繼續
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Key className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase());
                                if (error) setError(false);
                            }}
                            placeholder="輸入通行碼"
                            className={`w-full pl-12 pr-5 py-4 rounded-xl border-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all uppercase tracking-wider font-bold ${error
                                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/20'
                                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                }`}
                            autoFocus
                        />
                        {error && (
                            <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-xs font-bold animate-shake">
                                <AlertCircle className="w-3 h-3" />
                                通行碼錯誤，請再試一次
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 text-md font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30"
                        disabled={!code.trim()}
                    >
                        進入系統
                    </Button>

                    <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                        Access Protected
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AccessCodeModal;
