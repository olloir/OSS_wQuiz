(() => {
  const STORAGE_KEY = 'wquiz-progress';
  const wrongList = document.getElementById('wrong-list');
  const emptyState = document.getElementById('review-empty');
  const startButton = document.getElementById('start-review');

  function getWrongWords() {
    try {
      const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Array.isArray(progress.wrongWords) ? progress.wrongWords : [];
    } catch {
      return [];
    }
  }

  function renderWrongWords() {
    const words = getWrongWords().sort((a, b) => (b.lastWrongDate || '').localeCompare(a.lastWrongDate || ''));
    document.getElementById('wrong-count').textContent = String(words.length);
    wrongList.replaceChildren();
    emptyState.hidden = words.length > 0;
    startButton.classList.toggle('is-disabled', words.length === 0);
    startButton.setAttribute('aria-disabled', String(words.length === 0));
    startButton.tabIndex = words.length === 0 ? -1 : 0;

    words.forEach((word) => {
      const card = document.createElement('article');
      card.className = 'wrong-word-card';

      const wordInfo = document.createElement('div');
      wordInfo.className = 'wrong-word-info';
      const title = document.createElement('h2');
      title.textContent = word.word;
      const pronunciation = document.createElement('p');
      pronunciation.className = 'wrong-pronunciation';
      pronunciation.textContent = word.pronunciation || '';
      wordInfo.append(title, pronunciation);

      const meaning = document.createElement('p');
      meaning.className = 'wrong-meaning';
      meaning.textContent = word.meaning;

      const count = document.createElement('span');
      count.className = 'wrong-count-badge';
      count.textContent = `${Number(word.wrongCount) || 1}회 오답`;

      card.append(wordInfo, meaning, count);
      wrongList.append(card);
    });
  }

  startButton.addEventListener('click', (event) => {
    if (startButton.getAttribute('aria-disabled') === 'true') event.preventDefault();
  });
  window.addEventListener('pageshow', renderWrongWords);
  window.addEventListener('focus', renderWrongWords);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) renderWrongWords();
  });
  renderWrongWords();
})();
