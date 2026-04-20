console.log('Script loaded!');

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastMessage = toast.querySelector('.toast-message');
  if (!toastMessage) return;
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Initialize decoupled utility modules (loader, audio, contact, UI)
if (typeof initializePageLoader === 'function') {
  initializePageLoader();
}

if (typeof initAudioToggle === 'function') {
  initAudioToggle();
}

if (typeof initializeEmailJS === 'function') {
  initializeEmailJS();
}

if (typeof initializeContactForm === 'function') {
  initializeContactForm();
}

if (typeof initializeUI === 'function') {
  initializeUI();
}

const PROJECT_CARD_DATA = [
  {
    title: 'Scroll Trigger',
    description: 'A scroll-triggered animation built with native JavaScript.',
    image: 'images/scrolltrigger.png',
    alt: 'Scroll Trigger project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/Scroll-trigger-effect/archive/refs/heads/main.zip',
    liveLink: 'https://pritamx4.github.io/Scroll-trigger-effect/'
  },
  {
    title: 'To-Do List',
    description: 'A to-do list application built with Next.js.',
    image: 'images/todolist.png',
    alt: 'To-Do List project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/todolist/archive/refs/heads/main.zip',
    liveLink: 'https://to-do-list-delta-amber-46.vercel.app/'
  },
  {
    title: 'Tic Tac Toe',
    description: 'Classic Tic Tac Toe using HTML, CSS, and JavaScript.',
    image: 'images/tictactoe.png',
    alt: 'Tic Tac Toe project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/tic-tac-toe/archive/refs/heads/main.zip',
    liveLink: 'https://pritamx4.github.io/tic-tac-toe/'
  },
  {
    title: 'Memory Management Simulator',
    description: 'Operating system memory management simulator.',
    image: 'images/memorymanagementsimulator.png',
    alt: 'Memory Management Simulator project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/os-project/archive/refs/heads/master.zip',
    liveLink: 'https://pritamx4.github.io/os-project/'
  },
  {
    title: 'Snake Game',
    description: 'A classic snake game with responsive controls.',
    image: 'images/snakegame.png',
    alt: 'Snake Game project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/snake-game/archive/refs/heads/main.zip',
    liveLink: 'https://pritamx4.github.io/snake-game/'
  },
  {
    title: 'Drivemate',
    description: 'Car rental app using React.',
    image: 'images/drivemate.png',
    alt: 'Drivemate project preview',
    imageWidth: 1200,
    imageHeight: 675,
    codeLink: 'https://github.com/Pritamx4/drivemate/archive/refs/heads/main.zip',
    liveLink: 'https://drivemate-eight.vercel.app/'
  }
];

function renderProjectCards() {
  const cardsContainer = document.getElementById('projectCardsContainer');
  if (!cardsContainer) return;

  cardsContainer.innerHTML = PROJECT_CARD_DATA.map((project, index) => `
    <div class="project-card reveal-scale" data-project-id="${index}" tabindex="0" aria-label="${project.title} project card">
      <img src="${project.image}" alt="${project.alt}" loading="lazy" decoding="async" width="${project.imageWidth}" height="${project.imageHeight}" />
      <div class="card-info">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="links">
          <a href="${project.codeLink}">
            <lord-icon src="https://cdn.lordicon.com/lrubprlz.json" trigger="hover" colors="primary:#ffffff,secondary:#00f0ff" class="icon-20"></lord-icon>
            Get Code
          </a>
          <a href="${project.liveLink}">
            <lord-icon src="https://cdn.lordicon.com/dicvhxpz.json" trigger="hover" colors="primary:#ffffff,secondary:#00f0ff" stroke="bold" class="icon-20"></lord-icon>
            Live Review
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// Terminal Repo Stats
let terminalElement;
let statsGrid;

const messages = [
  '> CONNECTING TO GITHUB API...',
  '> ACCESSING REPO: CYBERDECK_Px4',
  '> FETCHING REPOSITORY DATA...',
  '> ANALYZING SOURCE CODE...',
  '> CALCULATING REPO STATISTICS...',
  '> RETRIEVING COMMIT HISTORY...',
  '> SCANNING REPOSITORY METRICS...',
  '> DEPLOYING SKILL METRICS... [COMPLETE]',
];

let msgIndex = 0;
let charPos = 0;
let repoData = [0, 0, 0];
let githubApiFallbackMessage = '';
let githubStats = {
  commits: 0,
  repos: 0,
  stars: 0,
  forks: 0,
  watchers: 0,
  issues: 0,
  contributors: 0,
  size: 0,
  lastUpdated: '',
  branches: 0
};

function applyGitHubFallback(message) {
  const cfg = APP_CONFIG;
  githubApiFallbackMessage = message;
  repoData = [cfg.REPO_DATA.HTML, cfg.REPO_DATA.CSS, cfg.REPO_DATA.JS];
  githubStats = { ...cfg.GITHUB_STATS };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url) {
  const apiCfg = APP_CONFIG.API;
  let lastError = null;

  for (let attempt = 0; attempt <= apiCfg.RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiCfg.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github+json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};
      clearTimeout(timeoutId);
      return { data, headers: response.headers };
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < apiCfg.RETRIES) {
        await wait(apiCfg.RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError;
}

async function fetchGitHubStats() {
  try {
    githubApiFallbackMessage = '';
    const username = 'Pritamx4';
    const repoName = 'CYBERDECK_Px4';

    console.log('Fetching GitHub stats...');

    // Fetch language stats
    const langResult = await fetchJsonWithRetry(`https://api.github.com/repos/${username}/${repoName}/languages`);
    const languageData = langResult.data;
    const totalBytes = Object.values(languageData).reduce((a, b) => a + b, 0);
    if (totalBytes > 0) {
      repoData = [
        Math.round(((languageData.HTML || 0) / totalBytes) * 100),
        Math.round(((languageData.CSS || 0) / totalBytes) * 100),
        Math.round(((languageData.JavaScript || 0) / totalBytes) * 100),
      ];
    }

    // Fetch repository info
    const repoInfoResult = await fetchJsonWithRetry(`https://api.github.com/repos/${username}/${repoName}`);
    const repoInfo = repoInfoResult.data;
    githubStats.stars = repoInfo.stargazers_count || 0;
    githubStats.forks = repoInfo.forks_count || 0;
    githubStats.watchers = repoInfo.watchers_count || 0;
    githubStats.issues = repoInfo.open_issues_count || 0;
    githubStats.size = repoInfo.size || 0;
    githubStats.lastUpdated = repoInfo.updated_at || '';

    // Fetch commit count
    const commitsResult = await fetchJsonWithRetry(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`);
    const commitsLinkHeader = commitsResult.headers.get('Link');
    if (commitsLinkHeader) {
      const match = commitsLinkHeader.match(/page=(\d+)>; rel="last"/);
      githubStats.commits = match ? parseInt(match[1], 10) : 1;
    } else {
      githubStats.commits = Array.isArray(commitsResult.data) ? commitsResult.data.length : 1;
    }

    // Fetch user repos count
    const userResult = await fetchJsonWithRetry(`https://api.github.com/users/${username}`);
    githubStats.repos = userResult.data.public_repos || 0;

    // Fetch contributors count
    const contributorsResult = await fetchJsonWithRetry(`https://api.github.com/repos/${username}/${repoName}/contributors?per_page=1`);
    const contributorsLinkHeader = contributorsResult.headers.get('Link');
    if (contributorsLinkHeader) {
      const match = contributorsLinkHeader.match(/page=(\d+)>; rel="last"/);
      githubStats.contributors = match ? parseInt(match[1], 10) : 1;
    } else {
      githubStats.contributors = Array.isArray(contributorsResult.data) ? contributorsResult.data.length : 1;
    }

    // Fetch branches count
    const branchesResult = await fetchJsonWithRetry(`https://api.github.com/repos/${username}/${repoName}/branches?per_page=1`);
    const branchesLinkHeader = branchesResult.headers.get('Link');
    if (branchesLinkHeader) {
      const match = branchesLinkHeader.match(/page=(\d+)>; rel="last"/);
      githubStats.branches = match ? parseInt(match[1], 10) : 1;
    } else {
      githubStats.branches = Array.isArray(branchesResult.data) ? branchesResult.data.length : 1;
    }

    console.log('Final GitHub stats:', githubStats);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    applyGitHubFallback('API limit hit. Showing fallback snapshot.');
    showToast('GitHub API limit hit. Showing fallback snapshot.', 'warning');
  }
}

function typeEffect() {
  if (!terminalElement) {
    terminalElement = document.getElementById('terminalText');
  }
  if (!terminalElement) return;

  if (msgIndex < messages.length) {
    if (charPos < messages[msgIndex].length) {
      terminalElement.innerHTML += messages[msgIndex].charAt(charPos);
      charPos++;
      setTimeout(typeEffect, 30);
    } else {
      terminalElement.innerHTML += '<br>';
      msgIndex++;
      charPos = 0;
      setTimeout(typeEffect, 400);
    }
  } else {
    showStats();
  }
}

function showStats() {
  updateStatCapsule();
}


// Animated Counter
function animateCounter(element, start, end, duration, isPercentage = true) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      element.textContent = isPercentage ? end + '%' : end;
      clearInterval(timer);
    } else {
      element.textContent = isPercentage ? Math.floor(current) + '%' : Math.floor(current);
    }
  }, 16);
}

// Sparkle Effect
function createSparkle(barElement) {
  const canvas = document.getElementById('sparkleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const rect = barElement.getBoundingClientRect();
  const containerRect = canvas.parentElement.getBoundingClientRect();

  const particles = [];
  const particleCount = 15;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: rect.right - containerRect.left,
      y: rect.top - containerRect.top + rect.height / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      size: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 60 + 160}, 100%, 50%)`
    });
  }

  function animateSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let hasAlive = false;
    particles.forEach(p => {
      if (p.life > 0) {
        hasAlive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.1; // gravity

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (hasAlive) {
      requestAnimationFrame(animateSparkles);
    }
  }

  animateSparkles();
}

/**
 * Stat Capsule Logic - Stitch Edition
 * High-fidelity HUD metrics and SVG Sparkline engine.
 */

function drawSparkline(containerId, data, color) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.offsetWidth || 100;
  const height = 20; // Fixed height for sparklines
  const padding = 2;
  
  const maxValue = Math.max(...data, 10);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (val / maxValue) * (height - padding * 2) - padding;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  
  container.innerHTML = `
    <svg width="${width}" height="${height}" class="sparkline-svg">
      <path d="${pathData}" stroke="${color}" />
    </svg>
  `;
}

function updateStatCapsule() {
  const commitVal = document.getElementById('val-commits');
  const starVal = document.getElementById('val-stars');
  const langVal = document.getElementById('val-lang');
  const langBar = document.getElementById('val-lang-bar');

  if (commitVal) animateCounter(commitVal, 0, githubStats.commits, 1500, false);
  if (starVal) animateCounter(starVal, 0, githubStats.stars, 1500, false);
  
  // Highlight Top Language
  const topLang = repoData[2] > repoData[0] && repoData[2] > repoData[1] ? 'JS' : 
                   repoData[1] > repoData[0] ? 'CSS' : 'HTML';
  if (langVal) langVal.textContent = `${topLang} ${Math.max(...repoData)}%`;
  if (langBar) langBar.style.width = `${Math.max(...repoData)}%`;

  // Draw Sparklines for Commits and Stars
  drawSparkline('spark-commits', generateTrend(githubStats.commits, 8), '#ffffff');
  drawSparkline('spark-stars', generateTrend(githubStats.stars, 8), '#ffffff');
}


// Generate trend data (simulate growth)
function generateTrend(finalValue, points) {
  const trend = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const variance = Math.random() * 0.2 - 0.1; // ±10% variance
    const value = Math.round(finalValue * progress * (1 + variance));
    trend.push(Math.max(0, value));
  }
  trend[points - 1] = finalValue; // Ensure last value is exact
  return trend;
}

window.addEventListener('load', () => {
  fetchGitHubStats().then(() => {
    // Stats fetched, ready to display when tab opens
  });

  // Initialize element references
  terminalElement = document.getElementById('terminalText');
  statsGrid = document.getElementById('statsGrid');
});

// Skills animation using native IntersectionObserver
function initSkillBars() {
  const skillCards = document.querySelectorAll('.skill-card');
  if (!skillCards.length) return;

  if (!('IntersectionObserver' in window) || window.innerWidth <= 768) {
    skillCards.forEach((card) => {
      const progressBar = card.querySelector('.skill-progress');
      if (!progressBar) return;
      const targetWidth = progressBar.getAttribute('data-progress') || '0';
      progressBar.style.width = `${targetWidth}%`;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const progressBar = card.querySelector('.skill-progress');
      if (progressBar) {
        const targetWidth = progressBar.getAttribute('data-progress') || '0';
        progressBar.style.width = `${targetWidth}%`;
      }
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      observer.unobserve(card);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  skillCards.forEach((card) => observer.observe(card));
}

// ========================================
// LAZY LOADING IMAGES
// ========================================
const lazyImages = document.querySelectorAll('img[loading="lazy"]');

const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add('loaded');
      observer.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));

// 3D and HUD classes are loaded from modules/*.js before this file.

// ========================================
// CORE INITIALIZER
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('SYSTEM_UPLINK: Initializing neural grid...');
  try {
    // 1. Core Background Environment (Highest Priority)
    if (typeof GalaxyBackground === 'function') {
      window.galaxy = new GalaxyBackground();
      console.log('GALAXY_CORE: Active');
    }

    // 2. Data Rendering
    renderProjectCards();
    initSkillBars();
    
    // 3. 3D Module Injection
    if (typeof NeuralGrid3D === 'function') new NeuralGrid3D();
    if (typeof ProjectVault3DModel === 'function') new ProjectVault3DModel();
    if (typeof HUDCursor === 'function') new HUDCursor();
    
    console.log('SYSTEM_BOOT: All modules synchronized.');
  } catch (e) {
    console.error('CRITICAL_BOOT_FAILURE:', e);
  }
});
