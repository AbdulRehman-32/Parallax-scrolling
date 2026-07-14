// ----------------------------------------------------
// Deep Sea Descent - Parallax Scrolling Script
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Select Parallax Layers
    const layerBg = document.querySelector('.layer-bg');
    const layerTitle = document.querySelector('.layer-title');
    const layerMidground = document.querySelector('.layer-midground');
    const layerForeground = document.querySelector('.layer-foreground');
    
    // Select Dynamic Content Elements
    const depthNumber = document.getElementById('depth-number');
    const subContainer = document.querySelector('.submarine-container');
    const jellyContainer = document.querySelector('.jellyfish-container');
    const anglerContainer = document.querySelector('.angler-container');

    // Scroll Handler
    window.addEventListener('scroll', () => {
        // Current scroll position (pixels from top)
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;

        // 1. Header Parallax Speeds (Only animate if header is visible on screen)
        if (scrolled <= viewportHeight) {
            // Background moves slowest (0.15x speed)
            layerBg.style.transform = `translateY(${scrolled * 0.15}px) scale(1.05)`;
            
            // Title moves slightly slower than normal scroll (0.35x speed) and fades out
            layerTitle.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.35}px))`;
            layerTitle.style.opacity = Math.max(0, 1 - scrolled / (viewportHeight * 0.8));
            
            // Whale (midground) moves at 0.3x speed
            layerMidground.style.transform = `translateY(${scrolled * 0.3}px)`;
            
            // Turtle and Kelp (foreground) moves at 0.5x speed (creates close depth)
            layerForeground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }

        // 2. Dynamic Depth Indicator (1 pixel scrolled = 2.5 meters depth)
        // Cap at 4,000 meters (average depth of midnight bathypelagic zone)
        const targetDepth = Math.min(4000, Math.floor(scrolled * 2.5));
        depthNumber.innerText = targetDepth.toLocaleString();

        // 3. Floating Creature Micro-Parallax
        // We calculate positions relative to when they appear in their depth sections
        
        // Submarine (around Sunlight Zone: scrolled between 400px and 1600px)
        if (subContainer) {
            const subOffset = scrolled - (viewportHeight * 0.8);
            subContainer.style.transform = `translateY(${subOffset * -0.15}px)`;
        }

        // Jellyfish (around Twilight Zone: scrolled between 1200px and 2600px)
        if (jellyContainer) {
            const jellyOffset = scrolled - (viewportHeight * 1.8);
            jellyContainer.style.transform = `translateY(${jellyOffset * -0.2}px)`;
        }

        // Anglerfish (around Midnight Zone: scrolled above 2000px)
        if (anglerContainer) {
            const anglerOffset = scrolled - (viewportHeight * 2.8);
            anglerContainer.style.transform = `translateY(${anglerOffset * -0.1}px)`;
        }
    });
});
