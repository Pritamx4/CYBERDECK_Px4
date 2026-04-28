/**
 * UI Module - Navigation, Menus & Interactive Elements
 * Handles navbar, mobile menu, and section tracking
 */

let hideTimeout;
let hasShownOnce = false;

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
 * Initialize all UI features
 */
function initializeUI() {
  initializeNavigation();
  initializeActiveNav();
}

window.toggleMenu = toggleMenu;
window.handleMenuKeydown = handleMenuKeydown;
window.updateActiveNav = updateActiveNav;
window.initializeUI = initializeUI;
window.initializeNavigation = initializeNavigation;
window.initializeActiveNav = initializeActiveNav;
