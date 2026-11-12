(() => {
  const QUIZ_SIZE = 10;
  const STORAGE_KEY = 'wquiz-progress';
  const words = Array.isArray(window.WQUIZ_WORDS) ? window.WQUIZ_WORDS : [];
  const $ = (id) => document.getElementById(id);
  const questionCard = $('question-card');
  const resultCard = $('result-card');
  const answersNode = $('answer-options');
  const nextButton = $('next-button');

  let questions = [];
  let questionIndex = 0;
  let score = 0;
  let selectedMeaning = null;
  let hasAnswered = false;

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  }

  function saveAnswerProgress(isCorrect) {
    const previous = readProgress();
    const today = localDateKey();
    const todayLearned = previous.date === today ? Number(previous.todayLearned) || 0 : 0;
    const lastStudyDate = previous.lastStudyDate || '';
    let streak = Number(previous.streak) || 0;

    if (lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      streak = lastStudyDate === localDateKey(yesterday) ? streak + 1 : 1;
    }

    const nextProgress = {
      date: today,
      todayLearned: Math.min(QUIZ_SIZE, todayLearned + 1),
      totalCorrect: (Number(previous.totalCorrect) || 0) + (isCorrect ? 1 : 0),
      streak,
      lastStudyDate: today
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    } catch {
      // Keep the quiz usable when browser storage is unavailable.
    }
  }

  function renderQuestion() {
    const question = questions[questionIndex];
    selectedMeaning = null;
    hasAnswered = false;

    $('current-count').textContent = String(questionIndex + 1).padStart(2, '0');
    $('total-count').textContent = String(questions.length).padStart(2, '0');
    $('question-word').textContent = question.word;
    $('word-pronunciation').textContent = question.pronunciation;
    updateQuizProgress(questionIndex);
    $('feedback').textContent = '';
    $('feedback').className = '';
    nextButton.disabled = true;
    nextButton.innerHTML = '다음 단어 <span>→</span>';
    answersNode.replaceChildren();

    const distractors = shuffle(words.filter((word) => word.meaning !== question.meaning))
      .slice(0, 3)
      .map((word) => word.meaning);
    const choices = shuffle([question.meaning, ...distractors]);

    choices.forEach((meaning, index) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'answer-option';
      option.setAttribute('aria-pressed', 'false');
      option.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span></span>`;
      option.lastElementChild.textContent = meaning;
      option.addEventListener('click', () => revealAnswer(meaning, option));
      answersNode.append(option);
    });
  }

  function revealAnswer(meaning, selectedOption) {
    if (hasAnswered) return;
    selectedMeaning = meaning;
    hasAnswered = true;
    const question = questions[questionIndex];
    const correct = selectedMeaning === question.meaning;
    if (correct) score += 1;
    saveAnswerProgress(correct);

    answersNode.querySelectorAll('.answer-option').forEach((option) => {
      option.disabled = true;
      option.setAttribute('aria-pressed', String(option === selectedOption));
      const optionMeaning = option.lastElementChild.textContent;
      if (optionMeaning === question.meaning) option.classList.add('correct');
      else if (option === selectedOption) option.classList.add('incorrect');
    });

    const feedback = $('feedback');
    feedback.textContent = correct
      ? '정답이에요! 잘 기억하고 있네요 ✨'
      : `아쉬워요. 정답은 “${question.meaning}”이에요.`;
    feedback.className = correct ? 'feedback-correct' : 'feedback-wrong';
    nextButton.disabled = false;
    nextButton.innerHTML = questionIndex === questions.length - 1
      ? '결과 보기 <span>→</span>'
      : '다음 단어 <span>→</span>';
    updateQuizProgress(questionIndex + 1);
  }

  function updateQuizProgress(completed) {
    const progress = $('quiz-progress-bar');
    const percent = (completed / questions.length) * 100;
    progress.style.width = `${percent}%`;
    progress.parentElement.setAttribute('aria-valuemax', String(questions.length));
    progress.parentElement.setAttribute('aria-valuenow', String(completed));
  }

  function checkOrContinue() {
    if (!hasAnswered) return;
    questionIndex += 1;
    if (questionIndex >= questions.length) showResult();
    else renderQuestion();
  }

  function showResult() {
    questionCard.hidden = true;
    $('current-count').textContent = String(questions.length).padStart(2, '0');
    updateQuizProgress(questions.length);
    resultCard.hidden = false;
    $('score-value').textContent = String(score);
    $('result-message').textContent = score === questions.length
      ? '완벽해요! 오늘의 단어를 모두 익혔어요.'
      : score >= 7
        ? '정말 잘했어요! 꾸준히 하면 더 많이 기억할 수 있어요.'
        : '좋은 시작이에요. 다시 도전하면 더 익숙해질 거예요.';
  }

  function startQuiz() {
    if (words.length < 4) {
      questionCard.innerHTML = '<p class="quiz-error">퀴즈를 시작할 단어 데이터가 부족합니다.</p>';
      return;
    }
    questions = shuffle(words).slice(0, Math.min(QUIZ_SIZE, words.length));
    questionIndex = 0;
    score = 0;
    resultCard.hidden = true;
    questionCard.hidden = false;
    renderQuestion();
  }

  nextButton.addEventListener('click', checkOrContinue);
  $('retry-button').addEventListener('click', startQuiz);
  document.addEventListener('keydown', (event) => {
    if (resultCard.hidden === false || event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^[1-4]$/.test(event.key) && !hasAnswered) {
      answersNode.querySelectorAll('.answer-option')[Number(event.key) - 1]?.click();
    } else if (event.key === 'Enter' && !nextButton.disabled && event.target.tagName !== 'BUTTON') {
      nextButton.click();
    }
  });

  startQuiz();
})();
