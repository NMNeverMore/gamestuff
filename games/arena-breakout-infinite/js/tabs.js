document.querySelectorAll('.tab').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const target = tabBtn.dataset.tab;

    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('tab--active'));
    tabBtn.classList.add('tab--active');

    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.hidden = panel.id !== `tab-${target}`;
    });
  });
});
