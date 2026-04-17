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
            try { playTypingSound(); } catch(e) { }
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
                try { playTypingSound(); } catch(e) {}
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
(function() {
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
const lazyImages = document.querySelectorAll('img[loading=\"lazy\"]');

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
// CORE INITIALIZER
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initSkillBars();
  console.log('System initialized: Native Mode');
});


