


// Asegúrate de que canvas-confetti se carga correctamente
if (typeof window.confetti === 'undefined') {
    console.error("Canvas-confetti no se ha cargado correctamente.");
} else {
    const confetti = window.confetti;
    const confettiBtn = document.querySelector(".canvas-confetti-btn");

    if (!confettiBtn) {
        console.error("No se ha encontrado el botón.");
    } else {
        const defaults = {
            particleCount: 500,
            spread: 80,
            angle: 50,
        };

        const fire = (particleRatio, opts) => {
            confetti(
                Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(defaults.particleCount * particleRatio),
                })
            );
        };

        confettiBtn.addEventListener("click", () => {
            console.log("Botón clickeado. Disparando confetti...");
            fire(1, {
                spread: 90,
            });
        });

        // Función para disparar confeti cuando el usuario gana
        function triggerConfetti() {
            fire(1, { spread: 90 });
        }
    }
}

console.log(window.confetti);

const maxAttempts = 6;

const hangmanStages = [
    `
     +-----+
     |     |
           |
           |
           |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
           |
           |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
     |     |
           |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
    /|     |
           |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
    /|\\    |
           |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
    /|\\    |
    /      |
           |
    =========
    `,
    `
     +-----+
     |     |
     O     |
    /|\\    |
    / \\    |
           |
    =========
    `
];

let selectedWord = '';
let guessedLetters = [];
let attempts = 0;

// Crear objetos de Audio para los sonidos
const clickSound = new Audio('Sonido/inicio1.mp3');
const restartSound = new Audio('Sonido/big-button-129050.mp3');
const keySound = new Audio('Sonido/beep-6-96243.mp3');
const backgroundSound = new Audio('Sonido/opcion7.mp3'); // Sonido de fondo
const winSound = new Audio('Sonido/urban2.mp4'); // Sonido de victoria
const loseSound = new Audio('Sonido/risa-de-chucky-25744.mp3'); // Sonido de derrota

// Obtener elementos del DOM para la ventana modal
const modal = document.getElementById("myModal");
const modalVideo = document.getElementById('modal-video');
const modalMessage = document.getElementById("modal-message");
const closeBtn = document.querySelector(".close");
const messageElement = document.getElementById("message");

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');
    const wordInput = document.getElementById('word-input');
    const soundToggleButton = document.getElementById('sound-toggle-btn');
    const restartButton2 = document.getElementById('restart-btn2');
    const introVideo = document.getElementById('intro-video');

    if (startButton && restartButton && wordInput && soundToggleButton) {
        startButton.addEventListener('click', () => {
            playClickSound(); // Reproducir sonido al hacer clic en el botón de iniciar
            initializeGame();
        });
        restartButton.addEventListener('click', () => {
            playRestartSound(); // Reproducir sonido al hacer clic en el botón de reinicio
            resetGame();
        });
        if (restartButton2) {
            restartButton2.addEventListener('click', () => {
                resetGame(); // Llamar a la función para reiniciar el juego
            });
        } else {
            console.error('No se encontró el botón de reinicio.');
        }

        soundToggleButton.addEventListener('click', function () {
            if (backgroundSound.paused) {
                playBackgroundSound();
                this.textContent = 'Pausar Sonido';
            } else {
                stopBackgroundSound();
                this.textContent = 'Reproducir Sonido';
            }
        });

        if (introVideo) {
            introVideo.addEventListener('ended', () => {
                document.getElementById('video-section').style.display = 'none';
                document.getElementById('start-section').style.display = 'block';
            });
        } else {
            console.error('No se encontró el elemento del video.');
        }
    } else {
        console.error('No se encontraron algunos de los botones o el campo de entrada.');
    }
});

// Función para reproducir el sonido del clic
function playClickSound() {
    clickSound.play();
}

// Función para reproducir el sonido de reinicio
function playRestartSound() {
    restartSound.play();
}

// Función para reproducir el sonido de la tecla
function playKeySound() {
    keySound.play();
}

// Función para reproducir el sonido de fondo
function playBackgroundSound() {
    backgroundSound.loop = true; // Hacer que el sonido se repita en bucle
    backgroundSound.play();
}

// Función para detener el sonido de fondo
function stopBackgroundSound() {
    backgroundSound.pause();
    backgroundSound.currentTime = 0; // Reiniciar el tiempo de reproducción al inicio
}

// Función para reproducir el sonido de victoria en bucle
function playWinSound() {
    winSound.loop = true; // Hacer que el sonido se repita en bucle
    winSound.play();
}

// Función para detener el sonido de victoria
function stopWinSound() {
    winSound.pause();
    winSound.currentTime = 0; // Reiniciar el tiempo de reproducción al inicio
}

// Función para reproducir el sonido de derrota en bucle
function playLoseSound() {
    loseSound.loop = true; // Hacer que el sonido se repita en bucle
    loseSound.play();
}

// Función para detener el sonido de derrota
function stopLoseSound() {
    loseSound.pause();
    loseSound.currentTime = 0; // Reiniciar el tiempo de reproducción al inicio
}

function initializeGame() {
    const wordInput = document.getElementById('word-input');
    selectedWord = wordInput.value.trim().toUpperCase();

    if (!isValidWord(selectedWord)) {
        const warningMessage = document.getElementById('warning-message');
        if (warningMessage) {
            warningMessage.textContent = 'Por favor, ingresa solo una o dos palabras (sin números ni símbolos).';
            warningMessage.style.display = 'block'; // Mostrar el mensaje de advertencia
        }
        return;
    }

    // Limpiar el mensaje de advertencia
    const warningMessage = document.getElementById('warning-message');
    if (warningMessage) {
        warningMessage.textContent = '';
        warningMessage.style.display = 'none'; // Ocultar el mensaje de advertencia
    }

    guessedLetters = [];
    attempts = 0;
    displayWord();
    displayKeyboard();
    updateHangmanText();

    // Limpiar el campo de entrada y ocultarlo
    wordInput.value = '';
    wordInput.style.display = 'none'; // Ocultar el campo de entrada

    const message = document.getElementById('message');
    if (message) {
        message.textContent = '';
    }

    // Ocultar la sección de inicio y mostrar el juego
    document.getElementById('start-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';

    // Reproducir el sonido de fondo si no está ya en reproducción
    if (backgroundSound.paused) {
        playBackgroundSound();
    }
}

function isValidWord(word) {
    // Acepta solo palabras sin números ni símbolos
    const regex = /^[A-Z\s]+$/; // Solo letras y espacios
    return regex.test(word) && word.split(' ').length <= 2; // Permitir una o dos palabras
}

function resetGame() {
    // Ocultar la sección del juego y mostrar la sección de inicio
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('start-section').style.display = 'block';

    // Limpiar el mensaje de estado y el campo de entrada
    const message = document.getElementById('message');
    if (message) {
        message.textContent = '';
    }

    const warningMessage = document.getElementById('warning-message');
    if (warningMessage) {
        warningMessage.textContent = ''; // Limpiar advertencia
        warningMessage.style.display = 'none'; // Ocultar advertencia
    }

    const wordInput = document.getElementById('word-input');
    if (wordInput) {
        wordInput.value = '';
        wordInput.style.display = 'inline'; // Mostrar el campo de entrada
    }

    document.getElementById('restart-btn').style.display = 'none'; // Ocultar el botón de reinicio
    document.getElementById('restart-btn2').style.display = 'none'; // Ocultar el botón de reinicio

    // Detener el sonido de fondo
    stopBackgroundSound();

    // Detener el sonido de victoria o derrota si están en reproducción
    stopWinSound();
    stopLoseSound();

    // Cerrar el modal si está abierto
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
        modalVideo.pause(); // Pausar el video al cerrar el modal
        modalVideo.src = ''; // Limpiar la fuente del video para evitar que se reproduzca al volver a abrir el modal

        // Reanudar el sonido de fondo al cerrar el modal
        playBackgroundSound();

        // Detener los sonidos de victoria y derrota cuando se cierra el modal
        stopWinSound();
        stopLoseSound();
    }
}

function displayWord() {
    const wordContainer = document.getElementById('word');
    if (wordContainer) {
        // Mostrar asteriscos para cada letra y espacios en blanco
        wordContainer.innerHTML = selectedWord.split('').map(letter =>
            guessedLetters.includes(letter) ? letter : (letter === ' ' ? '&nbsp;' : '*')
        ).join(' ');
    }
}

function displayKeyboard() {
    const keyboardContainer = document.getElementById('keyboard');
    keyboardContainer.innerHTML = ''; // Limpiar el contenido previo del teclado

    for (let i = 65; i <= 90; i++) { // Letras de la A a la Z (códigos ASCII 65 a 90)
        const button = document.createElement('button');
        button.textContent = String.fromCharCode(i); // Convertir el código ASCII a letra
        button.className = 'key'; // Clase para el estilo del botón
        button.addEventListener('click', () => {
            handleGuess(button.textContent); // Manejar la adivinanza
            button.classList.add('off'); // Añadir clase para indicar que se ha hecho clic
            button.disabled = true; // Deshabilitar el botón después de hacer clic
            playKeySound(); // Reproducir sonido de tecla
        });
        keyboardContainer.appendChild(button); // Agregar el botón al contenedor del teclado
    }
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter) || attempts >= maxAttempts) return;

    guessedLetters.push(letter);

    if (selectedWord.includes(letter)) {
        displayWord();
        if (selectedWord.split('').every(letter => guessedLetters.includes(letter) || letter === ' ')) {
            showWinningMessage();
            document.getElementById('restart-btn').style.display = 'block';
            document.getElementById('restart-btn2').style.display = 'block'; // Mostrar también el botón de reinicio secundario
            triggerConfetti(); // Disparar confetti cuando el usuario gana
        }
    } else {
        attempts++;
        updateHangmanText();
        if (attempts >= maxAttempts) {
            showLosingMessage();
            document.getElementById('restart-btn').style.display = 'block';
            document.getElementById('restart-btn2').style.display = 'block'; // Mostrar también el botón de reinicio secundario
        }
    }
}

function showWinningMessage() {
    const message = document.getElementById('message');
    if (message) {
        message.textContent = '¡Ganaste Compa!';
        message.style.fontSize = '1em'; // Aumentar el tamaño del texto
        message.style.color = 'green'; // Color verde
        message.style.fontWeight = 'bold'; // Negrita
        message.style.textAlign = 'center'; // Centrar el texto
        message.classList.add('celebrate'); // Añadir clase para animación

        setTimeout(() => {
            message.classList.remove('celebrate');
        }, 2000); // Duración de la animación en milisegundos

        playWinSound(); // Reproducir sonido de victoria en bucle
        showModal('win'); // Mostrar el modal de victoria
    }
}

function showLosingMessage() {
    const message = document.getElementById('message');
    if (message) {
        message.textContent = 'Perdiste Salame! La palabra era: ' + selectedWord;
        message.style.fontSize = '1em'; // Aumentar el tamaño del texto
        message.style.color = 'red'; // Color rojo
        message.style.fontWeight = 'bold'; // Negrita
        message.style.textAlign = 'center'; // Centrar el texto
        message.classList.add('celebrate'); // Añadir clase para animación

        setTimeout(() => {
            message.classList.remove('celebrate');
        }, 2000); // Duración de la animación en milisegundos

        playLoseSound(); // Reproducir sonido de derrota en bucle
        showModal('lose'); // Mostrar el modal de derrota
    }
}

function showModal(result) {
    // Pausar el sonido de fondo al mostrar el modal
    stopBackgroundSound();

    if (result === 'win') {
        modalVideo.src = 'video/urban1.mp4'; // Ruta al video de victoria
        modalMessage.textContent = '¡Felicidades, ganaste!';
        playWinSound(); // Reproducir el sonido de victoria en bucle
    } else if (result === 'lose') {
        modalVideo.src = 'video/perderc.mp4'; // Ruta al video de derrota
        modalMessage.textContent = ' Inténtalo Nuevamente.';
        playLoseSound(); // Reproducir el sonido de derrota en bucle
    }
    modal.style.display = 'block'; // Mostrar el modal
    modalVideo.play(); // Reproducir el video automáticamente
}

// Event listener para el botón de cierre del modal
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
    modalVideo.pause(); // Pausar el video al cerrar el modal
    modalVideo.src = ''; // Limpiar la fuente del video para evitar que se reproduzca al volver a abrir el modal

    // Reanudar el sonido de fondo al cerrar el modal
    playBackgroundSound();

    // Detener los sonidos de victoria y derrota cuando se cierra el modal
    stopWinSound();
    stopLoseSound();
});

// Event listener para hacer clic fuera del modal para cerrarlo
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        modalVideo.pause(); // Pausar el video al cerrar el modal
        modalVideo.src = ''; // Limpiar la fuente del video

        // Reanudar el sonido de fondo al cerrar el modal
        playBackgroundSound();

        // Detener los sonidos de victoria y derrota cuando se cierra el modal
        stopWinSound();
        stopLoseSound();
    }
});

function updateHangmanText() {
    const hangmanText = document.getElementById('hangman-text');
    if (hangmanText) {
        hangmanText.textContent = hangmanStages[attempts];

        // Aplicar colores específicos según el número de intentos
        switch (attempts) {
            case 0:
                hangmanText.style.color = '#000'; // Color para la etapa 0
                break;
            case 1:
                hangmanText.style.color = '#ff0000'; // Color para la etapa 1
                break;
            case 2:
                hangmanText.style.color = '#ff6600'; // Color para la etapa 2
                break;
            case 3:
                hangmanText.style.color = '#ffcc00'; // Color para la etapa 3
                break;
            case 4:
                hangmanText.style.color = '#99cc00'; // Color para la etapa 4
                break;
            case 5:
                hangmanText.style.color = '#3399ff'; // Color para la etapa 5
                break;
            case 6:
                hangmanText.style.color = '#cc33ff'; // Color para la etapa 6
                break;
            default:
                hangmanText.style.color = '#000'; // Color por defecto
                break;
        }
    }
}

function generateRandomWord() {
    const words = ["sol", "diferente amistades"];
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

// Manejo del botón "Random"
document.getElementById('random-btn').addEventListener('click', function () {
    const randomWord = generateRandomWord();
    document.getElementById('word-input').value = randomWord;
});

document.addEventListener('DOMContentLoaded', () => {
    const restartButton2 = document.getElementById('restart-btn2');

    if (restartButton2) {
        restartButton2.addEventListener('click', () => {
            resetGame(); // Llamar a la función para reiniciar el juego
        });
    } else {
        console.error('No se encontró el botón de reinicio.');
    }
});








// script.js

document.addEventListener('DOMContentLoaded', function () {
    // Obtener los elementos
    const startButton = document.getElementById('start-button');
    const videoSection = document.getElementById('video-section');
    const startSection = document.getElementById('start-section');

    // Añadir evento de clic al botón "Empezar Ya"
    startButton.addEventListener('click', function (event) {
        event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
        videoSection.style.display = 'none'; // Ocultar la sección del video
        startSection.style.display = 'block'; // Mostrar la sección de inicio
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const startVideoButton = document.getElementById('start-button');
    const introVideo = document.getElementById('intro-video');
    const videoSection = document.getElementById('video-section');
    const startSection = document.getElementById('start-section');

    if (startVideoButton && introVideo) {
        startVideoButton.addEventListener('click', (event) => {
            event.preventDefault(); // Evitar el comportamiento predeterminado del enlace
            
            // Detener el video y el sonido
            introVideo.pause();
            introVideo.currentTime = 0; // Opcional: Reiniciar el video al inicio

            // Ocultar la sección del video
            videoSection.style.display = 'none';

            // Mostrar la sección de inicio
            startSection.style.display = 'block';
        });
    } else {
        console.error('No se encontró el botón "Empezar Ya" o el video.');
    }
});
