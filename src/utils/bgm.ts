/**
 * BGM Engine - Procedural 8-bit music using Web Audio API
 * No audio files needed. All music is synthesized on-the-fly.
 */

type BGMTrack = 'title' | 'town' | 'battle' | 'boss' | 'victory' | 'defeat' | 'event' | 'dungeon'
  | 'battle-frost' | 'battle-volt' | 'battle-venom' | 'battle-alloy' | 'battle-mirage' | 'battle-final'
  | 'boss-blaze' | 'boss-frost' | 'boss-volt' | 'boss-venom' | 'boss-alloy' | 'boss-mirage' | 'boss-final'
  | 'capture' | 'capture-success' | 'capture-fail';

interface Note {
  freq: number;       // frequency in Hz
  start: number;      // start time in seconds from loop beginning
  duration: number;   // note duration in seconds
  type: OscillatorType;
  volume: number;     // 0-1
}

interface PercNote {
  start: number;
  duration: number;
  volume: number;
}

interface TrackData {
  duration: number;   // total loop duration in seconds
  notes: Note[];
  perc?: PercNote[];  // percussion (noise bursts)
}

// Note frequency reference
const C4 = 262, D4 = 294, E4 = 330, F4 = 349, G4 = 392, A4 = 440, B4 = 494;
const C5 = 523, D5 = 587, E5 = 659, F5 = 698, G5 = 784, _A5 = 880, _B5 = 988;
void _A5; void _B5;
const C3 = 131, D3 = 147, E3 = 165, F3 = 175, G3 = 196, A3 = 220, B3 = 247;
const Bb3 = 233, Eb4 = 311, _Ab4 = 415, Bb4 = 466;
void _Ab4;
const C6 = 1047;
// Minor scale extras
const Gs3 = 208, Fs4 = 370;
// Additional frequencies for chapter battle themes
const Eb3 = 156, Fs3 = 185;
const Gs4 = 415;
const Eb5 = 622, Fs5 = 740, Gs5 = 831;

const BPM_TO_BEAT = (bpm: number) => 60 / bpm;

// ============================================================
// TRACK DEFINITIONS
// ============================================================

function makeTitleTrack(): TrackData {
  // Mysterious, inviting - arpeggiated chords, triangle wave
  // ~100 BPM, C major / Am
  const b = BPM_TO_BEAT(100);
  const notes: Note[] = [];

  // Arpeggio pattern 1: Am  (A3 C4 E4 A4)
  const arp1 = [A3, C4, E4, A4, E4, C4, A3, C4];
  // Arpeggio pattern 2: F   (F3 A3 C4 F4)
  const arp2 = [F3, A3, C4, F4, C4, A3, F3, A3];

  for (let i = 0; i < 8; i++) {
    notes.push({ freq: arp1[i], start: i * b, duration: b * 0.8, type: 'triangle', volume: 0.22 });
  }
  for (let i = 0; i < 8; i++) {
    notes.push({ freq: arp2[i], start: (8 + i) * b, duration: b * 0.8, type: 'triangle', volume: 0.22 });
  }

  // Soft bass drone
  notes.push({ freq: A3 / 2, start: 0, duration: 8 * b, type: 'sine', volume: 0.08 });
  notes.push({ freq: F3 / 2, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.08 });

  return { duration: 16 * b, notes };
}

function makeTownTrack(): TrackData {
  // Peaceful, warm - 120 BPM, C major
  const b = BPM_TO_BEAT(120);
  const notes: Note[] = [];

  // Melody (triangle) - gentle ascending/descending
  const melody = [
    C4, E4, G4, C5, B4, G4, E4, D4,
    E4, G4, B4, D5, C5, A4, G4, E4,
  ];
  for (let i = 0; i < melody.length; i++) {
    notes.push({ freq: melody[i], start: i * b, duration: b * 0.75, type: 'triangle', volume: 0.2 });
  }

  // Harmony (triangle, soft)
  const harmony = [
    E4, G4, C5, E5, D5, B4, G4, F4,
    G4, B4, D5, F5, E5, C5, B4, G4,
  ];
  for (let i = 0; i < harmony.length; i++) {
    notes.push({ freq: harmony[i], start: i * b, duration: b * 0.5, type: 'triangle', volume: 0.08 });
  }

  // Bass (square, low volume) - root notes, half notes
  const bass = [C3, C3, G3, G3, A3, A3, E3, E3, F3, F3, G3, G3, C3, C3, G3, G3];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.6, type: 'square', volume: 0.06 });
  }

  return { duration: 16 * b, notes };
}

function makeBattleTrack(): TrackData {
  // Energetic, driving - 160 BPM, A minor
  const b = BPM_TO_BEAT(160);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (sawtooth) - aggressive patterns
  const melody = [
    A4, 0, C5, A4, E4, 0, A4, G4,
    F4, 0, A4, F4, D4, 0, F4, E4,
    A4, 0, C5, D5, E5, 0, D5, C5,
    A4, 0, G4, A4, E4, 0, A4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.4, type: 'sawtooth', volume: 0.14 });
  }

  // Bass (square) - driving eighth notes
  const bass = [
    A3, A3, A3, A3, A3, A3, A3, A3,
    F3, F3, F3, F3, F3, F3, F3, F3,
    A3, A3, A3, A3, E3, E3, E3, E3,
    A3, A3, G3, G3, A3, A3, A3, A3,
  ];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * (b / 2), duration: b * 0.35, type: 'square', volume: 0.07 });
  }

  // Percussion - kick on beats 1 & 3, snare-ish on 2 & 4
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * (b / 2) * 2;
    // kick
    perc.push({ start: offset, duration: 0.06, volume: 0.15 });
    perc.push({ start: offset + b, duration: 0.06, volume: 0.15 });
    // snare (shorter, quieter)
    perc.push({ start: offset + b / 2, duration: 0.03, volume: 0.08 });
    perc.push({ start: offset + b * 1.5, duration: 0.03, volume: 0.08 });
  }

  return { duration: 16 * b, notes, perc };
}

function makeBossTrack(): TrackData {
  // Epic, intense, dramatic - 140 BPM, D minor
  const b = BPM_TO_BEAT(140);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (sawtooth) - dramatic minor key, wider intervals
  const melody = [
    D4, 0, F4, A4, D5, 0, C5, Bb4,
    A4, 0, G4, F4, E4, 0, D4, 0,
    D4, 0, F4, A4, D5, 0, F5, E5,
    D5, 0, C5, Bb4, A4, 0, D4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.4, type: 'sawtooth', volume: 0.15 });
  }

  // Counter melody (square, lower)
  const counter = [
    A3, 0, D4, 0, F4, 0, A4, 0,
    G3, 0, Bb3, 0, D4, 0, F4, 0,
    A3, 0, D4, 0, F4, 0, A4, 0,
    G3, 0, Bb3, 0, A3, 0, D4, 0,
  ];
  for (let i = 0; i < counter.length; i++) {
    if (counter[i] === 0) continue;
    notes.push({ freq: counter[i], start: i * (b / 2), duration: b * 0.35, type: 'square', volume: 0.08 });
  }

  // Heavy bass
  const bass = [D3, D3, D3, D3, G3, G3, G3, G3, D3, D3, D3, D3, A3, A3, D3, D3];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  }

  // Ominous drone undertone
  notes.push({ freq: D3 / 2, start: 0, duration: 8 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: A3 / 2, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.06 });

  // Intense percussion
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    for (let beat = 0; beat < 4; beat++) {
      // kick every beat
      perc.push({ start: offset + beat * b, duration: 0.06, volume: 0.18 });
      // off-beat hits
      perc.push({ start: offset + beat * b + b / 2, duration: 0.03, volume: 0.1 });
    }
  }

  return { duration: 16 * b, notes, perc };
}

function makeVictoryTrack(): TrackData {
  // Short triumphant fanfare, loops
  const b = BPM_TO_BEAT(130);
  const notes: Note[] = [];

  const melody = [C5, E5, G5, C6, C6, G5, C6, 0];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * b, duration: b * 0.8, type: 'triangle', volume: 0.2 });
    notes.push({ freq: melody[i], start: i * b, duration: b * 0.6, type: 'square', volume: 0.06 });
  }

  // Harmony
  const harm = [E4, G4, B4, E5, E5, B4, E5, 0];
  for (let i = 0; i < harm.length; i++) {
    if (harm[i] === 0) continue;
    notes.push({ freq: harm[i], start: i * b, duration: b * 0.6, type: 'triangle', volume: 0.1 });
  }

  // Bass
  notes.push({ freq: C3, start: 0, duration: 4 * b, type: 'square', volume: 0.06 });
  notes.push({ freq: G3, start: 4 * b, duration: 4 * b, type: 'square', volume: 0.06 });

  return { duration: 8 * b, notes };
}

function makeEventTrack(): TrackData {
  // Calm, mysterious - for events/shops
  const b = BPM_TO_BEAT(105);
  const notes: Note[] = [];

  // Gentle arpeggio in Em
  const arp1 = [E3, G3, B3, E4, G4, B4, G4, E4];
  const arp2 = [C3, E3, G3, C4, E4, G4, E4, C4];
  for (let i = 0; i < 8; i++) {
    notes.push({ freq: arp1[i], start: i * b, duration: b * 0.7, type: 'triangle', volume: 0.18 });
  }
  for (let i = 0; i < 8; i++) {
    notes.push({ freq: arp2[i], start: (8 + i) * b, duration: b * 0.7, type: 'triangle', volume: 0.18 });
  }

  // Soft pad
  notes.push({ freq: E3, start: 0, duration: 8 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: C3, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.06 });

  return { duration: 16 * b, notes };
}

function makeDungeonTrack(): TrackData {
  // Slightly tense, exploring - 110 BPM, E minor / sparse
  const b = BPM_TO_BEAT(110);
  const notes: Note[] = [];

  // Sparse melody (triangle)
  const melody = [
    E4, 0, 0, G4, 0, B4, 0, A4,
    0, G4, 0, 0, F4, 0, E4, 0,
    E4, 0, 0, B4, 0, C5, 0, B4,
    0, A4, 0, G4, 0, 0, E4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.6, type: 'triangle', volume: 0.16 });
  }

  // Low rumble bass
  const bass = [E3, 0, E3, 0, B3, 0, B3, 0, A3, 0, A3, 0, E3, 0, E3, 0];
  for (let i = 0; i < bass.length; i++) {
    if (bass[i] === 0) continue;
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.5, type: 'square', volume: 0.06 });
  }

  // Ambient tone
  notes.push({ freq: E3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.04 });

  return { duration: 16 * b, notes };
}

function makeDefeatTrack(): TrackData {
  // Slow, sad - ~80 BPM, A minor, descending melody
  const b = BPM_TO_BEAT(80);
  const notes: Note[] = [];

  // Descending melody - slow, lonely
  const melody = [A4, G4, F4, E4, D4, C4, B3, A3];
  for (let i = 0; i < melody.length; i++) {
    notes.push({ freq: melody[i], start: i * b, duration: b * 0.9, type: 'triangle', volume: 0.12 });
  }

  // Sparse harmony - every other note
  const harm = [E4, 0, C4, 0, A3, 0, E3, 0];
  for (let i = 0; i < harm.length; i++) {
    if (harm[i] === 0) continue;
    notes.push({ freq: harm[i], start: i * b, duration: b * 0.7, type: 'triangle', volume: 0.06 });
  }

  // Quiet bass drone
  notes.push({ freq: A3 / 2, start: 0, duration: 8 * b, type: 'sine', volume: 0.05 });

  return { duration: 8 * b, notes };
}

function makeBattleFrostTrack(): TrackData {
  // Ch2 - Ice/Frost: ~150 BPM, E minor, crystal-clear shimmering
  const b = BPM_TO_BEAT(150);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (triangle) - crystal-clear, high notes with shimmering pairs
  const melody = [
    E5, 0, G5, Fs5, B4, 0, E5, D5,
    G5, 0, Fs5, E5, B4, 0, D5, E5,
    E5, 0, Gs5, E5, B4, 0, Gs5, Fs5,
    E5, 0, D5, B4, E4, 0, E5, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.35, type: 'triangle', volume: 0.16 });
    // Shimmer: a second note slightly delayed and quieter
    notes.push({ freq: melody[i] * 1.002, start: i * (b / 2) + 0.03, duration: b * 0.25, type: 'triangle', volume: 0.06 });
  }

  // Bass - lighter, steady
  const bass = [
    E3, E3, E3, E3, G3, G3, G3, G3,
    B3, B3, B3, B3, E3, E3, E3, E3,
  ];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.5, type: 'square', volume: 0.05 });
  }

  // Light percussion - gentle taps
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    perc.push({ start: offset, duration: 0.04, volume: 0.08 });
    perc.push({ start: offset + 2 * b, duration: 0.04, volume: 0.08 });
  }

  return { duration: 16 * b, notes, perc };
}

function makeBattleVoltTrack(): TrackData {
  // Ch3 - Electric: ~170 BPM, B minor, rapid staccato with octave jumps
  const b = BPM_TO_BEAT(170);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (sawtooth) - staccato, octave jumps for electric feel
  const melody = [
    B4, 0, Fs4, B4, Fs5, 0, B4, 0,
    D5, 0, Fs4, D5, Fs5, 0, E5, D5,
    B4, 0, Fs5, B4, D5, 0, Fs5, 0,
    E5, 0, D5, B4, Fs4, 0, B4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    // Very short notes for staccato
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.2, type: 'sawtooth', volume: 0.14 });
  }

  // Driving bass - power chord feel
  const bass = [
    B3, B3, B3, B3, Fs3, Fs3, B3, B3,
    D3, D3, D3, D3, Fs3, Fs3, B3, B3,
    B3, B3, B3, B3, E3, E3, Fs3, Fs3,
    D3, D3, B3, B3, Fs3, Fs3, B3, B3,
  ];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * (b / 2), duration: b * 0.3, type: 'square', volume: 0.08 });
  }

  // Heavy syncopated percussion
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * (b / 2) * 2;
    // Kick every beat
    for (let beat = 0; beat < 4; beat++) {
      perc.push({ start: offset + beat * b / 2 * 2, duration: 0.05, volume: 0.16 });
    }
    // Off-beat snares
    perc.push({ start: offset + b * 0.5, duration: 0.03, volume: 0.12 });
    perc.push({ start: offset + b * 1.5, duration: 0.03, volume: 0.12 });
    perc.push({ start: offset + b * 2.5, duration: 0.03, volume: 0.1 });
    perc.push({ start: offset + b * 3.5, duration: 0.03, volume: 0.1 });
  }

  return { duration: 16 * b, notes, perc };
}

function makeBattleVenomTrack(): TrackData {
  // Ch4 - Poison/Venom: ~140 BPM, Eb minor / chromatic, creepy oozing
  const b = BPM_TO_BEAT(140);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (sawtooth) - chromatic half-steps, unsettling
  const melody = [
    Eb4, E4, Eb4, 0, Fs4, G4, Fs4, 0,
    Eb4, D4, Eb4, 0, Gs4, A4, Gs4, 0,
    Eb5, E5, Eb5, 0, Fs4, Gs4, A4, Gs4,
    Eb4, 0, D4, Eb4, E4, 0, Eb4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    // "Oozing" - slightly longer notes with close frequencies
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.45, type: 'sawtooth', volume: 0.13 });
    // Slide effect: a detuned ghost note
    notes.push({ freq: melody[i] * 0.99, start: i * (b / 2) + 0.02, duration: b * 0.3, type: 'sawtooth', volume: 0.04 });
  }

  // Low droning bass
  const bass = [Eb3, Eb3, Eb3, Eb3, D3, D3, D3, D3, Eb3, Eb3, Eb3, Eb3, Gs3, Gs3, Eb3, Eb3];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.7, type: 'square', volume: 0.06 });
  }

  // Drone undertone
  notes.push({ freq: Eb3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.05 });

  // Odd percussion - irregular hits
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    perc.push({ start: offset, duration: 0.05, volume: 0.1 });
    perc.push({ start: offset + b * 1.5, duration: 0.04, volume: 0.07 });
    perc.push({ start: offset + b * 3, duration: 0.05, volume: 0.09 });
  }

  return { duration: 16 * b, notes, perc };
}

function makeBattleAlloyTrack(): TrackData {
  // Ch5 - Metal/Alloy: ~155 BPM, C minor, mechanical/robotic patterns
  const b = BPM_TO_BEAT(155);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (square) - mechanical repeating motifs
  const melody = [
    C4, Eb4, G4, C4, Eb4, G4, C4, Eb4,
    Bb3, D4, F4, Bb3, D4, F4, Bb3, D4,
    C4, Eb4, G4, C5, G4, Eb4, C4, Eb4,
    Bb3, D4, G4, F4, Eb4, D4, C4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.3, type: 'square', volume: 0.14 });
  }

  // Bass - steady industrial pulse
  const bass = [
    C3, C3, C3, C3, C3, C3, C3, C3,
    Bb3, Bb3, Bb3, Bb3, G3, G3, G3, G3,
  ];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.4, type: 'square', volume: 0.07 });
  }

  // Heavy metallic percussion - hammering pattern
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    for (let beat = 0; beat < 4; beat++) {
      // Kick every beat
      perc.push({ start: offset + beat * b, duration: 0.06, volume: 0.18 });
      // Metallic tap on off-beats
      perc.push({ start: offset + beat * b + b / 2, duration: 0.02, volume: 0.12 });
      // Extra sixteenth-note hits for mechanical feel
      perc.push({ start: offset + beat * b + b / 4, duration: 0.015, volume: 0.06 });
    }
  }

  return { duration: 16 * b, notes, perc };
}

function makeBattleMirageTrack(): TrackData {
  // Ch6 - Illusion/Mirage: ~130 BPM, F# minor, ethereal, dreamy
  const b = BPM_TO_BEAT(130);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Melody (triangle) - ethereal, unexpected intervals
  const melody = [
    Fs4, 0, B4, 0, E5, 0, Gs4, 0,
    Fs4, 0, D5, 0, B4, 0, Fs5, 0,
    E5, 0, Gs5, 0, Fs5, 0, B4, 0,
    D5, 0, Fs4, 0, Gs4, 0, Fs4, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.55, type: 'triangle', volume: 0.15 });
    // Echo/delay effect: same note repeated quieter
    notes.push({ freq: melody[i], start: i * (b / 2) + b * 0.3, duration: b * 0.35, type: 'triangle', volume: 0.06 });
  }

  // Dissonant harmony pad
  notes.push({ freq: Fs3, start: 0, duration: 8 * b, type: 'sine', volume: 0.05 });
  notes.push({ freq: Gs3, start: 0, duration: 8 * b, type: 'sine', volume: 0.03 }); // dissonance
  notes.push({ freq: Fs3, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.05 });
  notes.push({ freq: E3, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.03 });

  // Light percussion - sparse, reverb-like
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    perc.push({ start: offset, duration: 0.04, volume: 0.06 });
    perc.push({ start: offset + 0.1, duration: 0.03, volume: 0.03 }); // echo
    perc.push({ start: offset + 2 * b, duration: 0.04, volume: 0.06 });
    perc.push({ start: offset + 2 * b + 0.1, duration: 0.03, volume: 0.03 }); // echo
  }

  return { duration: 16 * b, notes, perc };
}

function makeBattleFinalTrack(): TrackData {
  // Ch7 - Final: ~145 BPM, D minor, epic, combines elements from all chapters
  const b = BPM_TO_BEAT(145);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Main melody (sawtooth) - epic dramatic
  const melody = [
    D5, 0, F5, D5, A4, 0, D5, C5,
    Bb4, 0, D5, F5, E5, 0, D5, C5,
    D5, 0, F5, A4, Bb4, 0, C5, D5,
    F5, 0, E5, D5, A4, 0, D5, 0,
  ];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.4, type: 'sawtooth', volume: 0.15 });
  }

  // Counter-melody (square) - interweaving
  const counter = [
    A3, 0, D4, 0, F4, 0, A4, 0,
    Bb3, 0, D4, 0, F4, 0, G4, 0,
    A3, 0, D4, 0, F4, 0, A4, 0,
    G3, 0, Bb3, 0, A3, 0, D4, 0,
  ];
  for (let i = 0; i < counter.length; i++) {
    if (counter[i] === 0) continue;
    notes.push({ freq: counter[i], start: i * (b / 2), duration: b * 0.35, type: 'square', volume: 0.08 });
  }

  // Heavy bass
  const bass = [D3, D3, D3, D3, Bb3, Bb3, G3, G3, D3, D3, D3, D3, A3, A3, D3, D3];
  for (let i = 0; i < bass.length; i++) {
    notes.push({ freq: bass[i], start: i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  }

  // Ominous drone
  notes.push({ freq: D3 / 2, start: 0, duration: 8 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: A3 / 2, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.06 });

  // Full percussion - most intense
  for (let bar = 0; bar < 4; bar++) {
    const offset = bar * 4 * b;
    for (let beat = 0; beat < 4; beat++) {
      // kick every beat
      perc.push({ start: offset + beat * b, duration: 0.06, volume: 0.18 });
      // snare on off-beats
      perc.push({ start: offset + beat * b + b / 2, duration: 0.03, volume: 0.12 });
      // hi-hat sixteenths
      perc.push({ start: offset + beat * b + b / 4, duration: 0.015, volume: 0.05 });
      perc.push({ start: offset + beat * b + b * 3 / 4, duration: 0.015, volume: 0.05 });
    }
  }

  return { duration: 16 * b, notes, perc };
}

function makeCaptureTrack(): TrackData {
  // Tense, anticipatory - ~100 BPM, short loop
  const b = BPM_TO_BEAT(100);
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // Suspenseful rising tone
  const rise = [A3, Bb3, B3, C4, D4, Eb4, E4, F4];
  for (let i = 0; i < rise.length; i++) {
    notes.push({ freq: rise[i], start: i * (b / 2), duration: b * 0.4, type: 'triangle', volume: 0.1 + i * 0.01 });
  }

  // Drum roll effect - rapid quiet percussion
  const rollLen = 4 * b;
  const numHits = 24;
  for (let i = 0; i < numHits; i++) {
    const t = (i / numHits) * rollLen;
    perc.push({ start: t, duration: 0.02, volume: 0.04 + (i / numHits) * 0.06 });
  }

  return { duration: 4 * b, notes, perc };
}

function makeCaptureSuccessTrack(): TrackData {
  // Joyful fanfare - ~140 BPM, C major ascending
  const b = BPM_TO_BEAT(140);
  const notes: Note[] = [];

  const melody = [C5, E5, G5, C6, C6, G5, C6, 0];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.45, type: 'triangle', volume: 0.2 });
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.3, type: 'square', volume: 0.06 });
  }

  // Harmony
  const harm = [E4, G4, B4, E5, E5, B4, E5, 0];
  for (let i = 0; i < harm.length; i++) {
    if (harm[i] === 0) continue;
    notes.push({ freq: harm[i], start: i * (b / 2), duration: b * 0.35, type: 'triangle', volume: 0.08 });
  }

  // Bass
  notes.push({ freq: C3, start: 0, duration: 2 * b, type: 'square', volume: 0.06 });
  notes.push({ freq: G3, start: 2 * b, duration: 2 * b, type: 'square', volume: 0.06 });

  return { duration: 4 * b, notes };
}

function makeCaptureFailTrack(): TrackData {
  // Disappointed - ~90 BPM, short descending minor
  const b = BPM_TO_BEAT(90);
  const notes: Note[] = [];

  const melody = [E4, D4, C4, A3, E4, C4, A3, 0];
  for (let i = 0; i < melody.length; i++) {
    if (melody[i] === 0) continue;
    notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.5, type: 'triangle', volume: 0.13 - i * 0.01 });
  }

  // Low sigh
  notes.push({ freq: A3 / 2, start: 0, duration: 3 * b, type: 'sine', volume: 0.04 });

  return { duration: 3 * b, notes };
}

// ============================================================
// CHAPTER-SPECIFIC BOSS TRACKS
// Each is a heavier, slower, more dramatic version of the chapter battle BGM
// ============================================================

function makeBossBlazeTrack(): TrackData {
  // Ch1 boss - Heavy fire theme, 130 BPM Am, deeper than battle
  const b = BPM_TO_BEAT(130);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [A4, 0, C5, E5, A4, 0, G4, A4, F4, 0, A4, C5, D5, 0, C5, A4, A4, 0, E5, D5, C5, 0, A4, G4, A4, 0, C5, A4, E4, 0, A4, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.45, type: 'sawtooth', volume: 0.16 }); }
  const bass = [A3, A3, A3, A3, F3, F3, F3, F3, A3, A3, E3, E3, A3, A3, A3, A3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  notes.push({ freq: A3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 4; bt++) { perc.push({ start: o + bt * b, duration: 0.07, volume: 0.2 }); perc.push({ start: o + bt * b + b / 2, duration: 0.04, volume: 0.12 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossFrostTrack(): TrackData {
  // Ch2 boss - Icy menace, 125 BPM Em
  const b = BPM_TO_BEAT(125);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [E5, 0, G5, B4, E5, 0, D5, E5, B4, 0, E5, G5, A4, 0, G5, E5, E5, 0, B4, G5, E5, 0, D5, B4, E5, 0, G5, E5, B4, 0, E5, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.5, type: 'triangle', volume: 0.18 }); notes.push({ freq: melody[i] * 1.005, start: i * (b / 2), duration: b * 0.3, type: 'triangle', volume: 0.06 }); }
  const bass = [E3, E3, B3, B3, A3, A3, E3, E3, E3, E3, G3, G3, A3, A3, B3, B3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.6, type: 'square', volume: 0.07 });
  notes.push({ freq: E3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.06 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 4; bt++) { perc.push({ start: o + bt * b, duration: 0.06, volume: 0.16 }); perc.push({ start: o + bt * b + b / 2, duration: 0.03, volume: 0.09 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossVoltTrack(): TrackData {
  // Ch3 boss - Electric fury, 150 BPM Bm
  const b = BPM_TO_BEAT(150);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [B4, 0, D5, Fs4, B4, 0, B4, D5, Fs4, 0, B4, D5, E5, 0, D5, B4, Fs4, 0, D5, B4, Fs4, 0, B4, Fs4, D5, 0, B4, D5, Fs4, 0, B4, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.25, type: 'sawtooth', volume: 0.17 }); if (i % 4 === 0) notes.push({ freq: melody[i] * 2, start: i * (b / 2), duration: b * 0.1, type: 'square', volume: 0.06 }); }
  const bass = [B3, B3, B3, B3, Gs3, Gs3, Gs3, Gs3, E3, E3, E3, E3, B3, B3, B3, B3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  notes.push({ freq: B3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.06 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 8; bt++) { perc.push({ start: o + bt * (b / 2), duration: 0.04, volume: bt % 2 === 0 ? 0.18 : 0.1 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossVenomTrack(): TrackData {
  // Ch4 boss - Toxic dread, 120 BPM Ebm chromatic
  const b = BPM_TO_BEAT(120);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [Eb4, 0, E4, F4, Eb4, 0, D4, Eb4, F4, 0, Eb4, D4, C4, 0, D4, Eb4, Eb4, 0, F4, Eb4, D4, 0, Eb4, F4, Eb4, 0, D4, C4, D4, 0, Eb4, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.5, type: 'sawtooth', volume: 0.14 }); notes.push({ freq: melody[i] * 1.01, start: i * (b / 2) + 0.03, duration: b * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const bass = [Eb3, Eb3, Eb3, Eb3, D3, D3, D3, D3, C3, C3, C3, C3, Eb3, Eb3, D3, Eb3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  notes.push({ freq: Eb3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 4; bt++) { perc.push({ start: o + bt * b, duration: 0.07, volume: 0.16 }); perc.push({ start: o + bt * b + b * 0.75, duration: 0.04, volume: 0.08 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossAlloyTrack(): TrackData {
  // Ch5 boss - Mechanical titan, 135 BPM Cm
  const b = BPM_TO_BEAT(135);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [C5, C5, 0, G4, C5, C5, 0, Eb4, G4, G4, 0, C5, Eb4, 0, G4, C5, C5, C5, 0, Eb4, C5, C5, 0, G4, Eb4, Eb4, 0, G4, C5, 0, G4, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.3, type: 'square', volume: 0.15 }); }
  const bass = [C3, C3, G3, C3, C3, C3, Eb3, C3, G3, G3, C3, G3, Eb3, Eb3, G3, C3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.5, type: 'square', volume: 0.09 });
  notes.push({ freq: C3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 8; bt++) { perc.push({ start: o + bt * (b / 2), duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.2 : 0.12 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossMirageTrack(): TrackData {
  // Ch6 boss - Ethereal nightmare, 115 BPM F#m
  const b = BPM_TO_BEAT(115);
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const melody = [Fs4, 0, A4, Fs4, 0, E4, Fs4, 0, A4, 0, B4, A4, Fs4, 0, E4, 0, Fs4, 0, A4, B4, 0, Fs4, A4, 0, B4, 0, A4, Fs4, E4, 0, Fs4, 0];
  for (let i = 0; i < melody.length; i++) { if (melody[i] === 0) continue; notes.push({ freq: melody[i], start: i * (b / 2), duration: b * 0.6, type: 'triangle', volume: 0.16 }); notes.push({ freq: melody[i], start: i * (b / 2) + b * 0.3, duration: b * 0.4, type: 'triangle', volume: 0.06 }); }
  const bass = [Fs3, Fs3, Fs3, Fs3, D3, D3, D3, D3, A3, A3, A3, A3, Fs3, Fs3, E3, Fs3];
  for (let i = 0; i < bass.length; i++) notes.push({ freq: bass[i], start: i * b, duration: b * 0.6, type: 'square', volume: 0.06 });
  notes.push({ freq: Fs3 / 2, start: 0, duration: 8 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: D3 / 2, start: 8 * b, duration: 8 * b, type: 'sine', volume: 0.06 });
  for (let bar = 0; bar < 4; bar++) { const o = bar * 4 * b; for (let bt = 0; bt < 4; bt++) { perc.push({ start: o + bt * b, duration: 0.05, volume: 0.14 }); } }
  return { duration: 16 * b, notes, perc };
}

function makeBossFinalTrack(): TrackData {
  // Ch7 FINAL BOSS - ウロボロス - 全てを終わらせる壮大な決戦
  // 4パート構成: イントロ(不穏) → 主旋律(激しい) → 対旋律(重厚) → クライマックス(全開)
  const b = BPM_TO_BEAT(152); // 速めで緊迫感
  const notes: Note[] = [];
  const perc: PercNote[] = [];
  const h = b / 2; // 8th note

  // ===== Part A (bar 1-2): 不穏なイントロ - 低音のうねり =====
  const introMel = [D4, 0, Eb4, D4, 0, A3, Bb3, 0, D4, 0, F4, Eb4, D4, 0, A3, 0];
  for (let i = 0; i < introMel.length; i++) {
    if (introMel[i] === 0) continue;
    notes.push({ freq: introMel[i], start: i * h, duration: h * 0.7, type: 'triangle', volume: 0.18 });
  }
  // 不協和音ドローン
  notes.push({ freq: D3, start: 0, duration: 8 * b, type: 'sine', volume: 0.08 });
  notes.push({ freq: Eb3, start: 0, duration: 4 * b, type: 'sine', volume: 0.04 }); // 半音ぶつけ

  // ===== Part B (bar 3-4): 主旋律爆発 - sawtooth全開 =====
  const mainMel = [D5, F5, 0, A4, D5, F5, G5, 0, A4, D5, 0, F5, G5, A4, D5, 0];
  const off2 = 16 * h;
  for (let i = 0; i < mainMel.length; i++) {
    if (mainMel[i] === 0) continue;
    notes.push({ freq: mainMel[i], start: off2 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.18 });
    // オクターブ下でユニゾン（厚み）
    notes.push({ freq: mainMel[i] / 2, start: off2 + i * h, duration: h * 0.35, type: 'sawtooth', volume: 0.06 });
  }
  // 裏メロ（対位法）
  const counterB = [A4, 0, D4, F4, A4, 0, Bb4, A4, F4, 0, D4, A4, Bb4, 0, A4, 0];
  for (let i = 0; i < counterB.length; i++) {
    if (counterB[i] === 0) continue;
    notes.push({ freq: counterB[i], start: off2 + i * h, duration: h * 0.4, type: 'square', volume: 0.09 });
  }

  // ===== Part C (bar 5-6): 重厚な展開 - ベースライン主導 =====
  const off3 = 32 * h;
  const heavyMel = [Bb4, 0, A4, G4, F4, 0, G4, A4, Bb4, 0, C5, Bb4, A4, 0, G4, 0];
  for (let i = 0; i < heavyMel.length; i++) {
    if (heavyMel[i] === 0) continue;
    notes.push({ freq: heavyMel[i], start: off3 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.16 });
  }
  // パワーコード風ベース
  const powerBass = [Bb3, Bb3, Bb3, Bb3, A3, A3, G3, G3, F3, F3, G3, G3, A3, A3, A3, A3];
  for (let i = 0; i < powerBass.length; i++) {
    notes.push({ freq: powerBass[i], start: off3 + i * h, duration: h * 0.6, type: 'square', volume: 0.1 });
    // 5度上を重ねてパワーコード
    notes.push({ freq: powerBass[i] * 1.5, start: off3 + i * h, duration: h * 0.4, type: 'square', volume: 0.04 });
  }

  // ===== Part D (bar 7-8): クライマックス - 全パート全開 =====
  const off4 = 48 * h;
  // 主旋律（最高音域）
  const climaxMel = [D5, F5, G5, A4, D5, F5, G5, F5, D5, F5, A4, G5, F5, D5, G5, 0];
  for (let i = 0; i < climaxMel.length; i++) {
    if (climaxMel[i] === 0) continue;
    notes.push({ freq: climaxMel[i], start: off4 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.2 });
    notes.push({ freq: climaxMel[i] / 2, start: off4 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.07 });
  }
  // ハーモニー（3度上）
  const harmD = [F5, A4, Bb4, D5, F5, A4, Bb4, A4, F5, A4, D5, Bb4, A4, F5, Bb4, 0];
  for (let i = 0; i < harmD.length; i++) {
    if (harmD[i] === 0) continue;
    notes.push({ freq: harmD[i], start: off4 + i * h, duration: h * 0.35, type: 'triangle', volume: 0.1 });
  }
  // 高速アルペジオ装飾
  const arpD = [D5, A4, F4, D4, A4, F4, D4, A3, D5, A4, F4, D4, A4, F4, D4, A3];
  for (let i = 0; i < arpD.length; i++) {
    notes.push({ freq: arpD[i], start: off4 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.05 });
  }

  // ===== 通奏低音（全体） =====
  const fullBass = [
    D3, D3, D3, D3, D3, D3, A3, A3,   // Part A
    D3, D3, Bb3, Bb3, A3, A3, D3, D3,  // Part B
    Bb3, Bb3, A3, A3, G3, G3, A3, A3,  // Part C
    D3, D3, D3, D3, Bb3, A3, G3, D3,   // Part D
  ];
  for (let i = 0; i < fullBass.length; i++) {
    notes.push({ freq: fullBass[i], start: i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  }

  // ===== 重低音ドローン（全体を支える） =====
  notes.push({ freq: D3 / 4, start: 0, duration: 32 * b, type: 'sine', volume: 0.05 }); // サブベース
  notes.push({ freq: D3 / 2, start: 0, duration: 16 * b, type: 'sine', volume: 0.07 });
  notes.push({ freq: A3 / 2, start: 16 * b, duration: 16 * b, type: 'sine', volume: 0.07 });

  // ===== パーカッション =====
  // Part A: 重い4つ打ち
  for (let bt = 0; bt < 8; bt++) {
    perc.push({ start: bt * b, duration: 0.08, volume: 0.2 });
  }
  // Part B: 8分刻み
  for (let bt = 0; bt < 16; bt++) {
    perc.push({ start: 8 * b + bt * h, duration: bt % 2 === 0 ? 0.07 : 0.03, volume: bt % 2 === 0 ? 0.22 : 0.12 });
  }
  // Part C: 変則リズム（3+3+2）
  const cRhythm = [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30];
  for (const r of cRhythm) {
    perc.push({ start: 16 * b + r * h, duration: 0.06, volume: 0.2 });
  }
  // Part D: フルスロットル16分
  for (let bt = 0; bt < 16; bt++) {
    perc.push({ start: 24 * b + bt * h, duration: 0.05, volume: 0.24 });
    if (bt % 2 === 1) perc.push({ start: 24 * b + bt * h + h * 0.5, duration: 0.02, volume: 0.1 }); // ゴーストノート
  }

  return { duration: 32 * b, notes, perc };
}

const TRACKS: Record<BGMTrack, () => TrackData> = {
  title: makeTitleTrack,
  town: makeTownTrack,
  battle: makeBattleTrack,
  boss: makeBossTrack,
  victory: makeVictoryTrack,
  defeat: makeDefeatTrack,
  event: makeEventTrack,
  dungeon: makeDungeonTrack,
  'battle-frost': makeBattleFrostTrack,
  'battle-volt': makeBattleVoltTrack,
  'battle-venom': makeBattleVenomTrack,
  'battle-alloy': makeBattleAlloyTrack,
  'battle-mirage': makeBattleMirageTrack,
  'battle-final': makeBattleFinalTrack,
  'boss-blaze': makeBossBlazeTrack,
  'boss-frost': makeBossFrostTrack,
  'boss-volt': makeBossVoltTrack,
  'boss-venom': makeBossVenomTrack,
  'boss-alloy': makeBossAlloyTrack,
  'boss-mirage': makeBossMirageTrack,
  'boss-final': makeBossFinalTrack,
  capture: makeCaptureTrack,
  'capture-success': makeCaptureSuccessTrack,
  'capture-fail': makeCaptureFailTrack,
};

// ============================================================
// BGM ENGINE
// ============================================================

class BGMEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: BGMTrack | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private scheduledNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private loopTimer: number | null = null;
  private _volume = 0.3;
  private _muted = false;

  get currentTrackName(): string | null { return this.currentTrack; }
  get volume() { return this._volume; }
  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.value = this._volume;
    }
  }

  get muted() { return this._muted; }
  set muted(m: boolean) {
    this._muted = m;
    if (this.masterGain) {
      this.masterGain.gain.value = m ? 0 : this._volume;
    }
  }

  toggleMute(): boolean {
    this.muted = !this._muted;
    return this._muted;
  }

  play(track: BGMTrack) {
    if (this.currentTrack === track && this.isPlaying) return;
    this.stop();
    this.currentTrack = track;
    this.isPlaying = true;
    this.startLoop(track);
  }

  playOnce(track: BGMTrack) {
    this.stop();
    this.currentTrack = track;
    this.isPlaying = true;
    const trackData = TRACKS[track]();
    this.playSequence(trackData);
    // Auto-stop after duration (don't loop)
    this.loopTimer = window.setTimeout(() => {
      this.isPlaying = false;
      // Don't clear currentTrack so controller knows what was playing
    }, trackData.duration * 1000);
  }

  stop() {
    this.isPlaying = false;
    this.currentTrack = null;
    // Stop all scheduled oscillators/buffers
    for (const n of this.scheduledNodes) {
      try { n.stop(); } catch { /* already stopped */ }
    }
    this.scheduledNodes = [];
    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private startLoop(track: BGMTrack) {
    const trackData = TRACKS[track]();
    this.playSequence(trackData);
    this.loopTimer = window.setTimeout(() => {
      if (this.isPlaying && this.currentTrack === track) {
        this.scheduledNodes = [];
        this.startLoop(track);
      }
    }, trackData.duration * 1000);
  }

  private playSequence(trackData: TrackData) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const master = this.masterGain!;

    // Schedule tonal notes
    for (const note of trackData.notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(master);

      osc.type = note.type;

      const t0 = now + note.start;
      const t1 = t0 + note.duration;
      const attack = 0.01;
      const release = 0.02;

      osc.frequency.setValueAtTime(note.freq, t0);
      // ADSR envelope: quick attack, sustain, quick release
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(note.volume, t0 + attack);
      gain.gain.setValueAtTime(note.volume, t1 - release);
      gain.gain.linearRampToValueAtTime(0.001, t1);

      osc.start(t0);
      osc.stop(t1 + 0.01);

      this.scheduledNodes.push(osc);
    }

    // Schedule percussion (noise bursts)
    if (trackData.perc) {
      for (const p of trackData.perc) {
        const len = Math.max(1, Math.floor(ctx.sampleRate * p.duration));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        src.connect(gain);
        gain.connect(master);

        const t0 = now + p.start;
        gain.gain.setValueAtTime(p.volume, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + p.duration);

        src.start(t0);
        src.stop(t0 + p.duration + 0.01);

        this.scheduledNodes.push(src);
      }
    }
  }
}

export type { BGMTrack };
export const bgm = new BGMEngine();
