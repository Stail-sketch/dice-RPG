import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { bgm } from '../../utils/bgm';
import { sfx } from '../../utils/sfx';
import type { BGMTrack } from '../../utils/bgm';

/**
 * BGMController - Manages BGM playback based on current screen.
 * Also renders a small mute toggle button (fixed position).
 * Loads saved audio settings from localStorage on mount.
 */
export function BGMController() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const currentChapter = useGameStore((s) => s.currentChapter);
  const [muted, setMuted] = useState(bgm.muted);

  // Load saved audio settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('pip-socket-audio-settings');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.bgmVolume !== undefined) bgm.volume = s.bgmVolume;
        if (s.bgmMuted !== undefined) { bgm.muted = s.bgmMuted; setMuted(s.bgmMuted); }
        if (s.seVolume !== undefined) sfx.volume = s.seVolume;
        if (s.seMuted !== undefined) sfx.muted = s.seMuted;
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  useEffect(() => {
    if (currentScreen === 'battle') {
      // ボスBGMが既に流れている場合は上書きしない
      if (bgm.currentTrackName?.startsWith('boss')) return;
      const chapterBattleMap: Record<number, BGMTrack> = {
        1: 'battle',
        2: 'battle-frost',
        3: 'battle-volt',
        4: 'battle-venom',
        5: 'battle-alloy',
        6: 'battle-mirage',
        7: 'battle-final',
      };
      bgm.play(chapterBattleMap[currentChapter] ?? 'battle');
    } else {
      const trackMap: Record<string, BGMTrack> = {
        title: 'title',
        town: 'town',
        dungeon: 'dungeon',
        event: 'event',
        shop: 'event',
        forge: 'event',
        gacha: 'event',
        codex: 'town',
        'dice-editor': 'town',
        pvp: 'battle',
        tutorial: 'town',
        settings: 'town',
      };
      const track = trackMap[currentScreen] ?? 'town';
      bgm.play(track);
    }
  }, [currentScreen, currentChapter]);

  const handleToggle = () => {
    const nowMuted = bgm.toggleMute();
    setMuted(nowMuted);
    // Persist quick-toggle to storage too
    const saved = localStorage.getItem('pip-socket-audio-settings');
    let settings: Record<string, unknown> = {};
    if (saved) { try { settings = JSON.parse(saved); } catch { /* */ } }
    settings.bgmMuted = nowMuted;
    localStorage.setItem('pip-socket-audio-settings', JSON.stringify(settings));
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={muted ? 'BGM ON' : 'BGM OFF'}
      style={{
        position: 'fixed',
        top: 6,
        right: 6,
        zIndex: 9999,
        width: 28,
        height: 28,
        border: '1px solid #a09878',
        borderRadius: 4,
        background: muted ? '#d8d0c0' : '#c8c0a8',
        color: '#3a3018',
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: "'DotGothic16', monospace",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1,
        opacity: 0.7,
      }}
      title={muted ? 'BGM ON' : 'BGM OFF'}
    >
      {muted ? '\u{1F507}' : '\u{1F50A}'}
    </button>
  );
}
