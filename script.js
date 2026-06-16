document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL REVEAL EFFECT FOR CARDS
  const observerOptions = {
    root: null,
    threshold: 0.1, // Trigger when 10% of card is visible
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, observerOptions);

  const scrollElements = document.querySelectorAll('.animate-scroll-fade');
  scrollElements.forEach(el => revealObserver.observe(el));

  // 2. DYNAMIC FLOATING JASMINE PETALS (SINE-WAVE DRIFT FROM BOTTOM-RIGHT)
  const container = document.getElementById('jasmine-container');
  
  // Inject petal CSS rules dynamically into document head to keep styles clean
  const petalStyle = document.createElement('style');
  petalStyle.innerHTML = `
    .dynamic-petal {
      position: absolute;
      pointer-events: none;
      will-change: transform, opacity;
      animation: floatPetal var(--duration) linear forwards;
      opacity: 0;
    }
    
    @keyframes floatPetal {
      0% {
        opacity: 0;
        transform: translate3d(0, 0, 0) rotate(var(--rot-start)) scale(var(--scale));
      }
      10% {
        opacity: var(--max-op);
      }
      90% {
        opacity: var(--max-op);
      }
      100% {
        opacity: 0;
        transform: translate3d(var(--drift-x), var(--drift-y), 0) rotate(var(--rot-end)) scale(var(--scale));
      }
    }
  `;
  document.head.appendChild(petalStyle);

  const petalSVGs = [
    // Single petal design A
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 9 7 9 10C9 13 11 15 12 15C13 15 15 13 15 10C15 7 12 2 12 2Z" fill="#FBFBF7" stroke="#E6E6D8" stroke-width="0.5"/>
      <path d="M12 2C12 2 15 7 15 10C15 13 13 15 12 15C11 15 9 13 9 10C9 7 12 2 12 2Z" fill="#FFFDF6" stroke="#E6E6D8" stroke-width="0.5"/>
      <circle cx="12" cy="11.5" r="1.5" fill="#D4AF37"/>
    </svg>`,
    // Petal design B (slanted, slightly larger)
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 8 8 10 12C12 16 14 16 15 15C16 14 15 11 14 8C13 5 12 2 12 2Z" fill="#FBFBF7" stroke="#EAEAE0" stroke-width="0.5"/>
      <circle cx="12.5" cy="11.5" r="1.2" fill="#F2C94C"/>
    </svg>`,
    // Small cluster of 2 petals
    `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(15 16 16)">
        <path d="M12 4C12 4 9 9 9 12C9 15 11 17 12 17C13 17 15 15 15 12C15 9 12 4 12 4Z" fill="#FBFBF7" stroke="#E6E6D8" stroke-width="0.5"/>
        <circle cx="12" cy="13.5" r="1" fill="#D4AF37"/>
      </g>
      <g transform="translate(6, 4) rotate(-35 16 16)">
        <path d="M12 4C12 4 9 9 9 12C9 15 11 17 12 17C13 17 15 15 15 12C15 9 12 4 12 4Z" fill="#FFFDF6" stroke="#E6E6D8" stroke-width="0.5"/>
        <circle cx="12" cy="13.5" r="1" fill="#F2C94C"/>
      </g>
    </svg>`
  ];

  const MAX_PETALS = 15;
  let activePetals = 0;

  function createPetal() {
    if (activePetals >= MAX_PETALS || !container) return;

    activePetals++;
    const petal = document.createElement('div');
    petal.className = 'dynamic-petal';

    // Randomize SVG shape
    const randomSVG = petalSVGs[Math.floor(Math.random() * petalSVGs.length)];
    petal.innerHTML = randomSVG;

    // Start coordinates (primarily bottom-right quadrant)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Spawn in bottom-right corner: X from 70% to 98%, Y from 80% to 95%
    const startX = (0.7 + Math.random() * 0.28) * screenWidth;
    const startY = (0.8 + Math.random() * 0.15) * screenHeight;

    // Movement: float up (negative Y) and left (negative X)
    const driftY = -(startY + 50); // Drift all the way off screen top
    // Randomize sway leftwards
    const driftX = -((0.2 + Math.random() * 0.4) * screenWidth); // Drift left between 20% to 60% of viewport width

    // Timing
    const duration = 9 + Math.random() * 8; // 9s to 17s
    const scale = 0.6 + Math.random() * 0.7; // Scale 0.6x to 1.3x
    const rotStart = Math.random() * 360;
    const rotEnd = rotStart + (Math.random() * 180 - 90); // Rotate by -90deg to +90deg
    const maxOpacity = 0.5 + Math.random() * 0.45; // Max opacity between 0.5 and 0.95

    // Apply variables to styling
    petal.style.left = `${startX}px`;
    petal.style.top = `${startY}px`;
    petal.style.setProperty('--duration', `${duration}s`);
    petal.style.setProperty('--drift-x', `${driftX}px`);
    petal.style.setProperty('--drift-y', `${driftY}px`);
    petal.style.setProperty('--scale', scale);
    petal.style.setProperty('--rot-start', `${rotStart}deg`);
    petal.style.setProperty('--rot-end', `${rotEnd}deg`);
    petal.style.setProperty('--max-op', maxOpacity);

    container.appendChild(petal);

    // Clean up when animation ends
    petal.addEventListener('animationend', () => {
      petal.remove();
      activePetals--;
    });
  }

  // Spawn initial petals slowly
  setInterval(createPetal, 1800);
  
  // Spawn a few initial ones so page doesn't start empty
  for (let i = 0; i < 5; i++) {
    setTimeout(createPetal, i * 600);
  }

  // 3. INTERACTIVE DIYAS - FLICKER SPEED VARIATION ON CLICK
  const diyas = document.querySelectorAll('.interactive-diya');
  diyas.forEach(diya => {
    diya.addEventListener('click', () => {
      // Temporarily intensify the flicker on tap
      const flames = diya.querySelectorAll('.flickering-flame');
      flames.forEach(flame => {
        const originalAnim = flame.style.animation;
        flame.style.animation = 'flickerLarge 0.5s infinite ease-in-out';
        
        setTimeout(() => {
          flame.style.animation = originalAnim;
        }, 1500);
      });
      
      // Gentle puff of smoke/glow opacity increase
      const haze = diya.querySelector('.smoke-haze');
      if (haze) {
        haze.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        haze.style.opacity = '0.5';
        haze.style.transform = 'scale(1.4)';
        setTimeout(() => {
          haze.style.opacity = '';
          haze.style.transform = '';
          haze.style.transition = '';
        }, 1200);
      }
    });
  });
});
