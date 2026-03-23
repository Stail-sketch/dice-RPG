import { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { bgm } from '../../utils/bgm';
import type { BGMTrack } from '../../utils/bgm';

/**
 * BGMController - Manages BGM playback based on current screen.
 * Also renders a small mute/unmute toggle button (fixed position).
 */
export function BGMController() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const [muted, setMuted] = useState(bgm.muted);

  useEffect(() => {
    const trackMap: Record<string, BGMTrack> = {
      title: 'title',
      town: 'town',
      battle: 'battle',
      dungeon: 'dungeon',
      event: 'event',
      shop: 'event',
      forge: 'event',
      gacha: 'event',
      codex: 'town',
      'dice-editor': 'town',
      pvp: 'battle',
      tutorial: 'town',
    };
    const track = trackMap[currentScreen] ?? 'town';
    bgm.play(track);
  }, [currentScreen]);

  const handleToggle = () => {
    const nowMuted = bgm.toggleMute();
    setMuted(nowMuted);
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
        width: 32,
        height: 32,
        border: '1px solid #a09878',
        borderRadius: 4,
        background: muted ? '#d8d0c0' : '#c8c0a8',
        color: '#3a3018',
        fontSize: 16,
        cursor: 'pointer',
        fontFamily: "'DotGothic16', monospace",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1,
      }}
      title={muted ? 'BGM ON' : 'BGM OFF'}
    >
      {muted ? '\u{1F507}' : '\u{1F50A}'}
    </button>
  );
}
