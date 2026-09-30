document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader');

  if (!loader) return;

  const percentEl = loader.querySelector('.loader__percent');
  const barFill = loader.querySelector('.loader__bar-fill');
  let progress = 0;

  const update = () => {
    progress = Math.min(progress + 1, 100);
    if (percentEl) {
      percentEl.style.setProperty('--pct', progress);
    }
    if (barFill) {
      barFill.style.width = `${progress}%`;
    }

    if (progress >= 100) {
      clearInterval(intervalId);
      window.setTimeout(() => {
        loader.classList.add('loader--hidden');
      }, 250);
    }
  };

  const intervalId = window.setInterval(update, 50);
});
