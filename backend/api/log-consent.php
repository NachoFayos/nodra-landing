<?php

require_once __DIR__ . '/../config/database.php';

ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        echo json_encode(['status' => 'preflight_ok']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);

        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $inputRaw = file_get_contents('php://input');

    if (!$inputRaw) {
        http_response_code(400);

        echo json_encode(['error' => 'No data received']);
        exit;
    }

    $input = json_decode($inputRaw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);

        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    $requiredFields = ['timestamp', 'analytics', 'security'];

    foreach ($requiredFields as $field) {
        if (!array_key_exists($field, $input)) {
            http_response_code(422);

            echo json_encode(['error' => "Missing required field: {$field}"]);
            exit;
        }
    }

    $pdo = Database::getConnection();

    $sql = "
        INSERT INTO cookie_consents
        (timestamp, ip_address, user_agent, url, analytics_consent, security_consent, consent_method)
        VALUES (:timestamp, :ip_address, :user_agent, :url, :analytics_consent, :security_consent, :consent_method)
        RETURNING id, created_at
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':timestamp' => $input['timestamp'],
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
        ':url' => $input['url'] ?? null,
        ':analytics_consent' => (bool) $input['analytics'],
        ':security_consent' => (bool) $input['security'],
        ':consent_method' => $input['method'] ?? 'banner',
    ]);

    $result = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'id' => $result['id'],
        'created_at' => $result['created_at'],
    ]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode(['error' => 'Database error']);
} catch (Exception $e) {
    error_log('Server error: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode(['error' => 'Server error']);
}