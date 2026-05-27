# Nodra Landing

Landing corporativa desarrollada para presentar una propuesta de servicios digitales basada en asistentes IA, automatización de atención al cliente y soluciones orientadas a WhatsApp.

El proyecto incluye una página principal, una página específica para el asistente de WhatsApp, formularios de contacto, gestión de cookies, páginas legales y un backend PHP ligero para procesar formularios y registrar consentimiento.

## Características

- Landing responsive en HTML, CSS y JavaScript
- Página comercial específica para asistente IA de WhatsApp
- Formularios de contacto con validación
- Integración preparada para reCAPTCHA v3
- Gestión de consentimiento de cookies
- Registro de consentimiento mediante backend PHP
- Configuración sensible mediante variables de entorno
- Páginas legales: aviso legal, privacidad y política de cookies

## Stack

- HTML5
- CSS3
- JavaScript
- PHP
- PostgreSQL
- reCAPTCHA v3

## Estructura del proyecto

```txt
assets/
  css/
  js/
  img/

backend/
  api/
  config/
  mail/

index.html
asistente-whatsapp.html
avisolegal.html
politicaprivacidad.html
politicacookies.html

El archivo .env está excluido del repositorio para evitar publicar credenciales o configuración privada.

Funcionalidades principales
Formularios

Los formularios están preparados para enviar datos al backend PHP, validar la información recibida y proteger el envío mediante reCAPTCHA v3.

Cookies

El proyecto incluye un sistema de consentimiento de cookies con posibilidad de registrar la elección del usuario en base de datos.

Backend

El backend está desarrollado en PHP y centraliza la configuración sensible mediante variables de entorno. Incluye conexión a PostgreSQL mediante PDO.

Estado del proyecto

Este proyecto fue desarrollado originalmente como una landing corporativa y posteriormente saneado para portfolio.

No representa un producto comercial activo y no contiene credenciales reales en el repositorio.