// ========== FADE-IN ANIMATIONS ==========
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// ========== SMOOTH SCROLLING ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === "#") {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== PARALLAX EFFECT ==========
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const rate = scrolled * -0.5;

  document.querySelectorAll('.bg-orb').forEach((orb, index) => {
    const speed = (index + 1) * 0.3;
    orb.style.transform = `translate3d(0, ${rate * speed}px, 0)`;
  });
});

// ========== PARTICLE EFFECTS ==========
function createParticle() {
  const particle = document.createElement('div');
  particle.style.position = 'absolute';
  particle.style.width = '2px';
  particle.style.height = '2px';
  particle.style.background = '#25D366';
  particle.style.borderRadius = '50%';
  particle.style.opacity = '0.6';
  particle.style.pointerEvents = 'none';
  particle.style.left = Math.random() * window.innerWidth + 'px';
  particle.style.top = window.innerHeight + 'px';

  document.body.appendChild(particle);

  const animation = particle.animate([
    { transform: 'translateY(0px)', opacity: 0.6 },
    { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
  ], {
    duration: 3000 + Math.random() * 2000,
    easing: 'ease-out'
  });

  animation.onfinish = () => {
    particle.remove();
  };
}

setInterval(createParticle, 400);

// ========== DASHBOARD NAVIGATION ==========
document.querySelectorAll('.nav-item').forEach(navItem => {
  navItem.addEventListener('click', function () {
    // Remover clase active de todos los items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // Agregar clase active al item clickeado
    this.classList.add('active');

    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(section => section.classList.add('hidden'));
    
    // Mostrar la sección correspondiente
    const sectionId = this.getAttribute('data-section') + '-section';
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
  });
});

// ========== FEATURE CARD HOVER EFFECTS ==========
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-15px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// ========== NEXTBOARD FEATURE INTERACTIONS ==========
document.querySelectorAll('.nextboard-feature').forEach(feature => {
  feature.addEventListener('mouseenter', () => {
    feature.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  feature.addEventListener('mouseleave', () => {
    feature.style.transform = 'translateY(0) scale(1)';
  });
});

// ========== COMPARISON TABLE ANIMATIONS ==========
document.querySelectorAll('.comparison-table tbody tr').forEach((row, index) => {
  row.style.animationDelay = `${index * 0.1}s`;
  
  row.addEventListener('mouseenter', () => {
    row.style.backgroundColor = 'rgba(0, 179, 164, 0.1)';
  });
  
  row.addEventListener('mouseleave', () => {
    row.style.backgroundColor = 'transparent';
  });
});

// ========== STEP CARDS ANIMATION ==========
document.querySelectorAll('.step-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });
});

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimize scroll events
const debouncedScrollHandler = debounce(() => {
  // Additional scroll-based animations can go here
}, 10);
