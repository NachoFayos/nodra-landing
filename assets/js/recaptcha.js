const SITE_KEY = '6LfDspwrAAAAAHfKWZk-KMfPCzcP7BAUq8s1_Vm2'; // ← reemplaza con tu clave real

async function recaptcha(action = 'default') {
  return grecaptcha.execute(SITE_KEY, { action });
}

async function enviar(form) {
  const token = await recaptcha(form.dataset.recaptcha);
  const fd = new FormData(form);
  fd.append('token', token);
  fd.append('action', form.dataset.recaptcha);

  const r = await fetch(form.action, { method: 'POST', body: fd });
  const t = (await r.text()).trim();

  alert(t === 'ok' ? '¡Gracias! Te contactaremos pronto.'
      : t === 'recaptcha' ? '⚠️ Error de validación reCAPTCHA.'
      : '❌ Hubo un problema al enviar el formulario.');
}

document.querySelectorAll('form[data-recaptcha]').forEach(f => {
  f.addEventListener('submit', e => {
    e.preventDefault();
    enviar(f);
  });
});
