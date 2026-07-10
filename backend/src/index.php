<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/controllers/AuthController.php';

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

$resource = $segments[0] ?? '';
$action = $segments[1] ?? null;

try {
    if ($resource === 'auth' && $action === 'register' && $method === 'POST') {
        AuthController::register($body);
    } else {
        Response::error('Route non trouvée', 404);
    }
} catch (Throwable $e) {
    Response::error('Erreur serveur : ' . $e->getMessage(), 500);
}