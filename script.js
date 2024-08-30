

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

    TE QUEDAN 5 OPORTUNIDADES...
    `,
    `
     +-----+
     |     |
      O     | 
     |     |
           |
           |
    =========

    MMMM... TE QUEDAN 4 OPORTUNIDADES.
    `,
    `
     +-----+
     |     |
     O     |
    /|     |
           |
           |
    =========

    OJO...  TE QUEDAN 3 OPORTUNIDADES  
    `,
    `
     +-----+
     |     |
     O     |
    /|\\    |
           |
           |
    =========
   PERO NO LEESSSS... 
TE QUEDAN 2 OPORTUNIDADES
    `,
    `
     +-----+
     |     |
     O     |
    /|\\    |
    /      |
           |
    =========
    DONDE APRENDISTE A DELETREAR PALABRAS... 
     TE QUEDA 1 OPORTUNIDAD 
    Y NO DIGAS QUE NUNCA TE AVISE.. CHAU!!!
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
let score = 0; // Inicializa el contador de puntuación

// Crear objetos de Audio para los sonidos
const clickSound = new Audio('Sonido/inicio1.mp3');
const restartSound = new Audio('Sonido/big-button-129054.mp3');
const keySound = new Audio('Sonido/beep-6-96243.mp3');
const backgroundSound = new Audio('Sonido/opcion7.mp3'); // Sonido de fondo
const winSound = new Audio('Sonido/urban2.mp4'); // Sonido de victoria
const loseSound = new Audio('Sonido/0830.mp4'); // Sonido de derrota
const restartSound2 = new Audio('Sonido/big-button-129050.mp3');

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
    const randomBtn = document.getElementById('random-btn');

    // Cargar el puntaje guardado
    score = loadScore();
    document.getElementById('score').textContent = 'Victorias: ' + score;


    if (startButton && restartButton && wordInput && soundToggleButton && randomBtn) {
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

        // Manejo del botón "Random"
        randomBtn.addEventListener('click', function () {
            this.classList.add('button-active');
            wordInput.classList.add('input-active');/*me permite bloquear imput y poner color*/

            const randomWord = generateRandomWord();
            wordInput.value = randomWord;
            wordInput.disabled = true; // Deshabilitar el campo de entrada después de generar una palabra aleatoria
        });
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
            warningMessage.textContent = 'Por favor, ingresa palabras sin símbolos';
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
    return regex.test(word) && word.split(' ').length <= 93; // Permitir una o dos palabras
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
        wordInput.disabled = false; // Habilitar el campo de entrada
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

        score += 30;
        document.getElementById('score').textContent = 'Victorias: ' + score;
        saveScore(); // Guardar el puntaje en localStorage

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

        score -= 30;
        document.getElementById('score').textContent = 'Victorias: ' + score;
        saveScore(); // Guardar el puntaje en localStorage

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
        modalVideo.src = 'video/CASTELLANO2.mp4'; // Ruta al video de derrota
        modalMessage.textContent = ' Inténtalo Nuevamente.';
        playLoseSound(); // Reproducir el sonido de derrota en bucle
    }
    modal.style.display = 'block'; // Mostrar el modal
    modalVideo.play(); // Reproducir el video automáticamente
}

// Event listener para el botón de cierre del modal
closeBtn.addEventListener('click', function () {
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
window.addEventListener('click', function (event) {
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
    const words = ["sol", "zalamero mujeriego",
        "yate lujoso", "zanahoria grandota", "diferente amistades", "the advengers", "el cisne Negro", "la teniente rada", "harry potter", "transformers", "max game",
        "chuky", "octubre rojo", "sega saturn", "lobezno y deadpool", "counter striker", "el alquimista", "cronicas de pasion", "el bachero", "el mariachi loco",
        "estratosfera", "mutante", "x men", "una venganza mortal", "las aguas rebeldes", "donde empieza todo", "la renga", "la veinticinco", "los piojos",
        "ganas de comerte", "trapito", "pony caballo salvaje", "los cazafantasmas", "jinete sin cabeza", "dia de caza", "geopolitico", "la travesia infernal",
        "secretos ancestrales", "la gran estafa", "extraterrestres", "contramaestres", "aeroterrestres", "sanguijuela de barrio", "la bella durmiente", "amor ciego",
        "la mente infinita", "la mansion encantada", "la nueva conciencia", "las mujeres perfectas", "casi un angel", "termostato", "cancion de cuna", "mil noches",
        "solo un amor", "la ultima estacion", "la quinta estacion", "luz gaggi", "mercado pago", "un solo corazon", "cielo de octubre", "el encargado",
        "dulce hogar", "supernatural", "hola miguel", "hola moe", "vas a morir", "mira la ventana", "alguien te observa", "detras de ti", "mentiroso",
        "risas falsas", "el gordo", "el coleccionista", "coleccionista de huesos", "huevos grandes", "la mamila", "hermanos de sangre", "manufacturacion",
        "los miserables", "mentes brillantes", "mision a martes", "matrix reloaded", "la chimichanga", "olor a ti", "mariposa tecnicolor", "pasos de acero", "gigantes de acero",
        "fabrica de chocolates", "nomadas del viento", "la enredadera", "nunca fuimos angeles", "apocalipsis", "el gran showman", "el hobbit",
        "piratas del caribe", "rosa meltrozo", "polar express", "expreso polar", "por siempre jamas", "prefiero el paraiso", "roca tectonica", "sigo como dios",
        "esta entre nosotros", "smallville", "entre fantasmas", "hombre de famlia", "soy de todas", "todas para mi", "wonder woman", "michael jacson", "aunque te duela",
        "Idiosincrasia", "Otorrinolaringologo", "Desoxirribonucleico", "Paralelepipedo", "mas cuarenta", "max treinta", "Ovoviviparo", "Caleidoscopio", "Electroencefalografista",
        "Transustanciacion", "Hipopotomonstrosesquipedaliofobia", "pneumonoultramicroscopicsilicovolcanoconiosis", "Esternocleidomastoideo", "Parangaricutirimicuaro",
        "Dimetilnitrosamina", "Hexakosioihexekontahexafobia", "fluorescente", "El gran Gatsby", "La casa blanca", "Como agua chocolate", "intoxicado",
        "el ultimo deseo", "el libro perdido", "El corazon helado", "todo es posible", "la vida secreta", "la bicicleta", "despacito", "vivir mi vida",
        "te encontrare", "rayando el sol", "soy tu turrito", "leer es importante", "la familia primero", "soy tu turrita", "seras castigada", "la sangre tira",
        "dejala que vuelva", "si tu supieras", "cuando te vea", "el maximo lider", "luna de miel", "conocimiento es poder", "tus labios rojos",
        "cafè expreso", "ciencia ficcion", "cuentos fabulosos", "demonio infernal", "deporte agresivo", "desayuno", "desflorar", "detectar", "detestar",
        "diabetes", "diacritico", "dialelo", "dicha", "dilapidar", "dinamita", "dinero fácil", "diploma", "discipulo mio", "disco rigido", "discordar",
        "discrepar", "disculpa aceptada", "dispepsia", "dolar blue", "dromedario", "druida", "duda", "duelo mortal", "duende verde", "duodeno",
        "eclipse solar", "economia global", "Ecuador", "electricidad", "elefante", "esmoquin", "elegante", "elenco", "eliminar", "elipse", "elite",
        "elixir", "emocion incontenible", "empatar", "empatia", "emperifollado", "encerrar", "endriago", "energumeno", "enero caluroso", "enjuagar",
        "ensayo musical", "entretenimiento colectivo", "entrevero", "epanadiplosis", "epiceno", "epidemia mundial", "epigrama", "eponimo", "equidna",
        "equinoccio", "erario", "eritrocito", "erótico", "esbirro", "mansion escabrosa", "escafoides", "escamoles", "escamotear", "escaparate", "escarabajo",
        "bruja escarlata", "escatologia", "esceptico", "escorbuto", "escribir novelas", "esfenoides", "esguince", "pintura esmaltada", "espejo rectangular",
        "espía britanico", "esplan", "estafar", "estantigua", "esteatosis", "esteganalisis", "esteril", "cirujia estetica", "estilo", "estimulo",
        "estocastico", "filosofia estoica", "estraperlo", "estratosfera", "eufemismo", "exorcismo", "paisaje exotico", "expedicion Robinson",
        "explicar", "exquisito", "extranjero", "faeton", "billete falso", "faquir", "el faro", "farsante", "fascismo", "favela", "febrero", "feijoada",
        "feretro egipcio", "fetiche", "fettuccine", "fideos largos", "filatelia", "filipica", "filologia", "fiscal", "fisco", "fisgar", "flamenco",
        "flecha rota", "flema", "foco multifuncional", "folclore argento", "foliculo", "foxtrot uno", "fracaso profesional", "franela", "friso",
        "fuente milagrosa", "fuga carcelaria", "fundibulo", "furia sangrienta", "fusil", "gabinete presidencial", "gaceta", "galibo", "gallo dorado",
        "gama media", "ganas dinero", "garaje", "garantia", "error garrafal", "garrapata", "gastronomia vegetariana", "gazapo", "gendarme",
        "genetica animal", "genio artesanal", "geografia", "geranio", "gerenuc", "gitano", "gnomico", "gorila blanco", "gospel", "granate lanus", "gringo",
        "gripe", "grito", "grulla", "guardia medica", "Guatemala", "guillotina", "guiri", "habeas corpus", "hafefobia", "halloween", "hambre",
        "hamburguesa completa", "hapax", "hebilla", "helio", "hemorragia intestinal", "superheroe", "herpes", "hervir arroz", "hibrido", "higado",
        "higiene", "hipocoristico", "hipocresia", "hipopotamo", "hisopo", "hito", "hocico", "hoguera", "honor", "hostia", "humus magico", "huri",
        "iconoclasta", "idilio", "idolo maradona", "iglesia catolica", "ilusion optica", "imprenta clarin", "impresionismo", "inaugurar establecimiento",
        "inconsutil", "incunable", "indigena americano", "indigo", "inexorable", "hermosa infancia", "infarto cardiaco", "influenza", "infulas",
        "inmolar", "inmunidad congenita", "persona inocente", "inquilino", "insigne", "instinto animal", "no insultar", "intuicion femenina",
        "investigar profundamente", "Islas Malvinas", "pie izquierdo", "jabali salvaje", "jabon liquido", "jamon natural", "jaqueca dolorosa",
        "jardin", "jengibre", "jeringa larga", "jinete nocturno", "jitanjafora", "jovial", "judio", "juego mental", "junio largo",
        "kermes mensual", "kiosco veinticuatro", "laberinto infinito", "ladron espiritual", "lagarto juancho", "latinoamericano",
        "lechuga criolla", "guerrero legendario", "soy leyenda", "libelula voladora", "libertinaje juvenil", "libreto musical",
        "libro terrorifico", "frontera limitrofe", "linchar", "litera", "llama ardiente", "llorar impulsivamente", "lona gruesa",
        "la lonja", "lote gigante", "loteria nacional", "lubrican todo", "rey Lucifer", "lujuria divina", "luna roja", "lupanar",
        "luto", "animal macabro", "madrugar", "color magenta", "magnetismo", "magnolia", "rey mago", "mago capria", "maguey",
        "perro malandrin", "malaria", "maleta gris", "malta", "tigre malvado", "nuestras Malvinas", "alto mambo", "mameluco",
        "mandinga", "mandioca", "manglar", "maniqui", "mano larga", "maqueta", "maquina inoxidable", "margarita", "marihuana",
        "marioneta", "mariposa tecnicolor", "mariscal", "marmota", "marrano", "martir", "marzo", "masacre sangrienta", "mascara rara",
        "masoneria africana", "masoquismo grupal", "mastectomia", "no matar", "matricula vehicular", "mayeutica", "mayo", "mayolica",
        "mayonesa danica", "la mazmorra", "mazurca", "meandro", "medico traumatologo", "medula osea", "mefitico", "mejilla derecha",
        "noche melancolica", "melena extravagante", "melodia infinita", "membrillo", "menaje corporal", "mensaje subliminal",
        "mente traviesa", "mentir envejece", "mentor complicado", "mequetrefe", "mercado central", "planeta mercurio", "merengue suizo",
        "merienda", "metafora clasica", "pegaso meteoro", "meteorito Akbarpur", "Mexico hijo", "miel dulce", "milagro angelical",
        "milonga argentina", "mimo espiritual", "miniatura", "ministro economico", "misa religiosa", "misterio resuelto",
        "mitridatismo", "mojigato", "mondongo parrillero", "moneda asiatica", "monegasco", "monzon luis", "moraleja",
        "moreton fisico", "morfina", "morganatico", "morgue judicial", "un morlaco", "mosquetero imperial", "mucamita",
        "muelle Piedrabuena", "mujer diabolica", "mula viajera", "museo nacional", "narcisismo", "narcotrafico", "navaja afilada",
        "Navidad", "nazi Hitler", "humano nefasto", "nefelibata", "negacionismo", "negocio empresarial", "neurona", "nicotina",
        "nigromancia", "noche espeluznante", "nomada", "ultima noticia", "novela noventera", "nudo gordiano",
        "imagenes obscenas", "obstetricia", "obtuso", "oceano pacifico", "octubre rojo", "oficio judicial", "ogro Shrek",
        "oleaginoso", "oleoducto", "olfato canino", "olimpiada mundial", "recuerdos olvidados", "ombligo", "omnibus",
        "pokemon onix", "onomatopeya", "opio", "momento oportuno", "optimismo", "Optimus Prime", "oraculo sagrado",
        "orangutan salvaje", "orgia grupal", "origen natural", "orin", "ornitorrinco", "oropendola", "orquidea violeta",
        "ostracismo", "ovacion general", "paella", "persona pagana", "pagina amarillas", "palacios Exequiel", "paladio",
        "panfleto oficial", "panic show", "panorama ambiental", "pantagruelico", "pantalon corto", "panteon familiar",
        "Papa Noel", "papiro", "parafina", "paraiso demoniaco", "mundo paralelo", "paramecio", "parangon", "multiverso",
        "paranoia cerebral", "parasito extraterrestre", "pariente lejano", "paroxismo", "piso parquet", "partitura musical",
        "Pascua", "pasionaria hierba", "pasteurizacion", "payaso asesino", "paz mundial", "pedazo gigante", "pegar onda",
        "pelicula dramatica", "pendulo loco", "pera podrida", "percance personal", "perdiz", "periodo menstrual", "peripecia",
        "tibia perone", "perpetrar hecho", "persona extravagante", "perspectiva isometrica", "petroleo venezolano", "piano Casio",
        "picaro ancestral", "pigmento descolorido", "pincel poderoso", "pintar magicamente", "pinzon", "piquete", "pirámide egipcia",
        "piropo hermoso", "piscina publica", "pistón roto", "pizza especial", "placenta", "plagio escenico", "planeta Neptuno",
        "plastico transparente", "plutocracia", "polemica", "polimatia", "polipo", "politica sucia", "Polonia cuarta", "pomada negra",
        "pompa grande", "ponche frutal", "mayor pontífice", "jovenes pordioseros", "porro colombiano", "postergar casamiento", "potasio",
        "preferí vivir", "profesor prestigioso", "procrastinar", "programar sistemas", "el proletario", "propoleo", "protocolo eugin",
        "proxeneta", "psicología barata", "reaccion psicosomatica", "pterodactilo", "puerperio", "pupitre", "color púrpura", "quark",
        "quimera", "quintaesencia", "quiropraxia", "radar ruso", "radio mega", "raiz profunda", "ramera negra", "ramera turquesa",
        "rancho viejo", "rapsodia", "raza", "rebuznar", "recalcitrante", "recluso", "record guiness", "reloj rolex", "remoto", "remuneracion",
        "reservar", "resiliencia", "restaurante", "retaliacion", "reticencia", "retorica", "retruecano", "rey", "rezar", "rifirrafe", "rima",
        "ritalina", "robar", "robot", "rococo", "rosario", "rotiseria", "rubeola", "rubrica", "rueca", "rueda", "ruleta", "rupestre", "rupia",
        "sagrado", "sainete", "salamandra", "salario", "samba", "San Cristobal", "sandia", "sandwich", "santabarbara", "sarao", "sarcasmo",
        "sartorio", "satelite lunar", "saxofono", "secuestrar personas", "sedan gris", "seguridad maxima", "semana santa", "semantica pura",
        "septiembre lluvioso", "ser extrasensorial", "serpentina", "seudonimo", "sexagesimal", "sibarita", "sibilino", "sicalipsis",
        "sicario", "siesta", "sifilis", "silencio", "sílfide", "silueta", "simonia", "sinalefa", "siniestro", "sirena", "sismo",
        "sodomia", "sofisticado", "sofocar", "solidaridad", "solsticio", "sororidad", "sosia", "subasta", "suricata", "tabaco",
        "taberna", "tafetan", "tahona", "talento", "tamarindo", "tandem", "tanga roja", "tantalio", "tarjeta visa", "tartufo",
        "tatuaje luminoso", "tautologia", "taxidermia", "taximetro", "telo refugio", "temprano", "tenis", "terrorismo arabe",
        "tertulia", "testarudo", "testigo vital", "tifon", "tilde doble", "tilo", "timpano", "tinnitus", "tiovivo", "tiquismiquis",
        "tirabuzon", "tiroides", "titan", "titere", "toalla", "tocayo", "tomate", "topacio", "que toronja", "torpedo", "tos convulsa",
        "totem crash", "trabajo peligroso", "tragedia aereoportuaria", "tramite online", "tramoya", "trapecio", "trapiche",
        "traqueotomia computada", "tregua", "triaje", "tribu canival", "trifulca generalizada", "tripa higado", "triunfo",
        "trocanter", "troglodita", "trombocito", "tuna", "tusivi", "tutia", "ufanar", "ultracorreccion", "vieja urraca",
        "vacuna covid", "Valladolid", "vampiro nocturno", "vanguardia", "vasallo", "vaselina", "vecino chusma", "vedete",
        "vehículo blindado", "veneno puro", "venir", "ventrilocuo", "verbena", "vereda", "veredicto", "verguenza", "vermicelli",
        "veronal", "veto", "viandante", "sin viatico", "vicario", "victoria castellot", "villancico", "villano favorito",
        "vinilo", "vino tinto", "violencia domestica", "violeta valentina", "violin", "virus contagioso", "visa dabito",
        "vitamina b", "vitolfilia", "vituperar", "viuda negra", "vocacion natural", "vodevil", "volcan Krakatoa.",
        "vudu vicepresidente", "whisky cuervo", "yanqui", "yate", "yelmo", "yerno", "yoga", "yugular", "zafarrancho", "zahon",
        "zalamero barrial", "zanahoria", "zar", "zonzo", "zurdo", "chamba", "pisto", "soy chevere", "jato", "alta fiaca",
        "guagua", "pana", "chido", "bicho", "pibe raro", "mona lisa", "cucho", "morra", "plata facil", "sapo", "cleta", "nene",
        "tia dolores", "flete manuel", "bien bacan", "barrio budge", "pucha", "guapo", "cumbia", "hijole", "patojo",
        "cuate", "fiesta", "tamal", "churro", "bocado", "salsa", "che guevara", "palta verde", "bombon asesino", "torta crema",
        "bacalao", "tinto vino", "la yapa", "ruca", "empanada frita", "chisme", "pipi", "macho meno", "perra salvaje",
        "teniente rada", "punto seguido", "sabroso no", "mola mucho", "rato", "tio esutaquio", "carro rojo", "poncho",
        "cuero negro", "merienda", "parrillada", "suave", "carne podrida", "bocadillo", "panal", "chiclero", "tiburon",
        "fresa", "pesca intensa", "diez kilos", "silla alta", "ceniza", "loro brasilero", "paquete grandote", "boca sucia",
        "pantalon", "manta", "tierra inospita", "mujer desquisada", "espejo magico", "dientes", "agujero negro",
        "camisa colorada", "bolsa negra", "sombrero magico", "chaman", "calle trece", "movil celular", "sabor amargo",
        "verde fluorecente", "agua termal", "luna sangrienta", "nube voladora", "sol", "cielo raso", "fuego", "miel",
        "raíz arbol", "flores tulipan", "piedrabuena", "arena movediza", "futbol libre", "equipo ", "estadio bernabeu",
        "medicina laboral", "doctor strenger", "enfermera hot", "clinica privada", "hospital carriquiborde", "receta casera",
        "pastilla tramadol", "jarabe ibupirqac", "dosis mortal", "cita aciegas", "paciente traumatologico",
        "síntoma premenstrual", "diagnostico grave", "tratamiento ginecologico", "cuerpo", "salud temporal", "pelo risado",
        "ojos verdes", "boca grande", "nariz grande", "oreja puntiaguda", "dedo morcilla", "pie plano", "manos grandes",
        "brazo lasrgos", "pierna corta", "rodilla rota", "codo cortado", "cuello desgarrado", "espalda torsida",
        "pecho peludo", "estomago", "corazon valiente", "cabeza fria", "hombros ovalados", "tobillo esguinzado",
        "frente grande", "barba negra", "bigote", "cepillada", "crema humrectante", "jabon desengrasante", "champu anticaspa",
        "pasta dental", "toallita femenina", "ropa interior", "camisa negra", "falda corta", "chaqueta", "abrigo",
        "zapato gamuzado", "sandalia", "botin", "bufanda tejida", "guante blanco", "cinturon", "calzon largo", "sujetador",
        "calcetin", "manga japones", "blusa corta", "chaleco antibalas", "abandonar perdedor", "abogado judicial",
        "abrir cofre", "aceptar todo", "acercar lineas", "acuerdo laboral", "adivinar palabras", "afirmar testimonios",
        "analisis contemporaneo", "anotar goles", "aplicar habilidades", "aprender  habilidades", "apuntar arma",
        "arreglar hinodoro", "bailar cumbia", "banco provincia", "beber wisky", "buscar padres", "calificar notas",
        "cambiar modales", "campo deportivo", "cantar cuarteto", "caso cabezas", "clase teorica", "cerrar negocio",
        "comer milanesas", "comprar dolares", "correr siempre", "crear arte", "crédito personal", "cultivar marihuana",
        "dar recibir", "decidircumplidos", "dedicar poemas", "demostrar afecto", "deportes mentales", "descubrir america",
        "diferente amistades", "dormir morir", "duro grande", "educar combatir", "escribir libros", "esperar amor",
        "estudiar personas", "facilitar ayuda", "feliz navidad", "finalizar compra", "formar familia", "futuro cercano",
        "ganar inero", "generar dinero", "gestionar ingresos", "girar ruleta", "gobierno capitalista",
        "grandes coorporaciones", "gritar fuerte", "hacer pizza", "historia argentina", "informar noticias",
        "iniciar programa", "jugar ahorcado", "llegar arcas", "llevar cerveza", "luchar vivir", "manejar vehiculo", "mejorar personalidad",
        "navegar siempre", "ocupar corazones", "ofrecer ayuda", "organizar fiestas", "pagar impuestos", "pedir aumento", "pensar solo",
        "perder nunca", "permitir acceso", "preguntar inquietudes", "preparar cena", "probar volver", "proteger familia", "reducir gastos",
        "resolver ahorcado", "resultar ganador", "revisar ortografia", "saber quimica", "sentir calor", "vender casas", "viajar solo",
        "vivir juntos", "zambullir", "zapato roto", "adaptar sobrevivir", "encontrarpareja", "enviar mensajes", "escribir notas",
        "estudiar matematicas", "formar grupos", "volar", "rapsodia", "raza alienigena", "rebuznar", "recalcitrante", "recluso peligroso",
        "control remoto", "remuneracion", "reservar meza", "resiliencia", "restaurante", "retaliacion", "reticencia", "oracion retorica",
        "retruecano", "rifirrafe", "robar oro", "yo robot", "rotisería max", "rubeola", "rubia hermosa", "sagrado corazon", "salamandra",
        "salario mensual", "sandía dulce", "sicario suelto", "siesta santiabgueña", "sífilis", "siniestro vehicular", "la sirenita",
        "hombre sofisticado", "sofocar", "solidaridad plena", "solsticio", "subasta oculta", "suricata", "tabaco colombiano", "taberna moe",
        "talento argentino", "tamarindo naranja", "tanga blanca", "tarjeta mastercard", "terrorismo japones", "testarudo boton",
        "fideos tirabuzón", "tiroides", "titere asesino", "tomaco", "traqueotomia", "operación triunfo", "ultracorrección ortografica",
        "vacuna tetanos", "vaselina trasera", "vecino miron", "ventrílocuo", "maria victoria", "villancico", "vino blanco",
        "violencia domestica", "violeta valentina", "vitamina zinc", "vocación innegable", "yanqui careta"


    ];
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
function playRestartSound() {
    restartSound.play().catch(error => {
        console.error('Error al reproducir el sonido: ', error);
    });
}

// Añade el evento de clic al botón
document.addEventListener('DOMContentLoaded', () => {
    const restartButton2 = document.getElementById('restart-btn2');
    if (restartButton2) {
        restartButton2.addEventListener('click', () => {
            playRestartSound(); // Reproduce el sonido al hacer clic
            // Aquí puedes añadir más lógica para reiniciar el juego si es necesario
        });
    } else {
        console.error('No se encontró el botón de reinicio.');
    }
});

function saveScore() {
    localStorage.setItem('score', score);
}

function loadScore() {
    const savedScore = localStorage.getItem('score');
    return savedScore ? parseInt(savedScore, 10) : 0;
}










