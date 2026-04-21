/**
 * Configuration & Constants
 * Centralized app settings, API keys, and magic numbers
 */

// ===============================================
// APP CONFIGURATION
// ===============================================
const APP_CONFIG = {
  // Loading Screen
  LOADING: {
    TERMINAL_LINES: [
      '> Initializing Pritamx4 Digital Archive...',
      '> Fetching creative modules...',
      '> Optimizing visual environment...'
    ],
    TYPE_SPEED: 25, // ms per character
    LINE_DELAY: 150, // ms between lines
    PROGRESS_DURATION: 1200, // ms for progress bar
    ACCESS_TEXT: '> PREPARING VIEWPORT..',
    ACCESS_SPEED: 40, // ms per character
  },

  // Audio System
  AUDIO: {
    ENABLED_DEFAULT: true,
    SOUNDS: {
      TYPING: { freq: 600, type: 'square', duration: 0.08, gain: 0.08 },
      HOVER: { freq: 400, type: 'square', duration: 0.05, gain: 0.05 },
      GLITCH_1: { freq: 150, type: 'sawtooth', duration: 0.1, gain: 0.1 },
      GLITCH_2: { freq: 300, type: 'square', duration: 0.05, gain: 0.15, delay: 50 },
      GLITCH_3: { freq: 100, type: 'sawtooth', duration: 0.2, gain: 0.08, delay: 100 },
    }
  },

  // Navigation
  NAVIGATION: {
    SCROLL_OFFSET: 100, // pixels offset for active section detection
    HOVER_SOUND: true,
  },

  // UI Elements - Bottom Tab
  BOTTOM_TAB: {
    AUTO_HIDE_DELAY: 3000, // ms before auto-hiding
    SHOW_DELAY: 500, // ms before showing stats
  },

  // HUD Cursor
  CURSOR: {
    LOCK_TRANSITION_MS: 200,
    CLICK_PULSE_MS: 200,
  },

  // Contact Form
  CONTACT: {
    MIN_MESSAGE_LENGTH: 5,
    EMAILJS_SERVICE_ID: 'Pritamx4',
    EMAILJS_TEMPLATE_ID: 'Pritamx4',
    EMAILJS_PUBLIC_KEY: 'glYVjrgq1NH52F9M2',
    FORM_NAME: 'Portfolio Visitor',
    RECIPIENT_NAME: 'Pritam Singh',
  },

  // Terminal Stats
  STATS: {
    TERMINAL_MESSAGES: [
      '> INITIALIZING NEURAL INTERFACE...',
      '> SYNCING WITH GITHUB REPOSITORIES...',
      '> ANALYZING CODE METRICS...',
      '> RENDERING SKILL MATRIX...',
      '> STATUS: ALL SYSTEMS ONLINE'
    ],
    TYPE_SPEED: 30, // ms per character
    MESSAGE_DELAY: 400, // ms between messages
    CHART_UPDATE_DELAY: 500, // ms before showing chart
    ANIMATION_DURATION: 1500, // ms for counter animation
  },

  // Repository Data (default percentages)
  REPO_DATA: {
    HTML: 45,
    CSS: 30,
    JS: 25,
  },

  // GitHub Stats (defaults)
  GITHUB_STATS: {
    commits: 150,
    repos: 12,
    stars: 50,
    forks: 8,
    watchers: 5,
    issues: 0,
    contributors: 1,
    size: 2048,
    lastUpdated: '2026-04-18',
    branches: 5,
  },

  // Three.js Canvas
  CANVAS: {
    DPR_DESKTOP: 2,
    DPR_MOBILE: 1.5,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
  },

  // Animations
  ANIMATIONS: {
    SPARKLE_COUNT: 15,
    SPARKLE_LIFETIME: 800, // ms
    SPARKLE_SPEED: 4, // pixels per frame
  },

  // API Reliability
  API: {
    TIMEOUT_MS: 4000,
    RETRIES: 2,
    RETRY_DELAY_MS: 500,
  },
};

// ===============================================
// DOM SELECTORS (Common)
// ===============================================
const DOM_SELECTORS = {
  LOADING_SCREEN: '#loadingScreen',
  TERMINAL_OUTPUT: '#terminalOutput',
  PROGRESS_BAR: '#progressBar',
  PROGRESS_TEXT: '#progressText',
  PROGRESS_CONTAINER: '.progress-container',
  
  NAVBAR_LOGO: '#navbarLogo',
  NAV_ITEMS: '.nav-item',
  NAV_LINKS: '.nav-links a',
  MENU_ICON: '.menu-icon',
  
  SEND_BTN: '.send-btn',
  MESSAGE_INPUT: '.message-input',
  MESSAGE_COUNT: '#messageCount',
  MESSAGE_ERROR: '#messageError',
  TOAST: '#toast',
  TOAST_MESSAGE: '.toast-message',
  
  BOTTOM_TAB: '#bottomTab',
  TAB_TOGGLE: '.tab-toggle',
  TAB_CONTENT: '.tab-content',
  TERMINAL_TEXT: '#terminalText',
  STATS_GRID: '#statsGrid',
  
  SECTIONS: 'section[id]',
  HUD_CURSOR: '#hud-cursor',
};

window.APP_CONFIG = APP_CONFIG;
window.DOM_SELECTORS = DOM_SELECTORS;
