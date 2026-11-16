/* Recorded clips only. No speech synthesis and no generated tones. */
(function () {
  const SFX = [
    ['moo', 'audio/animals/moo.mp3'],
    ['bark', 'audio/animals/bark.mp3'],
    ['meow', 'audio/animals/meow.mp3'],
    ['quack', 'audio/animals/quack.mp3'],
    ['neigh', 'audio/animals/neigh.mp3'],
    ['engine', 'audio/sfx/engine.mp3'],
    ['tap', 'audio/sfx/tap.mp3'],
    ['chime', 'audio/sfx/chime.mp3']
  ];

  const VOICE_DEFAULTS = {
    what_animal: '',
    you_got_it: '',
    try_again: 'try_again.mp3',
    sounds_good: 'sounds_good.mp3',
    lets_go: 'lets_go.mp3',
    all_done: 'all_done.mp3',
    cow: 'cow.mp3',
    dog: 'dog.mp3',
    cat: 'cat.mp3',
    duck: 'duck.mp3',
    horse: 'horse.mp3'
  };

  const VOICE_KEYS = Object.keys(VOICE_DEFAULTS);
  const clips = {};
  let muted = false;
  let credits = [];

  try {
    muted = localStorage.getItem('hudson-drive-muted') === '1';
  } catch (err) {
    muted = false;
  }

  function make(url, loop) {
    const base = new Audio(url);
    base.preload = 'auto';
    base.loop = !!loop;
    return { base: base, url: url };
  }

  function volumeFor(id) {
    if (muted) return 0;
    if (id === 'engine') return 0.75;
    if (VOICE_KEYS.indexOf(id) !== -1) return 1;
    if (id === 'tap' || id === 'chime') return 0.9;
    return 0.86;
  }

  function applyVoiceMap(map) {
    VOICE_KEYS.forEach(function (key) {
      const file = map && Object.prototype.hasOwnProperty.call(map, key) ? map[key] : VOICE_DEFAULTS[key];
      if (!file) {
        delete clips[key];
        return;
      }
      const url = 'audio/voice/' + file;
      if (!clips[key] || clips[key].url !== url) {
        clips[key] = make(url, false);
      }
    });
  }

  SFX.forEach(function (pair) {
    clips[pair[0]] = make(pair[1], pair[0] === 'engine');
  });
  applyVoiceMap(VOICE_DEFAULTS);

  const manifestReady = fetch('audio/voice/manifest.json')
    .then(function (res) { return res.json(); })
    .then(applyVoiceMap)
    .catch(function () {});

  const creditsReady = fetch('audio/credits.json')
    .then(function (res) { return res.json(); })
    .then(function (data) { credits = data.clips || []; })
    .catch(function () { credits = []; });

  function whenReady() {
    return manifestReady.then(function () {
      const waits = Object.keys(clips).map(function (id) {
        return new Promise(function (resolve) {
          const base = clips[id].base;
          if (base.readyState >= 2) {
            resolve();
            return;
          }
          const done = function () { resolve(); };
          base.addEventListener('canplay', done, { once: true });
          base.addEventListener('error', done, { once: true });
          setTimeout(done, 8000);
        });
      });
      return Promise.all(waits);
    });
  }

  function play(id) {
    return new Promise(function (resolve) {
      const clip = clips[id];
      if (!clip || muted) {
        resolve();
        return;
      }
      const node = clip.base.cloneNode(true);
      node.loop = false;
      node.volume = volumeFor(id);
      let settled = false;
      const finish = function () {
        if (settled) return;
        settled = true;
        resolve();
      };
      node.addEventListener('ended', finish);
      node.addEventListener('error', finish);
      const dur = clip.base.duration;
      const ms = (isFinite(dur) && dur > 0 ? dur : 4) * 1000 + 900;
      setTimeout(finish, ms);
      node.play().catch(finish);
    });
  }

  function unlock() {
    const tap = clips.tap && clips.tap.base;
    if (tap && !muted) {
      tap.loop = false;
      tap.currentTime = 0;
      tap.volume = volumeFor('tap');
      tap.play().catch(function () {});
    }
    Object.keys(clips).forEach(function (id) {
      if (id === 'tap') return;
      const base = clips[id].base;
      base.muted = true;
      const pending = base.play();
      const reset = function () {
        base.pause();
        try { base.currentTime = 0; } catch (err) {}
        base.muted = false;
      };
      if (pending && pending.then) pending.then(reset, reset);
      else reset();
    });
  }

  function setDrive(ratio) {
    const clip = clips.engine;
    if (!clip) return;
    const node = clip.base;
    if (muted || ratio < 0.05) {
      if (!node.paused) {
        node.volume = Math.max(0, node.volume - 0.08);
        if (node.volume <= 0.03) {
          node.pause();
          node.volume = 0;
        }
      }
      return;
    }
    const target = 0.28 + ratio * 0.5;
    if (node.paused) {
      node.volume = 0.04;
      node.play().catch(function () {});
    }
    node.volume += (target - node.volume) * 0.18;
  }

  function setMuted(next) {
    muted = !!next;
    try {
      localStorage.setItem('hudson-drive-muted', muted ? '1' : '0');
    } catch (err) {}
    if (muted) {
      Object.keys(clips).forEach(function (id) {
        clips[id].base.pause();
      });
    }
  }

  window.audio = {
    play: play,
    unlock: unlock,
    whenReady: whenReady,
    has: function (id) { return !!clips[id]; },
    setDrive: setDrive,
    setMuted: setMuted,
    isMuted: function () { return muted; },
    credits: function () { return creditsReady.then(function () { return credits; }); }
  };
})();
