<?php
/**
 * Script de envío de formulario de contacto
 * Nodra Soluciones Digitales
 */

// Mostrar errores solo en desarrollo (quitar en producción)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Cargar configuración
require_once __DIR__ . '/../config/config.php';

// Crear directorio de logs si no existe
$log_dir = __DIR__ . '/../logs';
if (!file_exists($log_dir)) {
    mkdir($log_dir, 0755, true);
}

// ──────────────── RECIBIR DATOS ────────────────
$nombre   = isset($_POST['nombre']) ? strip_tags(trim($_POST['nombre'])) : '';
$email    = isset($_POST['email']) ? trim($_POST['email']) : '';
$empresa  = isset($_POST['empresa']) ? strip_tags(trim($_POST['empresa'])) : '';
$sector   = isset($_POST['sector']) ? strip_tags(trim($_POST['sector'])) : '';
$mensaje  = isset($_POST['mensaje']) ? strip_tags(trim($_POST['mensaje'])) : '';

// Validar email
$email = filter_var($email, FILTER_VALIDATE_EMAIL);

// ──────────────── VALIDACIÓN BÁSICA ────────────────
if (empty($nombre) || empty($email) || empty($mensaje)) {
    echo "incompleto";
    exit;
}

// ──────────────── VERIFICAR RECAPTCHA ────────────────
$token = $_POST['token'] ?? '';
$action = $_POST['action'] ?? 'formulario';

$resultadoCaptcha = verificarRecaptcha($token, $action);
$esHumano = $resultadoCaptcha['success'];
$score = $resultadoCaptcha['score'] ?? 0;

// Log de debug
if (DEBUG_MODE) {
    error_log("reCAPTCHA - Token: " . substr($token, 0, 20) . "...");
    error_log("reCAPTCHA - Resultado: " . json_encode($resultadoCaptcha));
}

// ──────────────── CONSTRUIR MENSAJE ────────────────
$asunto = "Nuevo contacto web - $nombre";

$cuerpo = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$cuerpo .= "NUEVO MENSAJE DESDE LA WEB\n";
$cuerpo .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$cuerpo .= "Nombre: $nombre\n";
$cuerpo .= "Email: $email\n";
if (!empty($empresa)) {
    $cuerpo .= "Empresa: $empresa\n";
}
if (!empty($sector)) {
    $cuerpo .= "Sector: $sector\n";
}
$cuerpo .= "\nMensaje:\n";
$cuerpo .= "------------------------\n";
$cuerpo .= "$mensaje\n";
$cuerpo .= "------------------------\n\n";
$cuerpo .= "Fecha: " . date('d/m/Y H:i:s') . "\n";
$cuerpo .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Desconocida') . "\n";
$cuerpo .= "Score reCAPTCHA: $score\n";
$cuerpo .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

// ──────────────── INTENTAR ENVIAR EMAIL ────────────────
$email_enviado = false;
$metodo_usado = '';

// Si el score de reCAPTCHA es muy bajo, loguear pero intentar enviar igual
if ($score < 0.3 && $score > 0) {
    error_log("Advertencia: Score reCAPTCHA bajo ($score) para $email");
}

// Intentar enviar el email
try {
    // Método 1: Intentar con la función principal que prueba varios métodos
    if (function_exists('enviarEmail')) {
        $email_enviado = enviarEmail(TO_EMAIL, $asunto, $cuerpo, $email);
        $metodo_usado = 'enviarEmail';
    }
    
    // Método 2: Si falla, intentar con mail() directamente
    if (!$email_enviado) {
        $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        $email_enviado = @mail(TO_EMAIL, $asunto, $cuerpo, $headers);
        $metodo_usado = 'mail()';
    }
    
} catch (Exception $e) {
    error_log("Error enviando email: " . $e->getMessage());
}

// ──────────────── LOGGING ────────────────
$log_entry = [
    'fecha' => date('Y-m-d H:i:s'),
    'nombre' => $nombre,
    'email' => $email,
    'empresa' => $empresa,
    'enviado' => $email_enviado,
    'metodo' => $metodo_usado,
    'score' => $score,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Desconocida'
];

// Guardar en log según el resultado
if ($email_enviado) {
    file_put_contents(
        $log_dir . '/enviados.log',
        json_encode($log_entry) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
} else {
    file_put_contents(
        $log_dir . '/errores.log',
        json_encode($log_entry) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

// ──────────────── RESPUESTA AL CLIENTE ────────────────
// Siempre devolvemos "ok" para no revelar información del sistema
echo "ok";

// Debug adicional (quitar en producción)
if (DEBUG_MODE && !$email_enviado) {
    error_log("Email no enviado - Destinatario: " . TO_EMAIL);
    error_log("Método usado: " . $metodo_usado);
}
?>