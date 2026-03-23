import { useState, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { bgm } from '../../utils/bgm';
import { sfx } from '../../utils/sfx';

const STORAGE_KEY = 'pip-socket-audio-settings';

function saveToStorage(bgmVolume: number, bgmMuted: boolean, seVolume: number, seMuted: boolean) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ bgmVolume, bgmMuted, seVolume, seMuted }));
}

export function SettingsScreen() {
  const { setScreen } = useGameStore();
  const [bgmVol, setBgmVol] = useState(Math.round(bgm.volume * 100));
  const [seVol, setSeVol] = useState(Math.round(sfx.volume * 100));
  const [bgmMuted, setBgmMuted] = useState(bgm.muted);
  const [seMuted, setSeMuted] = useState(sfx.muted);

  const handleBgmVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setBgmVol(v);
    bgm.volume = v / 100;
    saveToStorage(v / 100, bgmMuted, sfx.volume, seMuted);
  }, [bgmMuted, seMuted]);

  const handleSeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setSeVol(v);
    sfx.volume = v / 100;
    saveToStorage(bgm.volume, bgmMuted, v / 100, seMuted);
  }, [bgmMuted, seMuted]);

  const handleBgmMute = useCallback(() => {
    const next = !bgmMuted;
    setBgmMuted(next);
    bgm.muted = next;
    saveToStorage(bgm.volume, next, sfx.volume, seMuted);
  }, [bgmMuted, seMuted]);

  const handleSeMute = useCallback(() => {
    const next = !seMuted;
    setSeMuted(next);
    sfx.muted = next;
    saveToStorage(bgm.volume, bgmMuted, sfx.volume, next);
  }, [bgmMuted, seMuted]);

  const handleTestSe = useCallback(() => {
    sfx.click();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '16px 8px',
      fontFamily: "'DotGothic16', monospace",
    }}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        marginBottom: 16,
        letterSpacing: 2,
      }}>
        設定
      </div>

      {/* BGM Section */}
      <div className="rpg-panel" style={{ marginBottom: 8 }}>
        <div className="rpg-panel-title">BGM音量</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <button
            onClick={handleBgmMute}
            style={{
              padding: '4px 12px',
              background: bgmMuted ? 'var(--bg-overlay)' : 'var(--btn-bg)',
              border: '2px solid ' + (bgmMuted ? 'var(--text-damage)' : 'var(--btn-border)'),
              borderRadius: 2,
              color: bgmMuted ? 'var(--text-damage)' : 'var(--btn-text)',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12,
              cursor: 'pointer',
              minWidth: 52,
            }}
          >
            {bgmMuted ? 'OFF' : 'ON'}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={bgmVol}
            onChange={handleBgmVolume}
            disabled={bgmMuted}
            style={{
              flex: 1,
              opacity: bgmMuted ? 0.4 : 1,
            }}
          />

          <span style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            minWidth: 32,
            textAlign: 'right',
          }}>
            {bgmVol}%
          </span>
        </div>
      </div>

      {/* SE Section */}
      <div className="rpg-panel" style={{ marginBottom: 8 }}>
        <div className="rpg-panel-title">SE音量</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <button
            onClick={handleSeMute}
            style={{
              padding: '4px 12px',
              background: seMuted ? 'var(--bg-overlay)' : 'var(--btn-bg)',
              border: '2px solid ' + (seMuted ? 'var(--text-damage)' : 'var(--btn-border)'),
              borderRadius: 2,
              color: seMuted ? 'var(--text-damage)' : 'var(--btn-text)',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 12,
              cursor: 'pointer',
              minWidth: 52,
            }}
          >
            {seMuted ? 'OFF' : 'ON'}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={seVol}
            onChange={handleSeVolume}
            disabled={seMuted}
            style={{
              flex: 1,
              opacity: seMuted ? 0.4 : 1,
            }}
          />

          <span style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            minWidth: 32,
            textAlign: 'right',
          }}>
            {seVol}%
          </span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleTestSe}
            disabled={seMuted}
            style={{
              padding: '4px 16px',
              background: 'var(--btn-bg)',
              border: '1px solid var(--btn-border)',
              borderRadius: 2,
              color: 'var(--btn-text)',
              fontFamily: "'DotGothic16', monospace",
              fontSize: 11,
              cursor: seMuted ? 'not-allowed' : 'pointer',
              opacity: seMuted ? 0.4 : 1,
            }}
          >
            テスト
          </button>
        </div>
      </div>

      {/* Back button */}
      <button
        className="rpg-btn"
        onClick={() => setScreen('town')}
        style={{ marginTop: 16 }}
      >
        街に戻る
      </button>
    </div>
  );
}
