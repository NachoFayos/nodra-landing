/**
 * Mobile Menu Handler - VERSIÓN CORREGIDA SIN BLOQUEOS DE SCROLL
 * Nodra Soluciones Digitales
 * Esta versión corrige específicamente la visibilidad del menú móvil
 */

class MobileMenuHandler {
  constructor() {
    this.mobileMenuToggle = null;
    this.mobileNav = null;
    this.mobileNavOverlay = null;
    this.mobileNavClose = null;
    this.body = document.body;
    this.header = document.getElementById('header');
    this.isMenuOpen = false;
    this.touchStartX = null;
    this.touchStartY = null;
    this.edgeSwipeStart = false;
    
    this.init();
  }

  init() {
    this.createMobileMenuIfNotExists();
    this.attachEventListeners();
    this.handleInitialState();
    this.fixScrollIssues();
  }

  // ========== CREAR ELEMENTOS DEL MENÚ MÓVIL ==========
  createMobileMenuIfNotExists() {
    // 1. Crear hamburguesa si no existe
    if (!document.querySelector('.mobile-menu-toggle')) {
      this.createHamburgerButton();
    }
    
    // 2. Crear navegación móvil si no existe
    if (!document.querySelector('.mobile-nav')) {
      this.createMobileNavigation();
    }

    // 3. Crear overlay si no existe
    if (!document.querySelector('.mobile-nav-overlay')) {
      this.createOverlay();
    }

    // 4. Actualizar referencias
    this.updateReferences();
    
    // 5. Verificar que todo se creó correctamente
    this.verifyElements();
  }

  createHamburgerButton() {
    
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) {
      console.error('.header-content no encontrado');
      return;
    }

    const hamburger = document.createElement('div');
    hamburger.className = 'mobile-menu-toggle';
    hamburger.setAttribute('aria-label', 'Abrir menú');
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('tabindex', '0');
    hamburger.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;

    // Añadir al final del header-content
    headerContent.appendChild(hamburger);
    
  }

  createMobileNavigation() {
    
    // Obtener enlaces de navegación existente
    const desktopNav = document.querySelector('.nav, .desktop-nav');
    const navLinks = this.extractNavLinks(desktopNav);
    
    const mobileNavHTML = `
    <nav class="mobile-nav" role="navigation" aria-label="Navegación móvil">
        <div class="mobile-nav-close" role="button" tabindex="0" aria-label="Cerrar menú">&times;</div>
        <div class="menu-particles" aria-hidden="true"></div>
        ${navLinks}
        <a href="#" class="btn-primary mobile-cta" role="button">Solicitar Demo</a>
    </nav>
    `;

    document.body.insertAdjacentHTML('beforeend', mobileNavHTML);
    
  }

  createOverlay() {
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    
  }

  extractNavLinks(desktopNav) {
    if (!desktopNav) {
      return this.getDefaultNavLinks();
    }

    const links = desktopNav.querySelectorAll('a');
    if (links.length === 0) {
      return this.getDefaultNavLinks();
    }

    return Array.from(links).map(link => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      return `<a href="${href}" class="mobile-nav-link" role="menuitem">${text}</a>`;
    }).join('');
  }

  getDefaultNavLinks() {
    return `
      <a href="#services" class="mobile-nav-link" role="menuitem">Servicios</a>
      <a href="#about" class="mobile-nav-link" role="menuitem">Sobre Nosotros</a>
      <a href="#testimonials" class="mobile-nav-link" role="menuitem">Testimonios</a>
      <a href="#contact" class="mobile-nav-link" role="menuitem">Contacto</a>
    `;
  }

  updateReferences() {
    this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    this.mobileNav = document.querySelector('.mobile-nav');
    this.mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    this.mobileNavClose = document.querySelector('.mobile-nav-close');
  }

  verifyElements() {
    const elements = {
      hamburguesa: !!this.mobileMenuToggle,
      navegacion: !!this.mobileNav,
      overlay: !!this.mobileNavOverlay,
      cerrar: !!this.mobileNavClose
    };


    const missing = Object.entries(elements)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    if (missing.length > 0) {
      console.error('Elementos faltantes:', missing);
      this.applyEmergencyFix();
    } else {
    }

    // Verificar visibilidad en móvil
    if (window.innerWidth <= 768) {
      setTimeout(() => this.checkMobileVisibility(), 500);
    }
  }

  checkMobileVisibility() {
    if (!this.mobileMenuToggle) return;

    const style = getComputedStyle(this.mobileMenuToggle);
    const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      position: style.position
    });

    if (!isVisible) {
      console.warn('Modal no visible - aplicando fix de emergencia');
      this.applyEmergencyFix();
    }
  }

  applyEmergencyFix() {
    
    // CSS de emergencia para forzar visibilidad
    const emergencyCSS = `
      <style id="mobile-menu-emergency-css">
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex !important;
            position: absolute !important;
            top: 50% !important;
            right: 1rem !important;
            transform: translateY(-50%) !important;
            z-index: 1001 !important;
            background: rgba(0, 179, 164, 0.8) !important;
            border: 2px solid var(--primary-500) !important;
            width: 44px !important;
            height: 44px !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 4px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
          }
          
          .mobile-nav {
            position: fixed !important;
            top: 0 !important;
            left: -100% !important;
            width: 100% !important;
            max-width: 400px !important;
            height: 100vh !important;
            background: rgba(17, 24, 39, 0.98) !important;
            z-index: 999 !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 80px 2rem 2rem !important;
            transition: left 0.3s ease !important;
          }
          
          .mobile-nav.active {
            left: 0 !important;
          }
          
          .mobile-nav a {
            display: block !important;
            color: white !important;
            text-decoration: none !important;
            padding: 1rem !important;
            margin: 0.5rem 0 !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 8px !important;
            text-align: center !important;
          }
          
          .mobile-nav-overlay.active {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.7) !important;
            z-index: 998 !important;
          }
        }
      </style>
    `;

    if (!document.getElementById('mobile-menu-emergency-css')) {
      document.head.insertAdjacentHTML('beforeend', emergencyCSS);
    }
  }

  // ========== EVENT LISTENERS ==========
  attachEventListeners() {

    // Toggle del menú hamburguesa
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.toggleMenu();
      });

      // Soporte para teclado
      this.mobileMenuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMenu();
        }
      });
    }

    // Botón de cerrar (X)
    if (this.mobileNavClose) {
      this.mobileNavClose.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.closeMenu();
      });

      this.mobileNavClose.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.closeMenu();
        }
      });
    }

    // Overlay para cerrar menú
    if (this.mobileNavOverlay) {
      this.mobileNavOverlay.addEventListener('click', () => {
        this.closeMenu();
      });
    }

    // Enlaces del menú móvil
    this.attachMobileNavLinks();

    // Eventos globales
    this.attachGlobalEvents();
  }

  attachMobileNavLinks() {
    if (!this.mobileNav) return;

    const links = this.mobileNav.querySelectorAll('a');

    links.forEach((link, index) => {
      // Resetear estados de los enlaces
      this.resetLinkState(link);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const href = link.getAttribute('href');
        const isDemo = link.id === 'mobile-demo-btn' || 
                      link.classList.contains('mobile-cta') || 
                      link.classList.contains('btn-primary');
        

        if (isDemo) {
          this.closeMenu();
          setTimeout(() => {
            this.openDemoModal();
          }, 300);
        } else if (href && href.startsWith('#') && href !== '#') {
          this.closeMenu();
          setTimeout(() => {
            this.scrollToSection(href);
          }, 300);
        }
      });

      // Gestión manual de hover - SIN EFECTOS POR DEFECTO
      link.addEventListener('mouseenter', () => {
        if (!link.classList.contains('btn-primary') && !link.classList.contains('mobile-cta')) {
          link.style.background = 'rgba(0, 179, 164, 0.15)';
          link.style.borderColor = 'var(--primary-500)';
          link.style.color = 'var(--primary-500)';
          link.style.transform = 'translateY(-2px)';
          link.style.boxShadow = '0 8px 16px rgba(0, 179, 164, 0.2)';
        }
      });

      link.addEventListener('mouseleave', () => {
        if (!link.classList.contains('btn-primary') && !link.classList.contains('mobile-cta')) {
          this.resetLinkState(link);
        }
      });

      // Touch events CORREGIDOS - sin preventDefault problemático
      link.addEventListener('touchend', (e) => {
        // NO USAR preventDefault aquí - causa el error de Intervention
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        setTimeout(() => link.dispatchEvent(clickEvent), 0);
      }, { passive: true });
    });
  }

  resetLinkState(link) {
    if (link.classList.contains('btn-primary') || link.classList.contains('mobile-cta')) return;
    
    link.style.background = 'rgba(255, 255, 255, 0.08)';
    link.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    link.style.color = 'var(--neutral-300)';
    link.style.transform = 'none';
    link.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  }

  resetAllLinkStates() {
    if (!this.mobileNav) return;
    
    const links = this.mobileNav.querySelectorAll('a:not(.btn-primary):not(.mobile-cta)');
    links.forEach(link => this.resetLinkState(link));
  }

  attachGlobalEvents() {
    // Cerrar menú con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Cerrar al redimensionar ventana a desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Touch gestures CORREGIDOS para cerrar menú
    this.attachTouchGesturesFixed();
  }

  // ========== FUNCIONALIDAD PRINCIPAL ==========
  toggleMenu() {
    
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    if (this.isMenuOpen) return;

    this.isMenuOpen = true;
    
    // Aplicar clases y estilos
    this.body.classList.add('menu-open');
    this.mobileMenuToggle?.classList.add('active');
    this.mobileNav?.classList.add('active');
    this.mobileNavOverlay?.classList.add('active');
    this.body.style.overflow = 'hidden';
    
    if (this.header) this.header.classList.add('menu-open');
    
    // Resetear estados de enlaces
    setTimeout(() => {
      this.resetAllLinkStates();
      const firstLink = this.mobileNav?.querySelector('a:not(.btn-primary)');
      if (firstLink) {
        firstLink.focus();
      }
    }, 100);
    
    document.dispatchEvent(new CustomEvent('mobileMenuOpen'));
  }

  closeMenu() {
    if (!this.isMenuOpen) return;

    this.isMenuOpen = false;
    
    // Quitar clases y estilos
    this.body.classList.remove('menu-open');
    this.mobileMenuToggle?.classList.remove('active');
    this.mobileNav?.classList.remove('active');
    this.mobileNavOverlay?.classList.remove('active');
    this.body.style.overflow = 'auto';
    
    if (this.header) this.header.classList.remove('menu-open');
    
    // Resetear estados
    setTimeout(() => {
      this.resetAllLinkStates();
    }, 100);
    
    document.dispatchEvent(new CustomEvent('mobileMenuClose'));
  }

  // ========== NAVEGACIÓN ==========
  openDemoModal() {
    
    // Método 1: Modal directo
    const demoModal = document.getElementById('demo-modal');
    if (demoModal) {
      demoModal.classList.add('active');
      this.body.style.overflow = 'hidden';
      return;
    }

    // Método 2: Buscar botones de demo
    const demoBtns = [
      document.getElementById('demo-btn'),
      document.getElementById('get-started'),
      document.querySelector('.cta-button:not(.mobile-cta)'),
      document.querySelector('[data-modal="demo"]')
    ];

    for (const btn of demoBtns) {
      if (btn) {
        btn.click();
        return;
      }
    }

    // Método 3: Evento personalizado
    document.dispatchEvent(new CustomEvent('openDemoModal'));
  }

  scrollToSection(href) {
    const target = document.querySelector(href);
    if (!target) {
      console.warn(`Sección no encontrada: ${href}`);
      return;
    }

    const headerHeight = this.header ? this.header.offsetHeight : 80;
    const targetPosition = target.getBoundingClientRect().top + 
                          window.pageYOffset - headerHeight - 20;
    
      targetPosition,
      headerHeight,
      currentScroll: window.pageYOffset
    });

    // Scroll suave CORREGIDO
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    } else {
      this.smoothScrollTo(targetPosition);
    }
  }

  smoothScrollTo(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  }

  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  // ========== TOUCH GESTURES CORREGIDOS ==========
  attachTouchGesturesFixed() {
    // Touch start para swipe desde borde
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      
      if (!this.isMenuOpen && touch.clientX < 20) {
        this.edgeSwipeStart = true;
        this.touchStartX = touch.clientX;
      } else if (this.isMenuOpen) {
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
      }
    }, { passive: true });

    // Touch move - SIN preventDefault que causa problemas
    document.addEventListener('touchmove', (e) => {
      if (!this.edgeSwipeStart || this.isMenuOpen) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      
      if (deltaX > 50) {
        this.openMenu();
        this.edgeSwipeStart = false;
      }
    }, { passive: true });

    // Touch end para cerrar menú
    document.addEventListener('touchend', (e) => {
      if (!this.isMenuOpen || !this.touchStartX || !this.touchStartY) {
        this.edgeSwipeStart = false;
        return;
      }
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = this.touchStartX - touchEndX;
      const deltaY = this.touchStartY - touchEndY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
        if (deltaX > 0 && this.touchStartX < window.innerWidth * 0.7) {
          this.closeMenu();
        }
      }
      
      this.touchStartX = null;
      this.touchStartY = null;
      this.edgeSwipeStart = false;
    }, { passive: true });
  }

  // ========== SCROLL FIXES ==========
  fixScrollIssues() {
    // Asegurar que las floating cards no bloqueen el scroll
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach(card => {
      card.style.pointerEvents = 'none';
      // REMOVIDO: touch-action que causa problemas
    });

    // Asegurar que el hero content sea interactivo
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.style.pointerEvents = 'auto';
      // REMOVIDO: touch-action restrictivo
      heroContent.style.zIndex = '100';
      
      const interactiveElements = heroContent.querySelectorAll('*');
      interactiveElements.forEach(el => {
        el.style.pointerEvents = 'auto';
      });
    }

    // CORREGIDO: sin touch-action restrictivo
    document.body.style.touchAction = 'auto';
    
  }

  // ========== ESTADO INICIAL ==========
  handleInitialState() {
    this.closeMenu();
    this.fixScrollIssues();
    
    setTimeout(() => {
      this.resetAllLinkStates();
    }, 500);
    
    if (window.innerWidth > 768) {
      const mobileElements = document.querySelectorAll('.mobile-menu-toggle, .mobile-nav, .mobile-nav-overlay');
      mobileElements.forEach(el => {
        if (el) el.style.display = 'none';
      });
    }
  }

  // ========== MÉTODOS PÚBLICOS ==========
  isOpen() {
    return this.isMenuOpen;
  }

  destroy() {
    this.closeMenu();
    
    const elementsToRemove = [
      document.querySelector('.mobile-menu-toggle'),
      document.querySelector('.mobile-nav'),
      document.querySelector('.mobile-nav-overlay'),
      document.getElementById('mobile-menu-emergency-css')
    ];
    
    elementsToRemove.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
  }

  // ========== DEBUG ==========
  debug() {
      isOpen: this.isMenuOpen,
      elements: {
        toggle: !!this.mobileMenuToggle,
        nav: !!this.mobileNav,
        overlay: !!this.mobileNavOverlay,
        close: !!this.mobileNavClose
      },
      visibility: {
        toggleDisplay: this.mobileMenuToggle ? getComputedStyle(this.mobileMenuToggle).display : 'N/A',
        navDisplay: this.mobileNav ? getComputedStyle(this.mobileNav).display : 'N/A',
        navLeft: this.mobileNav ? getComputedStyle(this.mobileNav).left : 'N/A'
      },
      classes: {
        bodyMenuOpen: this.body.classList.contains('menu-open'),
        toggleActive: this.mobileMenuToggle?.classList.contains('active'),
        navActive: this.mobileNav?.classList.contains('active')
      },
      windowWidth: window.innerWidth
    });
  }
}

// ========== INTEGRACIÓN CON OTROS SISTEMAS ==========
document.addEventListener('DOMContentLoaded', () => {
  // Integración con Form Manager
  if (window.NodraFormManager || window.nodraFormManager) {
    
    document.addEventListener('openDemoModal', () => {
      const formManager = window.NodraFormManager || window.nodraFormManager;
      if (formManager && formManager.openModal) {
        formManager.openModal();
      }
    });
  }

  if (window.NodraCookies) {
  }

  setTimeout(() => {
    const requiredElements = ['#header', '.hero', '.hero-content'];
    const missing = requiredElements.filter(selector => !document.querySelector(selector));
    
    if (missing.length > 0) {
      console.warn('Elementos requeridos no encontrados:', missing);
    } else {
    }
  }, 1000);
});

// ========== AUTO-INICIALIZACIÓN ==========
let mobileMenuHandler;

function initMobileMenu() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mobileMenuHandler = new MobileMenuHandler();
    });
  } else {
    mobileMenuHandler = new MobileMenuHandler();
  }
}

initMobileMenu();

// ========== EXPORTAR PARA USO GLOBAL ==========
window.MobileMenuHandler = MobileMenuHandler;
window.mobileMenuHandler = mobileMenuHandler;

// Cleanup anterior si existe
if (window.mobileMenuHandlerFix && window.mobileMenuHandlerFix.destroy) {
  window.mobileMenuHandlerFix.destroy();
}

