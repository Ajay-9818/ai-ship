const copyPrompt = async (button) => {
  if (!button) return;
  const payload = button.dataset.copySource;
  if (!payload) return;

  let text = '';
  try {
    text = JSON.parse(payload);
  } catch (error) {
    text = payload;
  }

  const labelDefault = button.dataset.copyLabel || 'Copy';
  const labelSuccess = button.dataset.copySuccess || 'Copied';
  const labelFailed = button.dataset.copyFailed || 'Copy failed';
  const hiddenLabel = button.querySelector('.visually-hidden');

  const updateLabel = (label) => {
    button.setAttribute('aria-label', label);
    if (hiddenLabel) {
      hiddenLabel.textContent = label;
    }
  };

  const clearTimer = () => {
    if (button._copyTimer) {
      clearTimeout(button._copyTimer);
      button._copyTimer = null;
    }
  };

  const scheduleReset = () => {
    clearTimer();
    button._copyTimer = setTimeout(() => {
      button.classList.remove('is-success', 'is-failed');
      updateLabel(labelDefault);
      button._copyTimer = null;
    }, 1800);
  };

  clearTimer();
  button.classList.remove('is-success', 'is-failed');
  updateLabel(labelDefault);

  const handleSuccess = () => {
    button.classList.add('is-success');
    button.classList.remove('is-failed');
    updateLabel(labelSuccess);
    scheduleReset();
  };

  const handleFailure = () => {
    button.classList.add('is-failed');
    button.classList.remove('is-success');
    updateLabel(labelFailed);
    scheduleReset();
  };

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      handleSuccess();
      return;
    } catch (error) {
      console.warn('Clipboard API not available, fallback in use.', error);
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    handleSuccess();
  } catch (error) {
    console.error('Copy failed', error);
    handleFailure();
  }
  document.body.removeChild(textarea);
};

const bindPromptDetails = () => {
  // 同步两个details元素的状态
  document.querySelectorAll('.case-card__prompt-summary-only').forEach((summaryOnly) => {
    const cardId = summaryOnly.dataset.cardId;
    const fullDetails = document.querySelector(`.case-card__prompt-full[data-card-id="${cardId}"]`);

    if (!fullDetails) return;

    summaryOnly.addEventListener('toggle', () => {
      if (summaryOnly.open) {
        fullDetails.classList.add('is-open');
      } else {
        fullDetails.classList.remove('is-open');
      }
    });
  });

  document.querySelectorAll('.prompt-copy').forEach((button) => {
    button.addEventListener('click', () => copyPrompt(button));
  });
};

const bindPagination = () => {
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;
  const main = document.querySelector('.site-main');
  pagination.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (main) {
        main.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  localStorage.setItem('theme', theme);
};

const initControls = () => {
  // 初始化主题控制
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');

  // 更新主题菜单状态
  const themeMenu = document.querySelector('[data-menu="theme"]');
  if (themeMenu) {
    const activeItem = themeMenu.querySelector(`[data-theme="${storedTheme || 'auto'}"]`);
    if (activeItem) {
      activeItem.classList.add('is-active');
    }
  }

  // 主题菜单点击事件
  document.querySelectorAll('[data-theme]').forEach((item) => {
    item.addEventListener('click', () => {
      const theme = item.dataset.theme;

      // 移除所有主题菜单项的激活状态
      document.querySelectorAll('[data-theme]').forEach(el => {
        el.classList.remove('is-active');
      });

      // 设置当前项为激活状态
      item.classList.add('is-active');

      if (theme === 'auto') {
        localStorage.removeItem('theme');
        const autoTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        applyTheme(autoTheme);
      } else {
        localStorage.setItem('theme', theme);
        applyTheme(theme);
      }
    });
  });

  const languageMenu = document.querySelector('[data-menu="language"]');
  if (languageMenu) {
    const activeLang = document.documentElement.getAttribute('lang') || 'zh';
    const currentItem = languageMenu.querySelector(`[data-lang="${activeLang}"]`);
    if (currentItem) {
      currentItem.classList.add('is-active');
    }
  }

  // 语言菜单点击事件
  document.querySelectorAll('[data-lang]').forEach((item) => {
    item.addEventListener('click', () => {
      const lang = item.dataset.lang;

      // 移除所有语言菜单项的激活状态
      document.querySelectorAll('[data-lang]').forEach(el => {
        el.classList.remove('is-active');
      });

      // 设置当前项为激活状态
      item.classList.add('is-active');

      // 跳转到对应语言页面
      if (lang === 'zh') {
        window.location.href = '/';
      } else {
        window.location.href = `/${lang}/`;
      }
    });
  });

  // 关闭菜单当点击外部
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.control-group')) {
      document.querySelectorAll('.control-menu').forEach(menu => {
        menu.classList.remove('is-open');
      });
    }
  });

  // 控制按钮点击事件
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const controlType = btn.dataset.control;
      const menu = document.querySelector(`[data-menu="${controlType}"]`);

      // 切换菜单显示
      if (menu) {
        const isOpen = menu.classList.contains('is-open');
        document.querySelectorAll('.control-menu').forEach(m => {
          m.classList.remove('is-open');
        });
        if (!isOpen) {
          menu.classList.add('is-open');
        }
      }
    });
  });
};

function initSailboat() {
  const title = document.querySelector('.site-title');
  if (!title) return;
  const boat = title.querySelector('.icon-sailboat');
  if (!boat) return;
  const container = title.closest('.container') || document.body;
  const margin = 16;

  let animating = false;
  let direction = 1; // 1 = right, -1 = left
  let currentX = 0;
  let lastTs = 0;
  const speed = 120; // px per second
  const rotateDuration = 260; // ms for flip
  let flipping = false;
  let rafId = null;
  let hasStarted = false;
  let wavePhase = 0;
  const waveSpeed = 1.4; // oscillations per second
  const waveAmplitude = 6; // px vertical bobbing
  const tiltAmplitude = 4; // deg

  const TWO_PI = Math.PI * 2;
  let yaw = 0;
  let targetYaw = 0;
  let startYaw = 0;
  let yawDiff = 0;
  let flipStart = 0;
  let baseLeft = 0;
  let boatWidth = boat.offsetWidth;
  let waveIntensity = 0;
  boat.style.transformStyle = 'preserve-3d';
  boat.style.backfaceVisibility = 'visible';
  boat.style.transformOrigin = '50% 70%';
  boat.style.willChange = 'transform';
  const waveRampDuration = 0.35; // seconds to reach full wave amplitude

  function measureBase() {
    const wrapper = boat.closest('.site-title__icon');
    const prevBoatTransform = boat.style.transform;
    const prevWrapperTransform = wrapper ? wrapper.style.transform : '';

    boat.style.transform = 'none';
    if (wrapper) {
      wrapper.style.transform = 'none';
    }

    const containerRect = container.getBoundingClientRect();
    const referenceRect = (wrapper || boat).getBoundingClientRect();
    boatWidth = referenceRect.width;
    baseLeft = referenceRect.left - containerRect.left;

    boat.style.transform = prevBoatTransform;
    if (wrapper) {
      wrapper.style.transform = prevWrapperTransform;
    }
  }

  function render() {
    const angle = wavePhase % TWO_PI;
    const effectiveWave = waveAmplitude * waveIntensity;
    const bob = Math.sin(angle) * effectiveWave;
    const yawRad = (yaw * Math.PI) / 180;
    const facing = Math.cos(yawRad);
    const leanDirection = Math.abs(facing) > 0.05 ? Math.sign(facing) : direction;
    const tilt = Math.sin(angle + Math.PI / 2) * tiltAmplitude * leanDirection * waveIntensity;
    const perspective = 'perspective(800px)';
    boat.style.transform = `${perspective} translateX(${currentX}px) translateY(${bob}px) rotateY(${yaw}deg) rotate(${tilt}deg)`;
  }

  function getBounds() {
    const containerRect = container.getBoundingClientRect();
    const maxX = Math.max(0, containerRect.width - baseLeft - boatWidth - margin);
    return { minX: 0, maxX };
  }

  function frame(ts) {
    if (!animating) return;
    if (!lastTs) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;

    if (!flipping) {
      const previousX = currentX;
      const nextX = previousX + direction * speed * dt;
      const { minX, maxX } = getBounds();
      if (nextX > maxX) {
        currentX = maxX;
        flip();
      } else if (nextX < minX) {
        currentX = minX;
        flip();
      } else {
        currentX = nextX;
      }
    }
    if (flipping) {
      const elapsed = ts - flipStart;
      const progress = Math.min(elapsed / rotateDuration, 1);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
      yaw = startYaw + yawDiff * eased;
      if (progress >= 1) {
        yaw = targetYaw;
        flipping = false;
      }
    } else {
      yaw = targetYaw;
    }
    wavePhase += waveSpeed * TWO_PI * dt;
    if (waveIntensity < 1) {
      waveIntensity = Math.min(1, waveIntensity + (dt / waveRampDuration));
    }
    render();
    rafId = requestAnimationFrame(frame);
  }
  function flip() {
    if (flipping) return;
    direction *= -1;
    startYaw = yaw;
    targetYaw = direction === 1 ? 0 : 180;
    yawDiff = targetYaw - startYaw;
    if (yawDiff > 180) yawDiff -= 360;
    if (yawDiff < -180) yawDiff += 360;
    flipStart = performance.now();
    flipping = true;
  }
  function reset() {
    direction = 1;
    currentX = 0;
    flipping = false;
    wavePhase = 0;
    waveIntensity = 0;
    yaw = 0;
    targetYaw = 0;
    startYaw = 0;
    yawDiff = 0;
    measureBase();
    render();
  }
  function start() {
    if (animating) return;
    if (!hasStarted) {
      reset();
      hasStarted = true;
    }
    animating = true;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    animating = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastTs = 0;
    render();
  }
  function handleResize() {
    measureBase();
    const { minX, maxX } = getBounds();
    currentX = Math.min(Math.max(currentX, minX), maxX);
    render();
  }
  title.addEventListener('mouseenter', start);
  title.addEventListener('mouseleave', stop);
  window.addEventListener('resize', handleResize);

  measureBase();
  render();
}

const init = () => {
  bindPromptDetails();
  bindPagination();
  initControls();
  initSailboat();
};

document.addEventListener('DOMContentLoaded', init);
