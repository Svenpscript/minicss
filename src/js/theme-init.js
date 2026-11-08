(() => {
  try {
    const choice = localStorage.getItem('minicss-theme');
    if (choice === 'light' || choice === 'dark') document.documentElement.dataset.theme = choice;
  } catch { /* Storage is optional. No attribute means system preference. */ }
})();
