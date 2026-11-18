(() => {
  const STORAGE_KEY = 'wquiz-progress';
  const list = document.getElementById('important-list');
  const emptyState = document.getElementById('important-empty');

  function readImportantWords() {
    try {
      const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Array.isArray(progress.importantWords) ? progress.importantWords : [];
    } catch {
      return [];
    }
  }

  function removeImportantWord(word) {
    try {
      const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
      const savedWords = Array.isArray(progress.importantWords) ? progress.importantWords : [];
      progress.importantWords = savedWords.filter((item) => item.word !== word);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      renderImportantWords();
    } catch {
      // Keep the list visible if browser storage is unavailable.
    }
  }

  function renderImportantWords() {
    const words = readImportantWords().sort((a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''));
    document.getElementById('important-count').textContent = String(words.length);
    list.replaceChildren();
    emptyState.hidden = words.length > 0;

    words.forEach((word) => {
      const card = document.createElement('article');
      card.className = 'important-word-card';

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

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-important-button';
      removeButton.setAttribute('aria-label', `${word.word} 중요단어에서 삭제`);
      removeButton.innerHTML = '<span aria-hidden="true">★</span> 저장 해제';
      removeButton.addEventListener('click', () => removeImportantWord(word.word));

      card.append(wordInfo, meaning, removeButton);
      list.append(card);
    });
  }

  window.addEventListener('pageshow', renderImportantWords);
  window.addEventListener('focus', renderImportantWords);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) renderImportantWords();
  });
  renderImportantWords();
})();
