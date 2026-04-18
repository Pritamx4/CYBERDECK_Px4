console.log('Script loaded!');

// Loading Screen Terminal Lines
const terminalLines = [
  '> $ git clone Pritamx4/CYBERDECK_Px4',
  '> COMPILING SOURCE [██████████████] 100%',
  '> DEPLOYING TO CYBERDECK_PX4...'
];

function showLoadingScreen() {
  const terminalOutput = document.getElementById('terminalOutput');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressContainer = document.querySelector('.progress-container');

  if (!terminalOutput || !progressBar || !progressText || !progressContainer) {
    console.error('Loading screen elements not found');
    hideLoadingScreen();
    return;
  }

  console.log('Loading screen started');

  progressContainer.style.display = 'none';
  progressText.style.display = 'none';

  setTimeout(() => {
    console.log('Starting terminal typing');
    let lineIndex = 0;

    function typeNextLine() {
      if (lineIndex < terminalLines.length) {
        const line = document.createElement('div');
        line.className = 'line';
        terminalOutput.appendChild(line);

        let charIndex = 0;
        const currentText = terminalLines[lineIndex];

        function typeCharacter() {
          if (charIndex < currentText.length) {
            line.textContent += currentText.charAt(charIndex);
            try { playTypingSound(); } catch (e) { }
            charIndex++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(typeCharacter, 25);
          } else {
            lineIndex++;
            setTimeout(typeNextLine, 150);
          }
        }
        typeCharacter();
      } else {
        console.log('All lines typed, clearing...');
        setTimeout(() => {
          terminalOutput.innerHTML = '';
          setTimeout(() => {
            const accessLine = document.createElement('div');
            accessLine.className = 'line access-granted';
            terminalOutput.appendChild(accessLine);

            let accessCharIndex = 0;
            const accessText = '> ACCESS GRANTED..';

            function typeAccessChar() {
              if (accessCharIndex < accessText.length) {
                accessLine.textContent += accessText.charAt(accessCharIndex);
                try { playTypingSound(); } catch (e) { }
                accessCharIndex++;
                setTimeout(typeAccessChar, 40);
              } else {
                console.log('Starting progress bar');
                setTimeout(() => {
                  progressContainer.style.display = 'block';
                  progressText.style.display = 'block';

                  const progressDuration = 1200;
                  const startTime = performance.now();

                  function updateProgress(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progressPercent = Math.min((elapsed / progressDuration) * 100, 100);

                    progressBar.style.width = progressPercent + '%';
                    progressText.textContent = Math.floor(progressPercent) + '%';

                    if (progressPercent < 100) {
                      requestAnimationFrame(updateProgress);
                    } else {
                      console.log('Loading complete');
                      setTimeout(hideLoadingScreen, 200);
                    }
                  }
                  requestAnimationFrame(updateProgress);
                }, 400);
              }
            }
            typeAccessChar();
          }, 200);
        }, 400);
      }
    }
    typeNextLine();
  }, 1000);
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
      document.body.style.overflow = 'auto';
      animateNavbarEntry();
    }, 600);
  }
}

// Navbar Entry Fallback (Native JS)
function animateNavbarEntry() {
  const navbarLogo = document.getElementById('navbarLogo');
  const navItems = document.querySelectorAll('.nav-item');

  if (navbarLogo) {
    navbarLogo.style.transition = 'all 0.8s ease-out';
    navbarLogo.style.opacity = '1';
    navbarLogo.style.transform = 'translateY(0)';
  }

  navItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.transition = 'all 0.5s ease-out';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 300 + (index * 100));
  });
}

// Sound System
let audioContext;
let soundEnabled = true;

function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

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

function playTypingSound() { createSound(600, 'square', 0.08, 0.08); }
function playHoverSound() { createSound(400, 'square', 0.05, 0.05); }
function playDataGlitch() {
  createSound(150, 'sawtooth', 0.1, 0.1);
  setTimeout(() => createSound(300, 'square', 0.05, 0.15), 50);
  setTimeout(() => createSound(100, 'sawtooth', 0.2, 0.08), 100);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    soundEnabled = !soundEnabled;
    showToast(soundEnabled ? 'Sound ON' : 'Sound OFF', 'info');
  }
});

console.log('Setting up window load event');

// Make sure loading starts even if images fail to load
let loadingStarted = false;

window.addEventListener('load', () => {
  if (loadingStarted) return;
  loadingStarted = true;
  console.log('Window loaded!');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    console.log('Calling showLoadingScreen');
    showLoadingScreen();
  }, 100);
});

// Fallback in case load event doesn't fire
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!loadingStarted) {
      loadingStarted = true;
      console.log('DOMContentLoaded fallback triggered');
      document.body.style.overflow = 'hidden';
      showLoadingScreen();
    }
  }, 500);

  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => link.addEventListener('mouseenter', playHoverSound));
});

// Initialize EmailJS
(function () {
  if (window.emailjs) {
    emailjs.init("glYVjrgq1NH52F9M2");
  }
})();

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

// Mobile Menu (native)
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const menuIcon = document.querySelector('.menu-icon');
  if (!navLinks || !menuIcon) return;

  const isOpen = navLinks.classList.toggle('show');
  menuIcon.classList.toggle('active', isOpen);
  menuIcon.setAttribute('aria-expanded', String(isOpen));
}

function handleMenuKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleMenu();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('#navLinks a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      if (navLinks.classList.contains('show')) toggleMenu();
    });
  });
});

// Hero Section logic (if any needed)

// Contact Message Functionality (Fusion Grid)
const sendBtn = document.querySelector('.send-btn');
const messageInput = document.querySelector('.message-input');

if (sendBtn && messageInput) {
  sendBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const message = messageInput.value.trim();

    if (!message) {
      showToast('Please enter a message first!', 'warning');
      return;
    }

    if (message.length < 5) { // Reduced min length for better UX
      showToast('Message too short!', 'warning');
      return;
    }

    if (!window.emailjs) {
      showToast('Service unavailable.', 'error');
      return;
    }

    // Disable button during send
    sendBtn.disabled = true;
    // Disabled icon spin logic (FontAwesome removed)

    const templateParams = {
      message: message,
      from_name: 'Portfolio Visitor',
      to_name: 'Pritam Singh'
    };

    try {
      await emailjs.send('Pritamx4', 'Pritamx4', templateParams);
      showToast('✓ Signal synchronized. Message sent.', 'success');
      messageInput.value = '';
    } catch (error) {
      console.error('FAILED...', error);
      showToast('✗ Signal lost. Please try again.', 'error');
    } finally {
      sendBtn.disabled = false;
    }
  });

  // Allow 'Enter' key to send
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });
}

// Active Navigation Indicator
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${sectionId}`) {
          item.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav(); // Call on page load

let hideTimeout;
let hasShownOnce = false;
let isBottomTabOpen = false;

function toggleBottomTab() {
  const tab = document.getElementById('bottomTab');
  const icon = document.getElementById('toggleIcon');
  const toggleButton = document.querySelector('.tab-toggle');
  if (!tab) return;

  clearTimeout(hideTimeout);
  isBottomTabOpen = !isBottomTabOpen;
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', String(isBottomTabOpen));
  }

  if (isBottomTabOpen) {
    tab.classList.add('open');
    if (toggleButton) {
      toggleButton.style.transform = 'translateX(-50%) rotate(180deg)';
    }

    // Start typing effect only on first show
    if (!hasShownOnce) {
      setTimeout(() => {
        typeEffect();
      }, 500);
      hasShownOnce = true;
    }
  } else {
    tab.classList.remove('open');
    if (toggleButton) {
      toggleButton.style.transform = 'translateX(-50%) rotate(0deg)';
    }
  }
}

// Initialize bottom tab event listeners after DOM loads
function initBottomTabEvents() {
  const bottomTab = document.getElementById('bottomTab');

  if (bottomTab) {
    bottomTab.addEventListener('mouseenter', () => {
      if (isBottomTabOpen) {
        clearTimeout(hideTimeout);
      }
    });

    bottomTab.addEventListener('mouseleave', () => {
      if (isBottomTabOpen) {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          if (isBottomTabOpen) {
            toggleBottomTab();
          }
        }, 3000); // Reduced to 3 seconds after mouse leaves
      }
    });
  }
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

async function fetchGitHubStats() {
  try {
    const username = 'Pritamx4';
    const repoName = 'CYBERDECK_Px4';

    console.log('Fetching GitHub stats...');

    // Fetch language stats
    const langResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/languages`);
    if (langResponse.ok) {
      const data = await langResponse.json();
      console.log('Language data:', data);
      const totalBytes = Object.values(data).reduce((a, b) => a + b, 0);
      if (totalBytes > 0) {
        repoData = [
          Math.round(((data.HTML || 0) / totalBytes) * 100),
          Math.round(((data.CSS || 0) / totalBytes) * 100),
          Math.round(((data.JavaScript || 0) / totalBytes) * 100),
        ];
      }
    }

    // Fetch repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
    if (repoResponse.ok) {
      const repoInfo = await repoResponse.json();
      console.log('Repo info:', repoInfo);
      githubStats.stars = repoInfo.stargazers_count || 0;
      githubStats.forks = repoInfo.forks_count || 0;
      githubStats.watchers = repoInfo.watchers_count || 0;
      githubStats.issues = repoInfo.open_issues_count || 0;
      githubStats.size = repoInfo.size || 0; // in KB
      githubStats.lastUpdated = repoInfo.updated_at || '';
    }

    // Fetch commit count
    const commitsResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`);
    if (commitsResponse.ok) {
      const linkHeader = commitsResponse.headers.get('Link');
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        githubStats.commits = match ? parseInt(match[1]) : 1;
      } else {
        githubStats.commits = 1;
      }
    }

    // Fetch user repos count
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (userResponse.ok) {

      const userData = await userResponse.json();
      githubStats.repos = userData.public_repos || 0;
    }

    // Fetch contributors count
    const contributorsResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/contributors?per_page=1`);
    if (contributorsResponse.ok) {
      const linkHeader = contributorsResponse.headers.get('Link');
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        githubStats.contributors = match ? parseInt(match[1]) : 1;
      } else {
        const contributors = await contributorsResponse.json();
        githubStats.contributors = contributors.length;
      }
    }

    // Fetch branches count
    const branchesResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/branches?per_page=1`);
    if (branchesResponse.ok) {
      const linkHeader = branchesResponse.headers.get('Link');
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        githubStats.branches = match ? parseInt(match[1]) : 1;
      } else {
        const branches = await branchesResponse.json();
        githubStats.branches = branches.length;
      }
    }

    console.log('Final GitHub stats:', githubStats);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    console.warn('Using fallback data due to:', error.message);
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
  if (!statsGrid) {
    statsGrid = document.getElementById('statsGrid');
  }
  if (!statsGrid) return;

  statsGrid.style.opacity = '1';
  statsGrid.style.transition = 'opacity 1s ease';

  setTimeout(() => {
    // Animate language bars
    const htmlBar = document.querySelector('[data-lang="html"]');
    const cssBar = document.querySelector('[data-lang="css"]');
    const jsBar = document.querySelector('[data-lang="js"]');

    const htmlPercent = document.getElementById('htmlPercent');
    const cssPercent = document.getElementById('cssPercent');
    const jsPercent = document.getElementById('jsPercent');

    if (htmlBar && htmlPercent) {
      htmlBar.style.width = repoData[0] + '%';
      animateCounter(htmlPercent, 0, repoData[0], 1000);
      setTimeout(() => createSparkle(htmlBar), 1000);
    }

    if (cssBar && cssPercent) {
      cssBar.style.width = repoData[1] + '%';
      animateCounter(cssPercent, 0, repoData[1], 1000);
      setTimeout(() => createSparkle(cssBar), 1000);
    }

    if (jsBar && jsPercent) {
      jsBar.style.width = repoData[2] + '%';
      animateCounter(jsPercent, 0, repoData[2], 1000);
      setTimeout(() => createSparkle(jsBar), 1000);
    }

    // Animate GitHub stats
    setTimeout(() => {
      const commitEl = document.getElementById('commitCount');
      const repoEl = document.getElementById('repoCount');
      const starEl = document.getElementById('starCount');
      const forkEl = document.getElementById('forkCount');
      const watcherEl = document.getElementById('watcherCount');
      const issueEl = document.getElementById('issueCount');
      const contributorEl = document.getElementById('contributorCount');
      const sizeEl = document.getElementById('repoSize');
      const updatedEl = document.getElementById('lastUpdated');
      const branchEl = document.getElementById('branchCount');

      if (commitEl) animateCounter(commitEl, 0, githubStats.commits, 1500, false);
      if (repoEl) animateCounter(repoEl, 0, githubStats.repos, 1500, false);
      if (starEl) animateCounter(starEl, 0, githubStats.stars, 1500, false);
      if (forkEl) animateCounter(forkEl, 0, githubStats.forks, 1500, false);
      if (watcherEl) animateCounter(watcherEl, 0, githubStats.watchers, 1500, false);
      if (issueEl) animateCounter(issueEl, 0, githubStats.issues, 1500, false);
      if (contributorEl) animateCounter(contributorEl, 0, githubStats.contributors, 1500, false);
      if (branchEl) animateCounter(branchEl, 0, githubStats.branches, 1500, false);

      // Format size
      if (sizeEl) {
        const sizeMB = (githubStats.size / 1024).toFixed(2);
        sizeEl.textContent = githubStats.size > 1024 ? sizeMB + ' MB' : githubStats.size + ' KB';
      }

      // Format last updated
      if (updatedEl && githubStats.lastUpdated) {
        const date = new Date(githubStats.lastUpdated);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        updatedEl.textContent = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }

      // Draw stats chart
      drawStatsChart();
    }, 500);
  }, 500);
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

// Draw Stats Chart
function drawStatsChart() {
  const canvas = document.getElementById('statsChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Chart settings
  const padding = { top: 30, right: 140, bottom: 50, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Stats data with trends (simulated over 5 points)
  const stats = [
    {
      label: 'Commits',
      color: '#00fff7',
      values: generateTrend(githubStats.commits, 5)
    },
    {
      label: 'Stars',
      color: '#ff4ddb',
      values: generateTrend(githubStats.stars, 5)
    },
    {
      label: 'Forks',
      color: '#00ff88',
      values: generateTrend(githubStats.forks, 5)
    },
    {
      label: 'Watchers',
      color: '#ffd700',
      values: generateTrend(githubStats.watchers, 5)
    },
    {
      label: 'Issues',
      color: '#ff6b6b',
      values: generateTrend(githubStats.issues, 5)
    },
    {
      label: 'Contributors',
      color: '#a78bfa',
      values: generateTrend(githubStats.contributors, 5)
    }
  ];

  // Find max value for scaling
  const allValues = stats.flatMap(s => s.values);
  const maxValue = Math.max(...allValues, 10);

  // Draw grid
  ctx.strokeStyle = 'rgba(0, 255, 247, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Draw vertical grid
  for (let i = 0; i <= 4; i++) {
    const x = padding.left + (chartWidth / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();
  }

  // Draw lines for each stat
  stats.forEach((stat, index) => {
    ctx.strokeStyle = stat.color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = stat.color;

    ctx.beginPath();
    stat.values.forEach((value, i) => {
      const x = padding.left + (chartWidth / (stat.values.length - 1)) * i;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw points
    stat.values.forEach((value, i) => {
      const x = padding.left + (chartWidth / (stat.values.length - 1)) * i;
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

      ctx.fillStyle = stat.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = stat.color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;

    // Draw legend
    const legendY = padding.top + index * 35;
    const legendX = padding.left + chartWidth + 20;

    // Legend line
    ctx.strokeStyle = stat.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 20, legendY);
    ctx.stroke();

    // Legend circle
    ctx.fillStyle = stat.color;
    ctx.beginPath();
    ctx.arc(legendX + 10, legendY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legend text
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 13px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText(stat.label, legendX + 25, legendY + 5);

    // Current value
    ctx.font = '11px Courier New';
    ctx.fillText(stat.values[stat.values.length - 1], legendX + 25, legendY + 20);
  });

  // Draw axes labels
  ctx.fillStyle = 'rgba(0, 255, 247, 0.6)';
  ctx.font = '12px Courier New';
  ctx.textAlign = 'center';

  // X-axis labels
  const labels = ['Start', 'Q1', 'Q2', 'Q3', 'Now'];
  labels.forEach((label, i) => {
    const x = padding.left + (chartWidth / (labels.length - 1)) * i;
    ctx.fillText(label, x, height - 15);
  });

  // Y-axis label
  ctx.save();
  ctx.translate(20, padding.top + chartHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('Activity', 0, 0);
  ctx.restore();
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
  initBottomTabEvents();

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
// MATRIX RAIN EFFECT
// ========================================
function initMatrixRain() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00fff7';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = matrix.charAt(Math.floor(Math.random() * matrix.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 35);

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ========================================
// GLITCH EFFECT ON TYPEWRITER
// ========================================
// Glitch logic removed (replaced by high-fidelity CSS animations)

// ========================================
// PARALLAX SCROLL EFFECT
// ========================================
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;

      // Parallax logic for legacy hero removed to support grid stability
      // const heroSection = document.querySelector('.hero-section');
      // if (heroSection) {
      //   heroSection.style.transform = `translateY(${scrolled * 0.4}px)`;
      // }

      // Parallax for matrix canvas
      const matrixCanvas = document.getElementById('matrixCanvas');
      if (matrixCanvas) {
        matrixCanvas.style.transform = `translateY(${scrolled * 0.3}px)`;
      }

      // Parallax for cubes
      const cubes = document.querySelectorAll('.cube');
      cubes.forEach((cube, index) => {
        const speed = 0.15 + (index * 0.05);
        cube.style.transform = `translateY(${scrolled * speed}px) rotateX(${scrolled * 0.05}deg) rotateY(${scrolled * 0.05}deg)`;
      });

      ticking = false;
    });

    ticking = true;
  }
});

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

// ========================================
// 7. 3D MODULE - GLOBAL_PARTICLES (ENVIRONMENT)
// ========================================

class GlobalParticles {
  constructor() {
    this.container = document.getElementById('global-particles-backdrop');
    if (!this.container) return;

    this.isMobile = window.innerWidth <= 768;
    this.isVisible = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.init();
    this.setupVisibilityObserver();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Optimization: Cap pixel ratio on mobile to prevent GPU lag
    const maxDPR = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.container.appendChild(this.renderer.domElement);

    this.createParticles();
    this.camera.position.z = 20;

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  setupVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  createParticles() {
    // Optimization: Adaptive density for mobile
    const particleCount = this.isMobile ? 150 : 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: this.isMobile ? 0.06 : 0.04,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isVisible) return; // Optimization: Stop render if hidden

    this.particles.rotation.y += 0.0005;
    this.particles.rotation.z += 0.0002;
    this.renderer.render(this.scene, this.camera);
  }
}

// ========================================
// 8. 3D MODULE - NEURAL_CORE_PX4 (LOCAL)
// ========================================

class NeuralCore3D {
  constructor() {
    this.container = document.getElementById('neural-canvas-container');
    if (!this.container) return;

    this.isMobile = window.innerWidth <= 768;
    this.isVisible = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;

    // VFX & Kinetic States
    this.pulses = [];
    this.nodes = [];
    this.boostPower = 0;
    this.lastPulseTime = 0;

    this.init();
    this.setupVisibilityObserver();
  }

  init() {
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    const maxDPR = this.isMobile ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.container.appendChild(this.renderer.domElement);

    this.createCore();
    this.createNodes();

    this.camera.position.z = 10;
    this.onResize();
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onResize());

    this.animate();
  }

  setupVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  createCore() {
    this.group = new THREE.Group();

    // Inner Core
    const innerGeo = new THREE.IcosahedronGeometry(1.5, 1);
    this.innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.innerMesh = new THREE.Mesh(innerGeo, this.innerMat);
    this.group.add(this.innerMesh);

    // Outer Shell
    const outerGeo = new THREE.IcosahedronGeometry(2, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x7A00FF,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    this.outerMesh = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outerMesh);

    // Floating Px4 Logo
    const loader = new THREE.TextureLoader();
    loader.load('images/px4 main logo.svg', (texture) => {
      const logoGeo = new THREE.PlaneGeometry(1.5, 1.5);
      const logoMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });
      this.logoMesh = new THREE.Mesh(logoGeo, logoMat);
      this.group.add(this.logoMesh);
    });

    this.scene.add(this.group);
  }

  createNodes() {
    const skillIcons = [
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg',
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg'
    ];

    const loader = new THREE.TextureLoader();

    // Optimization: Filter nodes if on low-end
    const iconsToRender = this.isMobile ? skillIcons.slice(0, 8) : skillIcons;

    iconsToRender.forEach((url, i) => {
      loader.load(url, (texture) => {
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.9, 0.9, 0.9);

        const radius = this.isMobile ? (8 + Math.random() * 6) : (10 + Math.random() * 12);
        const speed = 0.002 + Math.random() * 0.006;
        const angle = (i / iconsToRender.length) * Math.PI * 2;
        const verticalOffset = (Math.random() - 0.5) * (this.isMobile ? 5 : 8);

        this.scene.add(sprite);
        this.nodes.push({
          sprite,
          url,
          orbit: { angle, radius, speed, verticalOffset }
        });
      });
    });
  }

  createPulse(startPos) {
    const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const headMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 1 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.copy(startPos);
    this.scene.add(head);

    const trail = [];
    const trailCount = this.isMobile ? 4 : 8; // Optimization: Shorter trails on mobile
    for (let i = 0; i < trailCount; i++) {
      const tGeo = new THREE.SphereGeometry(0.1 - (i * 0.012), 4, 4);
      const tMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6 - (i * 0.07)
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.position.copy(startPos);
      this.scene.add(tMesh);
      trail.push(tMesh);
    }

    this.pulses.push({
      head: head,
      trail: trail,
      target: this.group.position,
      speed: 0.05 + Math.random() * 0.05,
      positions: Array(trailCount).fill().map(() => startPos.clone())
    });
  }

  updatePulses() {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i];
      p.positions.unshift(p.head.position.clone());
      p.positions.pop();
      p.head.position.lerp(p.target, p.speed);
      p.trail.forEach((tMesh, idx) => {
        tMesh.position.copy(p.positions[idx]);
      });

      if (p.head.position.distanceTo(p.target) < 0.3) {
        this.scene.remove(p.head);
        p.trail.forEach(t => this.scene.remove(t));
        this.pulses.splice(i, 1);
        this.triggerBoost();
      }
    }

    if (Date.now() - this.lastPulseTime > 1500 && this.nodes.length > 3) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      this.createPulse(randomNode.sprite.position);
      this.lastPulseTime = Date.now();
    }
  }

  triggerBoost() {
    this.boostPower = 1.0;
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left - rect.width / 2) / 100;
    this.mouseY = (e.clientY - rect.top - rect.height / 2) / 100;
  }

  onResize() {
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    if (width === 0 || height === 0) return;

    this.isMobile = window.innerWidth <= 768;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (width > 1024) {
      this.group.position.x = 3.5;
      this.group.position.y = 0;
      this.camera.position.z = 10;
    } else {
      this.group.position.x = 0;
      this.group.position.y = 1.8;
      this.camera.position.z = 14;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isVisible) return; // Optimization: Stop render if hidden

    this.nodes.forEach(node => {
      node.orbit.angle += node.orbit.speed;
      node.sprite.position.x = Math.cos(node.orbit.angle) * node.orbit.radius;
      node.sprite.position.z = Math.sin(node.orbit.angle) * node.orbit.radius;
      node.sprite.position.y = node.orbit.verticalOffset + Math.sin(node.orbit.angle * 0.5) * 2;
    });

    this.innerMesh.rotation.y += 0.005;
    this.outerMesh.rotation.y -= 0.002;
    if (this.logoMesh) this.logoMesh.rotation.y += 0.005;

    this.targetRotationX += (this.mouseY - this.targetRotationX) * 0.05;
    this.targetRotationY += (this.mouseX - this.targetRotationY) * 0.05;
    this.group.rotation.x = this.targetRotationX;
    this.group.rotation.y = this.targetRotationY;

    this.updatePulses();

    if (this.boostPower > 0) {
      const scale = 1.0 + (this.boostPower * 0.3);
      this.group.scale.set(scale, scale, scale);
      this.innerMat.opacity = 0.3 + (this.boostPower * 0.6);
      this.boostPower *= 0.94;
    } else {
      this.group.scale.set(1, 1, 1);
      this.innerMat.opacity = 0.3;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ========================================
// 9. HUD_INTERFACE MODULE
// ========================================

class HUDCursor {
  constructor() {
    this.cursor = document.getElementById('hud-cursor');
    if (!this.cursor) return;

    this.dot = this.cursor.querySelector('.cursor-dot');
    this.coordsX = this.cursor.querySelector('.x');
    this.coordsY = this.cursor.querySelector('.y');

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.delayedPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    this.size = { w: 40, h: 40 };
    this.delayedSize = { w: 40, h: 40 };

    this.lerpAmount = 0.15;
    this.isLocked = false;
    this.lockTarget = null;
    this.hideTimeout = null;

    this.init();
  }

  init() {
    const updatePosition = (x, y) => {
      if (!this.isLocked) {
        this.pos.x = x;
        this.pos.y = y;
      }
      this.cursor.classList.add('active');
      this.resetHideTimeout();

      if (this.coordsX) this.coordsX.textContent = Math.round(x).toString().padStart(3, '0');
      if (this.coordsY) this.coordsY.textContent = Math.round(y).toString().padStart(3, '0');
    };

    // Mouse Listeners
    window.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));

    // Touch Listeners for Mobile Compatibility
    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    });

    window.addEventListener('mousedown', () => {
      this.cursor.classList.add('click-pulse');
      setTimeout(() => this.cursor.classList.remove('click-pulse'), 400);
    });

    window.addEventListener('resize', () => {
      if (this.isLocked && this.lockTarget) {
        this.lockOn(this.lockTarget);
      }
    });

    this.addInteractions();
    this.animate();
  }

  resetHideTimeout() {
    clearTimeout(this.hideTimeout);
    // On mobile, hide cursor after 3s of inactivity to keep space clean
    if (window.innerWidth <= 768) {
      this.hideTimeout = setTimeout(() => {
        if (!this.isLocked) this.cursor.classList.remove('active');
      }, 3000);
    }
  }

  lockOn(el) {
    const rect = el.getBoundingClientRect();
    const padding = 12;
    this.isLocked = true;
    this.lockTarget = el;
    this.cursor.classList.add('locked', 'active');
    this.pos.x = rect.left + rect.width / 2;
    this.pos.y = rect.top + rect.height / 2;
    this.size.w = rect.width + padding * 2;
    this.size.h = rect.height + padding * 2;
    this.resetHideTimeout();
  }

  unlock() {
    this.isLocked = false;
    this.lockTarget = null;
    this.cursor.classList.remove('locked');
    this.size.w = 40;
    this.size.h = 40;
    this.resetHideTimeout();
  }

  addInteractions() {
    const interactables = document.querySelectorAll('a, button, .project-card, .social-item, .tab-toggle, .skill-card, .btn-sleek, .btn-outline');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => this.lockOn(el));
      el.addEventListener('mouseleave', () => this.unlock());
      // For mobile: trigger lock on tap
      el.addEventListener('touchstart', () => this.lockOn(el));
    });
  }

  animate() {
    this.delayedPos.x += (this.pos.x - this.delayedPos.x) * this.lerpAmount;
    this.delayedPos.y += (this.pos.y - this.delayedPos.y) * this.lerpAmount;
    this.delayedSize.w += (this.size.w - this.delayedSize.w) * this.lerpAmount;
    this.delayedSize.h += (this.size.h - this.delayedSize.h) * this.lerpAmount;

    this.cursor.style.left = `${this.delayedPos.x}px`;
    this.cursor.style.top = `${this.delayedPos.y}px`;
    this.cursor.style.width = `${this.delayedSize.w}px`;
    this.cursor.style.height = `${this.delayedSize.h}px`;

    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// 10. PROJECT_VAULT_3D MODULE (ORBITAL MAP)
// ========================================

// ========================================
// 10. PROJECT_VAULT_3D MODULE (ORBITAL MAP)
// ========================================

class ProjectVault3D {
  constructor() {
    this.container = document.getElementById('project-canvas-container');
    this.projectSection = document.getElementById('section-projects');
    if (!this.container || !this.projectSection) return;

    this.projectsData = this.extractProjectData();
    this.isMobile = window.innerWidth <= 768;
    this.isVisible = false;
    this.isDragging = false;
    this.rotationEnabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.container.offsetWidth / this.container.offsetHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    this.shards = [];
    this.labels = [];
    this.pulses = [];
    this.latticeLines = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
    this.setupVisibilityObserver();
    this.setupDetailOverlay();
  }

  extractProjectData() {
    const cards = document.querySelectorAll('.project-card');
    const data = Array.from(cards).map((card, index) => {
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      const img = card.querySelector('img');
      const links = card.querySelectorAll('.links a');

      return {
        id: index,
        title: (h3 && h3.textContent) ? h3.textContent.trim() : `MODULE_${index + 1}`,
        description: (p && p.textContent) ? p.textContent.trim() : 'Neural link active. Data stream stabilized.',
        img: img ? img.getAttribute('src') : 'images/fallback.png',
        codeLink: (links[0] && links[0].href) ? links[0].href : '#',
        liveLink: (links[1] && links[1].href) ? links[1].href : '#'
      };
    });
    console.table(data);
    return data;
  }

  createLabelTexture(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 24px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(text.toUpperCase(), 128, 32);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < canvas.height; i += 4) {
      ctx.fillRect(0, i, canvas.width, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  init() {
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    const maxDPR = this.isMobile ? 1 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 150, 50);
    pointLight.position.set(0, 10, 10);
    this.scene.add(pointLight);

    this.createCore();
    this.createProjectShards();
    this.createLattice();

    this.camera.position.z = this.isMobile ? 25 : 22;

    window.addEventListener('resize', () => this.onResize());
    this.container.addEventListener('click', (e) => this.onClick(e));
    this.container.addEventListener('mousemove', (e) => this.onHover(e));

    let prevMouseX = 0;
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      prevMouseX = e.clientX;
    });
    window.addEventListener('mouseup', () => this.isDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = (e.clientX - prevMouseX) * 0.005;
        this.group.rotation.y += deltaX;
        prevMouseX = e.clientX;
      }
    });

    this.projectSection.classList.add('orbital-active');
    this.animate();

    setInterval(() => this.spawnPulse(), 2000);
  }

  setupVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      this.isVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(this.container);
  }

  createCore() {
    this.group = new THREE.Group();
    this.coreGroup = new THREE.Group();

    const geo1 = new THREE.IcosahedronGeometry(2.5, 0);
    const mat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      wireframe: true,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.5
    });
    this.coreOuter = new THREE.Mesh(geo1, mat1);
    this.coreGroup.add(this.coreOuter);

    const geo2 = new THREE.OctahedronGeometry(1.5, 0);
    const mat2 = new THREE.MeshStandardMaterial({
      color: 0xCCFF00,
      wireframe: true,
      emissive: 0xCCFF00,
      emissiveIntensity: 0.8
    });
    this.coreInner = new THREE.Mesh(geo2, mat2);
    this.coreGroup.add(this.coreInner);

    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) { pPos[i] = (Math.random() - 0.5) * 2; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.05, transparent: true, opacity: 0.8 });
    this.coreParticles = new THREE.Points(pGeo, pMat);
    this.coreGroup.add(this.coreParticles);

    this.group.add(this.coreGroup);
    this.scene.add(this.group);
  }

  createProjectShards() {
    const loader = new THREE.TextureLoader();
    const count = this.projectsData.length;

    this.projectsData.forEach((data, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = this.isMobile ? 12 : 16;
      const geometry = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 6);

      loader.load(data.img, (texture) => {
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.5, wireframe: true }),
          new THREE.MeshStandardMaterial({ map: texture, transparent: true, opacity: 0.9 }),
          new THREE.MeshStandardMaterial({ color: 0x111111 })
        ];

        const shard = new THREE.Mesh(geometry, materials);
        shard.rotation.x = Math.PI / 2;
        shard.position.x = Math.cos(angle) * radius;
        shard.position.z = Math.sin(angle) * radius;
        shard.position.y = (Math.random() - 0.5) * 6;

        shard.userData = data;
        shard.userData.angle = angle;
        this.shards.push(shard);
        this.group.add(shard);

        const labelMat = new THREE.SpriteMaterial({ map: this.createLabelTexture(data.title), transparent: true, opacity: 0 });
        const label = new THREE.Sprite(labelMat);
        label.scale.set(6, 1.5, 1);
        label.position.copy(shard.position);
        label.position.y += 3;
        shard.userData.label = label;
        this.group.add(label);

        const wireGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.45, 6);
        const wireMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.2 });
        const circuit = new THREE.Mesh(wireGeo, wireMat);
        shard.add(circuit);
      });
    });
  }

  createLattice() {
    this.latticeGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.1 });
    this.shards.forEach(() => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
      const line = new THREE.Line(geo, lineMat);
      this.latticeLines.push(line);
      this.latticeGroup.add(line);
    });
    this.group.add(this.latticeGroup);
  }

  spawnPulse() {
    if (!this.isVisible || this.shards.length === 0 || !window.gsap) return;
    const targetShard = this.shards[Math.floor(Math.random() * this.shards.length)];

    const pulseGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const pulseMat = new THREE.MeshStandardMaterial({ color: 0xCCFF00, emissive: 0xCCFF00, emissiveIntensity: 1 });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    this.group.add(pulse);

    gsap.to(pulse.position, {
      x: targetShard.position.x,
      y: targetShard.position.y,
      z: targetShard.position.z,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        this.group.remove(pulse);
        gsap.to(targetShard.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
      }
    });
  }

  updateLattice() {
    this.shards.forEach((shard, i) => {
      if (this.latticeLines[i]) {
        this.latticeLines[i].geometry.setFromPoints([new THREE.Vector3(0, 0, 0), shard.position]);
        this.latticeLines[i].geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  setupDetailOverlay() {
    this.overlay = document.getElementById('project-detail-overlay');
    this.closeBtn = this.overlay.querySelector('.close-detail');
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeProjectDetail());
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.closeProjectDetail(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay.classList.contains('active')) this.closeProjectDetail();
    });
  }

  closeProjectDetail() {
    this.overlay.classList.remove('active');
    this.rotationEnabled = true;
    try { playDataGlitch(); } catch (e) { }
  }

  showProjectDetail(data) {
    console.log("PROJECT_UPLINK_START:", data.title);
    const title = document.getElementById('detail-title');
    const desc = document.getElementById('detail-description');
    const img = document.getElementById('detail-img');
    const code = document.getElementById('detail-code');
    const live = document.getElementById('detail-live');

    if (!title || !desc || !img) return;

    title.textContent = data.title;
    desc.textContent = data.description;
    img.style.opacity = '0';
    img.src = data.img;
    img.onload = () => { img.style.opacity = '1'; };

    if (code) { code.href = data.codeLink; code.style.display = data.codeLink === '#' ? 'none' : 'flex'; }
    if (live) { live.href = data.liveLink; live.style.display = data.liveLink === '#' ? 'none' : 'flex'; }

    this.overlay.classList.add('active');
    this.rotationEnabled = false;
    try { playDataGlitch(); } catch (e) { }

    if (window.gsap) {
      gsap.killTweensOf([title, desc, ".detail-frame"]);
      gsap.set([title, desc], { opacity: 1, y: 0 });
      gsap.from([title, desc], { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".detail-frame", { scaleX: 0, transformOrigin: "left", opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.5, ease: "expo.out", delay: 0.2 });
    }
  }

  onHover(e) {
    if (!window.gsap) return;
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shards);

    if (intersects.length > 0) {
      this.container.style.cursor = 'pointer';
      const shard = intersects[0].object;
      if (!shard.isAnimating) {
        shard.isAnimating = true;
        gsap.to(shard.rotation, { z: shard.rotation.z + 0.5, duration: 0.4, ease: "power2.out", onComplete: () => { shard.isAnimating = false; } });
        gsap.to(shard.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
        if (shard.userData.label) gsap.to(shard.userData.label.material, { opacity: 1, duration: 0.3 });
      }
    } else {
      this.container.style.cursor = this.isDragging ? 'grabbing' : 'grab';
      this.shards.forEach(shard => {
        gsap.to(shard.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        if (shard.userData.label) gsap.to(shard.userData.label.material, { opacity: 0, duration: 0.3 });
      });
    }
  }

  onClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.shards);
    if (intersects.length > 0) {
      this.showProjectDetail(intersects[0].object.userData);
      if (window.gsap) gsap.to(intersects[0].object.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.4, yoyo: true, repeat: 1, ease: "power2.inOut" });
    }
  }

  onResize() {
    this.isMobile = window.innerWidth <= 768;
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.camera.position.z = this.isMobile ? 25 : 22;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isVisible) return;
    if (this.rotationEnabled && !this.isDragging) { this.group.rotation.y += 0.002; }
    this.coreOuter.rotation.y += 0.01;
    this.coreInner.rotation.x -= 0.015;
    this.coreParticles.rotation.y += 0.005;
    const time = Date.now() * 0.001;
    this.coreInner.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
    this.shards.forEach(shard => {
      shard.lookAt(this.camera.position);
      shard.rotation.x = Math.PI / 2;
      shard.position.y += Math.sin(time * 0.5 + shard.userData.angle) * 0.01;
      if (shard.userData.label) { shard.userData.label.position.copy(shard.position); shard.userData.label.position.y += 2.5; }
    });
    this.updateLattice();
    this.renderer.render(this.scene, this.camera);
  }
}

// ========================================
// CORE INITIALIZER
// ========================================

const PROJECT_VAULT_3D = ProjectVault3D;

document.addEventListener('DOMContentLoaded', () => {
  try {
    initSkillBars();
    new GlobalParticles();
    new NeuralCore3D();
    new PROJECT_VAULT_3D();
    new HUDCursor();
    console.log('SYSTEM_BOOT: All modules synchronized.');
  } catch (e) {
    console.error('CRITICAL_BOOT_FAILURE:', e);
  }
});
