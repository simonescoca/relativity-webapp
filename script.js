// Costanti fisiche
const SPEED_OF_LIGHT = 299792458; // m/s
const LIGHT_YEAR_IN_METERS = 9.461e15; // metri
const SECONDS_IN_YEAR = 31557600; // secondi in un anno (365.25 giorni)

// Elementi DOM
const distanceInput = document.getElementById('distance');
const velocityInput = document.getElementById('velocity');

// Elementi risultati
const externalDistanceLY = document.getElementById('external-distance-ly');
const externalDistanceKM = document.getElementById('external-distance-km');
const internalDistanceLY = document.getElementById('internal-distance-ly');
const internalDistanceKM = document.getElementById('internal-distance-km');
const externalTimeYears = document.getElementById('external-time-years');
const externalTimeFormatted = document.getElementById('external-time-formatted');
const internalTimeYears = document.getElementById('internal-time-years');
const internalTimeFormatted = document.getElementById('internal-time-formatted');
const timeDilationYears = document.getElementById('time-dilation-years');
const timeDilationFormatted = document.getElementById('time-dilation-formatted');
const lorentzFactorElement = document.getElementById('lorentz-factor');

// Elementi formule
const distanceFormulaResult = document.getElementById('distance-formula-result');
const timeFormulaResult = document.getElementById('time-formula-result');

// Elementi visualizzazione
const externalViewBtn = document.getElementById('external-view-btn');
const internalViewBtn = document.getElementById('internal-view-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const restartBtn = document.getElementById('restart-btn');
const speedBtn = document.getElementById('speed-btn');

// Variabili di stato
let isPlaying = false;
let animationSpeed = 1.0;
let externalP5Instance = null;
let internalP5Instance = null;

// Funzioni di calcolo relativistico
function calculateLorentzFactor(velocityPercentage) {
    const v = velocityPercentage / 100 * SPEED_OF_LIGHT;
    const vSquaredOverCSquared = Math.pow(v / SPEED_OF_LIGHT, 2);
    return 1 / Math.sqrt(1 - vSquaredOverCSquared);
}

function calculateInternalDistance(externalDistance, velocityPercentage) {
    const v = velocityPercentage / 100 * SPEED_OF_LIGHT;
    const vSquaredOverCSquared = Math.pow(v / SPEED_OF_LIGHT, 2);
    return externalDistance * Math.sqrt(1 - vSquaredOverCSquared);
}

function calculateExternalTime(externalDistance, velocityPercentage) {
    const v = velocityPercentage / 100 * SPEED_OF_LIGHT;
    return externalDistance * LIGHT_YEAR_IN_METERS / v;
}

function calculateInternalTime(externalTime, velocityPercentage) {
    const v = velocityPercentage / 100 * SPEED_OF_LIGHT;
    const vSquaredOverCSquared = Math.pow(v / SPEED_OF_LIGHT, 2);
    return externalTime * Math.sqrt(1 - vSquaredOverCSquared);
}

// Funzioni di formattazione
function formatNumber(number, decimals = 3) {
    // Formatta il numero con i decimali richiesti
    let formatted = number.toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
    
    // Rimuovi gli zeri decimali finali non significativi
    if (formatted.includes(',')) {
        formatted = formatted.replace(/,?0+$/, '');
        // Se rimane solo la virgola, rimuovila
        if (formatted.endsWith(',')) {
            formatted = formatted.slice(0, -1);
        }
    }
    
    return formatted;
}

function formatScientific(number) {
    if (number === 0) return "0 × 10^0";
    
    const exponent = Math.floor(Math.log10(number));
    const mantissa = number / Math.pow(10, exponent);
    
    return `${formatNumber(mantissa, 3)} × 10^${exponent}`;
}

function formatTimeExtended(seconds) {
    const years = Math.floor(seconds / SECONDS_IN_YEAR);
    seconds %= SECONDS_IN_YEAR;
    
    const months = Math.floor(seconds / (SECONDS_IN_YEAR / 12));
    seconds %= (SECONDS_IN_YEAR / 12);
    
    const days = Math.floor(seconds / 86400);
    seconds %= 86400;
    
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    
    return `${years} anni, ${months} mesi, ${days} giorni, ${hours} ore, ${minutes} minuti, ${seconds} secondi`;
}

// Funzione principale per aggiornare tutti i calcoli e visualizzazioni
function updateCalculations() {
    const distance = parseFloat(distanceInput.value);
    const velocity = parseFloat(velocityInput.value);
    
    if (isNaN(distance) || isNaN(velocity) || velocity <= 0 || velocity >= 100) {
        return;
    }
    
    // Calcolo del fattore di Lorentz
    const lorentzFactor = calculateLorentzFactor(velocity);
    
    // Calcolo delle distanze
    const externalDistanceInLY = distance;
    const internalDistanceInLY = calculateInternalDistance(externalDistanceInLY, velocity);
    
    // Calcolo dei tempi
    const externalTimeInSeconds = calculateExternalTime(externalDistanceInLY, velocity);
    const internalTimeInSeconds = calculateInternalTime(externalTimeInSeconds, velocity);
    
    // Calcolo dello slittamento temporale
    const timeDilationInSeconds = externalTimeInSeconds - internalTimeInSeconds;
    
    // Conversione in anni
    const externalTimeInYears = externalTimeInSeconds / SECONDS_IN_YEAR;
    const internalTimeInYears = internalTimeInSeconds / SECONDS_IN_YEAR;
    const timeDilationInYears = timeDilationInSeconds / SECONDS_IN_YEAR;
    
    // Aggiornamento dei risultati
    externalDistanceLY.textContent = `${formatNumber(externalDistanceInLY)} anni luce`;
    externalDistanceKM.textContent = `${formatScientific(externalDistanceInLY * LIGHT_YEAR_IN_METERS / 1000)} km`;
    
    internalDistanceLY.textContent = `${formatNumber(internalDistanceInLY)} anni luce`;
    internalDistanceKM.textContent = `${formatScientific(internalDistanceInLY * LIGHT_YEAR_IN_METERS / 1000)} km`;
    
    externalTimeYears.textContent = `${formatNumber(externalTimeInYears)} anni`;
    externalTimeFormatted.textContent = formatTimeExtended(externalTimeInSeconds);
    
    internalTimeYears.textContent = `${formatNumber(internalTimeInYears)} anni`;
    internalTimeFormatted.textContent = formatTimeExtended(internalTimeInSeconds);
    
    timeDilationYears.textContent = `${formatNumber(timeDilationInYears)} anni`;
    timeDilationFormatted.textContent = formatTimeExtended(timeDilationInSeconds);
    
    lorentzFactorElement.textContent = formatNumber(lorentzFactor);
    
    // Aggiornamento delle formule
    distanceFormulaResult.textContent = `L = ${formatNumber(externalDistanceInLY)} × √(1 - (${velocity}c/100)²) = ${formatNumber(internalDistanceInLY)} anni luce`;
    timeFormulaResult.textContent = `t₀ = ${formatNumber(externalTimeInYears)} × √(1 - (${velocity}c/100)²) = ${formatNumber(internalTimeInYears)} anni`;
    
    // Aggiornamento della visualizzazione se le istanze p5 esistono
    if (externalP5Instance && externalP5Instance.updateParameters) {
        externalP5Instance.updateParameters(distance, velocity, lorentzFactor);
    }
    if (internalP5Instance && internalP5Instance.updateParameters) {
        internalP5Instance.updateParameters(distance, velocity, lorentzFactor);
    }
}

// Inizializzazione di p5.js
function initP5() {
    if (externalP5Instance) {
        externalP5Instance.remove();
    }
    if (internalP5Instance) {
        internalP5Instance.remove();
    }
    
    // Sketch per l'osservatore esterno
    const externalSketch = function(p) {
        // Parametri dell'animazione
        let distance = parseFloat(distanceInput.value);
        let velocity = parseFloat(velocityInput.value);
        let lorentzFactor = calculateLorentzFactor(velocity);
        
        // Parametri della visualizzazione
        const animationDuration = 20; // secondi
        let animationProgress = 0;
        let stars = [];
        const numStars = 200;
        
        // Emoji
        const rocketEmoji = "🚀";
        const flagEmoji = "🏁";
        
        p.setup = function() {
            const canvas = p.createCanvas(
                document.getElementById('external-canvas-wrapper').offsetWidth,
                document.getElementById('external-canvas-wrapper').offsetHeight
            );
            canvas.parent('external-canvas-wrapper');
            
            // Inizializzazione delle stelle
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(1, 3)
                });
            }
            
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
        };
        
        p.draw = function() {
            p.background(0);
            
            // Aggiornamento dell'animazione se in riproduzione
            if (isPlaying) {
                animationProgress += p.deltaTime / 1000 * animationSpeed / animationDuration;
                if (animationProgress >= 1) {
                    animationProgress = 1;
                    isPlaying = false;
                    playPauseBtn.innerHTML = "▶️ Play";
                }
            }
            
            // Disegno delle stelle
            drawStars();
            
            // Disegno dell'animazione per l'osservatore esterno
            drawExternalView();
        };
        
        function drawStars() {
            p.noStroke();
            for (let star of stars) {
                // Stelle sempre visibili
                p.fill(255, 255, 255, 255);
                p.ellipse(star.x, star.y, star.size, star.size);
            }
        }
        
        function drawExternalView() {
            // Posizione della nave e della meta
            const startX = p.width * 0.1;
            const endX = p.width * 0.9;
            const centerY = p.height / 2;
            
            // Disegno della linea di percorso
            p.stroke(110, 143, 255, 100);
            p.strokeWeight(2);
            p.line(startX, centerY, endX, centerY);
            
            // Disegno della meta
            p.noStroke();
            p.fill(255);
            p.text(flagEmoji, endX, centerY);
            
            // Posizione attuale della nave
            const currentX = startX + (endX - startX) * animationProgress;
            
            // Disegno della nave
            p.fill(255);
            p.text(rocketEmoji, currentX, centerY);
            
            // Informazioni sul progresso
            const currentDistance = distance * animationProgress;
            const currentTime = (distance / (velocity / 100)) * animationProgress;
            
            p.fill(110, 143, 255);
            p.textSize(16);
            p.text(`Distanza percorsa: ${formatNumber(currentDistance)} anni luce`, p.width / 2, p.height - 50);
            p.text(`Tempo trascorso: ${formatNumber(currentTime)} anni`, p.width / 2, p.height - 25);
        }
        
        p.windowResized = function() {
            p.resizeCanvas(
                document.getElementById('external-canvas-wrapper').offsetWidth,
                document.getElementById('external-canvas-wrapper').offsetHeight
            );
        };
        
        // Funzione per aggiornare i parametri dell'animazione
        p.updateParameters = function(newDistance, newVelocity, newLorentzFactor) {
            distance = newDistance;
            velocity = newVelocity;
            lorentzFactor = newLorentzFactor;
        };
        
        // Funzione per riavviare l'animazione
        p.restart = function() {
            animationProgress = 0;
        };
    };
    
    // Sketch per l'osservatore interno
    const internalSketch = function(p) {
        // Parametri dell'animazione
        let distance = parseFloat(distanceInput.value);
        let velocity = parseFloat(velocityInput.value);
        let lorentzFactor = calculateLorentzFactor(velocity);
        
        // Parametri della visualizzazione
        const animationDuration = 5; // secondi (1/4 del tempo dell'osservatore esterno)
        let animationProgress = 0;
        let stars = [];
        const numStars = 200;
        
        // Emoji
        const rocketEmoji = "🚀";
        const flagEmoji = "🏁";
        
        p.setup = function() {
            const canvas = p.createCanvas(
                document.getElementById('internal-canvas-wrapper').offsetWidth,
                document.getElementById('internal-canvas-wrapper').offsetHeight
            );
            canvas.parent('internal-canvas-wrapper');
            
            // Inizializzazione delle stelle
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    size: p.random(1, 3)
                });
            }
            
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(24);
        };
        
        p.draw = function() {
            p.background(0);
            
            // Aggiornamento dell'animazione se in riproduzione
            if (isPlaying) {
                animationProgress += p.deltaTime / 1000 * animationSpeed / animationDuration;
                if (animationProgress >= 1) {
                    animationProgress = 1;
                }
            }
            
            // Disegno delle stelle
            drawStars();
            
            // Disegno dell'animazione per l'osservatore interno
            drawInternalView();
        };
        
        function drawStars() {
            p.noStroke();
            for (let star of stars) {
                // Stelle sempre visibili
                p.fill(255, 255, 255, 255);
                p.ellipse(star.x, star.y, star.size, star.size);
            }
        }
        
        function drawInternalView() {
            // Posizione della nave a sinistra e posizione iniziale della meta
            const shipX = p.width * 0.1;
            const centerY = p.height / 2;
            const startFlagX = p.width * 0.9;
            
            // Calcolo della posizione attuale della meta e della contrazione
            let currentFlagX = startFlagX;
            
            // Disegno della linea di percorso (segmento nave-bandiera)
            p.stroke(110, 143, 255, 100);
            p.strokeWeight(2);
            
            // Effetto di contrazione istantanea all'avvio dell'animazione
            if (isPlaying || animationProgress > 0) {
                // Contrazione della distanza quando l'animazione è attiva
                const contractedDistance = distance / lorentzFactor;
                const fullDistance = startFlagX - shipX;
                
                // La bandiera si contrae istantaneamente a metà schermo
                const midX = p.width * 0.5;
                const contractedFlagX = midX - (midX - shipX) * animationProgress;
                
                // Disegno della linea contratta
                p.line(shipX, centerY, contractedFlagX, centerY);
                
                // Aggiorna la posizione attuale della bandiera
                currentFlagX = contractedFlagX;
                
                // Movimento delle stelle solo quando l'animazione è attiva e non ha raggiunto la destinazione
                if (isPlaying && animationProgress < 1) {
                    for (let star of stars) {
                        // Velocità differenziate: stelle più vicine si muovono più velocemente
                        // ma nessuna stella si muove più velocemente della bandiera
                        const maxSpeed = 2 * animationSpeed * p.deltaTime / 16;
                        const distanceFactor = star.y / p.height; // 0 per stelle in alto, 1 per stelle in basso
                        const starSpeed = maxSpeed * (0.5 + 0.5 * distanceFactor);
                        
                        star.x -= starSpeed;
                        if (star.x < 0) {
                            star.x = p.width + 10;
                            star.y = p.random(p.height);
                        }
                    }
                }
            } else {
                // Disegno della linea non contratta quando l'animazione non è ancora iniziata
                p.line(shipX, centerY, startFlagX, centerY);
            }
            
            // Disegno della nave (fissa a sinistra)
            p.noStroke();
            p.fill(255);
            p.text(rocketEmoji, shipX, centerY);
            
            // Disegno della meta
            p.fill(255);
            p.text(flagEmoji, currentFlagX, centerY);
            
            // Informazioni sul progresso
            const contractedDistance = distance / lorentzFactor;
            const currentDistance = contractedDistance * animationProgress;
            const totalTime = distance / (velocity / 100) / lorentzFactor;
            const currentTime = totalTime * animationProgress;
            
            p.fill(110, 143, 255);
            p.textSize(16);
            p.text(`Distanza percorsa: ${formatNumber(currentDistance)} anni luce`, p.width / 2, p.height - 50);
            p.text(`Tempo trascorso: ${formatNumber(currentTime)} anni`, p.width / 2, p.height - 25);
        }
        
        p.windowResized = function() {
            p.resizeCanvas(
                document.getElementById('internal-canvas-wrapper').offsetWidth,
                document.getElementById('internal-canvas-wrapper').offsetHeight
            );
        };
        
        // Funzione per aggiornare i parametri dell'animazione
        p.updateParameters = function(newDistance, newVelocity, newLorentzFactor) {
            distance = newDistance;
            velocity = newVelocity;
            lorentzFactor = newLorentzFactor;
        };
        
        // Funzione per riavviare l'animazione
        p.restart = function() {
            animationProgress = 0;
        };
    };
    
    // Crea entrambe le istanze di p5.js
    externalP5Instance = new p5(externalSketch);
    internalP5Instance = new p5(internalSketch);
}

// Event listeners
distanceInput.addEventListener('input', updateCalculations);
velocityInput.addEventListener('input', updateCalculations);

playPauseBtn.addEventListener('click', function() {
    isPlaying = !isPlaying;
    playPauseBtn.innerHTML = isPlaying ? "⏸️ Pausa" : "▶️ Play";
});

restartBtn.addEventListener('click', function() {
    if (externalP5Instance && externalP5Instance.restart) {
        externalP5Instance.restart();
    }
    if (internalP5Instance && internalP5Instance.restart) {
        internalP5Instance.restart();
    }
    isPlaying = false;
    playPauseBtn.innerHTML = "▶️ Play";
});

speedBtn.addEventListener('click', function() {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(animationSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    animationSpeed = speeds[nextIndex];
    speedBtn.innerHTML = `🚀 Velocità: ${animationSpeed}x`;
});

// Inizializzazione
window.addEventListener('load', function() {
    updateCalculations();
    initP5();
    
    // Crea stelle di sfondo
    const body = document.body;
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * window.innerWidth + 'px';
        star.style.top = Math.random() * window.innerHeight + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        body.appendChild(star);
    }
});
