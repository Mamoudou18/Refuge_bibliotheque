<?php

// --- CORS (pour Angular en dev, ex: http://localhost:4200) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/middlewares/Auth.php';

// --- Récupération de la route ---
// REQUEST_URI ex: /api/livres/5 -> on retire le préfixe /api
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/'); // ex: "livres/5"
$segments = $path === '' ? [] : explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// --- Routage ---
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$sub = $segments[2] ?? null;

try {
    switch ($resource) {

        // --- Routes à ajouter progressivement ici ---

        default:
            Response::error('Route non trouvée', 404);
    }
} catch (Throwable $e) {
    Response::error('Erreur serveur : ' . $e->getMessage(), 500);
}