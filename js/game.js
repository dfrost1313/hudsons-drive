(function () {
  const STOPS = [
    { animal: 'cow', foil: 'duck' },
    { animal: 'dog', foil: 'cow' },
    { animal: 'cat', foil: 'cow' },
    { animal: 'duck', foil: 'horse' },
    { animal: 'horse', foil: 'duck' }
  ];
  const CRY = { cow: 'moo', dog: 'bark', cat: 'meow', duck: 'quack', horse: 'neigh' };
  const FIRST = 680;
  const GAP = 1040;
  const MAX_SPEED = 270;
  const ACCEL = 540;
  const DECEL = 400;

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const title = document.getElementById('title');
  const startBtn = document.getElementById('start');
  const goBtn = document.getElementById('go');
  const hero = document.getElementById('hero');
  const choices = document.getElementById('choices');
  const sparkles = document.getElementById('sparkles');
  const endScreen = document.getElementById('end');
  const sticker = document.getElementById('sticker');
  const againBtn = document.getElementById('again');
  const parentEntry = document.getElementById('parent-entry');
  const gate = document.getElementById('gate');
  const gateBack = document.getElementById('gate-back');
  const numbers = document.getElementById('numbers');
  const parent = document.getElementById('parent');
  const parentClose = document.getElementById('parent-close');
  const muteBtn = document.getElementById('mute');
  const muteLabel = document.getElementById('mute-label');
  const muteIcon = document.getElementById('mute-icon');
  const creditsEl = document.getElementById('credits');

  const clouds = [
    { x: 40, y: 36, s: 1 },
    { x: 280, y: 70, s: 0.75 },
    { x: 540, y: 28, s: 1.15 },
    { x: 860, y: 64, s: 0.85 }
  ];
  const trees = [];
  for (let x = 30; x < 9000; x += 260) {
    trees.push({ x: x + (x % 90), s: 0.85 + (x % 4) * 0.08 });
  }

  let state = 'title';
  let overlay = null;
  let started = false;
  let world = 0;
  let decor = 0;
  let speed = 0;
  let holding = false;
  let throttleUntil = 0;
  let stopIndex = 0;
  let misses = 0;
  let celebrating = false;
  let holdRaf = 0;
  let last = performance.now();

  function stopAt(i) {
    return FIRST + i * GAP;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function setState(next) {
    state = next;
    document.body.dataset.state = next;
  }

  function setOverlay(name) {
    overlay = name;
    gate.hidden = name !== 'gate';
    parent.hidden = name !== 'parent';
    parentEntry.hidden = !!name;
    if (name === 'gate') buildNumbers();
    if (name === 'parent') renderCredits();
    paintMute();
  }

  function paintMute() {
    const off = audio.isMuted();
    muteBtn.setAttribute('aria-pressed', off ? 'true' : 'false');
    muteLabel.textContent = off ? 'Sound off' : 'Sound on';
    muteIcon.innerHTML = off
      ? '<path d="M10 24h10l14-10v36L20 40H10z" fill="#fff"/><path d="M42 24l16 16M58 24L42 40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
      : '<path d="M8 24h10l14-10v36L18 40H8z" fill="#fff"/><path d="M42 22c6 6 6 20 0 26M50 16c10 10 10 28 0 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>';
  }

  function renderCredits() {
    audio.credits().then(function (clips) {
      if (!clips.length) {
        creditsEl.textContent = 'Credits could not be loaded.';
        return;
      }
      const esc = function (value) {
        return String(value).replace(/[&<>]/g, function (ch) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch];
        });
      };
      let html = '';
      let group = '';
      clips.forEach(function (clip) {
        if (clip.group !== group) {
          group = clip.group;
          html += '<h3>' + esc(group) + '</h3>';
        }
        html += '<div class="credit"><b>' + esc(clip.title) + '</b>' +
          '<span>' + esc(clip.creator) + ' · ' + esc(clip.license) + '</span>' +
          '<span>' + esc(clip.sourceUrl) + '</span>' +
          '<span>' + esc(clip.licenseUrl) + '</span>' +
          '<span>Downloaded ' + esc(clip.downloadDate) + '</span></div>';
      });
      creditsEl.innerHTML = html;
    });
  }

  function buildNumbers() {
    const values = [5, 6, 7, 8, 9];
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = values[i];
      values[i] = values[j];
      values[j] = tmp;
    }
    numbers.innerHTML = '';
    values.forEach(function (n) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(n);
      btn.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        audio.play('tap');
        if (n === 7) {
          setOverlay('parent');
          return;
        }
        btn.classList.remove('wiggle');
        void btn.offsetWidth;
        btn.classList.add('wiggle');
      });
      numbers.appendChild(btn);
    });
  }

  function showHero(id, klass) {
    hero.hidden = false;
    hero.innerHTML = Art.animal(id);
    hero.classList.remove('pop', 'hop');
    void hero.offsetWidth;
    if (klass) hero.classList.add(klass);
  }

  function hideAsk() {
    hero.hidden = true;
    choices.hidden = true;
    choices.innerHTML = '';
  }

  function burst() {
    sparkles.innerHTML = '';
    const colors = ['#f0c14a', '#fff', '#f3a35c', '#fff6d0'];
    for (let i = 0; i < 14; i++) {
      const bit = document.createElement('i');
      const ang = (Math.PI * 2 * i) / 14;
      const dist = 46 + (i % 4) * 16;
      bit.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      bit.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      bit.style.background = colors[i % colors.length];
      sparkles.appendChild(bit);
    }
  }

  function ask(stop) {
    setState('ask');
    speed = 0;
    holding = false;
    misses = 0;
    goBtn.hidden = true;
    audio.setDrive(0);
    showHero(stop.animal, 'pop');
    if (audio.has('what_animal')) audio.play('what_animal');
    const order = Math.random() < 0.5 ? [stop.animal, stop.foil] : [stop.foil, stop.animal];
    choices.hidden = false;
    choices.innerHTML = '';
    order.forEach(function (id, index) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice ' + (index === 0 ? 'left' : 'right');
      btn.dataset.animal = id;
      btn.setAttribute('aria-label', id);
      btn.innerHTML = Art.animal(id);
      btn.addEventListener('pointerdown', function (event) {
        event.preventDefault();
        choose(stop, id, btn);
      });
      choices.appendChild(btn);
    });
  }

  function choose(stop, id, btn) {
    if (state !== 'ask' || celebrating || overlay) return;
    audio.play('tap');
    btn.classList.add('is-down');
    setTimeout(function () { btn.classList.remove('is-down'); }, 140);
    if (id === stop.animal) {
      celebrate(stop);
      return;
    }
    misses += 1;
    btn.classList.remove('wiggle');
    void btn.offsetWidth;
    btn.classList.add('wiggle');
    if (audio.has('try_again')) audio.play('try_again');
    const right = choices.querySelector('[data-animal="' + stop.animal + '"]');
    if (misses === 2 && right) {
      right.classList.remove('hint');
      void right.offsetWidth;
      right.classList.add('hint');
    }
    if (misses >= 3 && right) {
      right.classList.remove('hint');
      right.classList.add('show-right');
      choices.querySelectorAll('.choice').forEach(function (el) {
        if (el !== right) el.classList.add('dim');
      });
    }
  }

  function praiseKey() {
    if (audio.has('you_got_it')) return 'you_got_it';
    if (audio.has('sounds_good')) return 'sounds_good';
    return '';
  }

  function celebrate(stop) {
    celebrating = true;
    setState('celebrate');
    choices.hidden = true;
    hero.classList.remove('pop');
    void hero.offsetWidth;
    hero.classList.add('hop');
    burst();
    audio.play('chime').then(function () {
      const praise = praiseKey();
      return praise ? audio.play(praise) : null;
    }).then(function () {
      return audio.play(CRY[stop.animal]);
    }).then(function () {
      return audio.has(stop.animal) ? audio.play(stop.animal) : null;
    }).then(function () {
      celebrating = false;
      hideAsk();
      sparkles.innerHTML = '';
      stopIndex += 1;
      if (stopIndex >= STOPS.length) {
        showEnd();
        return;
      }
      setState('drive');
      goBtn.hidden = false;
    });
  }

  function showEnd() {
    setState('end');
    goBtn.hidden = true;
    speed = 0;
    audio.setDrive(0);
    const row = STOPS.map(function (stop) {
      return Art.animal(stop.animal);
    }).join('');
    sticker.innerHTML = Art.star() + '<p class="all-done">All done!</p><div class="row">' + row + '</div>';
    endScreen.hidden = false;
    if (audio.has('all_done')) audio.play('all_done');
  }

  function beginTrip() {
    world = 0;
    speed = 0;
    stopIndex = 0;
    misses = 0;
    celebrating = false;
    title.hidden = true;
    endScreen.hidden = true;
    hideAsk();
    goBtn.hidden = false;
    setState('drive');
    if (audio.has('lets_go')) audio.play('lets_go');
  }

  function arrive() {
    world = stopAt(stopIndex);
    speed = 0;
    holding = false;
    ask(STOPS[stopIndex]);
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state === 'title') decor += 16 * dt;
    if (state === 'drive' && !overlay && !celebrating) {
      const goal = stopAt(stopIndex);
      const dist = Math.max(0, goal - world);
      const throttle = holding || now < throttleUntil;
      if (throttle) speed = Math.min(MAX_SPEED, speed + ACCEL * dt);
      else speed = Math.max(0, speed - DECEL * dt);
      if (dist < 320) speed = Math.min(speed, Math.max(24, dist * 1.25));
      const step = Math.min(speed * dt, dist);
      world += step;
      if (dist - step <= 0.6) arrive();
    } else if (state !== 'drive') {
      speed = 0;
    }
    const ratio = overlay ? 0 : speed / MAX_SPEED;
    audio.setDrive(ratio);
    draw(state === 'title' ? decor : world);
    requestAnimationFrame(frame);
  }

  function draw(scroll) {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    const roadTop = h * 0.58;
    const roadH = Math.max(64, h * 0.2);

    const sky = ctx.createLinearGradient(0, 0, 0, roadTop);
    sky.addColorStop(0, '#9fd4ef');
    sky.addColorStop(1, '#d7f0c8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.16, Math.min(w, h) * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    clouds.forEach(function (cloud) {
      const x = ((cloud.x - scroll * 0.2) % (w + 220) + (w + 220)) % (w + 220) - 80;
      const s = cloud.s;
      ctx.beginPath();
      ctx.ellipse(x, cloud.y, 36 * s, 18 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 28 * s, cloud.y + 4, 26 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 26 * s, cloud.y + 6, 22 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#8fcb78';
    ctx.beginPath();
    ctx.moveTo(0, roadTop);
    for (let x = 0; x <= w; x += 20) {
      const y = roadTop - 28 - Math.sin((x + scroll * 0.15) * 0.01) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, roadTop + 10);
    ctx.lineTo(0, roadTop + 10);
    ctx.fill();

    ctx.fillStyle = '#74bf6c';
    ctx.fillRect(0, roadTop - 8, w, 18);

    trees.forEach(function (tree) {
      const x = tree.x - scroll * 0.55;
      if (x < -80 || x > w + 80) return;
      const s = tree.s;
      const base = roadTop - 6;
      ctx.fillStyle = '#8a5a32';
      ctx.fillRect(x - 6 * s, base - 34 * s, 12 * s, 36 * s);
      ctx.fillStyle = '#3f9a55';
      ctx.beginPath();
      ctx.arc(x, base - 48 * s, 22 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#57b068';
      ctx.beginPath();
      ctx.arc(x + 12 * s, base - 40 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#6b7380';
    ctx.fillRect(0, roadTop, w, roadH);
    ctx.fillStyle = '#ffe08a';
    const dashW = 36;
    const gap = 28;
    const offset = scroll % (dashW + gap);
    for (let x = -offset; x < w; x += dashW + gap) {
      roundRect(x, roadTop + roadH * 0.42, dashW, Math.max(6, roadH * 0.08), 4, '#ffe08a');
    }

    ctx.fillStyle = '#9ed18a';
    ctx.fillRect(0, roadTop + roadH, w, h - roadTop - roadH);

    const asking = state === 'ask' || state === 'celebrate';
    const bikeX = asking ? w * 0.46 : w * 0.2;
    const bikeY = roadTop + roadH * 0.62 + Math.sin(scroll * 0.05) * (speed > 12 ? 2.4 : 0.7);
    drawBike(bikeX, bikeY, Math.min(w, h) * (asking ? 0.0021 : 0.0027), scroll * 0.015);
  }

  function roundRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.fill();
  }

  function drawBike(x, y, scale, wheel) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(36,48,56,0.18)';
    ctx.beginPath();
    ctx.ellipse(10, 36, 70, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    wheelAt(-46, 18, wheel);
    wheelAt(48, 18, wheel);
    ctx.strokeStyle = '#3a2e28';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-46, 18);
    ctx.lineTo(-10, -8);
    ctx.lineTo(48, 18);
    ctx.moveTo(-10, -8);
    ctx.lineTo(18, -8);
    ctx.stroke();
    ctx.fillStyle = '#e85d4c';
    roundRect(-18, -28, 58, 26, 10, '#e85d4c');
    ctx.strokeStyle = '#3a2e28';
    ctx.lineWidth = 4;
    ctx.strokeRect(-16, -26, 54, 22);
    ctx.beginPath();
    ctx.moveTo(30, -22);
    ctx.lineTo(62, -40);
    ctx.lineTo(58, -22);
    ctx.stroke();
    ctx.fillStyle = '#3d8fd4';
    ctx.beginPath();
    ctx.arc(-4, -46, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff8ef';
    ctx.beginPath();
    ctx.arc(-1, -48, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function wheelAt(x, y, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#2c3338';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8eef2';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.rotate(Math.PI / 3);
    }
    ctx.stroke();
    ctx.restore();
  }

  startBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    if (started || overlay) return;
    started = true;
    startBtn.classList.add('is-loading');
    audio.unlock();
    audio.whenReady().then(function () {
      startBtn.classList.remove('is-loading');
      beginTrip();
    });
  });

  goBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    if (state !== 'drive' || overlay) return;
    goBtn.setPointerCapture(event.pointerId);
    holding = true;
    throttleUntil = performance.now() + 1400;
    goBtn.classList.add('is-down');
    audio.play('tap');
  });
  function releaseGo() {
    holding = false;
    goBtn.classList.remove('is-down');
  }
  goBtn.addEventListener('pointerup', releaseGo);
  goBtn.addEventListener('pointercancel', releaseGo);

  againBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    audio.play('tap');
    beginTrip();
  });

  parentEntry.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    event.stopPropagation();
    parentEntry.setPointerCapture(event.pointerId);
    const startedAt = performance.now();
    const tick = function () {
      const p = Math.min(1, (performance.now() - startedAt) / 3000);
      parentEntry.style.setProperty('--p', String(p));
      if (p >= 1) {
        parentEntry.style.setProperty('--p', '0');
        setOverlay('gate');
        return;
      }
      holdRaf = requestAnimationFrame(tick);
    };
    holdRaf = requestAnimationFrame(tick);
  });
  function cancelHold() {
    cancelAnimationFrame(holdRaf);
    parentEntry.style.setProperty('--p', '0');
  }
  parentEntry.addEventListener('pointerup', cancelHold);
  parentEntry.addEventListener('pointercancel', cancelHold);

  gateBack.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    audio.play('tap');
    setOverlay(null);
  });
  parentClose.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    audio.play('tap');
    setOverlay(null);
  });
  muteBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    audio.play('tap');
    audio.setMuted(!audio.isMuted());
    paintMute();
  });

  document.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  window.addEventListener('resize', resize);
  paintMute();
  resize();
  requestAnimationFrame(frame);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
