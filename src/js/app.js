const copyPrompt = async (button) => {
  const payload = button.dataset.copySource;
  if (!payload) return;
  let text = '';
  try {
    text = JSON.parse(payload);
  } catch (error) {
    text = payload;
  }

  const getLabel = (state) => {
    if (state === 'success') return button.dataset.copySuccess || '已复制';
    if (state === 'failed') return button.dataset.copyFailed || '复制失败';
    return button.dataset.copyLabel || button.textContent || '复制';
  };

  const reset = (state) => {
    button.dataset.originalLabel = button.dataset.originalLabel || getLabel();
    button.textContent = getLabel(state);
    setTimeout(() => {
      button.textContent = button.dataset.originalLabel;
    }, 1800);
  };

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      reset('success');
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
    reset('success');
  } catch (error) {
    console.error('Copy failed', error);
    reset('failed');
  }
  document.body.removeChild(textarea);
};

const bindPromptDetails = () => {
  document.querySelectorAll('.case-card__prompt').forEach((details) => {
    details.addEventListener('toggle', () => {
      details.classList.toggle('is-open', details.open);
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

const initTheme = () => {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;
  const labels = {
    dark: toggle.dataset.themeLabelDark || '切换为浅色',
    light: toggle.dataset.themeLabelLight || '切换为深色'
  };
  toggle.textContent = theme === 'dark' ? labels.dark : labels.light;
  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    toggle.textContent = next === 'dark' ? labels.dark : labels.light;
  });
};

const init = () => {
  bindPromptDetails();
  bindPagination();
  initTheme();
};

document.addEventListener('DOMContentLoaded', init);
