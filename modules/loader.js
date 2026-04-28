/**
 * Loader Module - Loading Screen & Initial Page Setup
 * Handles terminal typewriter effect, progress animation, and navbar reveal
 */

/**
 * Display the loading screen with terminal typewriter effect
 * Includes progress bar animation and "ACCESS GRANTED" sequence
 */

let loadingScrollLocked = false;
const blockedScrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

function preventScrollInteraction(event) {
  if (!loadingScrollLocked) return;

  if (event.type === 'keydown' && !blockedScrollKeys.has(event.key)) {
    return;
  }

  event.preventDefault();
}

function setLoadingScrollLock(shouldLock) {
  loadingScrollLocked = shouldLock;

  if (shouldLock) {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    window.addEventListener('wheel', preventScrollInteraction, { passive: false });
    window.addEventListener('touchmove', preventScrollInteraction, { passive: false });
    window.addEventListener('keydown', preventScrollInteraction, { passive: false });
    return;
  }

  window.removeEventListener('wheel', preventScrollInteraction);
  window.removeEventListener('touchmove', preventScrollInteraction);
  window.removeEventListener('keydown', preventScrollInteraction);
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = '';
}

/**
 * Display the loading screen with cinematic 'Quantum Trace' sequence
 * Uses GSAP for high-fidelity path tracing and warp-speed transition
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const logoContainer = document.querySelector('.loading-logo');
  const paths = document.querySelectorAll('.logo-part path');
  const logoParts = document.querySelectorAll('.logo-part');

  if (!loadingScreen || !logoContainer) {
    console.error('Loading elements not found');
    hideLoadingScreen();
    return;
  }

  console.log('Quantum Trace sequence initialized');

  // 1. Dynamic Path Length Calculation for "Perfect Trace"
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  // 2. Setup GSAP Timeline
  const tl = gsap.timeline({
    onComplete: () => {
      console.log('Cinematic Sequence Finalized');
    }
  });

  // 3. The Quantum Trace Entrance (Sequential)
  tl.set(logoParts, { opacity: 0, scale: 0.85 })
    .to(logoParts, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out"
    }, 0.2)
    .to(paths, {
      strokeDashoffset: 0,
      duration: 1.8,
      stagger: 0.1,
      ease: "power4.inOut"
    }, "-=0.4")
    // 2. MATERIALIZE INTO CHROME ONLY AFTER STROKE IS COMPLETE
    .to(logoParts, {
      opacity: 1,
      fill: "#ffffff", // Initial flash target
      duration: 0.1,
      ease: "none"
    }, "+=0.1")
    .to(logoParts, {
      fill: "url(#chrome-gradient)",
      duration: 0.5,
      ease: "power2.inOut",
      onStart: () => {
        logoParts.forEach(part => part.classList.add('filled'));
      }
    })
    // 3. REMOVED CHROME SHINE FLASH PER USER REQUEST
    // 4. ZOOM ONLY AFTER THE CHROME LOOK HAS SETTLED
    .add(() => {
      loadingScreen.classList.add('screen-shake');
    }, "+=0.4")
    .to(logoContainer, {
      scale: 50,
      opacity: 0,
      duration: 0.9,
      ease: "expo.in",
      onStart: () => {
        logoContainer.classList.add('warp-vision');
      }
    })
    .to(loadingScreen, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        hideLoadingScreenFinal();
      }
    }, "-=0.3");
}

/**
 * Final steps for hiding the loader and revealing the main content
 */
function hideLoadingScreenFinal() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.remove('screen-shake');
    loadingScreen.style.display = 'none';
    setLoadingScrollLock(false);
    if (window.animateNavbarEntry) window.animateNavbarEntry();
  }
}

// Keep the old function name for compatibility if needed, but redirects to new trace
function hideLoadingScreen() {
  // Now handled by the GSAP timeline in showLoadingScreen
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

  // On reload, always boot from home/top instead of restoring prior section/hash.
  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navigationEntry && navigationEntry.type === 'reload';
  if (isReload) {
    if (window.history && typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
    }
    window.scrollTo(0, 0);
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  setLoadingScrollLock(true);

  // Make sure loading starts even if images fail to load
  let loadingStarted = false;
  let fallbackTimer;

  const startLoading = () => {
    if (loadingStarted) return;
    loadingStarted = true;
    setLoadingScrollLock(true);
    console.log('Starting loader sequence');
    setTimeout(() => {
      console.log('Calling showLoadingScreen');
      showLoadingScreen();
    }, 50);
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
