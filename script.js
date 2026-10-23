const sarcasticAnswers = [
  "That question's giving 'first draft.' Try again.",
  "The magic ball has muted you for the next 24 hours.",
  "Your future is bright, unlike your current decision-making skills.",
  "The universe whispered an answer, but it was mostly laughing.",
  "My sources say no, and honestly, so does common sense.",
  "Yes! (Just kidding, absolutely not).",
  "Delulu is not the solulu for this one bestie.",
  "The stars said touch grass.",
  "The cosmos gave you a major side-eye.",
  "You need a software update and a walk outside.",
  "The universe left you on read for a reason.",
  "That question was straight-up cringe.",
  "That's gonna be a no from me dawg."
];

const DEFAULT_TEXT = 'Ask and you shall receive';
const magicBall = document.getElementById('magicBall');
const questionInput = document.getElementById('questionInput');
const starRain = document.getElementById('starRain');
const wandCursor = document.getElementById('wandCursor');

let isThinking = false;
let answerTimeoutId = null;
let usedAnswers = [];
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lastSoundTime = 0;
let sparklingAudioContext = null;
let sparkleReverbBuffer = null;
let wandTrailStopId = null;
let lastDisplayedAnswer = '';
let isAnswerVisible = false;

function stopThinkingState() {
  if (answerTimeoutId) {
    clearTimeout(answerTimeoutId);
    answerTimeoutId = null;
  }

  isThinking = false;
  clearStarRain();
  magicBall.classList.remove('thinking');
  lastDisplayedAnswer = '';
  isAnswerVisible = false;
}

function setAnswerInInput(answer) {
  lastDisplayedAnswer = answer;
  isAnswerVisible = true;
  questionInput.value = answer;
}

function clearPreviousAnswerForTyping() {
  if (isThinking || !isAnswerVisible || questionInput.value === DEFAULT_TEXT) {
    return;
  }

  questionInput.value = '';
  lastDisplayedAnswer = '';
  isAnswerVisible = false;
}

function getRandomUnusedAnswer() {
  const available = sarcasticAnswers.filter((answer) => !usedAnswers.includes(answer));
  const pool = available.length ? available : [...sarcasticAnswers];
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  usedAnswers.push(chosen);
  if (usedAnswers.length > sarcasticAnswers.length) {
    usedAnswers = [chosen];
  }

  return chosen;
}

function createSparkleTrail() {
  const spark = document.createElement('span');
  spark.className = 'star-trail';
  const tipOffsetX = 52;
  const tipOffsetY = 38;
  spark.style.left = `${pointer.x + tipOffsetX}px`;
  spark.style.top = `${pointer.y + tipOffsetY}px`;
  spark.style.width = `${(Math.random() * 8 + 8).toFixed(0)}px`;
  spark.style.height = spark.style.width;
  document.body.appendChild(spark);

  setTimeout(() => spark.remove(), 650);
}

function triggerStarRain() {
  starRain.innerHTML = '';

  const starCount = 240;
  for (let i = 0; i < starCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'star-piece';
    piece.style.setProperty('--x', `${(Math.random() * 100).toFixed(2)}vw`);
    piece.style.setProperty('--w', `${(Math.random() * 16 + 8).toFixed(0)}px`);
    piece.style.setProperty('--h', `${(Math.random() * 16 + 8).toFixed(0)}px`);
    piece.style.setProperty('--rot', `${(Math.random() * 360).toFixed(0)}deg`);
    piece.style.setProperty('--drift', `${(Math.random() * 170 - 85).toFixed(0)}px`);
    piece.style.setProperty('--dur', `${(1.4 + Math.random() * 1.8).toFixed(2)}s`);
    starRain.appendChild(piece);
  }
}

function clearStarRain() {
  starRain.innerHTML = '';
}

function createBurstFromBall({ type = 'reveal' } = {}) {
  const ballRect = magicBall.getBoundingClientRect();
  const centerX = ballRect.left + ballRect.width / 2;
  const centerY = ballRect.top + ballRect.height / 2;
  const totalStars = type === 'click' ? 52 : 140;
  const spread = type === 'click' ? 120 : 350;

  for (let i = 0; i < totalStars; i += 1) {
    const burst = document.createElement('span');
    burst.className = 'star-trail';
    burst.style.left = `${centerX}px`;
    burst.style.top = `${centerY}px`;
    const size = (Math.random() * (type === 'click' ? 8 : 12) + (type === 'click' ? 6 : 8)).toFixed(0);
    burst.style.width = `${size}px`;
    burst.style.height = `${size}px`;
    burst.style.background = [
      'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 28%, rgba(255, 212, 160, 0.7) 45%, rgba(255, 160, 220, 0.25) 65%, transparent 100%)',
      'radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(236, 196, 255, 0.9) 32%, rgba(255, 182, 225, 0.4) 66%, transparent 100%)',
      'radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(255, 235, 180, 0.85) 32%, rgba(255, 164, 120, 0.18) 70%, transparent 100%)'
    ][i % 3];
    document.body.appendChild(burst);

    const angle = (Math.PI * 2 * i) / totalStars;
    const dx = Math.cos(angle) * (spread + Math.random() * spread * 0.7);
    const dy = Math.sin(angle) * (spread + Math.random() * spread * 0.7);
    const duration = type === 'click' ? 220 + Math.random() * 140 : 260 + Math.random() * 160;

    burst.animate([
      {
        transform: 'translate(-50%, -50%) scale(0.7)',
        opacity: 1,
        filter: 'brightness(1.35)'
      },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(${type === 'click' ? 1.2 : 1.5}) rotate(${Math.random() * 140}deg)`,
        opacity: 1,
        filter: 'brightness(1.8)'
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${type === 'click' ? 1.35 : 1.9}) rotate(${Math.random() * 200}deg)`,
        opacity: 0,
        filter: 'brightness(1.2)'
      }
    ], {
      duration,
      easing: 'cubic-bezier(0.12, 0.85, 0.2, 1)',
      fill: 'forwards'
    }).onfinish = () => burst.remove();
  }
}

/* ---------- Fairy-dust sound ---------- */

function getSparkleReverb(ctx) {
  if (sparkleReverbBuffer) return sparkleReverbBuffer;

  const length = Math.floor(ctx.sampleRate * 2.4);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const decay = Math.pow(1 - i / length, 2.6);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }

  sparkleReverbBuffer = buffer;
  return buffer;
}

function createMagicTone(type = 'click') {
  const now = Date.now();
  if (now - lastSoundTime < 220) {
    return;
  }
  lastSoundTime = now;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sparklingAudioContext) {
      sparklingAudioContext = new AudioContextClass();
    }
    const ctx = sparklingAudioContext;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const t0 = ctx.currentTime + 0.01;

    // Master chain: soft lowpass -> dry out + reverb send
    const master = ctx.createGain();
    master.gain.value = 0.9;

    const softener = ctx.createBiquadFilter();
    softener.type = 'lowpass';
    softener.frequency.value = 9000;
    softener.Q.value = 0.3;

    const reverb = ctx.createConvolver();
    reverb.buffer = getSparkleReverb(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;

    master.connect(softener);
    softener.connect(ctx.destination);
    softener.connect(reverb);
    reverb.connect(wet);
    wet.connect(ctx.destination);

    // C major pentatonic, high register (C6 -> G7)
    const notes = [1046.5, 1174.7, 1318.5, 1568.0, 1760.0, 2093.0, 2349.3, 2637.0, 3136.0];

    const isReveal = type === 'reveal';
    const count = isReveal ? 24 : 14;
    const span = isReveal ? 1.1 : 0.7;

    for (let i = 0; i < count; i += 1) {
      const progress = i / count;
      const start = t0 + progress * span + Math.random() * 0.045;

      // Notes drift upward like a wand sweep, with some randomness
      const idx = Math.min(
        notes.length - 1,
        Math.floor(progress * notes.length * 0.7 + Math.random() * notes.length * 0.3)
      );
      const freq = notes[idx] * (1 + (Math.random() - 0.5) * 0.004);

      const decay = 0.35 + Math.random() * 0.5;
      const peak = (0.04 + Math.random() * 0.06) * (1 - progress * 0.35);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.0001, start);
      voiceGain.gain.exponentialRampToValueAtTime(peak, start + 0.004);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

      let output = voiceGain;
      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.value = Math.random() * 1.6 - 0.8;
        voiceGain.connect(panner);
        output = panner;
      }
      output.connect(master);

      // Fundamental: pure, soft sine
      const fundamental = ctx.createOscillator();
      fundamental.type = 'sine';
      fundamental.frequency.value = freq;
      fundamental.connect(voiceGain);
      fundamental.start(start);
      fundamental.stop(start + decay + 0.05);

      // Inharmonic overtone gives the glassy "tiny bell" shimmer
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.value = freq * 2.76;
      overtoneGain.gain.setValueAtTime(0.22, start);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, start + decay * 0.45);
      overtone.connect(overtoneGain);
      overtoneGain.connect(voiceGain);
      overtone.start(start);
      overtone.stop(start + decay * 0.5);
    }
  } catch (error) {
    console.warn('Magic sound not available:', error);
  }
}

/* ---------- Wand cursor ---------- */

function updateCursor() {
  const wandOffsetX = 54;
  const wandOffsetY = 42;
  wandCursor.style.transform = `translate(${pointer.x + wandOffsetX}px, ${pointer.y + wandOffsetY}px)`;
  requestAnimationFrame(updateCursor);
}

window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;

  if (window.matchMedia('(pointer: coarse)').matches) return;

  if (wandTrailStopId) {
    cancelAnimationFrame(wandTrailStopId);
  }

  wandTrailStopId = requestAnimationFrame(() => {
    createSparkleTrail();
  });
});

window.addEventListener('pointerdown', (event) => {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const spark = document.createElement('span');
  spark.className = 'star-trail';
  const tipOffsetX = 52;
  const tipOffsetY = 38;
  spark.style.left = `${event.clientX + tipOffsetX}px`;
  spark.style.top = `${event.clientY + tipOffsetY}px`;
  spark.style.width = '16px';
  spark.style.height = '16px';
  document.body.appendChild(spark);

  setTimeout(() => spark.remove(), 700);
});

window.addEventListener('resize', () => {
  pointer.x = Math.min(pointer.x, window.innerWidth);
  pointer.y = Math.min(pointer.y, window.innerHeight);
});

if (window.matchMedia('(pointer: coarse)').matches) {
  wandCursor.style.display = 'none';
}

requestAnimationFrame(updateCursor);

/* ---------- Input behaviour ---------- */

questionInput.value = DEFAULT_TEXT;

questionInput.addEventListener('pointerdown', () => {
  stopThinkingState();

  if (questionInput.value === DEFAULT_TEXT) {
    questionInput.value = '';
  }

  if (isAnswerVisible) {
    clearPreviousAnswerForTyping();
  }

  questionInput.focus();
  const end = questionInput.value.length;
  questionInput.setSelectionRange(end, end);
});

questionInput.addEventListener('click', () => {
  if (document.activeElement !== questionInput) {
    questionInput.focus();
  }

  if (isAnswerVisible && !isThinking) {
    clearPreviousAnswerForTyping();
  }
});

questionInput.addEventListener('input', () => {
  if (isThinking || !isAnswerVisible || !lastDisplayedAnswer) {
    return;
  }

  const typedValue = questionInput.value;
  if (typedValue.startsWith(lastDisplayedAnswer)) {
    questionInput.value = typedValue.slice(lastDisplayedAnswer.length);
    lastDisplayedAnswer = '';
    isAnswerVisible = false;
    const end = questionInput.value.length;
    questionInput.setSelectionRange(end, end);
  } else {
    lastDisplayedAnswer = '';
    isAnswerVisible = false;
  }
});

questionInput.addEventListener('focus', () => {
  if (questionInput.value === DEFAULT_TEXT) {
    questionInput.value = '';
  }

  if (isAnswerVisible && !isThinking) {
    clearPreviousAnswerForTyping();
  }
});

questionInput.addEventListener('blur', () => {
  if (questionInput.value.trim() === '') {
    questionInput.value = DEFAULT_TEXT;
    lastDisplayedAnswer = '';
    isAnswerVisible = false;
  }
});

/* ---------- Asking the ball ---------- */

function revealAnswer() {
  const answer = getRandomUnusedAnswer();
  setAnswerInInput(answer);
  createBurstFromBall({ type: 'reveal' });
  createMagicTone('reveal');
}

function askMagicBall() {
  const userQuestion = questionInput.value.trim();

  if (isThinking) {
    return;
  }

  if (!userQuestion || userQuestion === DEFAULT_TEXT) {
    questionInput.value = DEFAULT_TEXT;
    lastDisplayedAnswer = '';
    isAnswerVisible = false;
    return;
  }

  isThinking = true;
  magicBall.classList.add('thinking');
  questionInput.value = '...';
  lastDisplayedAnswer = '';
  isAnswerVisible = false;
  triggerStarRain();
  createBurstFromBall({ type: 'click' });
  createMagicTone('click');

  answerTimeoutId = setTimeout(() => {
    const answer = getRandomUnusedAnswer();

    isThinking = false;
    clearStarRain();
    magicBall.classList.remove('thinking');
    setAnswerInInput(answer);
    createBurstFromBall({ type: 'reveal' });
    createMagicTone('reveal');
  }, 2400);
}

magicBall.addEventListener('click', (event) => {
  event.stopPropagation();
  createMagicTone('click');
  askMagicBall();
});

questionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    createMagicTone('click');
    askMagicBall();
  }
});

/* ---------- Background stars ---------- */

function seedBackgroundStars() {
  const starLayer = document.getElementById('backgroundStars');
  if (!starLayer) return;

  const starCount = 170;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < starCount; i += 1) {
    const star = document.createElement('span');
    const size = (Math.random() * 3.2 + 1.2).toFixed(2);
    const left = (Math.random() * 100).toFixed(2);
    const top = (Math.random() * 100).toFixed(2);
    const opacity = (Math.random() * 0.8 + 0.35).toFixed(2);
    const delay = (Math.random() * 4.5).toFixed(2);
    const duration = (Math.random() * 3.5 + 2.8).toFixed(2);

    star.style.position = 'absolute';
    star.style.left = `${left}%`;
    star.style.top = `${top}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.borderRadius = '50%';
    star.style.opacity = opacity;
    star.style.background = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,232,168,0.9) 32%, rgba(255,187,255,0.5) 58%, transparent 100%)';
    star.style.boxShadow = '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,207,150,0.6)';
    star.style.animation = `backgroundStarPulse ${duration}s ease-in-out ${delay}s infinite alternate`;

    if (Math.random() > 0.7) {
      star.style.width = `${(Number(size) * 1.8 + 1.2).toFixed(2)}px`;
      star.style.height = star.style.width;
      star.style.boxShadow = '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,190,120,0.9), 0 0 30px rgba(255,146,216,0.7)';
    }

    fragment.appendChild(star);
  }

  starLayer.appendChild(fragment);
}

const backgroundStarPulse = document.createElement('style');
backgroundStarPulse.textContent = `
  @keyframes backgroundStarPulse {
    0% { transform: scale(0.7); opacity: 0.4; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0.7; }
  }
`;
document.head.appendChild(backgroundStarPulse);

seedBackgroundStars();