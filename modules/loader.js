/**
 * Loader Module - Loading Screen & Initial Page Setup
 * Handles terminal typewriter effect, progress animation, and navbar reveal
 */

/**
 * Display the loading screen with terminal typewriter effect
 * Includes progress bar animation and "ACCESS GRANTED" sequence
 */
function showLoadingScreen() {
  const cfg = APP_CONFIG.LOADING;
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

  // Fail-safe: never allow permanent lock on loading overlay.
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && loadingScreen.style.display !== 'none') {
      console.warn('Loader fail-safe triggered, forcing hideLoadingScreen()');
      hideLoadingScreen();
    }
  }, 8000);

  progressContainer.style.display = 'none';
  progressText.style.display = 'none';

  setTimeout(() => {
    console.log('Starting terminal typing');
    let lineIndex = 0;

    function typeNextLine() {
      if (lineIndex < cfg.TERMINAL_LINES.length) {
        const line = document.createElement('div');
        line.className = 'line';
        terminalOutput.appendChild(line);

        let charIndex = 0;
        const currentText = cfg.TERMINAL_LINES[lineIndex];

        function typeCharacter() {
          if (charIndex < currentText.length) {
            line.textContent += currentText.charAt(charIndex);
            try { playTypingSound(); } catch (e) { }
            charIndex++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
            setTimeout(typeCharacter, cfg.TYPE_SPEED);
          } else {
            lineIndex++;
            setTimeout(typeNextLine, cfg.LINE_DELAY);
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
            const accessText = cfg.ACCESS_TEXT;

            function typeAccessChar() {
              if (accessCharIndex < accessText.length) {
                accessLine.textContent += accessText.charAt(accessCharIndex);
                try { playTypingSound(); } catch (e) { }
                accessCharIndex++;
                setTimeout(typeAccessChar, cfg.ACCESS_SPEED);
              } else {
                console.log('Starting progress bar');
                setTimeout(() => {
                  progressContainer.style.display = 'block';
                  progressText.style.display = 'block';

                  const progressDuration = cfg.PROGRESS_DURATION;
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

/**
 * Hide the loading screen and reveal main content
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const logoParts = document.querySelectorAll('.logo-part');
  
  if (loadingScreen) {
    // Stage 1: Trigger Glitch Slicer on Logo
    logoParts.forEach(logo => {
      logo.classList.add('logo-glitching');
    });

    // Stage 2: Wait for glitch oscillation, then fade out the whole screen
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        document.body.style.overflow = 'auto';
        animateNavbarEntry();
      }, 600);
    }, 500); // Glitch duration before fade
  }
}

/**
 * Animate navbar and nav items into view on page load
 * Staggered reveal effect for logo and navigation links
 */
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

/**
 * Initialize page loading sequence
 * Starts on window.load and DOMContentLoaded with fallback
 */
function initializePageLoader() {
  console.log('Setting up window load event');

  // Make sure loading starts even if images fail to load
  let loadingStarted = false;
  let fallbackTimer;

  const startLoading = () => {
    if (loadingStarted) return;
    loadingStarted = true;
    document.body.style.overflow = 'hidden';
    console.log('Starting loader sequence');
    setTimeout(() => {
      console.log('Calling showLoadingScreen');
      showLoadingScreen();
    }, 100);
  };

  const cancelFallback = () => {
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  };

  window.addEventListener('load', () => {
    console.log('Window loaded!');
    cancelFallback();
    startLoading();
  });

  // Fallback in case load event doesn't fire or listener is attached too late
  document.addEventListener('DOMContentLoaded', () => {
    fallbackTimer = setTimeout(() => {
      if (!loadingStarted) {
        console.log('DOMContentLoaded fallback triggered');
        startLoading();
      }
    }, 500);

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => link.addEventListener('mouseenter', playHoverSound));
  });

  // If script runs after load has already completed, start immediately.
  if (document.readyState === 'complete') {
    console.log('Document already complete, starting loader immediately');
    startLoading();
  }
}

window.showLoadingScreen = showLoadingScreen;
window.hideLoadingScreen = hideLoadingScreen;
window.animateNavbarEntry = animateNavbarEntry;
window.initializePageLoader = initializePageLoader;
