/**
 * Voice activity detection for the Nouri voice orb.
 *
 * The old check compared the average frequency-bin level against a fixed
 * threshold. A real microphone's room noise (fan, laptop hum, auto gain)
 * sits above any fixed number, so "silence" was never seen and every turn
 * ran to the 30s cap before Nouri answered. This tracks the room's noise
 * floor instead and decides speech/silence relative to it.
 *
 * Pure logic, no Web Audio: feed it one RMS level per animation frame.
 */

const DEFAULTS = {
  speechRatio: 3.0,      // level above floor * this = speech
  silenceRatio: 1.8,     // after speech, level below floor * this = silence
  minSpeechRms: 0.008,   // ignore "speech" quieter than ~-42 dBFS
  silenceMs: 1500,       // trailing silence that ends the turn
  minSpeechMs: 250,      // speech must last this long to count (clicks, bumps)
  noSpeechMs: 9000,      // give up if the user never starts talking
  maxMs: 30000,          // hard cap on one recording
  floorRise: 0.02,       // floor creeps up this fraction per frame in silence
};

/** RMS (0..1) of a Float32 time-domain buffer from AnalyserNode. */
export function rmsOf(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / (samples.length || 1));
}

export function createVoiceActivityDetector(options = {}) {
  const o = { ...DEFAULTS, ...options };
  let start = null;
  let floor = null;
  let speechSince = 0;
  let speechDetected = false;
  let silenceSince = 0;

  return {
    get speechDetected() { return speechDetected; },
    get noiseFloor() { return floor; },

    /**
     * @param {number} rms current RMS level (0..1)
     * @param {number} now ms timestamp
     * @returns {{ stop: false } | { stop: true, reason: 'silence'|'no_speech'|'max' }}
     */
    update(rms, now) {
      if (start === null) start = now;
      const elapsed = now - start;
      if (elapsed > o.maxMs) return { stop: true, reason: 'max' };

      // Floor follows quiet levels down immediately and drifts up slowly,
      // so a word spoken right at the start doesn't become the "floor".
      if (floor === null || rms < floor) floor = rms;
      else if (rms < floor * o.speechRatio) floor += (rms - floor) * o.floorRise;
      const base = Math.max(floor, 1e-4);

      const loud = rms > base * o.speechRatio && rms > o.minSpeechRms;
      if (loud) {
        if (!speechSince) speechSince = now;
        if (now - speechSince >= o.minSpeechMs) speechDetected = true;
        silenceSince = 0;
      } else {
        speechSince = 0;
        if (speechDetected && rms < Math.max(base * o.silenceRatio, o.minSpeechRms)) {
          if (!silenceSince) silenceSince = now;
          if (now - silenceSince >= o.silenceMs) return { stop: true, reason: 'silence' };
        } else if (speechDetected) {
          // In-between level (trailing breath, soft syllable): not silence yet.
          silenceSince = 0;
        }
      }

      if (!speechDetected && elapsed > o.noSpeechMs) return { stop: true, reason: 'no_speech' };
      return { stop: false };
    },
  };
}
