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
  // Ch1 boss - 灼熱の支配者 - 10パート構成 Am, 138 BPM, 160 beats
  const b = BPM_TO_BEAT(138); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // === Section 1: Intro (0-16 beats) - 不穏な炎の揺らぎ (sparse Part A) ===
  const s1 = 0;
  const introA = [A3, 0, 0, 0, C4, 0, 0, E4, 0, 0, A3, 0, 0, E4, C4, 0,
                  A3, 0, 0, 0, C4, 0, E4, 0, G4, 0, 0, 0, E4, 0, 0, 0];
  for (let i = 0; i < introA.length; i++) { if (introA[i] === 0) continue; notes.push({ freq: introA[i], start: s1 + i * h, duration: h * 1.2, type: 'triangle', volume: 0.12 }); }
  notes.push({ freq: A3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.07 });
  // sparse perc
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.08, volume: 0.1 });

  // === Section 2: Build (16-32 beats) - ベースとリズム導入、Part Aに対旋律追加 ===
  const s2 = 16 * b;
  const buildMel = [A3, 0, C4, E4, A3, 0, E4, C4, A3, 0, C4, E4, G4, 0, E4, 0,
                    A3, 0, C4, E4, A4, 0, E4, C4, A3, 0, C4, E4, G4, 0, A4, 0];
  for (let i = 0; i < buildMel.length; i++) { if (buildMel[i] === 0) continue; notes.push({ freq: buildMel[i], start: s2 + i * h, duration: h * 0.7, type: 'triangle', volume: 0.16 }); }
  const buildCounter = [0, 0, E4, 0, 0, 0, G4, 0, 0, 0, A4, 0, 0, 0, G4, 0,
                        0, 0, E4, 0, 0, 0, G4, 0, 0, 0, A4, 0, B4, 0, C5, 0];
  for (let i = 0; i < buildCounter.length; i++) { if (!buildCounter[i]) continue; notes.push({ freq: buildCounter[i], start: s2 + i * h, duration: h * 0.5, type: 'square', volume: 0.07 }); }
  const buildBass = [A3, A3, A3, A3, A3, A3, E3, E3, F3, F3, A3, A3, E3, E3, A3, A3];
  for (let i = 0; i < buildBass.length; i++) notes.push({ freq: buildBass[i], start: s2 + i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.06, volume: 0.14 });

  // === Section 3: Theme A (32-48 beats) - 主旋律爆発 (full Part B) ===
  const s3 = 32 * b;
  const melB = [A4, 0, C5, E5, A4, 0, G4, A4, F4, 0, A4, C5, D5, 0, C5, A4,
                A4, 0, C5, E5, A4, 0, G4, A4, F4, 0, E5, D5, C5, 0, A4, 0];
  for (let i = 0; i < melB.length; i++) { if (melB[i] === 0) continue; notes.push({ freq: melB[i], start: s3 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.18 }); notes.push({ freq: melB[i] / 2, start: s3 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.06 }); }
  const counterB = [E4, 0, A3, C4, E4, 0, D4, E4, C4, 0, E4, A4, F4, 0, E4, C4,
                    E4, 0, A3, C4, E4, 0, D4, E4, C4, 0, G4, F4, E4, 0, C4, 0];
  for (let i = 0; i < counterB.length; i++) { if (counterB[i] === 0) continue; notes.push({ freq: counterB[i], start: s3 + i * h, duration: h * 0.4, type: 'square', volume: 0.08 }); }
  const bass3 = [A3, A3, A3, A3, F3, F3, A3, A3, D3, D3, A3, A3, E3, E3, A3, A3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.2 : 0.1 });

  // === Section 4: Bridge 1 (48-64 beats) - Theme A transposed up a 4th (Dm) ===
  const s4 = 48 * b;
  const melBr1 = [D5, 0, F5, A4, D5, 0, C5, D5, Bb4, 0, D5, F5, G5, 0, F5, D5,
                  D5, 0, F5, A4, D5, 0, C5, D5, Bb4, 0, A4, G4, F4, 0, D4, 0];
  for (let i = 0; i < melBr1.length; i++) { if (melBr1[i] === 0) continue; notes.push({ freq: melBr1[i], start: s4 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.17 }); }
  const counterBr1 = [A4, 0, D4, F4, A4, 0, G4, A4, F4, 0, A4, D5, Bb4, 0, A4, F4,
                      A4, 0, D4, F4, A4, 0, G4, A4, F4, 0, D5, C5, Bb4, 0, A4, 0];
  for (let i = 0; i < counterBr1.length; i++) { if (counterBr1[i] === 0) continue; notes.push({ freq: counterBr1[i], start: s4 + i * h, duration: h * 0.35, type: 'square', volume: 0.07 }); }
  const bass4 = [D3, D3, D3, D3, Bb3, Bb3, D3, D3, G3, G3, D3, D3, A3, A3, D3, D3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: bt % 4 === 0 ? 0.06 : 0.03, volume: bt % 4 === 0 ? 0.18 : 0.08 });

  // === Section 5: Theme B (64-80 beats) - 重厚展開 (full Part C + power chords) ===
  const s5 = 64 * b;
  const melC = [E5, 0, D5, C5, A4, 0, C5, D5, E5, 0, G4, A4, C5, 0, A4, 0,
                E5, 0, D5, C5, A4, 0, G4, A4, E5, 0, D5, C5, A4, 0, E5, 0];
  for (let i = 0; i < melC.length; i++) { if (melC[i] === 0) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.16 }); }
  const pwrC = [F3, F3, F3, F3, E3, E3, E3, E3, D3, D3, D3, D3, A3, A3, A3, A3,
                F3, F3, F3, F3, E3, E3, E3, E3, D3, D3, A3, A3, E3, E3, A3, A3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.6, type: 'square', volume: 0.1 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.4, type: 'square', volume: 0.04 }); }
  for (const r of [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30]) perc.push({ start: s5 + r * h, duration: 0.06, volume: 0.2 });

  // === Section 6: Breakdown (80-96 beats) - ベース+スパースメロディ、テンション上昇 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, A4, 0, 0, 0, 0, 0, 0, 0, C5, 0, 0, 0, 0, 0,
                    0, 0, D5, 0, 0, 0, E5, 0, 0, 0, F5, 0, 0, 0, G5, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; notes.push({ freq: breakMel[i], start: s6 + i * h, duration: h * 0.8, type: 'triangle', volume: 0.14 }); }
  const breakBass = [A3, 0, A3, 0, A3, 0, A3, 0, B3, 0, B3, 0, C4, 0, C4, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.8, type: 'square', volume: 0.09 }); }
  notes.push({ freq: A3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.07, volume: 0.12 });
  // Rising tension perc at end
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.04, volume: 0.08 + bt * 0.015 });

  // === Section 7: Theme C (96-112 beats) - Theme A + B combined, densest ===
  const s7 = 96 * b;
  const melComb1 = [A4, 0, C5, E5, A4, 0, G4, A4, F4, 0, A4, C5, D5, 0, C5, A4,
                    E5, 0, D5, C5, A4, 0, C5, D5, E5, 0, G4, A4, C5, 0, E5, 0];
  for (let i = 0; i < melComb1.length; i++) { if (melComb1[i] === 0) continue; notes.push({ freq: melComb1[i], start: s7 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.18 }); notes.push({ freq: melComb1[i] / 2, start: s7 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.06 }); }
  const melComb2 = [E4, 0, A3, C4, E4, 0, D4, E4, C4, 0, E4, A4, F4, 0, E4, C4,
                    A3, C4, E4, A3, C4, E4, D4, A3, C4, E4, A3, E4, D4, A3, C4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (melComb2[i] === 0) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.35, type: 'square', volume: 0.07 }); }
  const bass7 = [A3, A3, F3, F3, E3, E3, A3, A3, D3, D3, F3, F3, E3, E3, A3, A3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.2 : 0.1 });

  // === Section 8: Bridge 2 (112-128 beats) - Part D melody with echo/delay ===
  const s8 = 112 * b;
  const melD = [A4, C5, E5, A4, C5, E5, G4, A4, A4, C5, E5, D5, C5, A4, E5, 0,
                A4, C5, E5, A4, C5, E5, G4, A4, A4, C5, D5, C5, A4, G4, A4, 0];
  for (let i = 0; i < melD.length; i++) { if (melD[i] === 0) continue; notes.push({ freq: melD[i], start: s8 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.17 }); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.3, type: 'sawtooth', volume: 0.07 }); }
  const bass8 = [A3, A3, E3, E3, F3, F3, A3, A3, A3, A3, E3, E3, D3, D3, A3, A3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.04, volume: bt % 4 === 0 ? 0.18 : 0.08 });

  // === Section 9: Climax (128-144 beats) - 全開 ===
  const s9 = 128 * b;
  const climaxMel = [A4, C5, E5, A4, C5, E5, G4, A4, A4, C5, E5, D5, C5, A4, E5, A4,
                     E5, D5, C5, A4, G4, A4, C5, E5, D5, C5, A4, E5, A4, C5, E5, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (climaxMel[i] === 0) continue; notes.push({ freq: climaxMel[i], start: s9 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.2 }); notes.push({ freq: climaxMel[i] / 2, start: s9 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.07 }); }
  // Harmony line
  const harmCl = [C5, E5, G4, C5, E5, G4, E4, C5, C5, E5, G4, F4, E4, C5, G4, C5,
                  G4, F4, E4, C5, E4, C5, E5, G4, F4, E4, C5, G4, C5, E5, G4, 0];
  for (let i = 0; i < harmCl.length; i++) { if (harmCl[i] === 0) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.35, type: 'triangle', volume: 0.09 }); }
  // Arpeggios
  const arpCl = [A4, E4, C4, A3, E4, C4, A3, E3, A4, E4, C4, A3, E4, C4, A3, E3,
                 A4, E4, C4, A3, E4, C4, A3, E3, A4, E4, C4, A3, E4, C4, A3, E3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.05 });
  const bass9 = [A3, A3, A3, A3, F3, F3, E3, E3, D3, D3, A3, A3, E3, E3, A3, A3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.7, type: 'square', volume: 0.1 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s9 + bt * h, duration: 0.05, volume: 0.22 });

  // === Section 10: Outro/Loop (144-160 beats) - Intro回帰 ===
  const s10 = 144 * b;
  const outroMel = [A4, 0, 0, C5, 0, 0, E4, 0, 0, A3, 0, 0, C4, 0, E4, 0,
                    A3, 0, 0, 0, C4, 0, 0, 0, E4, 0, 0, 0, A3, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; notes.push({ freq: outroMel[i], start: s10 + i * h, duration: h * 1.0, type: 'triangle', volume: 0.14 - i * 0.003 }); }
  notes.push({ freq: A3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.07 });
  const bass10 = [A3, A3, A3, A3, E3, E3, E3, E3, A3, A3, A3, A3, A3, A3, A3, A3];
  for (let i = 0; i < bass10.length; i++) notes.push({ freq: bass10[i], start: s10 + i * b, duration: b * 0.5, type: 'square', volume: 0.07 - i * 0.003 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.06, volume: 0.1 - bt * 0.01 });

  // === Global sub-bass drone ===
  notes.push({ freq: A3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossFrostTrack(): TrackData {
  // Ch2 boss - 氷結の暴君 - 10パート構成 Em, 132 BPM, 160 beats (shimmer theme)
  const b = BPM_TO_BEAT(132); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // Helper: shimmer note pair
  const shimmer = (freq: number, start: number, dur: number, vol: number) => {
    notes.push({ freq, start, duration: dur, type: 'triangle', volume: vol });
    notes.push({ freq: freq * 1.005, start: start + 0.02, duration: dur * 0.7, type: 'triangle', volume: vol * 0.35 });
  };

  // === Section 1: Intro (0-16) - 凍てつく静寂、sparse shimmer ===
  const s1 = 0;
  const intro = [E4, 0, 0, 0, G4, 0, 0, 0, B4, 0, 0, 0, E4, 0, 0, 0,
                 0, 0, G4, 0, 0, 0, B4, 0, 0, 0, D5, 0, 0, 0, B4, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; shimmer(intro[i], s1 + i * h, h * 1.2, 0.12); }
  notes.push({ freq: E3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.04, volume: 0.08 });

  // === Section 2: Build (16-32) - Part Aリズム導入 ===
  const s2 = 16 * b;
  const buildMel = [E4, 0, G4, B4, E4, 0, B4, G4, E4, 0, G4, B4, D5, 0, B4, 0,
                    E4, 0, G4, B4, E4, 0, B4, G4, E4, 0, G4, B4, E5, 0, D5, 0];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; shimmer(buildMel[i], s2 + i * h, h * 0.6, 0.16); }
  const buildCounter = [0, 0, B3, 0, 0, 0, E4, 0, 0, 0, D4, 0, 0, 0, G4, 0,
                        0, 0, B3, 0, 0, 0, E4, 0, 0, 0, G4, 0, 0, 0, B4, 0];
  for (let i = 0; i < buildCounter.length; i++) { if (!buildCounter[i]) continue; notes.push({ freq: buildCounter[i], start: s2 + i * h, duration: h * 0.5, type: 'square', volume: 0.06 }); }
  const bass2 = [E3, E3, E3, E3, E3, E3, B3, B3, A3, A3, E3, E3, B3, B3, E3, E3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.6, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.05, volume: 0.12 });

  // === Section 3: Theme A (32-48) - 吹雪の主旋律 (full Part B) ===
  const s3 = 32 * b;
  const melB = [E5, 0, G5, B4, E5, 0, D5, E5, B4, 0, E5, G5, A4, 0, G5, E5,
                E5, 0, G5, B4, E5, 0, D5, E5, B4, 0, E5, Fs5, G5, 0, E5, 0];
  for (let i = 0; i < melB.length; i++) { if (!melB[i]) continue; shimmer(melB[i], s3 + i * h, h * 0.5, 0.2); notes.push({ freq: melB[i] / 2, start: s3 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const counterB = [B4, 0, E4, G4, B4, 0, A4, B4, G4, 0, B4, D5, E4, 0, D5, B4,
                    B4, 0, E4, G4, B4, 0, A4, B4, G4, 0, B4, D5, E5, 0, B4, 0];
  for (let i = 0; i < counterB.length; i++) { if (!counterB[i]) continue; notes.push({ freq: counterB[i], start: s3 + i * h, duration: h * 0.4, type: 'square', volume: 0.07 }); }
  const bass3 = [E3, E3, E3, E3, A3, A3, B3, B3, E3, E3, G3, G3, B3, B3, E3, E3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.18 : 0.09 });

  // === Section 4: Bridge 1 (48-64) - Theme A up a 5th (Bm) ===
  const s4 = 48 * b;
  const melBr = [B4, 0, D5, Fs4, B4, 0, A4, B4, Fs4, 0, B4, D5, E4, 0, D5, B4,
                 B4, 0, D5, Fs4, B4, 0, A4, B4, Fs4, 0, B4, D5, E5, 0, D5, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; shimmer(melBr[i], s4 + i * h, h * 0.5, 0.18); }
  const counterBr = [Fs4, 0, B3, D4, Fs4, 0, E4, Fs4, D4, 0, Fs4, A4, B3, 0, A4, Fs4,
                     Fs4, 0, B3, D4, Fs4, 0, E4, Fs4, D4, 0, Fs4, A4, B4, 0, Fs4, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.35, type: 'square', volume: 0.07 }); }
  const bass4 = [B3, B3, B3, B3, Fs3, Fs3, B3, B3, E3, E3, Fs3, Fs3, B3, B3, B3, B3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: bt % 4 === 0 ? 0.05 : 0.02, volume: bt % 4 === 0 ? 0.16 : 0.07 });

  // === Section 5: Theme B (64-80) - 氷の咆哮 (full Part C + power) ===
  const s5 = 64 * b;
  const melC = [G5, 0, E5, D5, B4, 0, D5, E5, G5, 0, B4, D5, E5, 0, D5, 0,
                G5, 0, E5, D5, B4, 0, E5, G5, Fs5, 0, E5, D5, B4, 0, E5, 0];
  for (let i = 0; i < melC.length; i++) { if (!melC[i]) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.16 }); }
  const pwrC = [A3, A3, A3, A3, G3, G3, G3, G3, E3, E3, E3, E3, B3, B3, B3, B3,
                A3, A3, A3, A3, G3, G3, G3, G3, E3, E3, B3, B3, E3, E3, B3, B3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.6, type: 'square', volume: 0.09 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.4, type: 'square', volume: 0.04 }); }
  for (const r of [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30]) perc.push({ start: s5 + r * h, duration: 0.05, volume: 0.18 });

  // === Section 6: Breakdown (80-96) - 氷の静寂、テンション上昇 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, E4, 0, 0, 0, 0, 0, 0, 0, G4, 0, 0, 0, 0, 0,
                    0, 0, B4, 0, 0, 0, D5, 0, 0, 0, E5, 0, 0, 0, G5, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; shimmer(breakMel[i], s6 + i * h, h * 1.0, 0.13); }
  notes.push({ freq: E3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  const breakBass = [E3, 0, E3, 0, E3, 0, E3, 0, Fs3, 0, Fs3, 0, G3, 0, A3, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.8, type: 'square', volume: 0.08 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.04, volume: 0.1 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.03, volume: 0.06 + bt * 0.015 });

  // === Section 7: Theme C (96-112) - Theme A + B combined ===
  const s7 = 96 * b;
  const melComb = [E5, 0, G5, B4, E5, 0, D5, E5, B4, 0, E5, G5, A4, 0, G5, E5,
                   G5, 0, E5, D5, B4, 0, D5, E5, G5, 0, B4, D5, E5, 0, G5, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; shimmer(melComb[i], s7 + i * h, h * 0.5, 0.2); notes.push({ freq: melComb[i] / 2, start: s7 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const melComb2 = [B4, 0, E4, G4, B4, 0, A4, B4, G4, 0, B4, D5, E4, 0, D5, B4,
                    E4, G4, B4, E4, G4, B4, A4, E4, G4, B4, E4, B4, A4, E4, B4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.35, type: 'square', volume: 0.07 }); }
  const bass7 = [E3, E3, A3, A3, G3, G3, B3, B3, E3, E3, A3, A3, B3, B3, E3, E3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.2 : 0.1 });

  // === Section 8: Bridge 2 (112-128) - Part D with echo/delay ===
  const s8 = 112 * b;
  const melD = [E5, G5, B4, E5, G5, B4, D5, E5, E5, G5, B4, A4, G5, E5, B4, 0,
                E5, G5, B4, E5, G5, B4, D5, E5, E5, G5, B4, Fs5, E5, D5, B4, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; shimmer(melD[i], s8 + i * h, h * 0.4, 0.18); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.3, type: 'triangle', volume: 0.07 }); }
  const bass8 = [E3, E3, B3, B3, A3, A3, E3, E3, E3, E3, B3, B3, A3, A3, E3, E3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.04, volume: bt % 4 === 0 ? 0.16 : 0.07 });

  // === Section 9: Climax (128-144) - 絶対零度 全開 ===
  const s9 = 128 * b;
  const climaxMel = [E5, G5, B4, E5, G5, B4, D5, E5, E5, G5, B4, A4, G5, E5, B4, E5,
                     G5, Fs5, E5, D5, B4, E5, G5, B4, Fs5, E5, D5, B4, E5, G5, B4, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; shimmer(climaxMel[i], s9 + i * h, h * 0.4, 0.2); notes.push({ freq: climaxMel[i] / 2, start: s9 + i * h, duration: h * 0.25, type: 'sawtooth', volume: 0.06 }); }
  const harmCl = [B4, D5, G4, B4, D5, G4, A4, B4, B4, D5, G4, E4, D5, B4, G4, B4,
                  D5, D5, B4, A4, G4, B4, D5, G4, D5, B4, A4, G4, B4, D5, G4, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.35, type: 'triangle', volume: 0.09 }); }
  const arpCl = [E5, B4, G4, E4, B4, G4, E4, B3, E5, B4, G4, E4, B4, G4, E4, B3,
                 E5, B4, G4, E4, B4, G4, E4, B3, E5, B4, G4, E4, B4, G4, E4, B3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.04 });
  const bass9 = [E3, E3, A3, A3, G3, G3, B3, B3, E3, E3, A3, A3, B3, B3, E3, E3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.6, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s9 + bt * h, duration: 0.04, volume: 0.2 });

  // === Section 10: Outro/Loop (144-160) - 凍結回帰 ===
  const s10 = 144 * b;
  const outroMel = [E5, 0, 0, G4, 0, 0, B4, 0, 0, E4, 0, 0, G4, 0, B4, 0,
                    E4, 0, 0, 0, G4, 0, 0, 0, B4, 0, 0, 0, E4, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; shimmer(outroMel[i], s10 + i * h, h * 1.0, 0.12 - i * 0.002); }
  notes.push({ freq: E3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.07 });
  const bass10 = [E3, E3, E3, E3, B3, B3, B3, B3, E3, E3, E3, E3, E3, E3, E3, E3];
  for (let i = 0; i < bass10.length; i++) notes.push({ freq: bass10[i], start: s10 + i * b, duration: b * 0.4, type: 'square', volume: 0.06 - i * 0.002 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.04, volume: 0.08 - bt * 0.008 });

  // === Global sub-bass drone ===
  notes.push({ freq: E3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossVoltTrack(): TrackData {
  // Ch3 boss - 雷帝 - 10パート構成 Bm, 155 BPM, 160 beats (staccato/electric theme)
  const b = BPM_TO_BEAT(155); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // Helper: electric zap note (staccato + octave spark)
  const zap = (freq: number, start: number, vol: number) => {
    notes.push({ freq, start, duration: h * 0.28, type: 'sawtooth', volume: vol });
    notes.push({ freq: freq * 2, start, duration: h * 0.1, type: 'square', volume: vol * 0.35 });
  };

  // === Section 1: Intro (0-16) - 静電気の前兆 ===
  const s1 = 0;
  const intro = [B3, 0, 0, 0, D4, 0, 0, 0, Fs4, 0, 0, 0, B3, 0, 0, 0,
                 0, 0, D4, 0, 0, Fs4, 0, 0, 0, B4, 0, 0, 0, Fs4, 0, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; notes.push({ freq: intro[i], start: s1 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.1 }); if (i % 5 === 0) notes.push({ freq: intro[i] * 2, start: s1 + i * h, duration: h * 0.08, type: 'square', volume: 0.04 }); }
  notes.push({ freq: B3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.06 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.04, volume: 0.1 });

  // === Section 2: Build (16-32) - 帯電開始 ===
  const s2 = 16 * b;
  const buildMel = [B3, 0, D4, Fs4, 0, B3, Fs4, 0, B3, 0, D4, Fs4, 0, B4, Fs4, 0,
                    B3, 0, D4, Fs4, 0, B3, Fs4, D4, B3, 0, D4, Fs4, B4, 0, D5, 0];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; notes.push({ freq: buildMel[i], start: s2 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.15 }); if (i % 3 === 0) notes.push({ freq: buildMel[i] * 2, start: s2 + i * h, duration: h * 0.1, type: 'square', volume: 0.05 }); }
  const bass2 = [B3, B3, B3, B3, B3, B3, Gs3, Gs3, E3, E3, B3, B3, Fs3, Fs3, B3, B3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.5, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.04, volume: 0.14 });

  // === Section 3: Theme A (32-48) - 落雷の主旋律 (full Part B) ===
  const s3 = 32 * b;
  const melB = [B4, 0, D5, Fs4, B4, 0, B4, D5, Fs4, 0, B4, D5, E5, 0, D5, B4,
                B4, 0, D5, Fs4, B4, 0, B4, D5, Fs5, 0, E5, D5, B4, 0, Fs4, 0];
  for (let i = 0; i < melB.length; i++) { if (!melB[i]) continue; zap(melB[i], s3 + i * h, 0.19); }
  const counterB = [Fs4, 0, B3, D4, Fs4, 0, Fs4, B4, D4, 0, Fs4, B4, Gs3, 0, B4, Fs4,
                    Fs4, 0, B3, D4, Fs4, 0, Fs4, B4, D4, 0, Gs3, B4, Fs4, 0, D4, 0];
  for (let i = 0; i < counterB.length; i++) { if (!counterB[i]) continue; notes.push({ freq: counterB[i], start: s3 + i * h, duration: h * 0.25, type: 'square', volume: 0.08 }); }
  const bass3 = [B3, B3, B3, B3, Fs3, Fs3, B3, B3, E3, E3, Gs3, Gs3, B3, B3, B3, B3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: 0.03, volume: bt % 2 === 0 ? 0.2 : 0.1 });

  // === Section 4: Bridge 1 (48-64) - Theme A up a 4th (Em) ===
  const s4 = 48 * b;
  const melBr = [E5, 0, G5, B4, E5, 0, E5, G5, B4, 0, E5, G5, A4, 0, G5, E5,
                 E5, 0, G5, B4, E5, 0, E5, G5, Fs5, 0, E5, G5, A4, 0, B4, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; zap(melBr[i], s4 + i * h, 0.17); }
  const counterBr = [B4, 0, E4, G4, B4, 0, B4, E5, G4, 0, B4, E5, D4, 0, E5, B4,
                     B4, 0, E4, G4, B4, 0, B4, E5, D5, 0, B4, E5, D4, 0, G4, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.22, type: 'square', volume: 0.07 }); }
  const bass4 = [E3, E3, E3, E3, B3, B3, E3, E3, A3, A3, B3, B3, E3, E3, E3, E3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: 0.03, volume: bt % 2 === 0 ? 0.18 : 0.08 });

  // === Section 5: Theme B (64-80) - 連鎖雷撃 (full Part C + power) ===
  const s5 = 64 * b;
  const melC = [D5, Fs4, B4, D5, Fs4, B4, E5, D5, B4, Fs4, D5, B4, Fs4, D5, B4, 0,
                D5, Fs4, B4, D5, Fs5, B4, E5, D5, B4, Fs4, D5, E5, D5, B4, Fs4, 0];
  for (let i = 0; i < melC.length; i++) { if (!melC[i]) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.22, type: 'sawtooth', volume: 0.18 }); }
  const pwrC = [Gs3, Gs3, Gs3, Gs3, E3, E3, E3, E3, B3, B3, B3, B3, Fs3, Fs3, Fs3, Fs3,
                Gs3, Gs3, Gs3, Gs3, E3, E3, E3, E3, B3, B3, Fs3, Fs3, B3, B3, B3, B3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.5, type: 'square', volume: 0.09 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.3, type: 'square', volume: 0.04 }); }
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s5 + bt * h, duration: 0.03, volume: 0.18 });

  // === Section 6: Breakdown (80-96) - 放電停止、再帯電 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, B3, 0, 0, 0, 0, 0, 0, 0, D4, 0, 0, 0, 0, 0,
                    0, 0, Fs4, 0, 0, 0, B4, 0, 0, 0, D5, 0, 0, 0, Fs5, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; notes.push({ freq: breakMel[i], start: s6 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.12 }); }
  notes.push({ freq: B3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  const breakBass = [B3, 0, B3, 0, B3, 0, B3, 0, D4, 0, D4, 0, E4, 0, Fs4, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.04, volume: 0.1 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.03, volume: 0.08 + bt * 0.02 });

  // === Section 7: Theme C (96-112) - Theme A + B combined ===
  const s7 = 96 * b;
  const melComb = [B4, 0, D5, Fs4, B4, 0, B4, D5, Fs4, 0, B4, D5, E5, 0, D5, B4,
                   D5, Fs4, B4, D5, Fs4, B4, E5, D5, B4, Fs4, D5, B4, Fs4, D5, B4, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; zap(melComb[i], s7 + i * h, 0.19); }
  const melComb2 = [Fs4, 0, B3, D4, Fs4, 0, Fs4, B4, D4, 0, Fs4, B4, Gs3, 0, B4, Fs4,
                    B3, D4, Fs4, B3, D4, Fs4, Gs3, B3, Fs4, D4, B3, Gs3, D4, B3, Fs4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.22, type: 'square', volume: 0.07 }); }
  const bass7 = [B3, B3, Gs3, Gs3, E3, E3, B3, B3, Fs3, Fs3, Gs3, Gs3, B3, B3, B3, B3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: 0.03, volume: bt % 2 === 0 ? 0.2 : 0.1 });

  // === Section 8: Bridge 2 (112-128) - Part D with echo/delay ===
  const s8 = 112 * b;
  const melD = [B4, D5, Fs4, B4, D5, Fs4, E5, B4, D5, Fs4, B4, E5, D5, B4, Fs4, 0,
                B4, D5, Fs4, B4, D5, Fs4, E5, B4, D5, Fs5, E5, D5, B4, Fs4, B4, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; zap(melD[i], s8 + i * h, 0.17); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.2, type: 'sawtooth', volume: 0.06 }); }
  const bass8 = [B3, B3, Fs3, Fs3, E3, E3, B3, B3, B3, B3, Gs3, Gs3, E3, E3, B3, B3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.03, volume: bt % 4 === 0 ? 0.18 : 0.08 });

  // === Section 9: Climax (128-144) - 万雷 全開 ===
  const s9 = 128 * b;
  const climaxMel = [B4, D5, Fs4, B4, D5, Fs4, E5, B4, D5, Fs4, B4, E5, D5, B4, Fs4, B4,
                     Fs5, E5, D5, B4, Fs4, B4, D5, Fs4, E5, D5, B4, Fs5, E5, D5, B4, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; zap(climaxMel[i], s9 + i * h, 0.2); }
  const harmCl = [D5, Fs4, B3, D5, Fs4, B3, Gs3, D5, Fs4, B3, D5, Gs3, Fs4, D5, B3, D5,
                  B4, Gs3, Fs4, D5, B3, D5, Fs4, B3, Gs3, Fs4, D5, B4, Gs3, Fs4, D5, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.08 }); }
  const arpCl = [B4, Fs4, D4, B3, Fs4, D4, B3, Fs3, B4, Fs4, D4, B3, Fs4, D4, B3, Fs3,
                 B4, Fs4, D4, B3, Fs4, D4, B3, Fs3, B4, Fs4, D4, B3, Fs4, D4, B3, Fs3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.15, type: 'triangle', volume: 0.04 });
  const bass9 = [B3, B3, Gs3, Gs3, E3, E3, Fs3, Fs3, B3, B3, Gs3, Gs3, E3, Fs3, B3, B3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.5, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) { perc.push({ start: s9 + bt * h, duration: 0.04, volume: 0.24 }); if (bt % 2 === 1) perc.push({ start: s9 + bt * h + h * 0.5, duration: 0.02, volume: 0.08 }); }

  // === Section 10: Outro/Loop (144-160) - 放電収束 ===
  const s10 = 144 * b;
  const outroMel = [B4, 0, 0, D4, 0, 0, Fs4, 0, 0, B3, 0, 0, D4, 0, Fs4, 0,
                    B3, 0, 0, 0, D4, 0, 0, 0, Fs4, 0, 0, 0, B3, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; notes.push({ freq: outroMel[i], start: s10 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.1 - i * 0.002 }); }
  notes.push({ freq: B3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.06 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.04, volume: 0.08 - bt * 0.008 });

  // === Global sub-bass drone ===
  notes.push({ freq: B3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossVenomTrack(): TrackData {
  // Ch4 boss - 毒竜ニーズヘッグ - 10パート構成 Ebm, 126 BPM, 160 beats (chromatic/oozing theme)
  const b = BPM_TO_BEAT(126); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // Helper: poison ooze note (detuned ghost)
  const ooze = (freq: number, start: number, dur: number, vol: number) => {
    notes.push({ freq, start, duration: dur, type: 'sawtooth', volume: vol });
    notes.push({ freq: freq * 1.01, start: start + 0.03, duration: dur * 0.7, type: 'sawtooth', volume: vol * 0.35 });
  };

  // === Section 1: Intro (0-16) - 瘴気の胎動 (sparse) ===
  const s1 = 0;
  const intro = [Eb4, 0, 0, 0, E4, 0, 0, 0, Eb4, 0, 0, 0, D4, 0, 0, 0,
                 0, 0, Eb4, 0, 0, 0, D4, 0, 0, 0, C4, 0, 0, 0, D4, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; ooze(intro[i], s1 + i * h, h * 1.2, 0.1); }
  notes.push({ freq: Eb3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.07 });
  notes.push({ freq: E3 / 2, start: s1, duration: 8 * b, type: 'sine', volume: 0.03 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.06, volume: 0.08 });

  // === Section 2: Build (16-32) - 毒霧発生 ===
  const s2 = 16 * b;
  const buildMel = [Eb4, 0, E4, Eb4, D4, 0, Eb4, 0, D4, 0, C4, D4, Eb4, 0, D4, 0,
                    Eb4, 0, E4, Eb4, D4, 0, Eb4, 0, D4, 0, Eb4, E4, F4, 0, Eb4, 0];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; ooze(buildMel[i], s2 + i * h, h * 0.6, 0.14); }
  const bass2 = [Eb3, Eb3, Eb3, Eb3, Eb3, Eb3, D3, D3, D3, D3, C3, C3, Eb3, Eb3, D3, Eb3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.7, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.06, volume: 0.12 });

  // === Section 3: Theme A (32-48) - 猛毒の牙 (full Part B) ===
  const s3 = 32 * b;
  const melB = [Eb4, 0, E4, F4, Eb4, 0, D4, Eb4, F4, 0, Eb4, D4, C4, 0, D4, Eb4,
                Eb4, 0, E4, F4, Eb4, 0, D4, Eb4, F4, 0, Gs4, F4, Eb4, 0, D4, 0];
  for (let i = 0; i < melB.length; i++) { if (!melB[i]) continue; ooze(melB[i], s3 + i * h, h * 0.5, 0.17); notes.push({ freq: melB[i] / 2, start: s3 + i * h, duration: h * 0.3, type: 'square', volume: 0.05 }); }
  const bass3 = [Eb3, Eb3, Eb3, Eb3, D3, D3, Eb3, Eb3, C3, C3, D3, D3, Eb3, Eb3, D3, Eb3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: 0.05, volume: bt % 2 === 0 ? 0.18 : 0.08 });

  // === Section 4: Bridge 1 (48-64) - Theme A up a 4th (Abm/Gs) ===
  const s4 = 48 * b;
  const melBr = [Gs4, 0, A4, Bb4, Gs4, 0, Fs4, Gs4, Bb4, 0, Gs4, Fs4, E4, 0, Fs4, Gs4,
                 Gs4, 0, A4, Bb4, Gs4, 0, Fs4, Gs4, Bb4, 0, A4, Gs4, Fs4, 0, E4, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; ooze(melBr[i], s4 + i * h, h * 0.5, 0.16); }
  const counterBr = [E4, 0, Gs3, Bb3, E4, 0, D4, E4, Bb3, 0, E4, Gs4, Fs3, 0, E4, Bb3,
                     E4, 0, Gs3, Bb3, E4, 0, D4, E4, Bb3, 0, Gs3, Fs3, E3, 0, Gs3, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.4, type: 'square', volume: 0.07 }); }
  const bass4 = [Gs3, Gs3, Gs3, Gs3, Fs3, Fs3, Gs3, Gs3, E3, E3, Fs3, Fs3, Gs3, Gs3, Gs3, Gs3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: 0.04, volume: bt % 3 === 0 ? 0.16 : 0.07 });

  // === Section 5: Theme B (64-80) - 腐蝕の波 (full Part C + power) ===
  const s5 = 64 * b;
  const melC = [F4, 0, Eb4, D4, C4, 0, D4, Eb4, F4, 0, Eb4, F4, Eb4, 0, D4, 0,
                F4, 0, Eb4, D4, C4, 0, Eb4, F4, Gs4, 0, F4, Eb4, D4, 0, Eb4, 0];
  for (let i = 0; i < melC.length; i++) { if (!melC[i]) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.16 }); }
  const pwrC = [D3, D3, D3, D3, C3, C3, C3, C3, Eb3, Eb3, Eb3, Eb3, D3, D3, Eb3, D3,
                D3, D3, D3, D3, C3, C3, C3, C3, Eb3, Eb3, D3, D3, C3, C3, Eb3, Eb3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.6, type: 'square', volume: 0.09 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.4, type: 'square', volume: 0.04 }); }
  for (const r of [0, 3, 5, 8, 11, 13, 16, 19, 21, 24, 27, 29]) perc.push({ start: s5 + r * h, duration: 0.06, volume: 0.18 });

  // === Section 6: Breakdown (80-96) - 毒霧沈静、再蓄積 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, Eb4, 0, 0, 0, 0, 0, 0, 0, E4, 0, 0, 0, 0, 0,
                    0, 0, F4, 0, 0, 0, Gs4, 0, 0, 0, A4, 0, 0, 0, Bb4, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; ooze(breakMel[i], s6 + i * h, h * 0.9, 0.12); }
  notes.push({ freq: Eb3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: E3 / 2, start: s6, duration: 8 * b, type: 'sine', volume: 0.03 });
  const breakBass = [Eb3, 0, Eb3, 0, Eb3, 0, Eb3, 0, D3, 0, D3, 0, E3, 0, F3, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.8, type: 'square', volume: 0.08 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.05, volume: 0.08 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.04, volume: 0.06 + bt * 0.015 });

  // === Section 7: Theme C (96-112) - Theme A + B combined ===
  const s7 = 96 * b;
  const melComb = [Eb4, 0, E4, F4, Eb4, 0, D4, Eb4, F4, 0, Eb4, D4, C4, 0, D4, Eb4,
                   F4, 0, Eb4, D4, C4, 0, D4, Eb4, F4, 0, Eb4, F4, Eb4, 0, D4, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; ooze(melComb[i], s7 + i * h, h * 0.5, 0.17); notes.push({ freq: melComb[i] / 2, start: s7 + i * h, duration: h * 0.3, type: 'square', volume: 0.05 }); }
  const melComb2 = [D4, 0, Eb3, Gs3, D4, 0, C4, D4, Eb3, 0, D4, Gs4, C3, 0, D4, Eb3,
                    Eb3, Gs3, D4, Eb3, Gs3, D4, C4, Eb3, Gs3, D4, Eb3, D4, C4, Eb3, Gs3, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.4, type: 'square', volume: 0.07 }); }
  const bass7 = [Eb3, Eb3, D3, D3, C3, C3, Eb3, Eb3, D3, D3, Gs3, Gs3, Eb3, Eb3, D3, Eb3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: 0.05, volume: bt % 2 === 0 ? 0.18 : 0.08 });

  // === Section 8: Bridge 2 (112-128) - Part D with echo/delay ===
  const s8 = 112 * b;
  const melD = [Eb4, F4, Eb4, D4, F4, Eb4, D4, C4, Eb4, F4, Eb4, D4, F4, Eb4, D4, 0,
                Eb4, F4, Eb4, D4, F4, Eb4, D4, C4, Eb4, F4, Gs4, F4, Eb4, D4, Eb4, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; ooze(melD[i], s8 + i * h, h * 0.45, 0.16); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.3, type: 'sawtooth', volume: 0.06 }); }
  const bass8 = [Eb3, Eb3, D3, D3, C3, C3, Eb3, Eb3, Eb3, Eb3, D3, D3, C3, D3, Eb3, Eb3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.04, volume: bt % 3 === 0 ? 0.16 : 0.07 });

  // === Section 9: Climax (128-144) - 致死毒 全開 ===
  const s9 = 128 * b;
  const climaxMel = [Eb4, F4, Eb4, D4, F4, Eb4, D4, C4, Eb4, F4, Eb4, D4, F4, Eb4, D4, Eb4,
                     Gs4, F4, Eb4, D4, C4, Eb4, F4, D4, Gs4, F4, Eb4, D4, Eb4, F4, Eb4, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; ooze(climaxMel[i], s9 + i * h, h * 0.45, 0.19); }
  const harmCl = [C4, D4, C4, Bb3, D4, C4, Bb3, Gs3, C4, D4, C4, Bb3, D4, C4, Bb3, C4,
                  E4, D4, C4, Bb3, Gs3, C4, D4, Bb3, E4, D4, C4, Bb3, C4, D4, C4, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.4, type: 'triangle', volume: 0.08 }); }
  const arpCl = [Eb4, D4, C4, Eb3, D4, C4, Eb3, D3, Eb4, D4, C4, Eb3, D4, C4, Eb3, D3,
                 Eb4, D4, C4, Eb3, D4, C4, Eb3, D3, Eb4, D4, C4, Eb3, D4, C4, Eb3, D3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.04 });
  const bass9 = [Eb3, Eb3, D3, D3, C3, C3, Eb3, Eb3, D3, D3, Gs3, Gs3, Eb3, D3, Eb3, Eb3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s9 + bt * h, duration: 0.05, volume: 0.2 });

  // === Section 10: Outro/Loop (144-160) - 毒霧回帰 ===
  const s10 = 144 * b;
  const outroMel = [Eb4, 0, 0, E4, 0, 0, Eb4, 0, 0, D4, 0, 0, C4, 0, D4, 0,
                    Eb4, 0, 0, 0, D4, 0, 0, 0, C4, 0, 0, 0, Eb4, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; ooze(outroMel[i], s10 + i * h, h * 1.0, 0.1 - i * 0.002); }
  notes.push({ freq: Eb3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.05, volume: 0.08 - bt * 0.008 });

  // === Global sub-bass drone ===
  notes.push({ freq: Eb3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossAlloyTrack(): TrackData {
  // Ch5 boss - 鋼鉄城塞 - 10パート構成 Cm, 140 BPM, 160 beats (mechanical/square theme)
  const b = BPM_TO_BEAT(140); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // === Section 1: Intro (0-16) - 起動シーケンス (sparse) ===
  const s1 = 0;
  const intro = [C4, C4, 0, 0, 0, 0, G3, 0, 0, 0, C4, C4, 0, 0, Eb4, 0,
                 G4, G4, 0, 0, 0, 0, C4, 0, 0, 0, Eb4, 0, 0, 0, G4, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; notes.push({ freq: intro[i], start: s1 + i * h, duration: h * 0.5, type: 'square', volume: 0.11 }); }
  notes.push({ freq: C3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.06, volume: 0.12 });

  // === Section 2: Build (16-32) - システム起動 ===
  const s2 = 16 * b;
  const buildMel = [C4, C4, 0, G3, C4, C4, 0, Eb4, G4, G4, 0, C4, Eb4, 0, G4, 0,
                    C4, C4, 0, G3, C4, C4, 0, Eb4, G4, G4, 0, C5, Eb4, 0, G4, C5];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; notes.push({ freq: buildMel[i], start: s2 + i * h, duration: h * 0.35, type: 'square', volume: 0.15 }); }
  const buildCounter = [0, 0, Eb4, 0, 0, 0, G4, 0, 0, 0, C5, 0, 0, 0, Eb4, 0,
                        0, 0, Eb4, 0, 0, 0, G4, 0, 0, 0, C5, 0, Eb5, 0, C5, 0];
  for (let i = 0; i < buildCounter.length; i++) { if (!buildCounter[i]) continue; notes.push({ freq: buildCounter[i], start: s2 + i * h, duration: h * 0.25, type: 'sawtooth', volume: 0.06 }); }
  const bass2 = [C3, C3, G3, C3, C3, C3, Eb3, C3, G3, G3, C3, G3, Eb3, Eb3, G3, C3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.06, volume: 0.16 });

  // === Section 3: Theme A (32-48) - 機械の咆哮 (full Part B) ===
  const s3 = 32 * b;
  const melB = [C5, C5, 0, G4, C5, C5, 0, Eb4, G4, G4, 0, C5, Eb4, 0, G4, C5,
                C5, C5, 0, G4, C5, C5, 0, Eb4, G4, G4, 0, C5, Eb5, 0, C5, 0];
  for (let i = 0; i < melB.length; i++) { if (!melB[i]) continue; notes.push({ freq: melB[i], start: s3 + i * h, duration: h * 0.3, type: 'square', volume: 0.18 }); notes.push({ freq: melB[i] / 2, start: s3 + i * h, duration: h * 0.25, type: 'square', volume: 0.06 }); }
  const counterB = [G4, 0, C4, Eb4, G4, 0, G4, C5, Eb4, 0, G4, Eb4, C4, 0, Eb4, G4,
                    G4, 0, C4, Eb4, G4, 0, G4, C5, Eb4, 0, G4, Eb4, C5, 0, G4, 0];
  for (let i = 0; i < counterB.length; i++) { if (!counterB[i]) continue; notes.push({ freq: counterB[i], start: s3 + i * h, duration: h * 0.25, type: 'sawtooth', volume: 0.08 }); }
  const bass3 = [C3, C3, C3, C3, Eb3, Eb3, G3, G3, C3, C3, G3, G3, Eb3, Eb3, C3, C3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.5, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.22 : 0.12 });
  // Metallic taps
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * b + b / 4, duration: 0.015, volume: 0.06 });

  // === Section 4: Bridge 1 (48-64) - Theme A up a 5th (Gm) ===
  const s4 = 48 * b;
  const melBr = [G4, G4, 0, D4, G4, G4, 0, Bb3, D4, D4, 0, G4, Bb3, 0, D4, G4,
                 G4, G4, 0, D4, G4, G4, 0, Bb3, D4, D4, 0, G4, Bb4, 0, G4, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; notes.push({ freq: melBr[i], start: s4 + i * h, duration: h * 0.3, type: 'square', volume: 0.17 }); notes.push({ freq: melBr[i] / 2, start: s4 + i * h, duration: h * 0.25, type: 'square', volume: 0.05 }); }
  const counterBr = [D4, 0, G3, Bb3, D4, 0, D4, G4, Bb3, 0, D4, Bb3, G3, 0, Bb3, D4,
                     D4, 0, G3, Bb3, D4, 0, D4, G4, Bb3, 0, D4, G4, D5, 0, Bb3, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.22, type: 'sawtooth', volume: 0.07 }); }
  const bass4 = [G3, G3, G3, G3, D3, D3, G3, G3, Bb3, Bb3, D3, D3, G3, G3, G3, G3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.5, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: bt % 4 === 0 ? 0.06 : 0.02, volume: bt % 4 === 0 ? 0.2 : 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h + h / 4, duration: 0.015, volume: 0.06 });

  // === Section 5: Theme B (64-80) - フルパワー (full Part C + power) ===
  const s5 = 64 * b;
  const melC = [Eb4, G4, C5, Eb4, G4, C5, G4, Eb4, C5, G4, Eb4, C5, G4, C5, Eb4, 0,
                Eb4, G4, C5, Eb4, G4, C5, Eb5, C5, G4, Eb4, C5, G4, Eb4, C5, G4, 0];
  for (let i = 0; i < melC.length; i++) { if (!melC[i]) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.3, type: 'square', volume: 0.17 }); }
  const pwrC = [G3, G3, G3, G3, Eb3, Eb3, Eb3, Eb3, C3, C3, C3, C3, G3, G3, G3, G3,
                G3, G3, G3, G3, Eb3, Eb3, Eb3, Eb3, C3, C3, G3, G3, Eb3, Eb3, G3, G3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.5, type: 'square', volume: 0.1 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.35, type: 'square', volume: 0.04 }); }
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s5 + bt * h, duration: 0.04, volume: 0.2 });

  // === Section 6: Breakdown (80-96) - システム再起動 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, C4, C4, 0, 0, 0, 0, 0, 0, Eb4, Eb4, 0, 0, 0, 0,
                    0, 0, G4, G4, 0, 0, C5, C5, 0, 0, Eb5, Eb5, 0, 0, G4, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; notes.push({ freq: breakMel[i], start: s6 + i * h, duration: h * 0.35, type: 'square', volume: 0.12 }); }
  notes.push({ freq: C3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  const breakBass = [C3, 0, C3, 0, C3, 0, C3, 0, D3, 0, D3, 0, Eb3, 0, F3, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.06, volume: 0.12 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.04, volume: 0.1 + bt * 0.015 });

  // === Section 7: Theme C (96-112) - Theme A + B combined ===
  const s7 = 96 * b;
  const melComb = [C5, C5, 0, G4, C5, C5, 0, Eb4, G4, G4, 0, C5, Eb4, 0, G4, C5,
                   Eb4, G4, C5, Eb4, G4, C5, G4, Eb4, C5, G4, Eb4, C5, G4, C5, Eb4, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; notes.push({ freq: melComb[i], start: s7 + i * h, duration: h * 0.3, type: 'square', volume: 0.18 }); notes.push({ freq: melComb[i] / 2, start: s7 + i * h, duration: h * 0.25, type: 'square', volume: 0.06 }); }
  const melComb2 = [G4, 0, C4, Eb4, G4, 0, G4, C5, Eb4, 0, G4, Eb4, C4, 0, Eb4, G4,
                    C4, Eb4, G4, C4, Eb4, G4, Eb4, C4, G4, Eb4, C4, G4, Eb4, C4, G4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.22, type: 'sawtooth', volume: 0.07 }); }
  const bass7 = [C3, C3, Eb3, Eb3, G3, G3, C3, C3, Eb3, Eb3, G3, G3, C3, C3, G3, C3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.5, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: bt % 2 === 0 ? 0.06 : 0.03, volume: bt % 2 === 0 ? 0.22 : 0.12 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h + h / 4, duration: 0.015, volume: 0.06 });

  // === Section 8: Bridge 2 (112-128) - Part D with echo/delay ===
  const s8 = 112 * b;
  const melD = [C5, G4, C5, Eb4, C5, G4, Eb4, C5, G4, C5, Eb4, G4, C5, Eb4, G4, 0,
                C5, G4, C5, Eb4, C5, G4, Eb4, C5, G4, C5, Eb5, C5, G4, Eb4, C5, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; notes.push({ freq: melD[i], start: s8 + i * h, duration: h * 0.28, type: 'square', volume: 0.17 }); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.2, type: 'square', volume: 0.06 }); }
  const bass8 = [C3, C3, G3, G3, Eb3, Eb3, C3, C3, C3, C3, G3, G3, Eb3, G3, C3, C3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.5, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.04, volume: bt % 4 === 0 ? 0.2 : 0.08 });

  // === Section 9: Climax (128-144) - 鉄の暴走 全開 ===
  const s9 = 128 * b;
  const climaxMel = [C5, G4, C5, Eb4, C5, G4, Eb4, C5, G4, C5, Eb4, G4, C5, Eb4, G4, C5,
                     Eb5, C5, G4, Eb4, C5, G4, Eb4, C5, Eb5, C5, G4, Eb5, C5, G4, Eb4, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; notes.push({ freq: climaxMel[i], start: s9 + i * h, duration: h * 0.28, type: 'square', volume: 0.2 }); notes.push({ freq: climaxMel[i] / 2, start: s9 + i * h, duration: h * 0.22, type: 'square', volume: 0.07 }); }
  const harmCl = [Eb4, C4, Eb4, C4, Eb4, C4, C4, Eb4, C4, Eb4, C4, C4, Eb4, C4, C4, Eb4,
                  C5, Eb4, C4, C4, Eb4, C4, C4, Eb4, C5, Eb4, C4, C5, Eb4, C4, C4, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.22, type: 'sawtooth', volume: 0.08 }); }
  const arpCl = [C5, G4, Eb4, C4, G4, Eb4, C4, G3, C5, G4, Eb4, C4, G4, Eb4, C4, G3,
                 C5, G4, Eb4, C4, G4, Eb4, C4, G3, C5, G4, Eb4, C4, G4, Eb4, C4, G3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.15, type: 'triangle', volume: 0.04 });
  const bass9 = [C3, C3, Eb3, Eb3, G3, G3, C3, C3, Eb3, Eb3, G3, G3, C3, G3, Eb3, C3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.5, type: 'square', volume: 0.1 });
  for (let bt = 0; bt < 32; bt++) { perc.push({ start: s9 + bt * h, duration: 0.05, volume: 0.24 }); if (bt % 2 === 1) perc.push({ start: s9 + bt * h + h * 0.5, duration: 0.02, volume: 0.1 }); }

  // === Section 10: Outro/Loop (144-160) - シャットダウン ===
  const s10 = 144 * b;
  const outroMel = [C5, C5, 0, 0, G4, G4, 0, 0, Eb4, 0, 0, 0, C4, 0, G3, 0,
                    C4, 0, 0, 0, G3, 0, 0, 0, C4, 0, 0, 0, C4, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; notes.push({ freq: outroMel[i], start: s10 + i * h, duration: h * 0.4, type: 'square', volume: 0.12 - i * 0.002 }); }
  notes.push({ freq: C3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.07 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.06, volume: 0.1 - bt * 0.01 });

  // === Global sub-bass drone ===
  notes.push({ freq: C3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossMirageTrack(): TrackData {
  // Ch6 boss - 虚空のスフィンクス - 10パート構成 F#m, 120 BPM, 160 beats (echo/ethereal theme)
  const b = BPM_TO_BEAT(120); const h = b / 2;
  const notes: Note[] = []; const perc: PercNote[] = [];

  // Helper: echo note (delayed repeat)
  const echo = (freq: number, start: number, dur: number, vol: number) => {
    notes.push({ freq, start, duration: dur, type: 'triangle', volume: vol });
    notes.push({ freq, start: start + h * 0.35, duration: dur * 0.65, type: 'triangle', volume: vol * 0.38 });
  };

  // === Section 1: Intro (0-16) - 幻惑の序章 (sparse) ===
  const s1 = 0;
  const intro = [Fs4, 0, 0, 0, A4, 0, 0, 0, E4, 0, 0, 0, Fs4, 0, 0, 0,
                 0, 0, A4, 0, 0, 0, B4, 0, 0, 0, A4, 0, 0, 0, Fs4, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; echo(intro[i], s1 + i * h, h * 1.0, 0.12); }
  notes.push({ freq: Fs3 / 2, start: s1, duration: 16 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: G3 / 2, start: s1, duration: 8 * b, type: 'sine', volume: 0.03 });
  // echo perc
  for (let bt = 0; bt < 8; bt++) { perc.push({ start: s1 + bt * 2 * b, duration: 0.04, volume: 0.06 }); perc.push({ start: s1 + bt * 2 * b + 0.1, duration: 0.03, volume: 0.03 }); }

  // === Section 2: Build (16-32) - 幻影出現 ===
  const s2 = 16 * b;
  const buildMel = [Fs4, 0, A4, 0, E4, 0, Fs4, 0, A4, 0, B4, 0, A4, 0, Fs4, 0,
                    Fs4, 0, A4, 0, E4, 0, Fs4, 0, A4, 0, B4, 0, D5, 0, B4, 0];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; echo(buildMel[i], s2 + i * h, h * 0.7, 0.16); }
  const buildCounter = [0, 0, D4, 0, 0, 0, A3, 0, 0, 0, E4, 0, 0, 0, D4, 0,
                        0, 0, D4, 0, 0, 0, A3, 0, 0, 0, Fs4, 0, 0, 0, E4, 0];
  for (let i = 0; i < buildCounter.length; i++) { if (!buildCounter[i]) continue; notes.push({ freq: buildCounter[i], start: s2 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.05 }); }
  const bass2 = [Fs3, Fs3, Fs3, Fs3, D3, D3, D3, D3, A3, A3, A3, A3, Fs3, Fs3, E3, Fs3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.6, type: 'square', volume: 0.06 });
  for (let bt = 0; bt < 8; bt++) { perc.push({ start: s2 + bt * 2 * b, duration: 0.05, volume: 0.1 }); perc.push({ start: s2 + bt * 2 * b + 0.1, duration: 0.03, volume: 0.05 }); }

  // === Section 3: Theme A (32-48) - 現実崩壊 (full Part B) ===
  const s3 = 32 * b;
  const melB = [Fs4, 0, A4, Fs4, 0, E4, Fs4, 0, A4, 0, B4, A4, Fs4, 0, E4, 0,
                Fs4, 0, A4, Fs4, 0, E4, Fs4, 0, A4, 0, B4, D5, B4, 0, A4, 0];
  for (let i = 0; i < melB.length; i++) { if (!melB[i]) continue; echo(melB[i], s3 + i * h, h * 0.6, 0.18); notes.push({ freq: melB[i] / 2, start: s3 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const bass3 = [Fs3, Fs3, D3, D3, A3, A3, Fs3, Fs3, D3, D3, E3, E3, Fs3, Fs3, Fs3, Fs3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.6, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) { perc.push({ start: s3 + bt * b, duration: 0.05, volume: 0.14 }); perc.push({ start: s3 + bt * b + 0.1, duration: 0.03, volume: 0.06 }); }

  // === Section 4: Bridge 1 (48-64) - Theme A up a 4th (Bm) ===
  const s4 = 48 * b;
  const melBr = [B4, 0, D5, B4, 0, A4, B4, 0, D5, 0, E5, D5, B4, 0, A4, 0,
                 B4, 0, D5, B4, 0, A4, B4, 0, D5, 0, E5, Fs5, E5, 0, D5, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; echo(melBr[i], s4 + i * h, h * 0.6, 0.17); }
  const counterBr = [0, 0, Fs4, 0, 0, 0, E4, 0, 0, 0, A4, 0, 0, 0, Fs4, 0,
                     0, 0, Fs4, 0, 0, 0, E4, 0, 0, 0, B4, 0, 0, 0, A4, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.06 }); }
  const bass4 = [B3, B3, B3, B3, Fs3, Fs3, Fs3, Fs3, D3, D3, D3, D3, B3, B3, A3, B3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.6, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) { perc.push({ start: s4 + bt * b, duration: 0.04, volume: 0.12 }); perc.push({ start: s4 + bt * b + 0.1, duration: 0.03, volume: 0.05 }); }

  // === Section 5: Theme B (64-80) - 夢魔の回廊 (full Part C + power) ===
  const s5 = 64 * b;
  const melC = [B4, 0, A4, Fs4, E4, 0, Fs4, A4, B4, 0, Fs4, A4, B4, 0, A4, 0,
                B4, 0, A4, Fs4, E4, 0, A4, B4, D5, 0, B4, A4, Fs4, 0, B4, 0];
  for (let i = 0; i < melC.length; i++) { if (!melC[i]) continue; notes.push({ freq: melC[i], start: s5 + i * h, duration: h * 0.55, type: 'triangle', volume: 0.17 }); }
  const pwrC = [D3, D3, D3, D3, A3, A3, A3, A3, E3, E3, E3, E3, Fs3, Fs3, Fs3, Fs3,
                D3, D3, D3, D3, A3, A3, A3, A3, E3, E3, Fs3, Fs3, D3, D3, Fs3, Fs3];
  for (let i = 0; i < pwrC.length; i++) { notes.push({ freq: pwrC[i], start: s5 + i * h, duration: h * 0.5, type: 'square', volume: 0.08 }); notes.push({ freq: pwrC[i] * 1.5, start: s5 + i * h, duration: h * 0.35, type: 'square', volume: 0.03 }); }
  // Dissonant harmony pad
  notes.push({ freq: Fs3, start: s5, duration: 8 * b, type: 'sine', volume: 0.05 });
  notes.push({ freq: Gs3, start: s5, duration: 8 * b, type: 'sine', volume: 0.03 });
  notes.push({ freq: Fs3, start: s5 + 8 * b, duration: 8 * b, type: 'sine', volume: 0.05 });
  notes.push({ freq: E3, start: s5 + 8 * b, duration: 8 * b, type: 'sine', volume: 0.03 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s5 + bt * h, duration: 0.04, volume: 0.16 });

  // === Section 6: Breakdown (80-96) - 幻影消失 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, Fs4, 0, 0, 0, 0, 0, 0, 0, A4, 0, 0, 0, 0, 0,
                    0, 0, B4, 0, 0, 0, D5, 0, 0, 0, E5, 0, 0, 0, Fs5, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; echo(breakMel[i], s6 + i * h, h * 1.2, 0.12); }
  notes.push({ freq: Fs3 / 2, start: s6, duration: 16 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: G3 / 2, start: s6 + 8 * b, duration: 8 * b, type: 'sine', volume: 0.04 });
  const breakBass = [Fs3, 0, Fs3, 0, Fs3, 0, Fs3, 0, A3, 0, A3, 0, B3, 0, D4, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.7, type: 'square', volume: 0.06 }); }
  for (let bt = 0; bt < 4; bt++) { perc.push({ start: s6 + bt * 4 * b, duration: 0.04, volume: 0.06 }); perc.push({ start: s6 + bt * 4 * b + 0.1, duration: 0.03, volume: 0.03 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.03, volume: 0.06 + bt * 0.012 });

  // === Section 7: Theme C (96-112) - Theme A + B combined ===
  const s7 = 96 * b;
  const melComb = [Fs4, 0, A4, Fs4, 0, E4, Fs4, 0, A4, 0, B4, A4, Fs4, 0, E4, 0,
                   B4, 0, A4, Fs4, E4, 0, Fs4, A4, B4, 0, Fs4, A4, B4, 0, A4, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; echo(melComb[i], s7 + i * h, h * 0.6, 0.18); notes.push({ freq: melComb[i] / 2, start: s7 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const melComb2 = [D4, 0, A3, Fs3, D4, 0, A3, Fs4, E4, 0, A3, D4, Fs3, 0, E4, A3,
                    A3, D4, Fs4, A3, D4, Fs4, E4, A3, D4, Fs4, A3, Fs4, E4, A3, D4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.45, type: 'square', volume: 0.06 }); }
  const bass7 = [Fs3, Fs3, D3, D3, A3, A3, Fs3, Fs3, D3, D3, E3, E3, Fs3, Fs3, Fs3, Fs3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.6, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s7 + bt * h, duration: 0.04, volume: 0.16 });

  // === Section 8: Bridge 2 (112-128) - Part D with echo/delay ===
  const s8 = 112 * b;
  const melD = [Fs4, A4, B4, Fs4, A4, E4, B4, Fs4, A4, B4, Fs4, E4, A4, Fs4, B4, 0,
                Fs4, A4, B4, Fs4, A4, E4, B4, Fs4, A4, B4, D5, B4, A4, Fs4, E4, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; echo(melD[i], s8 + i * h, h * 0.5, 0.17); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.35, type: 'triangle', volume: 0.06 }); }
  // Arpeggio decoration
  const arpBr2 = [Fs4, E4, D4, A3, Fs4, E4, D4, A3, B4, A4, Fs4, E4, B4, A4, Fs4, E4,
                  Fs4, E4, D4, A3, Fs4, E4, D4, A3, B4, A4, Fs4, E4, D5, B4, A4, Fs4];
  for (let i = 0; i < arpBr2.length; i++) notes.push({ freq: arpBr2[i], start: s8 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.04 });
  const bass8 = [Fs3, Fs3, D3, D3, A3, A3, Fs3, Fs3, Fs3, Fs3, D3, D3, E3, E3, Fs3, Fs3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.5, type: 'square', volume: 0.07 });
  for (let bt = 0; bt < 16; bt++) { perc.push({ start: s8 + bt * b, duration: 0.04, volume: 0.14 }); perc.push({ start: s8 + bt * b + 0.1, duration: 0.03, volume: 0.06 }); }

  // === Section 9: Climax (128-144) - 虚実混在 全開 ===
  const s9 = 128 * b;
  const climaxMel = [Fs4, A4, B4, Fs4, A4, E4, B4, Fs4, A4, B4, Fs4, E4, A4, Fs4, B4, Fs4,
                     D5, B4, A4, Fs4, E4, Fs4, A4, B4, D5, B4, A4, Fs4, B4, A4, Fs4, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; echo(climaxMel[i], s9 + i * h, h * 0.5, 0.2); }
  const harmCl = [D4, Fs4, A3, D4, Fs4, A3, E4, D4, Fs4, A3, D4, A3, Fs4, D4, E4, D4,
                  A4, E4, D4, A3, A3, D4, Fs4, E4, A4, E4, D4, A3, E4, D4, A3, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.08 }); }
  const arpCl = [Fs4, E4, D4, A3, Fs4, E4, D4, A3, B4, A4, Fs4, E4, B4, A4, Fs4, E4,
                 Fs4, E4, D4, A3, Fs4, E4, D4, A3, B4, A4, Fs4, E4, D5, B4, A4, Fs4];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.04 });
  const bass9 = [Fs3, Fs3, D3, D3, A3, A3, E3, E3, Fs3, Fs3, D3, D3, A3, Fs3, E3, Fs3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.6, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) { perc.push({ start: s9 + bt * h, duration: 0.04, volume: 0.2 }); if (bt % 2 === 1) perc.push({ start: s9 + bt * h + h * 0.5, duration: 0.02, volume: 0.08 }); }

  // === Section 10: Outro/Loop (144-160) - 幻惑回帰 ===
  const s10 = 144 * b;
  const outroMel = [Fs4, 0, 0, A4, 0, 0, E4, 0, 0, Fs4, 0, 0, A4, 0, Fs4, 0,
                    Fs4, 0, 0, 0, A4, 0, 0, 0, E4, 0, 0, 0, Fs4, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; echo(outroMel[i], s10 + i * h, h * 1.0, 0.12 - i * 0.002); }
  notes.push({ freq: Fs3 / 2, start: s10, duration: 16 * b, type: 'sine', volume: 0.06 });
  notes.push({ freq: G3 / 2, start: s10, duration: 8 * b, type: 'sine', volume: 0.03 });
  for (let bt = 0; bt < 4; bt++) { perc.push({ start: s10 + bt * 4 * b, duration: 0.04, volume: 0.06 - bt * 0.01 }); perc.push({ start: s10 + bt * 4 * b + 0.1, duration: 0.03, volume: 0.03 }); }

  // === Global sub-bass drone ===
  notes.push({ freq: Fs3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });

  return { duration: 160 * b, notes, perc };
}

function makeBossFinalTrack(): TrackData {
  // Ch7 FINAL BOSS - ウロボロス - 10パート構成 Dm, 152 BPM, 160 beats (epic dual melody theme)
  const b = BPM_TO_BEAT(152);
  const h = b / 2;
  const notes: Note[] = [];
  const perc: PercNote[] = [];

  // === Section 1: Intro (0-16) - 不穏なイントロ (sparse Part A) ===
  const s1 = 0;
  const intro = [D4, 0, 0, 0, Eb4, 0, 0, D4, 0, 0, 0, 0, A3, 0, Bb3, 0,
                 D4, 0, 0, 0, F4, 0, 0, Eb4, 0, 0, D4, 0, 0, A3, 0, 0];
  for (let i = 0; i < intro.length; i++) { if (!intro[i]) continue; notes.push({ freq: intro[i], start: s1 + i * h, duration: h * 1.0, type: 'triangle', volume: 0.14 }); }
  notes.push({ freq: D3, start: s1, duration: 16 * b, type: 'sine', volume: 0.08 });
  notes.push({ freq: Eb3, start: s1, duration: 8 * b, type: 'sine', volume: 0.04 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s1 + bt * 2 * b, duration: 0.08, volume: 0.14 });

  // === Section 2: Build (16-32) - 不穏さ増大、Part Aに対旋律 ===
  const s2 = 16 * b;
  const buildMel = [D4, 0, Eb4, D4, 0, A3, Bb3, 0, D4, 0, F4, Eb4, D4, 0, A3, 0,
                    D4, 0, Eb4, D4, 0, A3, Bb3, 0, D4, 0, F4, G4, A4, 0, D4, 0];
  for (let i = 0; i < buildMel.length; i++) { if (!buildMel[i]) continue; notes.push({ freq: buildMel[i], start: s2 + i * h, duration: h * 0.7, type: 'triangle', volume: 0.18 }); }
  const buildCounter = [0, 0, A3, 0, 0, 0, D4, 0, 0, 0, A3, 0, 0, 0, F4, 0,
                        0, 0, A3, 0, 0, 0, D4, 0, 0, 0, Bb3, 0, 0, 0, A4, 0];
  for (let i = 0; i < buildCounter.length; i++) { if (!buildCounter[i]) continue; notes.push({ freq: buildCounter[i], start: s2 + i * h, duration: h * 0.5, type: 'square', volume: 0.07 }); }
  const bass2 = [D3, D3, D3, D3, D3, D3, A3, A3, D3, D3, Bb3, Bb3, A3, A3, D3, D3];
  for (let i = 0; i < bass2.length; i++) notes.push({ freq: bass2[i], start: s2 + i * b, duration: b * 0.7, type: 'square', volume: 0.08 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s2 + bt * b, duration: 0.07, volume: 0.16 });

  // === Section 3: Theme A (32-48) - 主旋律爆発 (full Part B) ===
  const s3 = 32 * b;
  const mainMel = [D5, F5, 0, A4, D5, F5, G5, 0, A4, D5, 0, F5, G5, A4, D5, 0,
                   D5, F5, 0, A4, D5, F5, G5, 0, A4, D5, 0, F5, G5, F5, D5, 0];
  for (let i = 0; i < mainMel.length; i++) { if (!mainMel[i]) continue; notes.push({ freq: mainMel[i], start: s3 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.18 }); notes.push({ freq: mainMel[i] / 2, start: s3 + i * h, duration: h * 0.35, type: 'sawtooth', volume: 0.06 }); }
  const counterB = [A4, 0, D4, F4, A4, 0, Bb4, A4, F4, 0, D4, A4, Bb4, 0, A4, 0,
                    A4, 0, D4, F4, A4, 0, Bb4, A4, F4, 0, D4, A4, Bb4, A4, F4, 0];
  for (let i = 0; i < counterB.length; i++) { if (!counterB[i]) continue; notes.push({ freq: counterB[i], start: s3 + i * h, duration: h * 0.4, type: 'square', volume: 0.09 }); }
  const bass3 = [D3, D3, Bb3, Bb3, A3, A3, D3, D3, D3, D3, Bb3, Bb3, A3, A3, D3, D3];
  for (let i = 0; i < bass3.length; i++) notes.push({ freq: bass3[i], start: s3 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 16; bt++) perc.push({ start: s3 + bt * h, duration: bt % 2 === 0 ? 0.07 : 0.03, volume: bt % 2 === 0 ? 0.22 : 0.12 });

  // === Section 4: Bridge 1 (48-64) - Theme A up a 5th (Am) ===
  const s4 = 48 * b;
  const melBr = [A4, C5, 0, E4, A4, C5, D5, 0, E4, A4, 0, C5, D5, E4, A4, 0,
                 A4, C5, 0, E4, A4, C5, D5, 0, E4, A4, 0, C5, D5, C5, A4, 0];
  for (let i = 0; i < melBr.length; i++) { if (!melBr[i]) continue; notes.push({ freq: melBr[i], start: s4 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.17 }); notes.push({ freq: melBr[i] / 2, start: s4 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.05 }); }
  const counterBr = [E4, 0, A3, C4, E4, 0, F4, E4, C4, 0, A3, E4, F4, 0, E4, 0,
                     E4, 0, A3, C4, E4, 0, F4, E4, C4, 0, A3, E4, F4, E4, C4, 0];
  for (let i = 0; i < counterBr.length; i++) { if (!counterBr[i]) continue; notes.push({ freq: counterBr[i], start: s4 + i * h, duration: h * 0.35, type: 'square', volume: 0.08 }); }
  const bass4 = [A3, A3, F3, F3, E3, E3, A3, A3, A3, A3, F3, F3, E3, E3, A3, A3];
  for (let i = 0; i < bass4.length; i++) notes.push({ freq: bass4[i], start: s4 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s4 + bt * h, duration: bt % 4 === 0 ? 0.07 : 0.03, volume: bt % 4 === 0 ? 0.2 : 0.1 });

  // === Section 5: Theme B (64-80) - 重厚な展開 (full Part C + power) ===
  const s5 = 64 * b;
  const heavyMel = [Bb4, 0, A4, G4, F4, 0, G4, A4, Bb4, 0, C5, Bb4, A4, 0, G4, 0,
                    Bb4, 0, A4, G4, F4, 0, A4, Bb4, C5, 0, Bb4, A4, G4, 0, A4, 0];
  for (let i = 0; i < heavyMel.length; i++) { if (!heavyMel[i]) continue; notes.push({ freq: heavyMel[i], start: s5 + i * h, duration: h * 0.5, type: 'sawtooth', volume: 0.16 }); }
  const powerBass = [Bb3, Bb3, Bb3, Bb3, A3, A3, G3, G3, F3, F3, G3, G3, A3, A3, A3, A3,
                     Bb3, Bb3, Bb3, Bb3, A3, A3, G3, G3, F3, F3, A3, A3, G3, G3, A3, A3];
  for (let i = 0; i < powerBass.length; i++) { notes.push({ freq: powerBass[i], start: s5 + i * h, duration: h * 0.6, type: 'square', volume: 0.1 }); notes.push({ freq: powerBass[i] * 1.5, start: s5 + i * h, duration: h * 0.4, type: 'square', volume: 0.04 }); }
  const cRhythm5 = [0, 3, 6, 8, 11, 14, 16, 19, 22, 24, 27, 30];
  for (const r of cRhythm5) perc.push({ start: s5 + r * h, duration: 0.06, volume: 0.2 });

  // === Section 6: Breakdown (80-96) - 低音のうねり再来 ===
  const s6 = 80 * b;
  const breakMel = [0, 0, D4, 0, 0, 0, 0, 0, 0, 0, F4, 0, 0, 0, 0, 0,
                    0, 0, A4, 0, 0, 0, Bb4, 0, 0, 0, C5, 0, 0, 0, D5, 0];
  for (let i = 0; i < breakMel.length; i++) { if (!breakMel[i]) continue; notes.push({ freq: breakMel[i], start: s6 + i * h, duration: h * 0.9, type: 'triangle', volume: 0.14 }); }
  notes.push({ freq: D3, start: s6, duration: 16 * b, type: 'sine', volume: 0.08 });
  notes.push({ freq: Eb3, start: s6 + 8 * b, duration: 8 * b, type: 'sine', volume: 0.05 });
  const breakBass = [D3, 0, D3, 0, D3, 0, D3, 0, E3, 0, E3, 0, F3, 0, G3, 0];
  for (let i = 0; i < breakBass.length; i++) { if (!breakBass[i]) continue; notes.push({ freq: breakBass[i], start: s6 + i * b, duration: b * 0.8, type: 'square', volume: 0.08 }); }
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + bt * 2 * b, duration: 0.08, volume: 0.12 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s6 + 12 * b + bt * h, duration: 0.05, volume: 0.1 + bt * 0.02 });

  // === Section 7: Theme C (96-112) - Theme A + B combined, densest ===
  const s7 = 96 * b;
  const melComb = [D5, F5, 0, A4, D5, F5, G5, 0, A4, D5, 0, F5, G5, A4, D5, 0,
                   Bb4, 0, A4, G4, F4, 0, G4, A4, Bb4, 0, C5, Bb4, A4, 0, G4, 0];
  for (let i = 0; i < melComb.length; i++) { if (!melComb[i]) continue; notes.push({ freq: melComb[i], start: s7 + i * h, duration: h * 0.45, type: 'sawtooth', volume: 0.18 }); notes.push({ freq: melComb[i] / 2, start: s7 + i * h, duration: h * 0.35, type: 'sawtooth', volume: 0.06 }); }
  const melComb2 = [A4, 0, D4, F4, A4, 0, Bb4, A4, F4, 0, D4, A4, Bb4, 0, A4, 0,
                    D4, F4, A4, D4, F4, A4, Bb3, D4, F4, A4, D4, A4, Bb3, D4, F4, 0];
  for (let i = 0; i < melComb2.length; i++) { if (!melComb2[i]) continue; notes.push({ freq: melComb2[i], start: s7 + i * h, duration: h * 0.35, type: 'square', volume: 0.08 }); }
  const bass7 = [D3, D3, Bb3, Bb3, A3, A3, D3, D3, Bb3, Bb3, A3, A3, G3, G3, A3, A3];
  for (let i = 0; i < bass7.length; i++) notes.push({ freq: bass7[i], start: s7 + i * b, duration: b * 0.7, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s7 + bt * h, duration: bt % 2 === 0 ? 0.07 : 0.03, volume: bt % 2 === 0 ? 0.22 : 0.12 });

  // === Section 8: Bridge 2 (112-128) - Part D melody with echo/delay ===
  const s8 = 112 * b;
  const melD = [D5, F5, G5, A4, D5, F5, G5, F5, D5, F5, A4, G5, F5, D5, G5, 0,
                D5, F5, G5, A4, D5, F5, G5, F5, D5, F5, A4, G5, F5, D5, A4, 0];
  for (let i = 0; i < melD.length; i++) { if (!melD[i]) continue; notes.push({ freq: melD[i], start: s8 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.17 }); notes.push({ freq: melD[i], start: s8 + i * h + b, duration: h * 0.3, type: 'sawtooth', volume: 0.06 }); }
  const harmBr2 = [F5, A4, Bb4, D5, F5, A4, Bb4, A4, F5, A4, D5, Bb4, A4, F5, Bb4, 0,
                   F5, A4, Bb4, D5, F5, A4, Bb4, A4, F5, A4, D5, Bb4, A4, F5, D5, 0];
  for (let i = 0; i < harmBr2.length; i++) { if (!harmBr2[i]) continue; notes.push({ freq: harmBr2[i], start: s8 + i * h, duration: h * 0.35, type: 'triangle', volume: 0.08 }); }
  const bass8 = [D3, D3, D3, D3, Bb3, A3, G3, D3, D3, D3, Bb3, Bb3, A3, A3, D3, D3];
  for (let i = 0; i < bass8.length; i++) notes.push({ freq: bass8[i], start: s8 + i * b, duration: b * 0.6, type: 'square', volume: 0.09 });
  for (let bt = 0; bt < 32; bt++) perc.push({ start: s8 + bt * h, duration: 0.05, volume: bt % 4 === 0 ? 0.2 : 0.1 });

  // === Section 9: Climax (128-144) - 全パート全開 ===
  const s9 = 128 * b;
  const climaxMel = [D5, F5, G5, A4, D5, F5, G5, F5, D5, F5, A4, G5, F5, D5, G5, D5,
                     G5, F5, D5, A4, G5, F5, D5, F5, G5, F5, D5, G5, A4, D5, F5, 0];
  for (let i = 0; i < climaxMel.length; i++) { if (!climaxMel[i]) continue; notes.push({ freq: climaxMel[i], start: s9 + i * h, duration: h * 0.4, type: 'sawtooth', volume: 0.2 }); notes.push({ freq: climaxMel[i] / 2, start: s9 + i * h, duration: h * 0.3, type: 'sawtooth', volume: 0.07 }); }
  // Harmony (3rds)
  const harmCl = [F5, A4, Bb4, D5, F5, A4, Bb4, A4, F5, A4, D5, Bb4, A4, F5, Bb4, F5,
                  Bb4, A4, F5, D5, Bb4, A4, F5, A4, Bb4, A4, F5, Bb4, D5, F5, A4, 0];
  for (let i = 0; i < harmCl.length; i++) { if (!harmCl[i]) continue; notes.push({ freq: harmCl[i], start: s9 + i * h, duration: h * 0.35, type: 'triangle', volume: 0.1 }); }
  // Fast arpeggios
  const arpCl = [D5, A4, F4, D4, A4, F4, D4, A3, D5, A4, F4, D4, A4, F4, D4, A3,
                 D5, A4, F4, D4, A4, F4, D4, A3, D5, A4, F4, D4, A4, F4, D4, A3];
  for (let i = 0; i < arpCl.length; i++) notes.push({ freq: arpCl[i], start: s9 + i * h, duration: h * 0.2, type: 'triangle', volume: 0.05 });
  const bass9 = [D3, D3, Bb3, Bb3, A3, A3, D3, D3, D3, D3, Bb3, Bb3, A3, G3, D3, D3];
  for (let i = 0; i < bass9.length; i++) notes.push({ freq: bass9[i], start: s9 + i * b, duration: b * 0.7, type: 'square', volume: 0.1 });
  // Full throttle 16th percussion
  for (let bt = 0; bt < 32; bt++) { perc.push({ start: s9 + bt * h, duration: 0.05, volume: 0.24 }); if (bt % 2 === 1) perc.push({ start: s9 + bt * h + h * 0.5, duration: 0.02, volume: 0.1 }); }

  // === Section 10: Outro/Loop (144-160) - 不穏回帰 ===
  const s10 = 144 * b;
  const outroMel = [D5, 0, 0, F4, 0, 0, Eb4, 0, 0, D4, 0, 0, A3, 0, Bb3, 0,
                    D4, 0, 0, 0, Eb4, 0, 0, 0, D4, 0, 0, 0, A3, 0, 0, 0];
  for (let i = 0; i < outroMel.length; i++) { if (!outroMel[i]) continue; notes.push({ freq: outroMel[i], start: s10 + i * h, duration: h * 1.0, type: 'triangle', volume: 0.14 - i * 0.003 }); }
  notes.push({ freq: D3, start: s10, duration: 16 * b, type: 'sine', volume: 0.08 });
  notes.push({ freq: Eb3, start: s10, duration: 8 * b, type: 'sine', volume: 0.04 });
  const bass10 = [D3, D3, D3, D3, A3, A3, A3, A3, D3, D3, D3, D3, D3, D3, D3, D3];
  for (let i = 0; i < bass10.length; i++) notes.push({ freq: bass10[i], start: s10 + i * b, duration: b * 0.5, type: 'square', volume: 0.07 - i * 0.003 });
  for (let bt = 0; bt < 8; bt++) perc.push({ start: s10 + bt * 2 * b, duration: 0.08, volume: 0.12 - bt * 0.012 });

  // === Global drones ===
  notes.push({ freq: D3 / 4, start: 0, duration: 160 * b, type: 'sine', volume: 0.05 });
  notes.push({ freq: D3 / 2, start: 0, duration: 80 * b, type: 'sine', volume: 0.07 });
  notes.push({ freq: A3 / 2, start: 80 * b, duration: 80 * b, type: 'sine', volume: 0.07 });

  return { duration: 160 * b, notes, perc };
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
