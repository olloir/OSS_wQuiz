(() => {
  const STORAGE_KEY = 'wquiz-progress';
  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch {
    progress = {};
  }

  const today = dateKey(new Date());
  const todayStudied = progress.date === today ? Math.min(10, Number(progress.todayLearned) || 0) : 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const hasActiveStreak = progress.lastStudyDate === today || progress.lastStudyDate === dateKey(yesterday);
  const streak = hasActiveStreak ? Number(progress.streak) || 0 : 0;

  document.getElementById('today-label').textContent = new Intl.DateTimeFormat('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'long'
  }).format(new Date());
  document.getElementById('today-progress').textContent = String(todayStudied);
  document.getElementById('progress-bar').style.width = `${todayStudied * 10}%`;
  document.getElementById('stat-streak').textContent = String(streak);
  document.getElementById('streak-count').textContent = String(streak);
  document.getElementById('total-correct').textContent = String(Number(progress.totalCorrect) || 0);
})();
