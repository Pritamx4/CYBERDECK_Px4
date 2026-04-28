/**
 * HUD Cursor - Custom cyberpunk-style cursor tracking system
 * Follows mouse movement with smooth interpolation and locks to interactive elements
 */

class HUDCursor {
  constructor() {
    this.cursor = document.getElementById('hud-cursor');
    if (!this.cursor) return;

    this.isMobileDevice = ('ontouchstart' in window) || (window.innerWidth <= 768);
    if (this.isMobileDevice) {
      console.log('HUD_CURSOR: Touch device or small screen detected. HUD disabled.');
      return;
    }

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
    this.sizeAnimation = null;

    this.init();
    console.log('HUD_CURSOR: Initialized.');
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

    window.addEventListener('mousemove', (e) => updatePosition(e.clientX, e.clientY));

    window.addEventListener('mousedown', () => {
      this.cursor.classList.add('click-pulse');
      setTimeout(() => this.cursor.classList.remove('click-pulse'), 300);
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
    this.animateSizeTo(rect.width + padding * 2, rect.height + padding * 2, 300);
    this.resetHideTimeout();
  }

  unlock() {
    this.isLocked = false;
    this.lockTarget = null;
    this.cursor.classList.remove('locked');
    this.animateSizeTo(40, 40, 300);
    this.resetHideTimeout();
  }

  animateSizeTo(targetW, targetH, duration) {
    this.size.w = targetW;
    this.size.h = targetH;
    this.sizeAnimation = {
      startW: this.delayedSize.w,
      startH: this.delayedSize.h,
      targetW,
      targetH,
      startTime: performance.now(),
      duration,
    };
  }

  addInteractions() {
    const interactables = document.querySelectorAll('a, button, .project-card, .social-item, .tab-toggle, .skill-card, .btn-sleek, .btn-outline');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => this.lockOn(el));
      el.addEventListener('mouseleave', () => this.unlock());
    });
  }

  animate() {
    if (this.sizeAnimation) {
      const elapsed = performance.now() - this.sizeAnimation.startTime;
      const t = Math.min(elapsed / this.sizeAnimation.duration, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - (Math.pow(-2 * t + 2, 2) / 2);
      this.delayedSize.w = this.sizeAnimation.startW + (this.sizeAnimation.targetW - this.sizeAnimation.startW) * ease;
      this.delayedSize.h = this.sizeAnimation.startH + (this.sizeAnimation.targetH - this.sizeAnimation.startH) * ease;

      if (t >= 1) {
        this.delayedSize.w = this.sizeAnimation.targetW;
        this.delayedSize.h = this.sizeAnimation.targetH;
        this.sizeAnimation = null;
      }
    }

    this.delayedPos.x += (this.pos.x - this.delayedPos.x) * this.lerpAmount;
    this.delayedPos.y += (this.pos.y - this.delayedPos.y) * this.lerpAmount;

    this.cursor.style.left = `${this.delayedPos.x}px`;
    this.cursor.style.top = `${this.delayedPos.y}px`;
    this.cursor.style.width = `${this.delayedSize.w}px`;
    this.cursor.style.height = `${this.delayedSize.h}px`;

    requestAnimationFrame(() => this.animate());
  }
}

window.HUDCursor = HUDCursor;

// Self-initialization
const initHUD = () => {
  if (typeof window.HUDCursorInstance === 'undefined') {
    window.HUDCursorInstance = new HUDCursor();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHUD);
} else {
  initHUD();
}
