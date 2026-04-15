console.log('Script loaded!');

// Loading Screen Terminal Lines
const terminalLines = [
  '> $ git clone Pritamx4/CYBERDECK_Px4',
  '> COMPILING SOURCE [██████████████] 100%',
  '> DEPLOYING TO CYBERDECK_PX4...'
];

let currentLine = 0;
let progress = 0;

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
  loadingScreen.classList.add('hidden');
  document.body.style.overflow = 'auto';
  
  // Animate navbar entry after loading screen
  setTimeout(() => {
    animateNavbarEntry();
    
    // Initialize Matrix Rain after loading is complete
    setTimeout(() => {
      initMatrixRain();
    }, 500);
    
    // Add glitch effect to typewriter
    setTimeout(() => {
      addGlitchEffect();
    }, 1000);
  }, 300);
}

// Navbar Entry Animation with GSAP
function animateNavbarEntry() {
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded for navbar animation');
    return;
  }

  const navbarLogo = document.getElementById('navbarLogo');
  const navItems = document.querySelectorAll('.nav-item');

  // Animate logo from top
  gsap.from(navbarLogo, {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Animate nav items from right, one by one
  navItems.forEach((item, index) => {
    gsap.from(item, {
      x: 100,
      opacity: 0,
      duration: 0.6,
      delay: 0.3 + (index * 0.1),
      ease: 'power2.out'
    });
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

function playBeep() { createSound(800, 'sine', 0.1, 0.1); }
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
  emailjs.init("glYVjrgq1NH52F9M2");
})();

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = toast.querySelector('.toast-message');
  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Mobile Menu with GSAP
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const menuIcon = document.querySelector('.menu-icon');
  const menuItems = document.querySelectorAll('.nav-item');

  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded');
    navLinks.classList.toggle('show');
    return;
  }

  if (!navLinks.classList.contains('show')) {
    navLinks.classList.add('show');
    menuIcon.classList.add('active');

    gsap.to(navLinks, { opacity: 1, duration: 0.3, ease: 'power2.out' });

    menuItems.forEach((item, index) => {
      gsap.fromTo(item, 
        { opacity: 0, x: '100%' },
        { opacity: 1, x: 0, duration: 0.6, delay: index * 0.12, ease: 'power3.out' }
      );
    });
  } else {
    menuIcon.classList.remove('active');

    menuItems.forEach((item, index) => {
      gsap.to(item, { opacity: 0, x: '100%', duration: 0.4, delay: index * 0.05, ease: 'power2.in' });
    });

    gsap.to(navLinks, {
      opacity: 0,
      duration: 0.3,
      delay: 0.3,
      ease: 'power2.in',
      onComplete: () => navLinks.classList.remove('show')
    });
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

// Hero Typewriter Effect
const texts = [
  '⚡ SYSTEM INITIALIZING...',
  '🔐 ACCESS GRANTED: CYBERDECK_PX4',
  '💻 NEURAL INTERFACE ACTIVE',
  '🌐 PRITAM SINGH | DIGITAL ARCHITECT',
  '🚀 HTML • CSS • JAVASCRIPT • REACT',
  '⚙️ COMPILING DIGITAL DREAMS...',
  '🎯 THINK • CODE • EXECUTE',
  '🔥 PASSION > PERFECTION',
  '📡 ALWAYS LEARNING • ALWAYS BUILDING',
  '🎮 ZERO TO HERO PROTOCOL',
  '⚠️ ERROR 404: LIMITS NOT FOUND',
  '💾 <FRONTEND_DEV/>',
  '🔋 LOADING NEXT-GEN UI...',
  '🌟 QUANTUM CODE DETECTED',
  '🎨 ARCHITECTING THE IMPOSSIBLE',
];

let textIndex = 0;
let charIndex = 0;
const typingSpeed = 100;
const erasingSpeed = 50;
const delayBetweenTexts = 1000;
const typedText = document.getElementById('typedText');

function type() {
  if (charIndex < texts[textIndex].length) {
    typedText.textContent += texts[textIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(erase, delayBetweenTexts);
  }
}

function erase() {
  if (charIndex > 0) {
    typedText.textContent = texts[textIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(erase, erasingSpeed);
  } else {
    textIndex = (textIndex + 1) % texts.length;
    setTimeout(type, typingSpeed);
  }
}

document.addEventListener('DOMContentLoaded', () => setTimeout(type, 1000));

// Contact Message Functionality
const sendIcon = document.querySelector('.send-icon');
const messageInput = document.querySelector('.message-input');
let isInputVisible = false;

sendIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  
  if (!isInputVisible) {
    messageInput.classList.remove('hide');
    messageInput.classList.add('show');
    isInputVisible = true;
    messageInput.focus();
  } else {
    const message = messageInput.value.trim();
    
    // Validate message length
    if (!message) {
      showToast('Please enter a message first!', 'warning');
      return;
    }
    
    if (message.length < 10) {
      showToast('Message too short! Please write at least 10 characters.', 'warning');
      return;
    }
    
    if (message.length > 500) {
      showToast('Message too long! Please keep it under 500 characters.', 'warning');
      return;
    }
    
    // Send message
    sendIcon.classList.add('sending', 'fly-away');
    
    const templateParams = {
      message: message,
      from_name: 'Portfolio Visitor',
      to_name: 'Pritam Singh'
    };
    
    emailjs.send('Pritamx4', 'Pritamx4', templateParams)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        showToast('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
        messageInput.value = '';
        
        setTimeout(() => {
          sendIcon.classList.remove('fly-away');
          messageInput.classList.remove('show');
          messageInput.classList.add('hide');
          sendIcon.classList.remove('sending');
          isInputVisible = false;
        }, 800);
      }, (error) => {
        console.error('FAILED...', error);
        showToast('✗ Failed to send message. Please try again.', 'error');
        sendIcon.classList.remove('sending', 'fly-away');
      });
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.message-container') && isInputVisible) {
    messageInput.classList.remove('show');
    messageInput.classList.add('hide');
    isInputVisible = false;
  }
});

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

// Bottom Tab Terminal
document.addEventListener('DOMContentLoaded', () => {
  const bottomTab = document.getElementById('bottomTab');
  const toggleButton = bottomTab.querySelector('.toggle-btn');
  const icon = document.getElementById('icon');
  let hideTimeout;

  bottomTab.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
    icon.classList.remove('fa-angle-up');
    icon.classList.add('fa-angle-down');
    bottomTab.classList.remove('hidden');
    bottomTab.classList.add('shown');
  });

  bottomTab.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
      bottomTab.classList.add('hidden');
      icon.classList.remove('fa-angle-down');
      icon.classList.add('fa-angle-up');
      bottomTab.classList.remove('shown');
    }, 30);
  });

  hideTimeout = setTimeout(() => {
    bottomTab.classList.add('hidden');
    bottomTab.classList.remove('shown');
    icon.classList.remove('fa-angle-down');
    icon.classList.add('fa-angle-up');
  }, 5000);
});

let hideTimeout;
let hasShownOnce = false;
let isBottomTabOpen = false;

function toggleBottomTab() {
  const tab = document.getElementById('bottomTab');
  if (!tab) return;
  
  clearTimeout(hideTimeout);
  isBottomTabOpen = !isBottomTabOpen;
  
  if (isBottomTabOpen) {
    tab.classList.add('open');
    
    // Start typing effect only on first show
    if (!hasShownOnce) {
      setTimeout(() => {
        typeEffect();
      }, 500);
      hasShownOnce = true;
    }
  } else {
    tab.classList.remove('open');
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

window.onload = () => {
  fetchGitHubStats().then(() => {
    // Stats fetched, ready to display when tab opens
  });
  initBottomTabEvents();
  
  // Initialize element references
  terminalElement = document.getElementById('terminalText');
  statsGrid = document.getElementById('statsGrid');
};

// Skills Animation logic moved to modular GSAP ScrollTrigger below

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
function addGlitchEffect() {
  const typedText = document.getElementById('typedText');
  if (!typedText) return;

  setInterval(() => {
    if (Math.random() > 0.95) {
      typedText.classList.add('glitch');
      setTimeout(() => {
        typedText.classList.remove('glitch');
      }, 300);
    }
  }, 3000);
}

// GSAP SKILL BARS ANIMATION ON SCROLL
// ========================================
if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
  gsap.registerPlugin(ScrollTrigger);

  // Only apply GSAP animations on desktop (not mobile)
  if (window.innerWidth > 768) {
    gsap.utils.toArray('.skill-card').forEach((card, index) => {
      const progressBar = card.querySelector('.skill-progress');
      const targetWidth = progressBar.getAttribute('data-progress');

      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.05,
        ease: 'power3.out'
      });

      gsap.to(progressBar, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
        width: targetWidth + '%',
        duration: 1.2,
        delay: index * 0.05 + 0.1,
        ease: 'power2.out'
      });
    });
  } else {
    // On mobile, just set progress bars to their target width immediately
    document.querySelectorAll('.skill-card').forEach(card => {
      const progressBar = card.querySelector('.skill-progress');
      const targetWidth = progressBar.getAttribute('data-progress');
      progressBar.style.width = targetWidth + '%';
    });
  }
}


// ========================================
// PARALLAX SCROLL EFFECT
// ========================================
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      
      // Parallax for hero section
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.4}px)`;
      }
      
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
// LENIS SMOOTH SCROLLING & GSAP INTEGRATION
// ========================================

/**
 * LENIS INITIALIZATION
 * Handles smooth scrolling and syncing with GSAP
 */
let lenis;

const initLenis = () => {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      smoothWheel: true,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      normalizeWheel: true,
      infinite: false,
    });

    // Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    
    // Smooth transition for hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target);
        }
      });
    });
  }
};

/**
 * PREMIUM INTERACTION SYSTEM
 * Orchestrates group-based timelines for a cohesive narrative
 */
const initPremiumInteractions = () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);

  // Default configuration for consistent interaction feel
  const timelineConfig = (trigger) => ({
    scrollTrigger: {
      trigger: trigger,
      start: "top 85%",
      toggleActions: "play none none none",
      once: true
    }
  });

  // 1. ABOUT SECTION TIMELINE
  const aboutTl = gsap.timeline(timelineConfig('#section-about'));
  aboutTl
    .to('.about-header', { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
    .to('.operator-card', { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6")
    .to('.neural-visualizer', { autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.2)" }, "-=0.6")
    .to('.data-ticker', { opacity: 1, duration: 0.8 }, "-=0.4");

  // 2. SKILLS SECTION TIMELINE
  const skillsTl = gsap.timeline(timelineConfig('#section-skills'));
  skillsTl
    .to('.skills-header', { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
    .to('.skill-card', { 
        autoAlpha: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "power2.out" 
    }, "-=0.5")
    // Chain skill bar fulfillment to the cards' appearance
    .to('.skill-progress', {
        width: (i, target) => target.getAttribute('data-progress') + "%",
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out"
    }, "-=0.8");

  // 3. PROJECTS SECTION TIMELINE
  const projectsTl = gsap.timeline(timelineConfig('#section-projects'));
  projectsTl
    .to('.project-heading', { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
    .to('.project-card', { 
        autoAlpha: 1, 
        scale: 1, 
        duration: 0.8, 
        stagger: 0.15, 
        ease: "back.out(1.4)" 
    }, "-=0.6");

  // 4. CONTACT SECTION TIMELINE
  const contactTl = gsap.timeline(timelineConfig('#section-contact'));
  contactTl
    .to('.contact-left', { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" })
    .to('.contact-right', { autoAlpha: 1, scale: 1, duration: 1, ease: "power2.out" }, "-=0.7")
    .to('.social-icons a', { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power1.out" 
    }, "-=0.5");
};

// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initPremiumInteractions();
});


