import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { hasSaveData } from '../stores/saveSystem';

export function TitleScreen() {
  const { initNewGame, load } = useGameStore();
  const [hasSave, setHasSave] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hasSaveData().then(setHasSave);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    const ok = await load();
    if (!ok) setLoading(false);
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
        <button className="rpg-btn rpg-btn-primary" onClick={initNewGame}>
          はじめから
        </button>
        <button className="rpg-btn"
          onClick={handleContinue}
          style={{ opacity: hasSave ? 1 : 0.4 }}
          disabled={!hasSave || loading}
        >
          {loading ? '読み込み中...' : 'つづきから'}
        </button>
      </div>

      <div style={{ marginTop: 40, fontSize: 10, color: '#998a78' }}>
        v1.0.0
      </div>
    </div>
  );
}
