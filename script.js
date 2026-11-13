(() => {
  const $ = s => document.querySelector(s);
  const root = document.documentElement;

  /* theme */
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch(e){}
  $('#themeBtn').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch(e){}
    drawUlam();
  });

  /* mobile menu */
  const menu = $('#menu'), btn = $('#menuBtn');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); btn.classList.remove('open');
  }));

  /* nav shadow + active link */
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), {passive:true});
  const links = [...menu.querySelectorAll('a')];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.hash === '#' + e.target.id));
  }), {rootMargin:'-45% 0px -50% 0px'});
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  /* reveal on scroll + counters */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    e.target.querySelectorAll('.count').forEach(animate);
  }), {threshold:.15});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  function animate(el){
    const to = +el.dataset.to, start = el.dataset.plain ? to - 40 : 0, dur = 1200, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), v = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
      el.textContent = v; if (p < 1) requestAnimationFrame(step);
    };
    if (!matchMedia('(prefers-reduced-motion:reduce)').matches) requestAnimationFrame(step);
  }

  /* prime generator */
  const isPrime = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  $('#primeBtn').addEventListener('click', () => {
    let n; do { n = 100 + Math.floor(Math.random() * 9900); } while (!isPrime(n));
    $('#primeOut').textContent = `${n} is prime – it has no divisors other than 1 and itself.`;
  });

  /* Ulam spiral background */
  const cv = $('#ulam'), ctx = cv.getContext('2d');
  let mouse = {x:-999, y:-999}, cells = [], size = 10;

  function build(){
    const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    size = w < 600 ? 9 : 12;
    const cols = Math.ceil(w / size) + 2, rows = Math.ceil(h / size) + 2, total = cols * rows;
    const sieve = new Uint8Array(total + 1).fill(1); sieve[0] = sieve[1] = 0;
    for (let i = 2; i * i <= total; i++) if (sieve[i]) for (let j = i * i; j <= total; j += i) sieve[j] = 0;
    cells = [];
    let x = 0, y = 0, dx = 1, dy = 0, seg = 1, passed = 0, turns = 0;
    const cx = w / 2, cy = h / 2;
    for (let n = 1; n <= total; n++) {
      if (sieve[n]) cells.push({x: cx + x * size, y: cy + y * size});
      x += dx; y += dy; passed++;
      if (passed === seg) { passed = 0; [dx, dy] = [-dy, dx]; if (++turns % 2 === 0) seg++; }
    }
    drawUlam();
  }

  function drawUlam(){
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const c = getComputedStyle(root).getPropertyValue('--accent').trim();
    ctx.fillStyle = c;
    for (const p of cells) {
      if (p.x < -size || p.x > w + size || p.y < -size || p.y > h + size) continue;
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y), k = Math.max(0, 1 - d / 120);
      ctx.globalAlpha = .45 + k * .55;
      const r = size * (.18 + k * .22);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let raf;
  $('#home').addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect(); mouse = {x: e.clientX - r.left, y: e.clientY - r.top};
    cancelAnimationFrame(raf); raf = requestAnimationFrame(drawUlam);
  });
  $('#home').addEventListener('mouseleave', () => { mouse = {x:-999, y:-999}; drawUlam(); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  build();

  $('#year').textContent = new Date().getFullYear();
})();
