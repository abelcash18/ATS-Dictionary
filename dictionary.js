let audioUrl;

const userSearch = document.getElementById('userSearch');
const wordSearch = document.getElementById('wordSearch');
const phoneticText = document.getElementById('phoneticText');
const playWord = document.getElementById('playWord');
const partSpeech = document.getElementById('partSpeech');
const audioContainer = document.getElementById('audioContainer');
const installBtn = document.getElementById('installBtn');
const searchForm = document.getElementById('searchForm');

let activeController = null;

function setAudioUI(enabled) {
  audioContainer.style.opacity = enabled ? '1' : '0.3';
  audioContainer.style.cursor = enabled ? 'pointer' : 'default';
  playWord.style.pointerEvents = enabled ? 'auto' : 'none';
}

function renderData(data) {
  partSpeech.innerHTML = '';

  const fragment = document.createDocumentFragment();

  data.forEach((item) => {
    wordSearch.textContent = item.word.toUpperCase();

    const phonetic = item.phonetics?.find((p) => p.text);
    phoneticText.textContent = phonetic?.text ?? 'N/A';

    const audio = item.phonetics?.find((p) => p.audio);
    audioUrl = audio?.audio ?? null;

    setAudioUI(Boolean(audioUrl));

    (item.meanings || []).forEach((meaning) => {
      const synonyms = meaning.synonyms?.join(', ') || '—';
      const antonyms = meaning.antonyms?.join(', ') || '—';

      (meaning.definitions || []).forEach((def) => {
        const definition = def.definition?.length > 100
          ? `${def.definition.slice(0, 100)}...`
          : def.definition;

        const tr = document.createElement('tr');

        const tdPos = document.createElement('td');
        tdPos.textContent = meaning.partOfSpeech ?? '—';

        const tdDef = document.createElement('td');
        tdDef.textContent = definition ?? '—';

        const tdSem = document.createElement('td');
        tdSem.innerHTML = `Synonyms: ${synonyms} <br> Antonyms: ${antonyms}`;

        tr.appendChild(tdPos);
        tr.appendChild(tdDef);
        tr.appendChild(tdSem);

        fragment.appendChild(tr);
      });
    });
  });

  partSpeech.appendChild(fragment);
}

async function fetchWordEntry(query, { signal } = {}) {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`,
    { signal }
  );
  const data = await res.json();

  // dictionaryapi.dev returns an error object with {title,...} for not found
  if (!res.ok || !Array.isArray(data)) {
    throw new Error('Not Found');
  }

  return data;
}

async function searchWord() {
  const query = userSearch.value.trim();
  if (!query) return;

  if (activeController) activeController.abort();
  activeController = new AbortController();

  wordSearch.textContent = 'Loading...';
  phoneticText.textContent = '';
  partSpeech.innerHTML = '';
  setAudioUI(false);

  try {
    const data = await fetchWordEntry(query, { signal: activeController.signal });
    renderData(data);
  } catch (err) {
    if (err?.name === 'AbortError') return;

    wordSearch.textContent = 'Not Found';
    phoneticText.textContent = '';
    partSpeech.innerHTML = '<tr><td colspan="3">No definition found.</td></tr>';
    setAudioUI(false);
  }
}

// Form submit (modern)
searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  searchWord();
});

// Keystroke fallback
userSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchWord();
});

async function loadRandomWord() {
  askNotificationPermission();

  try {
    const res = await fetch('https://random-word-api.herokuapp.com/word?number=1');
    const [wordObj] = await res.json();
    if (!wordObj) return;
    userSearch.value = wordObj;
    await searchWord();
  } catch {
    // ignore silently
  }
}

playWord.addEventListener('click', async () => {
  if (!audioUrl) return;
  try {
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch {
    // playback blocked
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((err) => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// Handle Install Prompt (avoid multiple listeners)
let deferredPrompt;
if (window.matchMedia('(display-mode: browser)').matches) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
  });
}

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.style.display = 'none';
  deferredPrompt.prompt();

  try {
    const choiceResult = await deferredPrompt.userChoice;
    console.log(
      choiceResult?.outcome === 'accepted'
        ? 'User accepted the install prompt'
        : 'User dismissed the install prompt'
    );
  } finally {
    deferredPrompt = null;
  }
});

function askNotificationPermission() {
  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      console.log('Notification Permission:', permission);
    });
  }
}

window.addEventListener('load', () => {
  loadRandomWord();
});

