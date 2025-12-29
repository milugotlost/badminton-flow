// 語音播報服務
// 使用 Web Speech API

export interface Player {
    displayName: string;
}

/**
 * 播報球員上場通知
 * @param courtName 場地名稱（例如："1 號場"）
 * @param players 球員列表
 */
export const announceCourtAssignment = (courtName: string, players: Player[]) => {
    console.log('[Voice] 嘗試播報:', { courtName, players });

    if (!('speechSynthesis' in window)) {
        console.error('[Voice] 此瀏覽器不支援語音播報功能');
        alert('您的瀏覽器不支援語音播報功能');
        return;
    }

    // 取消任何正在進行的播報
    window.speechSynthesis.cancel();

    // 組合播報文字
    const playerNames = players.map(p => p.displayName).join('、');
    const message = `請注意！${courtName}，${playerNames}，請到場比賽`;

    console.log('[Voice] 播報內容:', message);

    // 建立語音物件
    const utterance = new SpeechSynthesisUtterance(message);

    // 設定語音參數
    utterance.lang = 'zh-TW'; // 繁體中文
    utterance.rate = 0.9; // 語速（0.1-10，預設1）
    utterance.pitch = 1; // 音調（0-2，預設1）
    utterance.volume = 1; // 音量（0-1，預設1）

    // 監聽事件
    utterance.onstart = () => console.log('[Voice] 開始播報');
    utterance.onend = () => console.log('[Voice] 播報結束');
    utterance.onerror = (e) => console.error('[Voice] 播報錯誤:', e);

    // 播放
    console.log('[Voice] 執行播放...');
    window.speechSynthesis.speak(utterance);
};

/**
 * 停止所有播報
 */
export const stopAnnouncement = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

/**
 * 檢查瀏覽器是否支援語音播報
 */
export const isSpeechSupported = (): boolean => {
    return 'speechSynthesis' in window;
};
