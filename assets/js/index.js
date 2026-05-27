// ========== MOBILE MENU FUNCTIONALITY ==========
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const body = document.body;

function toggleMobileMenu() {
  const isActive = mobileMenuToggle.classList.contains('active');
  
  if (isActive) {
    // Cerrar menú
    mobileMenuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
    body.style.overflow = 'auto';
  } else {
    // Abrir menú
    mobileMenuToggle.classList.add('active');
    mobileNav.classList.add('active');
    body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  mobileMenuToggle.classList.remove('active');
  mobileNav.classList.remove('active');
  body.style.overflow = 'auto';
}

// Event listeners para menú móvil
if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

// Cerrar menú al hacer click en los enlaces
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#') && href !== '#') {
      e.preventDefault();
      closeMobileMenu();
      
      // Scroll suave al elemento
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 300); // Esperar a que se cierre el menú
      }
    } else if (href === '#') {
      // Es el botón de demo
      e.preventDefault();
      closeMobileMenu();
      // Aquí se abrirá el modal (ya manejado por el form-handler)
    }
  });
});

// Cerrar menú con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
    closeMobileMenu();
  }
});

// Cerrar menú al redimensionar ventana a desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
    closeMobileMenu();
  }
});

// ========== HEADER SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (window.scrollY > 100) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Parallax effect (reducido en móvil para mejor performance)
  if (window.innerWidth > 768) {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    document.querySelectorAll('.bg-orb').forEach((orb, index) => {
      const speed = (index + 1) * 0.3;
      orb.style.transform = `translate3d(0, ${rate * speed}px, 0)`;
    });
  }
});

// ========== SMOOTH SCROLL NAVIGATION ==========
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
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========== FADE-IN ANIMATION ==========
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

// ========== TESTIMONIALS CAROUSEL ==========
const testimonialsTrack = document.getElementById('testimonials-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('carousel-dots');
const slides = document.querySelectorAll('.testimonial-slide');

let currentSlide = 0;
const totalSlides = slides.length;

function createDots() {
  if (!dotsContainer) return;
  
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function updateDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  const translateX = -slideIndex * 100;
  if (testimonialsTrack) {
    testimonialsTrack.style.transform = `translateX(${translateX}%)`;
  }
  updateDots();
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  goToSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  goToSlide(currentSlide);
}

if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

// Auto-play carousel
let autoPlay = null;
if (totalSlides > 0) {
  autoPlay = setInterval(nextSlide, 5000);
  
  const testimonialsContainer = document.querySelector('.testimonials-container');
  if (testimonialsContainer) {
    testimonialsContainer.addEventListener('mouseenter', () => {
      if (autoPlay) clearInterval(autoPlay);
    });
    testimonialsContainer.addEventListener('mouseleave', () => {
      autoPlay = setInterval(nextSlide, 5000);
    });
  }

  createDots();

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'ArrowRight') nextSlide();
  });
}

// ========== PARTICULAS DECORATIVAS (Optimizado para móvil) ==========
function createParticle() {
  // No crear partículas en móvil para mejor performance
  if (window.innerWidth <= 768) return;
  
  const particle = document.createElement('div');
  particle.style.position = 'absolute';
  particle.style.width = '4px';
  particle.style.height = '4px';
  particle.style.background = '#00B3A4';
  particle.style.borderRadius = '50%';
  particle.style.opacity = '0.6';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '1';
  
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
  
  particle.style.left = Math.random() * window.innerWidth + 'px';
  particle.style.top = (Math.random() * documentHeight) + 'px';

  document.body.appendChild(particle);

  const animation = particle.animate([
    { transform: 'translateY(0px)', opacity: 0.6 },
    { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
  ], {
    duration: 3000 + Math.random() * 2000,
    easing: 'ease-out'
  });

  animation.onfinish = () => {
    if (document.body.contains(particle)) {
      particle.remove();
    }
  };
}

function initializeParticles() {
  if (window.innerWidth <= 768) return;
  
  for (let i = 0; i < 20; i++) {
    setTimeout(() => createParticle(), i * 250);
  }
}

function cleanupParticles() {
  const particles = document.querySelectorAll('div[style*="position: absolute"][style*="width: 4px"]');
  const viewportTop = window.pageYOffset;
  const viewportBottom = viewportTop + window.innerHeight + 500;
  
  particles.forEach(particle => {
    const particleTop = parseInt(particle.style.top);
    
    if (particleTop < viewportTop - 1000 || particleTop > viewportBottom + 1000) {
      if (document.body.contains(particle)) {
        particle.remove();
      }
    }
  });
}

// Inicializar partículas cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth > 768) {
    initializeParticles();
  }
});

// Crear partículas regularmente (solo en desktop)
if (window.innerWidth > 768) {
  setInterval(createParticle, 200);
  setInterval(cleanupParticles, 15000);
}

// ========== SERVICE CARD INTERACTION ==========
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    if (card.classList.contains('available')) {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    } else if (card.classList.contains('coming-soon')) {
      card.style.transform = 'translateY(-5px) scale(1.01)';
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
  });

  if (card.classList.contains('available')) {
    card.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A') {
        const link = card.querySelector('.service-link');
        if (link) window.location.href = link.href;
      }
    });
  }

  if (card.classList.contains('coming-soon')) {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }
});

// ========== PERFORMANCE OPTIMIZATIONS ==========
// Debounce para eventos de scroll
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

// Optimizar eventos de resize
const debouncedResize = debounce(() => {
  // Recalcular elementos si es necesario
  if (window.innerWidth > 768 && !document.querySelector('.bg-orb').style.animation) {
    // Reactivar animaciones en desktop
    document.querySelectorAll('.bg-orb').forEach(orb => {
      orb.style.animation = 'float 20s infinite ease-in-out';
    });
  }
}, 250);

window.addEventListener('resize', debouncedResize);

// ========== TOUCH GESTURES PARA MÓVIL ==========
let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
  if (!touchStartX || !touchStartY) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchStartX - touchEndX;
  const deltaY = touchStartY - touchEndY;
  
  // Solo detectar swipes horizontales significativos
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    // Cerrar menú móvil con swipe hacia la izquierda
    if (deltaX < 0 && mobileNav.classList.contains('active')) {
      closeMobileMenu();
    }
  }
  
  touchStartX = null;
  touchStartY = null;
});

