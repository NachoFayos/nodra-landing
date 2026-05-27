<?php
// Cambia esto por tu correo corporativo real
$destinatario = "contacto@nodra.es";

$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_VALIDATE_EMAIL) : '';

if ($email) {
    $asunto = "Nuevo interesado en JDN NextBoard";
    $cuerpo = "El siguiente usuario ha solicitado ser avisado cuando NextBoard esté disponible:\n\nEmail: $email\nFecha: " . date('d/m/Y H:i');
    $headers = "De: Nodra Web <contacto@nodra.es>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($destinatario, $asunto, $cuerpo, $headers)) {
        echo "¡Gracias! Te avisaremos en cuanto esté disponible.";
    } else {
        echo "Hubo un error al registrar tu email. Por favor, inténtalo de nuevo.";
    }
} else {
    echo "Introduce un email válido.";
}
?>
