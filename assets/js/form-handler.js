// ========== SISTEMA UNIFICADO DE FORMULARIOS NODRA ==========
// Este archivo reemplaza: form-handler.js, recaptcha.js y parte de index.js/whatsapp.js

class NodraFormManager {
  constructor() {
    this.siteKey = '6LfDspwrAAAAAHfKWZk-KMfPCzcP7BAUq8s1_Vm2';
    this.processingForms = new Set();
    this.modal = null;
    this.modalClose = null;
    this.init();
  }

  init() {
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.setupModalElements();
    this.attachModalTriggers();
    this.attachFormHandlers();
    this.setupEventListeners();
  }

  // ========== GESTIÓN DE MODALES ==========
  setupModalElements() {
    this.modal = document.getElementById('demo-modal');
    this.modalClose = document.getElementById('modal-close');
    
    if (!this.modal) {
      console.warn('Modal #demo-modal no encontrado');
      return;
    }

    // Configurar botón de cerrar
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }

    // Cerrar modal al hacer clic fuera
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

  }

  attachModalTriggers() {
    // Lista de todos los posibles botones que abren el modal
    const triggerSelectors = [
      '#demo-btn',
      '#get-started', 
      '#cta-demo',
      '.btn-primary[href="#contact"]',
      '.cta-button',
      'a[href="#contact"]'
    ];

    let triggersFound = 0;

    triggerSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Evitar duplicar event listeners
        if (element.dataset.modalHandler) return;
        element.dataset.modalHandler = 'true';

        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openModal();
        });
        triggersFound++;
      });
    });

  }

  openModal() {
    if (!this.modal) {
      console.error('No se puede abrir modal: elemento no encontrado');
      return;
    }

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer campo del formulario
    const firstInput = this.modal.querySelector('input[type="text"], input[type="email"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  closeModal() {
    if (!this.modal) return;
    
    this.modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // ========== GESTIÓN DE FORMULARIOS ==========
  attachFormHandlers() {
    // Buscar todos los formularios con data-recaptcha
    const forms = document.querySelectorAll('form[data-recaptcha]');
    
    forms.forEach(form => {
      // Evitar duplicar handlers
      if (form.dataset.handlerAttached) return;
      form.dataset.handlerAttached = 'true';
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleFormSubmit(form);
      });
    });

  }

  async handleFormSubmit(form) {
    const formId = form.id || form.action || 'unknown';
    
    // Evitar envíos duplicados
    if (this.processingForms.has(formId)) {
      return;
    }

    this.processingForms.add(formId);
    
    try {

      // Validar campos requeridos
      if (!this.validateForm(form)) {
        this.showAlert('Por favor, rellena todos los campos obligatorios.');
        return;
      }

      // Obtener datos del formulario
      const formData = this.getFormData(form);

      // Obtener token de reCAPTCHA si está disponible
      const action = form.dataset.recaptcha || 'formulario';
      let token = '';
      
      if (typeof grecaptcha !== 'undefined' && window.enableRecaptcha !== false) {
        try {
          token = await grecaptcha.execute(this.siteKey, { action });
        } catch (error) {
          console.warn('Error reCAPTCHA:', error);
        }
      } else {
      }

      // Preparar datos para envío
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('token', token);
      submitData.append('action', action);

      // Deshabilitar botón y cambiar texto
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        submitButton.style.opacity = '0.6';
      }

      // Enviar formulario
      const response = await fetch(form.action, {
        method: 'POST',
        body: submitData
      });

      const result = (await response.text()).trim();
      
      // Procesar respuesta
      this.handleFormResponse(result, form);

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      this.showAlert('Hubo un error de conexión. Por favor, inténtalo más tarde.');
    } finally {
      // Limpiar estado
      this.processingForms.delete(formId);
      
      // Rehabilitar botón
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
        submitButton.style.opacity = '1';
      }
    }
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        field.focus();
        field.style.borderColor = '#ef4444';
        setTimeout(() => {
          field.style.borderColor = '';
        }, 3000);
        return false;
      }
      
      // Validar email
      if (field.type === 'email' && !this.isValidEmail(field.value)) {
        field.focus();
        field.style.borderColor = '#ef4444';
        this.showAlert('Por favor, introduce un email válido.');
        return false;
      }
    }
    
    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getFormData(form) {
    const formData = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData[input.name] = input.value.trim();
      }
    });
    
    return formData;
  }

  handleFormResponse(result, form) {
    switch(result) {
      case 'ok':
        this.showAlert('¡Gracias! Te contactaremos en breve.', 'success');
        form.reset();
        
        // Cerrar modal si está abierto
        if (this.modal && this.modal.classList.contains('active')) {
          setTimeout(() => this.closeModal(), 1500);
        }
        break;
        
      case 'incompleto':
        this.showAlert('Por favor, rellena los campos obligatorios.', 'warning');
        break;
        
      case 'recaptcha':
        this.showAlert('Error de validación de seguridad. Vuelve a intentarlo.', 'warning');
        break;
        
      default:
        this.showAlert('Ups, hubo un error. Inténtalo de nuevo o escríbenos a contacto@nodra.es', 'error');
        console.error('Respuesta inesperada del servidor:', result);
    }
  }

  showAlert(message, type = 'info') {
    // Crear notificación personalizada
    const notification = document.createElement('div');
    notification.className = `nodra-notification nodra-notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
      </div>
    `;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10004;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      max-width: 350px;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.75rem;
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar animación
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  getNotificationColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #00B3A4, #009688)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    return colors[type] || colors.info;
  }

  // ========== EVENT LISTENERS GLOBALES ==========
  setupEventListeners() {
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Mejorar experiencia de formularios
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) {
        // Quitar borde rojo al corregir errores
        e.target.style.borderColor = '';
      }
    });

  }
}

// ========== AUTO-INICIALIZACIÓN ==========
let nodraFormManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    nodraFormManager = new NodraFormManager();
  });
} else {
  nodraFormManager = new NodraFormManager();
}

// Exportar para debugging
window.NodraFormManager = nodraFormManager;
