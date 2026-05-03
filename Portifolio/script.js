'use strict';

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initCanvas();
  initNavbar();
  initHero();
  initTerminal();
  initSkills();
  initProjects();
  initScrollReveal();
  initCounters();
  initContact();
  initModal();
  initHamburger();
});

// ==================== CUSTOM CURSOR ====================
function initCursor() {
  const outer = document.getElementById('cursorOuter');
  const inner = document.getElementById('cursorInner');
  if (!outer || !inner) return;

  let mouseX = 0, mouseY = 0;
  let outerX = 0, outerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    inner.style.left = mouseX + 'px';
    inner.style.top = mouseY + 'px';
  });

  const lerp = (a, b, t) => a + (b - a) * t;

  function animateCursor() {
    outerX = lerp(outerX, mouseX, 0.12);
    outerY = lerp(outerY, mouseY, 0.12);
    outer.style.left = outerX + 'px';
    outer.style.top = outerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = 'a, button, .project-card, .contact-link, .skill-cat, .filter-btn, .f-card';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
}

// ==================== PARTICLE CANVAS ====================
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], connections = [];
  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() > 0.7 ? 180 : (Math.random() > 0.5 ? 320 : 260);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
}

// ==================== NAVBAR ====================
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    menu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      menu.classList.remove('open');
    });
  });
}

// ==================== HERO TYPER ====================
function initHero() {
  const tags = ['front-end engineer', 'ui specialist', 'Graphic Designer', 'Coder'];
  const roles = ['Front-end Engineer', 'UI Architect', 'Graphic Designer', 'Coder'];

  typeLoop(document.getElementById('tagTyper'), tags, 80, 50, 1600);
  typeLoop(document.getElementById('roleTyper'), roles, 100, 60, 2200);
}

function typeLoop(el, words, typeSpeed, deleteSpeed, pause) {
  if (!el) return;
  let wordIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const word = words[wordIdx];
    if (!deleting) {
      el.textContent = word.slice(0, ++charIdx);
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, pause);
        return;
      }
    } else {
      el.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }
    setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
  }
  tick();
}

// ==================== COUNTER ANIMATION ====================
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.count;
        let current = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current);
          if (current >= target) clearInterval(timer);
        }, 16);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

// ==================== TERMINAL ====================
function initTerminal() {
  const el = document.getElementById('terminalCode');
  if (!el) return;

  const lines = [
    { text: '{', color: '#ffe0e0' },
    { text: '  "name": "Davi Augusto",', color: '#00f5ff' },
    { text: '  "role": "Dev Front-end",', color: '#00f5ff' },
    { text: '  "location": "Rio de Janeiro, BR",', color: '#00f5ff' },
    { text: '  "experience": 3,', color: '#ffe600' },
    { text: '  "available": true,', color: '#00ff88' },
    { text: '  "passions": [', color: '#e0e0ff' },
    { text: '    "Animes",', color: '#ff006e' },
    { text: '    "Games",', color: '#ff006e' },
    { text: '    "programing"', color: '#ff006e' },
    { text: '  ],', color: '#e0e0ff' },
    { text: '  "Bug?": "no"', color: '#7b2fff' },
    { text: '}', color: '#e0e0ff' },
  ];

  let i = 0;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      typeLine();
      obs.disconnect();
    }
  }, { threshold: 0.4 });
  obs.observe(el);

  function typeLine() {
    if (i >= lines.length) return;
    const line = lines[i++];
    const span = document.createElement('span');
    span.style.color = line.color;
    span.style.display = 'block';
    el.appendChild(span);
    typeText(span, line.text, 28, () => setTimeout(typeLine, 60));
  }
}

function typeText(el, text, speed, done) {
  let i = 0;
  const t = setInterval(() => {
    el.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(t); done && done(); }
  }, speed);
}

// ==================== SKILLS ====================
const skillData = {
  frontend: [
    { name: 'React / Next.js', pct: 95 },
    { name: 'CSS / Animations', pct: 98 },
    { name: 'HTML', pct: 90 },
    { name: 'JavaScript', pct: 85 },
    { name: 'Mobile-First Design', pct: 82 },
  ],
  backend: [
    { name: 'Node.js / Express', pct: 85 },
    { name: 'MySQL', pct: 80 },
    { name: 'Algorithms & Problem Solving', pct: 95 },
    { name: 'Data Handling', pct: 68 },
    { name: 'REST APIs', pct: 75 },
  ],
  tools: [
    { name: 'Git / GitHub Actions', pct: 95 },
    { name: 'Terminal / Command Line', pct: 88 },
    { name: 'VS Code', pct: 80 },
    { name: 'Figma', pct: 82 },
    { name: 'Canva', pct: 85 },
  ],
  design: [
    { name: 'UI / UX Design', pct: 88 },
    { name: 'Motion Design', pct: 85 },
    { name: 'Responsive Design', pct: 90 },
    { name: 'Branding', pct: 70 },
    { name: 'Wireframing', pct: 60 },
  ],
};

const radarData = {
  frontend: [95, 98, 90, 78, 82],
  backend: [85, 80, 72, 68, 75],
  tools: [95, 88, 80, 82, 85],
  design: [88, 85, 90, 70, 60],
};

function initSkills() {
  const grid = document.getElementById('skillsGrid');
  const cats = document.querySelectorAll('.skill-cat');
  if (!grid) return;

  let currentCat = 'frontend';

  function renderSkills(cat) {
    grid.innerHTML = '';
    (skillData[cat] || []).forEach(({ name, pct }, i) => {
      const item = document.createElement('div');
      item.className = 'skill-item reveal';
      item.innerHTML = `
        <div class="skill-meta">
          <span class="skill-name">${name}</span>
          <span class="skill-pct">${pct}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-pct="${pct}" style="transition-delay:${i * 0.07}s"></div>
        </div>
      `;
      grid.appendChild(item);
    });

    setTimeout(() => {
      grid.querySelectorAll('.skill-fill').forEach(fill => {
        fill.style.width = fill.dataset.pct + '%';
      });
      grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }, 50);

    drawRadar(cat);
  }

  cats.forEach(cat => {
    cat.addEventListener('click', () => {
      cats.forEach(c => c.classList.remove('active'));
      cat.classList.add('active');
      currentCat = cat.dataset.cat;
      renderSkills(currentCat);
    });
  });

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      renderSkills(currentCat);
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(document.getElementById('skills'));
}

function drawRadar(cat) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = radarData[cat] || [80, 80, 80, 80, 80];
  const labels = ['Performance', 'UI/UX', 'Architecture', 'Design', 'Testing'];
  const N = data.length;
  const cx = 200, cy = 200, R = 140;

  ctx.clearRect(0, 0, 400, 400);

  // Grid
  for (let r = 1; r <= 5; r++) {
    const rad = (R / 5) * r;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const x = cx + rad * Math.cos(angle);
      const y = cy + rad * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
    ctx.stroke();
  }

  // Labels
  ctx.font = '11px Orbitron, monospace';
  ctx.fillStyle = 'rgba(154, 110, 110, 0.8)';
  ctx.textAlign = 'center';
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const lx = cx + (R + 22) * Math.cos(angle);
    const ly = cy + (R + 22) * Math.sin(angle);
    ctx.fillText(labels[i], lx, ly + 4);
  }

  // Data fill (animated)
  let progress = 0;
  const animate = () => {
    ctx.clearRect(0, 0, 400, 400);

    // Redraw grid
    for (let r = 1; r <= 5; r++) {
      const rad = (R / 5) * r;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
        const x = cx + rad * Math.cos(angle);
        const y = cy + rad * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
      ctx.stroke();
    }
    ctx.font = '11px Orbitron, monospace';
    ctx.fillStyle = 'rgba(154, 110, 110, 0.8)';
    ctx.textAlign = 'center';
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const lx = cx + (R + 22) * Math.cos(angle);
      const ly = cy + (R + 22) * Math.sin(angle);
      ctx.fillText(labels[i], lx, ly + 4);
    }

    // Filled polygon
    progress = Math.min(progress + 0.04, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const r = (data[i] / 100) * R * eased;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dots
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const r = (data[i] / 100) * R * eased;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ff0000';
      ctx.fill();
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (progress < 1) requestAnimationFrame(animate);
  };
  animate();
}

// ==================== PROJECTS ====================
const projects = [
  {
    id: 1, title: 'NEXUS DASHBOARD', type: 'web', featured: true,
    desc: 'Dashboard de analytics em tempo real com WebGL e dados ao vivo. 60fps garantidos.',
    tech: ['React', 'WebGL', 'GraphQL', 'WebSocket'],
    color: '#00c3ff', icon: '📊', bg: 'linear-gradient(135deg, #0a0a1a 0%, #0d1f3a 100%)',
    detail: 'Sistema completo de analytics com visualizações 3D, gráficos em tempo real via WebSocket, e uma interface que parece saída de um sci-fi. Redução de 70% no tempo de carregamento de dados.',
  },
  {
    id: 2, title: 'VOID RUNNER', type: 'game',
    desc: 'Jogo de plataforma no browser com engine própria em Canvas 2D. 120fps.',
    tech: ['Canvas 2D', 'Web Audio', 'JavaScript'],
    color: '#ffe600', icon: '🎮', bg: 'linear-gradient(135deg, #1a0a00 0%, #2a1a00 100%)',
    detail: 'Platformer completamente em JavaScript puro, sem bibliotecas. Engine própria com física, colisão AABB, sistema de partículas, shaders de pixel art e trilha sonora procedural via Web Audio API.',
  },
  {
    id: 3, title: 'SAKURA UI', type: 'web',
    desc: 'Design system completo com 80+ componentes animados. Usado em 12 projetos.',
    tech: ['TypeScript', 'SCSS', 'Storybook'],
    color: '#ff006e', icon: '🌸', bg: 'linear-gradient(135deg, #1a0010 0%, #2a0020 100%)',
    detail: 'Design system inspirado em anime com 80+ componentes, sistema de temas, acessibilidade WCAG AA, documentação interativa e bundle de 12kb gzipped.',
  },
  {
    id: 4, title: 'NEON WORLD', type: '3d',
    desc: 'Mundo 3D interativo no browser com Three.js. 150k+ usuários únicos.',
    tech: ['Three.js', 'GLSL', 'React'],
    color: '#7b2fff', icon: '🌐', bg: 'linear-gradient(135deg, #0a001a 0%, #1a0030 100%)',
    detail: 'Experiência 3D imersiva com shaders GLSL customizados, sistema de iluminação dinâmica, renderização de partículas em GPU, e otimizações que permitem rodar em mobile a 60fps.',
  },
  {
    id: 5, title: 'CIPHER CHAT', type: 'web',
    desc: 'App de chat criptografado com UI em tempo real e animações fluidas.',
    tech: ['Vue.js', 'Socket.io', 'Node.js'],
    color: '#00ff88', icon: '💬', bg: 'linear-gradient(135deg, #001a0a 0%, #002a10 100%)',
    detail: 'Chat end-to-end encrypted com UI que anima cada mensagem como um terminal hacker. Criptografia AES-256, suporte a markdown, emojis customizados e modo offline.',
  },
];

function initProjects() {
  const grid = document.getElementById('projectsGrid');
  const filters = document.querySelectorAll('.filter-btn');
  if (!grid) return;

  function renderProjects(filter = 'all') {
    const filtered = filter === 'all' ? projects : projects.filter(p => p.type === filter);
    grid.innerHTML = '';
    filtered.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = `project-card reveal${p.featured ? ' featured' : ''}`;
      card.style.transitionDelay = `${i * 0.1}s`;
      card.dataset.id = p.id;
      card.dataset.type = p.type;

      const typeClass = p.type === '3d' ? '\\33 d' : p.type;

      card.innerHTML = `
        <div class="project-thumb">
          <div class="project-thumb-bg" style="background:${p.bg};width:100%;height:100%;position:absolute;inset:0;"></div>
          <div class="project-type-badge ${typeClass}">${p.type.toUpperCase()}</div>
          <div class="project-icon" style="color:${p.color}">${p.icon}</div>
          <div class="project-overlay">
            <button class="project-overlay-btn" data-action="details" data-id="${p.id}">DETALHES</button>
            <button class="project-overlay-btn" data-action="live">DEMO →</button>
          </div>
        </div>
        <div class="project-body">
          <h3 class="project-title" style="color:${p.color}">${p.title}</h3>
          <p class="project-desc">${p.desc}</p>
          <div class="project-tech">${p.tech.map(t => `<span>${t}</span>`).join('')}</div>
        </div>
      `;
      grid.appendChild(card);
      setTimeout(() => card.classList.add('visible'), 50 + i * 80);
    });

    // Re-attach hover cursor listeners
    grid.querySelectorAll('.project-card').forEach(c => {
      c.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      c.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      c.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (btn && btn.dataset.action === 'details') {
          const id = +btn.dataset.id;
          openModal(projects.find(p => p.id === id));
        }
      });
    });
  }

  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      f.classList.add('active');
      renderProjects(f.dataset.filter);
    });
  });

  renderProjects();
}

// ==================== MODAL ====================
function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function openModal(project) {
  if (!project) return;
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;

  content.innerHTML = `
    <div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <span style="font-size:2.5rem">${project.icon}</span>
        <div>
          <h2 style="font-family:var(--font-display);font-size:1.4rem;letter-spacing:4px;color:${project.color}">${project.title}</h2>
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-dim);letter-spacing:2px">${project.type.toUpperCase()}</span>
        </div>
      </div>
      <div style="height:4px;background:${project.bg};border-radius:2px;margin-bottom:24px"></div>
      <p style="font-size:1rem;color:var(--text-dim);line-height:1.8;margin-bottom:20px">${project.detail}</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${project.tech.map(t => `<span style="font-family:var(--font-mono);font-size:0.7rem;padding:4px 12px;border:1px solid ${project.color};color:${project.color}">${t}</span>`).join('')}
      </div>
    </div>
  `;
  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
}

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Add reveal class to section elements
  const selectors = [
    '.section-header', '.about-grid', '.terminal-window',
    '.about-right', '.timeline-item', '.contact-grid', '.contact-left',
    '.contact-right', 
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 3)}`);
      observer.observe(el);
    });
  });
}

// ==================== CONTACT FORM ====================
function initContact() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('formName')?.value.trim();
    const email = document.getElementById('formEmail')?.value.trim();
    const msg = document.getElementById('formMsg')?.value.trim();

    if (!name || !email || !msg) return;

    const btn = form.querySelector('.form-submit .btn-text');
    if (btn) btn.textContent = 'ENVIANDO...';

    setTimeout(() => {
      form.reset();
      if (btn) btn.textContent = 'ENVIAR MENSAGEM';
      if (success) {
        success.style.display = 'block';
        setTimeout(() => { success.style.display = 'none'; }, 4000);
      }
    }, 1400);
  });

  // Form input glow
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
      input.style.setProperty('--glow', 'var(--glow-cyan)');
    });
  });
}

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==================== GLITCH RANDOM TRIGGER ====================
(function glitchLoop() {
  const glitched = document.querySelectorAll('.name-line[data-glitch]');
  setInterval(() => {
    glitched.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.style.animation = '';
    });
  }, 5000);
})();

// ==================== NAV ACTIVE STATE ON SCROLL ====================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    links.forEach(link => {
      link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--cyan)' : '';
    });
  });
})();