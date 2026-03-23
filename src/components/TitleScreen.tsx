import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { hasSaveData } from '../stores/saveSystem';

export function TitleScreen() {
  const { initNewGame, load, startTutorial } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<'new' | 'skip' | null>(null);

  useEffect(() => {
    hasSaveData().then(setHasSave);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    const ok = await load();
    if (!ok) setLoading(false);
  };

  const handleNewGame = (mode: 'new' | 'skip') => {
    if (hasSave) {
      setConfirm(mode);
    } else {
      mode === 'new' ? startTutorial() : initNewGame();
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 20,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 18, color: '#998a78', marginBottom: 8 }}>
          Pip Socket Chronicle
        </div>
        <h1 style={{
          fontSize: 28, color: '#705828',
          lineHeight: 1.4,
        }}>
          ピップソケット<br />クロニクル
        </h1>
        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 40 }}>⚀ ⚁ ⚂ ⚃ ⚄ ⚅</span>
        </div>
        <p style={{ color: '#998a78', fontSize: 12, marginTop: 16 }}>
          モンスターを倒してダイスに封印せよ
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 280 }}>
        <button className="rpg-btn rpg-btn-primary" onClick={() => handleNewGame('new')}>
          はじめから
        </button>
        <button className="rpg-btn" onClick={() => handleNewGame('skip')} style={{ fontSize: 11 }}>
          チュートリアルスキップ
        </button>
        <button className="rpg-btn"
          onClick={handleContinue}
          style={{ opacity: hasSave ? 1 : 0.4 }}
          disabled={!hasSave || loading}
        >
          {loading ? '読み込み中...' : 'つづきから'}
        </button>
      </div>

      {/* 確認ダイアログ */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#f5f0e8', border: '2px solid #705828', borderRadius: 8,
            padding: 20, maxWidth: 280, textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#3a2a1a', fontWeight: 'bold', marginBottom: 12 }}>
              セーブデータが存在します
            </div>
            <div style={{ fontSize: 11, color: '#6a5a4a', marginBottom: 16 }}>
              はじめからプレイすると<br />現在のセーブデータは上書きされます。<br />本当によろしいですか？
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="rpg-btn"
                style={{ flex: 1 }}
                onClick={() => setConfirm(null)}
              >
                やめる
              </button>
              <button
                className="rpg-btn rpg-btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  setConfirm(null);
                  confirm === 'new' ? startTutorial() : initNewGame();
                }}
              >
                はじめる
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 40, fontSize: 10, color: '#998a78' }}>
        v1.0.0
      </div>
    </div>
  );
}
