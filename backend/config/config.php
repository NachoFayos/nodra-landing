<?php

require_once __DIR__ . '/env.php';

define('RECAPTCHA_SITE_KEY', envValue('RECAPTCHA_SITE_KEY', ''));
define('RECAPTCHA_SECRET_KEY', envValue('RECAPTCHA_SECRET_KEY', ''));

define('SMTP_HOST', envValue('SMTP_HOST', 'smtp.ionos.es'));
define('SMTP_PORT', (int) envValue('SMTP_PORT', 587));
define('SMTP_USERNAME', envValue('SMTP_USERNAME', ''));
define('SMTP_PASSWORD', envValue('SMTP_PASSWORD', ''));
define('SMTP_ENCRYPTION', envValue('SMTP_ENCRYPTION', 'tls'));

define('FROM_EMAIL', envValue('FROM_EMAIL', ''));
define('FROM_NAME', envValue('FROM_NAME', 'Nodra Soluciones Digitales'));
define('TO_EMAIL', envValue('TO_EMAIL', ''));

define('DEBUG_MODE', filter_var(envValue('APP_DEBUG', false), FILTER_VALIDATE_BOOLEAN));

function verificarRecaptcha(string $token, string $accionEsperada = '', float $puntuacionMinima = 0.3): array
{
    if ($token === '' || RECAPTCHA_SECRET_KEY === '') {
        return ['success' => false, 'error' => 'Token o clave reCAPTCHA no configurados', 'score' => 0];
    }

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://www.google.com/recaptcha/api/siteverify',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => RECAPTCHA_SECRET_KEY,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    if (!$response) {
        return ['success' => false, 'error' => 'No se pudo verificar reCAPTCHA', 'score' => 0];
    }

    $result = json_decode($response, true);

    if (!isset($result['success']) || !$result['success']) {
        return ['success' => false, 'error' => 'Token reCAPTCHA inválido', 'score' => 0];
    }

    $score = $result['score'] ?? 0;

    if ($score < $puntuacionMinima) {
        return ['success' => false, 'error' => 'Puntuación baja', 'score' => $score];
    }

    if ($accionEsperada !== '' && isset($result['action']) && $result['action'] !== $accionEsperada) {
        return ['success' => false, 'error' => 'Acción incorrecta', 'score' => $score];
    }

    return ['success' => true, 'score' => $score];
}

function enviarEmailPHPMailer(string $para, string $asunto, string $cuerpo, string $responderA = ''): bool
{
    $phpmailerPath = __DIR__ . '/../../vendor/autoload.php';

    if (!file_exists($phpmailerPath)) {
        return enviarEmailSimple($para, $asunto, $cuerpo, $responderA);
    }

    require_once $phpmailerPath;

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_ENCRYPTION;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom(FROM_EMAIL, FROM_NAME);
        $mail->addAddress($para);

        if ($responderA !== '') {
            $mail->addReplyTo($responderA);
        }

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $cuerpo;
        $mail->AltBody = strip_tags($cuerpo);

        return $mail->send();
    } catch (Exception $e) {
        error_log('Error PHPMailer: ' . $e->getMessage());

        return false;
    }
}

function enviarEmailSimple(string $para, string $asunto, string $cuerpo, string $responderA = ''): bool
{
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    ];

    if ($responderA !== '') {
        $headers[] = 'Reply-To: ' . $responderA;
    }

    return mail($para, $asunto, $cuerpo, implode("\r\n", $headers));
}