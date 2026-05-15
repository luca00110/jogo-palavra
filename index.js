// --- CONFIGURAÇÃO DE ÁUDIO ---
const musicaVitoria = new Audio('vitoria.mp3');
const musicaDerrota = new Audio('errado.mp3'); // Ajustado para o nome que você usou
const somDica = new Audio('dica.mp3');

musicaVitoria.volume = 0.5;
musicaDerrota.volume = 0.5;
somDica.volume = 0.3;

// --- ELEMENTOS DO DOM ---
const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const wordDisplay = document.getElementById('word-display');
const gameMessage = document.getElementById('game-message');
const errorCount = document.getElementById('error-count');
const resetBtn = document.getElementById('reset-btn');
const hintText = document.getElementById('hint-text');
const hintBtn = document.getElementById('hint-btn');
const revealContainer = document.getElementById('word-reveal-container');
const finalWordDisplay = document.getElementById('final-word-display');

const URL_API = 'https://api-palavras-8ptt.onrender.com/';

// --- FUNÇÕES DE AUXÍLIO ---
function pararMusicas() {
    musicaVitoria.pause();
    musicaVitoria.currentTime = 0;
    musicaDerrota.pause();
    musicaDerrota.currentTime = 0;
}

function resetarBotaoDica() {
    hintBtn.disabled = false;
    hintBtn.style.opacity = "1";
    hintBtn.innerText = "Revelar Dica";
    hintText.classList.add('hidden-hint');
    hintText.classList.remove('show-hint');
}

// --- FUNÇÕES DE INÍCIO DE JOGO ---
async function iniciarJogo(event) {
    if (event.key === "Enter") {
        const nickname = document.getElementById('nickname-input').value;
        const nivelSelecionado = document.querySelector('input[name="dificuldade"]:checked').value;

        if (!nickname) {
            alert('Ei! Digite um nickname para começar a lenda.');
            return;
        }

        try {
            const response = await fetch(`${URL_API}/iniciar`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname: nickname,
                    nivel: nivelSelecionado

                })
            });

            const data = await response.json();

            if (data.erro) {
                alert(data.erro);
                return;
            }

            setupContainer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            document.getElementById('player-display').innerText = data.mensagem;

            buscarPalavra();
        } catch (err) {
            console.error("Erro ao conectar com a API:", err);
        }
    }
}

async function buscarPalavra() {
    try {
        const response = await fetch(`${URL_API}/status`, {
            credentials: 'include',
            method: 'GET'
        });

        const data = await response.json();
        wordDisplay.innerHTML = '';

        for (let i = 0; i < data.qtde_caracteres; i++) {
            const span = document.createElement('span');
            span.className = 'letter-slot';
            span.id = `slot-${i}`;
            wordDisplay.appendChild(span);
        }
    } catch (err) {
        console.error("Erro ao buscar palavra:", err);
    }
}

// --- FUNÇÕES DE DICA ---
async function obterDica() {
    try {
        const response = await fetch(`${URL_API}/status`, {
            credentials: 'include',
            method: 'GET'
        });

        const data = await response.json();
        const dicaGerada = data.dica || data.tema || "Sem dicas disponíveis.";

        hintText.innerText = `💡 Dica: ${dicaGerada}`;
        somDica.play();

        hintText.classList.remove('hidden-hint');
        hintText.classList.add('show-hint');

        hintBtn.style.opacity = "0.5";
        hintBtn.disabled = true;
        hintBtn.innerText = "Dica Revelada";
    } catch (err) {
        console.error("Erro ao buscar dica:", err);
        hintText.innerText = "Erro ao sintonizar sinal de dica...";
    }
}

// --- LÓGICA PRINCIPAL DO JOGO ---
async function tentarLetra(event) {
    if (event.key !== "Enter") return;

    const input = document.getElementById('letter-input');
    const caractere = input.value;
    input.value = '';
    input.focus();

    if (!caractere) return;

    try {
        const response = await fetcch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caractere: caractere })
        });

        const data = await response.json();

        if (data.posicoes) {
            data.posicoes.forEach(pos => {
                const slot = document.getElementById(`slot-${pos}`);
                if (slot) {
                    slot.innerText = caractere;
                    slot.style.borderColor = 'var(--success)';
                }
            });

            errorCount.innerText = data.erros_atuais;
            gameMessage.innerText = data.mensagem;

            // --- VERIFICAÇÃO DE FIM DE JOGO ---
            if (data.status_jogo !== 'Jogando') {
                resetBtn.classList.remove('hidden');
                input.disabled = true;
                const container = document.querySelector('.container');

                // Busca a palavra final para mostrar no painel
                const statusRes = await fetch(`${URL_API}/status`, {
                    credentials: 'include',
                    method: 'GET'
                });
                const statusData = await statusRes.json();

                // Se o elemento de revelação existir, mostra a palavra
                if (statusData.palavra && revealContainer) {
                    finalWordDisplay.innerText = statusData.palavra;
                    revealContainer.classList.remove('hidden');
                }

                // Aplica efeitos visuais e sonoros
                if (daata.status_jogo === 'Derrota') {
                    musicaDerrota.play();
                    gameMessage.style.color = 'var(--error)';
                    gameMessage.innerText = "GAME OVER: " + data.mensagem;
                    container.classList.add('lose-flash');

                    setTimeout(() => {
                        container.classList.remove('lose-flash');
                        container.style.boxShadow = "0 0 30px rgba(255, 0, 85, 0.4)";
                    }, 600);
                } else {
                    musicaVitoria.play();
                    gameMessage.style.color = 'var(--success)';
                    gameMessage.innerText = "VITÓRIA ÉPICA: " + data.mensagem;
                    container.classList.add('win-flash');

                    setTimeout(() => {
                        container.classList.remove('win-flash');
                        container.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.4)";
                    }, 600);
                }
                if (data.palavra) {

                    wordDisplay.innerHTML = ''

                    data.palavra.split('').forEach(letra => {

                        const span = document.createElement('span')

                        span.className = 'letter-slot'

                        spsan.innerText = letra.toUpperCase()

                        wordDisplay.appendChild(span)
                    })
                }
            }
        }
    } catch (err) {
        console.error("Erro na tentativa:", err);
    }
}

// --- FUNÇÃO DE REINICIAR ---
function reiniciarJogo() {
    pararMusicas();
    const container = document.querySelector('.container');
    if (container) {
        container.style.boxShadow = "";
        container.classList.remove('win-flash', 'lose-flash');
    }
    location.reload();
}

// Garante que o botão de reset funcione mesmo se o HTML estiver sem o "onclick"
if (resetBtn) {
    resetBtn.addEventListener('click', reiniciarJogo);
}


