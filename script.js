// ----------------------------------------------------
// Deep Sea Descent - Premium Parallax JavaScript
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements selection
    const layerBg = document.querySelector('.layer-bg');
    const layerTitle = document.querySelector('.layer-title');
    
    // Parallax Wrapper Containers (for scroll transformations)
    const subWrapper = document.querySelector('.submarine-wrapper');
    const jellyWrapper = document.querySelector('.jellyfish-wrapper');
    const templeWrapper = document.querySelector('.temple-wrapper');
    
    // HUD HUD Display
    const depthNum = document.getElementById('hud-depth-num');
    const barFill = document.getElementById('hud-bar-fill');

    // 2. Multi-Axis Scroll Parallax
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        const vh = window.innerHeight;

        // Perform transformations if within header view
        if (scrolled <= vh * 1.8) {
            // Background scrolls slowly and scales up slightly
            layerBg.style.transform = `translate3d(0, ${scrolled * 0.12}px, 0) scale(${1.05 + scrolled * 0.00015})`;
            
            // Title moves vertically and fades
            layerTitle.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.35}px))`;
            layerTitle.style.opacity = Math.max(0, 1 - scrolled / (vh * 0.8));
            
            // Submarine: moves down, drifts right, and rotates counter-clockwise
            if (subWrapper) {
                subWrapper.style.transform = `translate3d(${scrolled * 0.22}px, ${scrolled * 0.48}px, 0) rotate(${scrolled * -0.012}deg)`;
            }

            // Jellyfish: moves down faster (closes to viewer), drifts left, and scales
            if (jellyWrapper) {
                jellyWrapper.style.transform = `translate3d(${scrolled * -0.15}px, ${scrolled * 0.65}px, 0) scale(${1 + scrolled * 0.0002})`;
            }

            // Temple: moves down slowly (deep background), drifts right slightly
            if (templeWrapper) {
                templeWrapper.style.transform = `translate3d(${scrolled * 0.05}px, ${scrolled * 0.25}px, 0)`;
            }
        }

        // Calculate heights corresponding to CSS rules:
        // Header = 1.0 * vh
        // Sunlight Zone = 1.6 * vh (ends at 2.6 * vh)
        // Twilight Zone = 2.0 * vh (ends at 4.6 * vh)
        // Midnight Zone = 2.2 * vh (ends at 6.8 * vh)
        const y1 = vh;
        const y2 = vh + 1.6 * vh;
        const y3 = vh + 1.6 * vh + 2.0 * vh;
        const y4 = vh + 1.6 * vh + 2.0 * vh + 2.2 * vh;

        let currentDepth = 0;
        if (scrolled < y1) {
            currentDepth = 0;
        } else if (scrolled < y2) {
            // Sunlight Zone: 0m to 200m
            currentDepth = Math.floor(((scrolled - y1) / (y2 - y1)) * 200);
        } else if (scrolled < y3) {
            // Twilight Zone: 200m to 1000m
            currentDepth = Math.floor(200 + ((scrolled - y2) / (y3 - y2)) * 800);
        } else {
            // Midnight Zone: 1000m to 4000m
            currentDepth = Math.min(4000, Math.floor(1000 + ((scrolled - y3) / (y4 - y3)) * 3000));
        }

        // Update HUD display text
        depthNum.innerText = currentDepth.toLocaleString();
        
        // Progress Bar (scrolled relative to total page scroll height)
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = Math.min(100, Math.max(0, (scrolled / maxScroll) * 100));
        barFill.style.width = `${percent}%`;
    });

    // 3. Mouse Move Active Parallax (Active Drift)
    // We update global CSS custom variables so the CSS transitions handle smooth drifting.
    window.addEventListener('mousemove', (e) => {
        // Calculate offset coordinates from -1.0 to 1.0 relative to window center
        const mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        
        // Set CSS custom properties
        document.documentElement.style.setProperty('--mouseX', mouseX);
        document.documentElement.style.setProperty('--mouseY', mouseY);
    });

    // 4. Hotspot Click Toggle (Support touch devices)
    const hotspots = document.querySelectorAll('.hotspot');
    hotspots.forEach(hotspot => {
        const pin = hotspot.querySelector('.hotspot-pin');
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle active class on clicked hotspot, deactivate others
            hotspots.forEach(h => {
                if (h !== hotspot) h.classList.remove('active');
            });
            hotspot.classList.toggle('active');
        });
    });

    // Close hotspots if clicking elsewhere on screen
    window.addEventListener('click', () => {
        hotspots.forEach(h => h.classList.remove('active'));
    });
});

// ----------------------------------------------------
// 5. Sound Engine (Web Audio API Synthesizer Hum & Sonar)
// ----------------------------------------------------
let audioCtx = null;
let ambientOsc = null;
let ambientGain = null;
let sonarInterval = null;

function toggleAudio() {
    const statusText = document.getElementById('sound-status');
    const soundIcon = document.getElementById('sound-icon');

    if (!audioCtx) {
        // Initialize Audio Context
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Start Ambient Sub-Bass Ocean Hum
        startOceanHum();
        
        // Start Sonar Ping Loop (every 5 seconds)
        startSonarLoop();
        
        statusText.innerText = "ON";
        statusText.className = "status-on";
        soundIcon.className = "fa-solid fa-volume-high";
    } else {
        // Stop Audio
        if (audioCtx.state === 'running') {
            audioCtx.suspend();
            statusText.innerText = "OFF";
            statusText.className = "status-off";
            soundIcon.className = "fa-solid fa-volume-xmark";
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            statusText.innerText = "ON";
            statusText.className = "status-on";
            soundIcon.className = "fa-solid fa-volume-high";
        }
    }
}

// Low frequency ambient sweep to simulate submarine cabin hum
function startOceanHum() {
    ambientOsc = audioCtx.createOscillator();
    ambientGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    ambientOsc.type = 'sawtooth';
    ambientOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A note

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, audioCtx.currentTime); // Low pass filter cut-off

    ambientGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Soft volume

    ambientOsc.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);

    ambientOsc.start();
}

// Soft retro sonar ping sound
function playSonarPing() {
    if (!audioCtx || audioCtx.state !== 'running') return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Classic high pitch sonar ping frequency (880Hz -> 440Hz slide)
    osc.frequency.setValueAtTime(950, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
}

function startSonarLoop() {
    // Initial ping
    playSonarPing();
    
    // Repeat every 6 seconds
    sonarInterval = setInterval(playSonarPing, 6000);
}
