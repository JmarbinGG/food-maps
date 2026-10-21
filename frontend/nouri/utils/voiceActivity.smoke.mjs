/**
 * Smoke checks for the voice orb's voice activity detector.
 * Run: node frontend/nouri/utils/voiceActivity.smoke.mjs
 */
import { createVoiceActivityDetector } from './voiceActivity.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const FRAME_MS = 16;
const dbfs = (db) => 10 ** (db / 20);

// Seeded noise so runs are repeatable.
let seed = 7;
function jitter(level, spread = 0.15) {
  seed = (seed * 16807) % 2147483647;
  return level * (1 + spread * ((seed / 2147483647) * 2 - 1));
}

/** Simulate segments of [ms, rmsLevel]; returns { stopAt, reason } or null. */
function run(segments, options) {
  const vad = createVoiceActivityDetector(options);
  let t = 0;
  for (const [ms, level] of segments) {
    for (let end = t + ms; t < end; t += FRAME_MS) {
      const r = vad.update(jitter(level), t);
      if (r.stop) return { stopAt: t, reason: r.reason };
    }
  }
  return null;
}

const SPEECH = dbfs(-20);

// Room noise levels a real mic produces. The old fixed threshold never saw
// silence over these and ran every turn to the 30s cap.
for (const roomDb of [-70, -50, -40, -35]) {
  const room = dbfs(roomDb);
  const r = run([[1000, room], [3000, SPEECH], [30000, room]]);
  assert(r && r.reason === 'silence', `room ${roomDb} dBFS: expected silence stop, got ${JSON.stringify(r)}`);
  assert(r.stopAt < 1000 + 3000 + 2500, `room ${roomDb} dBFS: stopped too late at ${r.stopAt}ms`);
  assert(r.stopAt > 1000 + 3000, `room ${roomDb} dBFS: stopped before speech ended (${r.stopAt}ms)`);
}

// Mics often deliver a few all-zero frames while starting up (seen in
// mobile Chromium). They must not become the noise floor, or every room
// noise frame afterwards looks like speech and the turn runs to the cap.
for (const roomDb of [-50, -40]) {
  const room = dbfs(roomDb);
  const r = run([[50, 0], [1000, room], [3000, SPEECH], [30000, room]]);
  assert(r && r.reason === 'silence' && r.stopAt < 50 + 1000 + 3000 + 2500,
    `leading digital silence, room ${roomDb} dBFS: ${JSON.stringify(r)}`);
}

// Pauses between words shorter than the silence window keep recording.
{
  const room = dbfs(-45);
  const r = run([[500, room], [1500, SPEECH], [900, room], [1500, SPEECH], [8000, room]]);
  assert(r && r.reason === 'silence' && r.stopAt > 500 + 1500 + 900 + 1500,
    `mid-sentence pause ended the turn early: ${JSON.stringify(r)}`);
}

// Talking from the very first frame still works (floor learns from pauses).
{
  const room = dbfs(-45);
  const r = run([[2500, SPEECH], [200, room], [2000, SPEECH], [8000, room]]);
  assert(r && r.reason === 'silence' && r.stopAt > 4700, `immediate speech: ${JSON.stringify(r)}`);
}

// Nobody speaks: give up after the no-speech window, not the 30s cap.
{
  const r = run([[20000, dbfs(-40)]]);
  assert(r && r.reason === 'no_speech' && r.stopAt < 10000, `no speech: ${JSON.stringify(r)}`);
}

// A single click/bump is not speech.
{
  const room = dbfs(-50);
  const r = run([[1000, room], [80, SPEECH], [20000, room]]);
  assert(r && r.reason === 'no_speech', `click counted as speech: ${JSON.stringify(r)}`);
}

// Someone who never stops talking (short dips between words) hits the cap.
{
  const room = dbfs(-45);
  const talk = [[500, room]];
  for (let i = 0; i < 40; i += 1) talk.push([900, SPEECH], [150, room]);
  const r = run(talk);
  assert(r && r.reason === 'max', `max cap: ${JSON.stringify(r)}`);
}

// A steady loud sound with no gaps (vacuum, running tap) is not speech.
{
  const r = run([[20000, SPEECH]]);
  assert(r && r.reason === 'no_speech', `steady noise: ${JSON.stringify(r)}`);
}

console.log('voiceActivity smoke OK');
