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
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/LivreController.php';
require_once __DIR__ . '/controllers/MembreController.php';
require_once __DIR__ . '/controllers/EmpruntController.php';
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
        case 'auth':
            match ($id) {
                'register' => AuthController::register($body),
                'login' => AuthController::login($body),
                'logout' => AuthController::logout(),
                default => Response::error('Route auth inconnue', 404),
            };
            break;

        case 'livres':
            match (true) {
                $method === 'GET' && $id === null => LivreController::index(),
                $method === 'GET' && $id !== null => LivreController::show((int)$id),
                default => Response::error('Route livres inconnue', 404),
            };
            break;

        case 'membre':
            match (true) {
                $method === 'GET' && $id === 'profil' => MembreController::profil(),
                $method === 'PUT' && $id === 'profil' => MembreController::updateProfil($body),
                default => Response::error('Route membre inconnue', 404),
            };
            break;

        case 'emprunts':
            match (true) {
                $method === 'GET' && $id === null => EmpruntController::index(),
                $method === 'POST' && $id === null => EmpruntController::create($body),
                $method === 'PUT' && $id !== null => EmpruntController::update((int)$id, $body),
                default => Response::error('Route emprunts inconnue', 404),
            };
            break;

        default:
            Response::error('Route non trouvée', 404);
    }
} catch (Throwable $e) {
    Response::error('Erreur serveur : ' . $e->getMessage(), 500);
}