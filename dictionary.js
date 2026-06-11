let audioUrl;
    const userSearch = document.getElementById('userSearch');
    const wordSearch = document.getElementById('wordSearch');
    const phoneticText = document.getElementById('phoneticText');
    const playWord = document.getElementById('playWord');
    const partSpeech = document.getElementById('partSpeech');
    const audioContainer = document.getElementById('audioContainer');

    const renderData = (data) => {
        partSpeech.innerHTML = '';
        data.forEach(item => {
            wordSearch.textContent = item.word.toUpperCase();

            const phonetic = item.phonetics.find(p => p.text);
            phoneticText.textContent = phonetic ? phonetic.text : 'N/A';

            const audio = item.phonetics.find(p => p.audio);
            audioUrl = audio ? audio.audio : null;

            
            audioContainer.style.opacity = audioUrl ? '1' : '0.3';
            audioContainer.style.cursor = audioUrl ? 'pointer' : 'default';

            item.meanings.forEach(meaning => {
                meaning.definitions.forEach(def => {
                    partSpeech.innerHTML += `
                        <tr>
                            <td>${meaning.partOfSpeech}</td>
                            <td>${def.definition.length > 100 ? def.definition.slice(0, 100) + '...' : def.definition}</td>
                            <td>Synonyms: ${meaning.synonyms?.join(', ') || '—'} <br> Antonyms: ${meaning.antonyms?.join(', ') || '—'}</td>
                        </tr>`;
                });
            });
        });
    };

    const searchWord = () => {
        const query = userSearch.value.trim();
        if (!query) return;

        wordSearch.textContent = "Loading...";
        phoneticText.textContent = "";
        partSpeech.innerHTML = "";

        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
            .then(res => res.json())
            .then(data => renderData(data))
            .catch(err => {
                wordSearch.textContent = "Not Found";
                phoneticText.textContent = "";
                partSpeech.innerHTML = `<tr><td colspan="3">No definition found.</td></tr>`;
            });
    };

    userSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchWord();
    });

    window.addEventListener('load', () => {
        askNotificationPermission()
        fetch('https://random-word-api.herokuapp.com/word?number=1')
            .then(res => res.json())
            .then(([wordObj]) => {
                const word = wordObj;                
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
                    .then(res => res.json())
                    .then(data => renderData(data))
                    .catch(err => {
                        wordSearch.textContent = "Not Found";
                        phoneticText.textContent = "";
                        partSpeech.innerHTML = `<tr><td colspan="3">No definition found.</td></tr>`;
                    });
            });
    });

    playWord.addEventListener('click', () => {
        playWord.innerHTML = '';
        if (audioUrl) {
            // const icon = document.createElement('i');
            // icon.className = 'fa-solid fa-ear-listen';
            // playWord.appendChild(icon);
            const audio = new Audio(audioUrl);

            audio.play();
            // audio.addEventListener('ended', () => {
            //     playWord.innerHTML = '';
            // });
        }
    });


    if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        }, function(err) {
            console.log('Service Worker registration failed:', err);
        });
    });
}

// Handle Install Prompt
let deferredPrompt;
let installBtn = document.getElementById('installBtn')
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
});

function askNotificationPermission(){
    if(Notification.permission === 'default'){
        Notification.requestPermission().then(permission =>{
            console.log("Notification Permission:", permission);
        })
    }
}
// const notifyMe =() =>{
//     if(Notification.permission==='granted'){
//         new Notification('thanks for clicking!',{
//             body: 'You just clicked the button.',
//             icon: 'https://example.com/icon.png'
//         })
//     }else{
//         alert('please alert notification to receive alerts')
//     }
// }
