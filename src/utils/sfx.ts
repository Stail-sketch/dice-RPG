/**
 * SFX Engine - Procedural 8-bit sound effects using Web Audio API
 * No audio files needed. All sounds are synthesized on-the-fly.
 */
class SFXEngine {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private osc(
    type: OscillatorType,
    freq: number,
    freqEnd: number,
    duration: number,
    vol: number,
    delay = 0,
    volEnd = 0.001,
  ) {
    const ctx = this.getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), t + duration);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(volEnd, t + duration);
    o.start(t);
    o.stop(t + duration);
  }

  /** Noise burst helper using a buffer of random samples */
  private noise(duration: number, vol: number, delay = 0) {
    const ctx = this.getCtx();
    const len = ctx.sampleRate * duration;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    src.connect(g);
    g.connect(ctx.destination);
    const t = ctx.currentTime + delay;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    src.start(t);
    src.stop(t + duration);
  }

  /** Dice roll: rapid clicking noise transitioning to a thud */
  diceRoll() {
    // Rapid clicks
    for (let i = 0; i < 6; i++) {
      this.osc('square', 600 - i * 50, 200, 0.04, 0.08, i * 0.06);
    }
    // Rolling noise
    this.noise(0.35, 0.06);
  }

  /** Dice land: satisfying thump */
  diceLand() {
    this.osc('sine', 250, 60, 0.15, 0.25);
    this.osc('square', 180, 40, 0.08, 0.08);
    this.noise(0.08, 0.1);
  }

  /** Attack hit: sharp impact, pitch varies by element */
  hit(element?: string) {
    const freqs: Record<string, number> = {
      blaze: 200,
      frost: 400,
      volt: 500,
      venom: 150,
      alloy: 120,
      mirage: 350,
    };
    const freq = element ? (freqs[element] ?? 300) : 300;
    this.osc('sawtooth', freq, 60, 0.15, 0.2);
    this.osc('square', freq * 1.5, 80, 0.1, 0.1, 0.02);
    this.noise(0.06, 0.12);
  }

  /** Critical / big hit: deeper, longer impact with rumble */
  bigHit() {
    this.osc('sawtooth', 300, 40, 0.3, 0.3);
    this.osc('square', 200, 30, 0.25, 0.15, 0.02);
    this.osc('sine', 80, 30, 0.4, 0.2, 0.05);
    this.noise(0.15, 0.18);
  }

  /** Heal: ascending chime */
  heal() {
    this.osc('sine', 400, 800, 0.15, 0.15);
    this.osc('sine', 600, 1000, 0.15, 0.12, 0.08);
    this.osc('triangle', 800, 1200, 0.2, 0.1, 0.16);
  }

  /** Buff: short ascending tone */
  buff() {
    this.osc('triangle', 300, 600, 0.12, 0.12);
    this.osc('square', 450, 800, 0.1, 0.06, 0.06);
  }

  /** Debuff: short descending tone */
  debuff() {
    this.osc('triangle', 500, 200, 0.15, 0.12);
    this.osc('square', 400, 150, 0.12, 0.06, 0.04);
  }

  /** Charge up: rising tone */
  chargeUp() {
    this.osc('triangle', 200, 500, 0.2, 0.1);
    this.osc('sine', 250, 600, 0.18, 0.06, 0.05);
  }

  /** Charge MAX: dramatic fanfare hit */
  chargeMax() {
    this.osc('square', 300, 600, 0.1, 0.15);
    this.osc('square', 500, 900, 0.15, 0.15, 0.08);
    this.osc('triangle', 700, 1100, 0.2, 0.12, 0.16);
    this.osc('sine', 900, 1200, 0.25, 0.1, 0.24);
  }

  /** Victory fanfare: short triumphant jingle */
  victory() {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      this.osc('square', f, f, 0.15, 0.12, i * 0.12);
      this.osc('triangle', f, f * 1.01, 0.15, 0.06, i * 0.12);
    });
    // final long note
    this.osc('triangle', 1047, 1047, 0.4, 0.1, 0.48);
  }

  /** Defeat: sad descending tones */
  defeat() {
    const notes = [400, 350, 300, 200];
    notes.forEach((f, i) => {
      this.osc('triangle', f, f * 0.9, 0.25, 0.1, i * 0.2);
    });
    this.osc('sine', 150, 80, 0.5, 0.08, 0.8);
  }

  /** Button click: short click */
  click() {
    this.osc('square', 800, 600, 0.04, 0.08);
  }

  /** Select / toggle: soft blip */
  select() {
    this.osc('triangle', 600, 900, 0.06, 0.08);
  }

  /** Gacha: 召喚開始の荘厳なチャイム */
  gachaStart() {
    this.osc('sine', 300, 300, 0.3, 0.1);
    this.osc('sine', 400, 400, 0.3, 0.08, 0.15);
    this.osc('sine', 500, 500, 0.4, 0.06, 0.3);
    this.noise(0.3, 0.03, 0.1);
  }

  /** Gacha: ダイス回転のカラカラ音 */
  gachaSpin() {
    for (let i = 0; i < 8; i++) {
      this.osc('square', 400 + i * 30, 300 + i * 20, 0.03, 0.06, i * 0.05);
    }
    this.noise(0.4, 0.04);
  }

  /** Gacha: 昇格時の「ジャキーン！」 */
  gachaUpgrade() {
    this.osc('sawtooth', 400, 1200, 0.2, 0.2);
    this.osc('square', 600, 1400, 0.15, 0.15, 0.05);
    this.osc('triangle', 800, 1600, 0.15, 0.1, 0.1);
    this.noise(0.1, 0.15);
  }

  /** Gacha: Epic確定の重い昇格音 */
  gachaEpic() {
    this.osc('sawtooth', 200, 800, 0.3, 0.25);
    this.osc('square', 400, 1200, 0.25, 0.2, 0.05);
    this.osc('triangle', 600, 1400, 0.2, 0.15, 0.1);
    this.osc('sine', 800, 1600, 0.2, 0.1, 0.15);
    this.noise(0.15, 0.2);
  }

  /** Gacha: Legendary確定の超派手ファンファーレ */
  gachaLegendary() {
    // 低音ドーン
    this.osc('sine', 80, 40, 0.5, 0.3);
    this.osc('sawtooth', 150, 600, 0.3, 0.2, 0.05);
    // 上昇音
    this.osc('square', 300, 1200, 0.3, 0.2, 0.1);
    this.osc('triangle', 500, 1500, 0.25, 0.15, 0.15);
    this.osc('sine', 700, 1800, 0.3, 0.12, 0.2);
    // キラキラ
    this.osc('triangle', 1000, 2000, 0.15, 0.08, 0.3);
    this.osc('triangle', 1200, 2200, 0.15, 0.06, 0.35);
    this.osc('triangle', 1500, 2500, 0.15, 0.05, 0.4);
    // ノイズバースト
    this.noise(0.2, 0.2, 0.1);
  }

  /** Gacha: バースト時のドーン！ */
  gachaBurst() {
    this.osc('sine', 150, 40, 0.3, 0.3);
    this.osc('sawtooth', 300, 80, 0.2, 0.2);
    this.noise(0.15, 0.25);
    // 余韻キラキラ
    this.osc('triangle', 800, 1200, 0.2, 0.06, 0.15);
    this.osc('triangle', 1000, 1500, 0.2, 0.05, 0.2);
  }

  /** Gacha: 結果表示のジャラーン */
  gachaReveal() {
    const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
    notes.forEach((f, i) => {
      this.osc('triangle', f, f, 0.12, 0.1, i * 0.06);
    });
    this.osc('sine', 1319, 1319, 0.4, 0.06, 0.3);
  }

  /** Shield: metallic ring for shield activation */
  shield() {
    this.osc('triangle', 1200, 800, 0.15, 0.12);
    this.osc('square', 1500, 1000, 0.12, 0.08, 0.02);
    this.osc('sine', 900, 600, 0.2, 0.06, 0.05);
  }

  /** Counter: sharp ping for counter activation */
  counter() {
    this.osc('square', 1400, 1800, 0.08, 0.15);
    this.osc('triangle', 1800, 2200, 0.06, 0.08, 0.03);
    this.noise(0.04, 0.08);
  }

  /** DoT: sizzle sound for poison/burn tick */
  dot() {
    this.noise(0.15, 0.08);
    this.osc('sawtooth', 200, 100, 0.12, 0.06, 0.02);
    this.osc('square', 150, 80, 0.1, 0.04, 0.06);
  }

  /** Level up: short ascending celebratory fanfare (4 notes) */
  levelUp() {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      this.osc('square', f, f, 0.12, 0.14, i * 0.1);
      this.osc('triangle', f * 2, f * 2, 0.12, 0.05, i * 0.1);
    });
    // sustain final note
    this.osc('triangle', 1047, 1047, 0.35, 0.08, 0.4);
    this.osc('sine', 1047, 1047, 0.35, 0.06, 0.4);
  }

  /** Capture: dramatic whoosh + slam for capture scene */
  capture() {
    // whoosh rising
    this.osc('sawtooth', 150, 800, 0.25, 0.15);
    this.noise(0.25, 0.1);
    // slam impact
    this.osc('sine', 120, 40, 0.3, 0.25, 0.25);
    this.osc('square', 200, 60, 0.15, 0.15, 0.25);
    this.noise(0.1, 0.2, 0.25);
  }

  /** Synergy: dramatic whoosh with sparkle */
  synergy() {
    this.osc('sawtooth', 200, 800, 0.3, 0.12);
    this.osc('sine', 600, 1200, 0.25, 0.08, 0.1);
    this.noise(0.2, 0.06, 0.05);
    // sparkle
    this.osc('triangle', 1000, 1500, 0.1, 0.06, 0.2);
    this.osc('triangle', 1200, 1800, 0.1, 0.05, 0.25);
  }
}

export const sfx = new SFXEngine();
