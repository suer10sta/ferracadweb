<?php
require_once __DIR__ . '/includes/auth_helpers.php';

header('Content-Type: application/json'); // Always return JSON

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed.']);
    exit;
}

$allowedHosts = ['ferracad.com', 'www.ferracad.com'];
if (!in_array($_SERVER['HTTP_HOST'], $allowedHosts, true)) {
    http_response_code(403); // Forbidden
    echo json_encode(['error' => 'Access denied']);
    exit;
}

// Read raw JSON input
$rawData = file_get_contents("php://input");
$input = json_decode($rawData, true);

// Validate input
if (isset($input['codeComputer']) && isset($input['dateExp'])) {
    try {
        $authData = generateAuthCode(
            $input['codeComputer'],
            new DateTime($input['dateExp'])
        );

        echo json_encode([
            'success' => true,
            'data' => $authData]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Server error: ' . $e->getMessage()
        ]);

        exit;
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields: codeComputer and/or dateExp.'
    ]);

    exit;
}
