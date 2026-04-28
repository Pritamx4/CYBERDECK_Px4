/**
 * Audio Module - Sound System & Web Audio API
 * Generates retro-style sounds for UI interactions and effects
 */

let audioContext;
let soundEnabled = APP_CONFIG.AUDIO.ENABLED_DEFAULT;

/**
 * Initialize Web Audio API context
 */
function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

/**
 * Create and play a sound with given frequency, type, duration, and gain
 * @param {number} freq - Frequency in Hz
 * @param {string} type - Oscillator type ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} duration - Duration in seconds
 * @param {number} gain - Volume gain (0-1)
 */
function createSound(freq, type, duration, gain) {
  if (!soundEnabled) return;
  initAudio();
  const osc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + duration);
}

/**
 * Play keyboard typing sound
 */
function playTypingSound() {
  const s = APP_CONFIG.AUDIO.SOUNDS.TYPING;
  createSound(s.freq, s.type, s.duration, s.gain);
}

/**
 * Play hover/interaction sound
 */
function playHoverSound() {
  const s = APP_CONFIG.AUDIO.SOUNDS.HOVER;
  createSound(s.freq, s.type, s.duration, s.gain);
}

/**
 * Play data glitch sound effect (3-tone composition)
 */
function playDataGlitch() {
  const s1 = APP_CONFIG.AUDIO.SOUNDS.GLITCH_1;
  const s2 = APP_CONFIG.AUDIO.SOUNDS.GLITCH_2;
  const s3 = APP_CONFIG.AUDIO.SOUNDS.GLITCH_3;

  createSound(s1.freq, s1.type, s1.duration, s1.gain);
  setTimeout(() => createSound(s2.freq, s2.type, s2.duration, s2.gain), s2.delay);
  setTimeout(() => createSound(s3.freq, s3.type, s3.duration, s3.gain), s3.delay);
}

/**
 * Toggle sound on/off with keyboard shortcut (M key)
 */
function initAudioToggle() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      soundEnabled = !soundEnabled;
      showToast(soundEnabled ? 'Sound ON' : 'Sound OFF', 'info');
    }
  });
}

window.initAudio = initAudio;
window.createSound = createSound;
window.playTypingSound = playTypingSound;
window.playHoverSound = playHoverSound;
window.playDataGlitch = playDataGlitch;
window.initAudioToggle = initAudioToggle;
