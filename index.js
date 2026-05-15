// --- CONFIGURAÇÃO DE ÁUDIO ---
const musicaVitoria = new Audio('vitoria.mp3'); // Certifique-se de ter o arquivo na pasta
const musicaDerrota = new Audio('errado.mp3');
const somDica = new Audio('dica.mp3');
somDica.volume = 0.3;

async function obterDica() {
    const hintText = document.getElementById('hint-text');
    const hintBtn = document.getElementById('hint-btn');

    try {
        // Chamada para a API (Ajuste o endpoint se for diferente de /status)
        const response = await fetch(`${URL_API}/status`, {
            credentials: 'include',
            method: 'GET'
        });

        const data = await response.json();

        // Verificando se a API retornou um campo 'dica' ou 'tema'
        const dicaGerada = data.dica || data.tema || "Sem dicas disponíveis para esta palavra.";

        // Atualiza o texto e toca o som
        hintText.innerText = `💡 Dica: ${dicaGerada}`;
        somDica.play();

        // Efeito visual de revelação
        hintText.classList.remove('hidden-hint');
        hintText.classList.add('show-hint');

        // Desabilita o botão para não clicar várias vezes
        hintBtn.style.opacity = "0.5";
        hintBtn.disabled = true;
        hintBtn.innerText = "Dica Revelada";

    } catch (err) {
        console.error("Erro ao buscar dica:", err);
        hintText.innerText = "Erro ao sintonizar sinal de dica...";
    }
}

// IMPORTANTE: No seu reiniciarJogo(), resete o botão de dica
function resetarBotaoDica() {
    const hintBtn = document.getElementById('hint-btn');
    const hintText = document.getElementById('hint-text');

    hintBtn.disabled = false;
    hintBtn.style.opacity = "1";
    hintBtn.innerText = "Revelar Dica";
    hintText.classList.add('hidden-hint');
    hintText.classList.remove('show-hint');
}

musicaVitoria.volume = 0.5;
musicaDerrota.volume = 0.5;

// --- ELEMENTOS DO DOM ---
const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const wordDisplay = document.getElementById('word-display');
const gameMessage = document.getElementById('game-message');
const errorCount = document.getElementById('error-count');
const resetBtn = document.getElementById('reset-btn');

const URL_API = 'https://api-palavras-8ptt.onrender.com/';

// Inicia o jogo ao digitar o nickname
async function iniciarJogo(event) {
    if (event.key === "Enter") {
        const nickname = document.getElementById('nickname-input').value;

        if (!nickname) {
            alert('Ei! Digite um nickname para começar a lenda.');
            return;
        }

        try {
            const response = await fetch(`${URL_API}/iniciar`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname: nickname })
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

// Busca a estrutura da palavra (os slots vazios)
async function buscarPalavra() {
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
}

// Lógica de tentativa de letra
async function tentarLetra(event) {
    if (event.key !== "Enter") return;

    const input = document.getElementById('letter-input');
    const caractere = input.value;
    input.value = '';
    input.focus();

    if (!caractere) return;

    const response = await fetch(`${URL_API}/tentativa`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caractere: caractere })
    });

    const data = await response.json();

    // Atualiza as letras no visual se houver acerto
    if (data.posicoes) {
        data.posicoes.forEach(pos => {
            const slot = document.getElementById(`slot-${pos}`);
            if (slot) {
                slot.innerText = caractere;
                slot.style.borderColor = 'var(--success)'; // Brilho verde ao acertar
            }
        });

        errorCount.innerText = data.erros_atuais;
        gameMessage.innerText = data.mensagem;

        // --- VERIFICAÇÃO DE FIM DE JOGO ---
        if (data.status_jogo !== 'Jogando') {

            // ... dentro de if (data.status_jogo !== 'Jogando')

            const revealContainer = document.getElementById('word-reveal-container');
            const finalWordDisplay = document.getElementById('final-word-display');

            // 1. Buscamos o status final para garantir que temos a palavra completa
            const statusResponse = await fetch(`${URL_API}/status`, {
                credentials: 'include',
                method: 'GET'
            });
            const statusData = await statusResponse.json();

            // 2. Exibimos a palavra (ajuste 'statusData.palavra' conforme o nome do campo na sua API)
            if (statusData.palavra) {
                finalWordDisplay.innerText = statusData.palavra;
                revealContainer.classList.remove('hidden');
            }

            // 3. O restante da sua lógica de som e flash continua aqui...
            resetBtn.classList.remove('hidden');

            if (data.status_jogo === 'Derrota') {
                // Toca som de derrota
                musicaDerrota.play();
                gameMessage.style.color = 'var(--error)';
                gameMessage.innerText = "GAME OVER: " + data.mensagem;
            } else {
                // Toca som de vitória
                musicaVitoria.play();
                gameMessage.style.color = 'var(--success)';
                gameMessage.innerText = "VITÓRIA ÉPICA: " + data.mensagem;

                // Efeito extra de brilho no container
                gameContainer.style.boxShadow = "0 0 50px var(--success)";
            }

            // Desabilita o input para não jogar mais após o fim
            input.disabled = true;
        }
    }
}

function reiniciarJogo() {
    // Para as músicas antes de recarregar
    musicaVitoria.pause();
    musicaDerrota.pause();
    location.reload();
}




// ... (resto do seu JS no topo permanece igual)

// Lógica de tentativa de letra (Atualizada para os efeitos de flash)
async function tentarLetra(event) {
    if (event.key !== "Enter") return;

    const input = document.getElementById('letter-input');
    const caractere = input.value;
    input.value = '';
    input.focus();

    if (!caractere) return;

    try {
        const response = await fetch(`${URL_API}/tentativa`, {
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

                // Captura o container do jogo para aplicar a animação
                const container = document.querySelector('.container');

                if (data.status_jogo === 'Derrota') {
                    musicaDerrota.play();
                    gameMessage.style.color = 'var(--error)';
                    gameMessage.innerText = "GAME OVER: " + data.mensagem;

                    // Adiciona a classe de pisca-pisca vermelho
                    container.classList.add('lose-flash');

                    // Remove a classe após a animação acabar (3 * 0.2s = 0.6s)
                    setTimeout(() => {
                        container.classList.remove('lose-flash');
                        // Deixa uma sombra vermelha sutil permanente após piscar
                        container.style.boxShadow = "0 0 30px rgba(255, 0, 85, 0.3)";
                    }, 600);

                } else {
                    musicaVitoria.play();
                    gameMessage.style.color = 'var(--success)';
                    gameMessage.innerText = "VITÓRIA ÉPICA: " + data.mensagem;

                    // Adiciona a classe de pisca-pisca verde
                    container.classList.add('win-flash');

                    // Remove a classe após a animação acabar
                    setTimeout(() => {
                        container.classList.remove('win-flash');
                        // Deixa uma sombra verde sutil permanente após piscar
                        container.style.boxShadow = "0 0 30px rgba(0, 255, 136, 0.3)";
                    }, 600);
                }
            }
        }
    } catch (err) {
        console.error("Erro na tentativa:", err);
    }
}

function reiniciarJogo() {
    pararMusicas();
    // Limpa qualquer sombra residual no container antes de recarregar
    const container = document.querySelector('.container');
    container.style.boxShadow = "";
    container.classList.remove('win-flash', 'lose-flash');

    location.reload();
}
