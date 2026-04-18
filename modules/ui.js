/**
 * UI Module - Navigation, Menus & Interactive Elements
 * Handles navbar, mobile menu, bottom stats tab, and section tracking
 */

let hideTimeout;
let hasShownOnce = false;
let isBottomTabOpen = false;

/**
 * Toggle mobile menu visibility
 */
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  const menuIcon = document.querySelector('.menu-icon');

  if (!navLinks) return;

  navLinks.classList.toggle('show');
  if (menuIcon) {
    menuIcon.classList.toggle('active');
    menuIcon.setAttribute('aria-expanded', navLinks.classList.contains('show'));
  }
}

/**
 * Handle menu icon keyboard navigation (Space/Enter key)
 * @param {KeyboardEvent} event - Keyboard event object
 */
function handleMenuKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    toggleMenu();
  }
}

/**
 * Close mobile menu when nav link is clicked
 */
function initializeNavigation() {
  const cfg = APP_CONFIG.NAVIGATION;
  const links = document.querySelectorAll('#navLinks a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      if (navLinks && navLinks.classList.contains('show')) {
        toggleMenu();
      }
    });

    // Play sound on nav hover if enabled
    if (cfg.HOVER_SOUND) {
      link.addEventListener('mouseenter', playHoverSound);
    }
  });
}

/**
 * Update active navigation indicator based on scroll position
 * Highlights the current section in the navbar
 */
function updateActiveNav() {
  const cfg = APP_CONFIG.NAVIGATION;
  const scrollY = window.pageYOffset;
  const sections = document.querySelectorAll(DOM_SELECTORS.SECTIONS);
  const navItems = document.querySelectorAll(DOM_SELECTORS.NAV_LINKS);

  sections.forEach(section => {
    const sectionTop = section.offsetTop - cfg.SCROLL_OFFSET;
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

/**
 * Initialize active nav tracking on scroll
 */
function initializeActiveNav() {
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Call on page load
}

/**
 * Toggle bottom stats tab visibility
 */
function toggleBottomTab() {
  const cfg = APP_CONFIG.BOTTOM_TAB;
  const tab = document.getElementById('bottomTab');
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
      }, cfg.SHOW_DELAY);
      hasShownOnce = true;
    }
  } else {
    tab.classList.remove('open');
    if (toggleButton) {
      toggleButton.style.transform = 'translateX(-50%) rotate(0deg)';
    }
  }
}

/**
 * Initialize bottom tab mouse interaction listeners
 */
function initializeBottomTab() {
  const cfg = APP_CONFIG.BOTTOM_TAB;
  const bottomTab = document.getElementById('bottomTab');

  if (!bottomTab) return;

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
      }, cfg.AUTO_HIDE_DELAY);
    }
  });
}

/**
 * Initialize all UI features
 */
function initializeUI() {
  initializeNavigation();
  initializeActiveNav();
  initializeBottomTab();
}

window.toggleMenu = toggleMenu;
window.handleMenuKeydown = handleMenuKeydown;
window.updateActiveNav = updateActiveNav;
window.toggleBottomTab = toggleBottomTab;
window.initializeUI = initializeUI;
window.initializeNavigation = initializeNavigation;
window.initializeActiveNav = initializeActiveNav;
window.initializeBottomTab = initializeBottomTab;
