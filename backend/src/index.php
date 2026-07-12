<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/middlewares/Auth.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AdminMembreController.php';
require_once __DIR__ . '/models/Membre.php';

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

$resource = $segments[0] ?? '';
$action = $segments[1] ?? null;
$subAction = $segments[2] ?? null;

// --- Liste des ressources réservées à l'admin ---
const ADMIN_RESOURCES = ['membres']; // ajout ici de toute future ressource admin (ex: 'stats', 'roles', ...)

try {
    // --- Protection centralisée des routes admin ---
    if (in_array($resource, ADMIN_RESOURCES, true)) {
        $membreConnecte = Auth::check();
        Auth::checkRole($membreConnecte, 1); // 1 = admin
    }

    if ($resource === 'auth' && $action === 'register' && $method === 'POST') {
        AuthController::register($body);
    } elseif ($resource === 'auth' && $action === 'login' && $method === 'POST') {
        AuthController::login($body);
    } elseif ($resource === 'auth' && $action === 'logout' && $method === 'POST') {
        $membre = Auth::check();
        AuthController::logout($membre);

    // --- Routes admin ---
    } elseif ($resource === 'membres' && $action === null && $method === 'GET') {
        AdminMembreController::index();
    } elseif ($resource === 'membres' && is_numeric($action) && $subAction === 'statut' && $method === 'PATCH') {
        AdminMembreController::updateStatut($body, (int)$action);

    } else {
        Response::error('Route non trouvée', 404);
    }
} catch (Throwable $e) {
    Response::error('Erreur serveur : ' . $e->getMessage(), 500);
}