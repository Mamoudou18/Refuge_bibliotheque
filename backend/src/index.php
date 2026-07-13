<?php

require_once __DIR__ . '/../vendor/autoload.php';

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

//Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AdminMembreController.php';
require_once __DIR__ . '/controllers/AdminLivreController.php';
require_once __DIR__ . '/controllers/AdminEmpruntController.php';
require_once __DIR__ . '/controllers/LivreController.php';
require_once __DIR__ . '/controllers/EmpruntController.php';

// Models
require_once __DIR__ . '/models/Membre.php';
require_once __DIR__ . '/models/Livre.php';
require_once __DIR__ . '/models/Emprunt.php';

require_once __DIR__ . '/services/CloudinaryService.php';

$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$path = preg_replace('#^api/#', '', $path);
$segments = explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// --- Support du method spoofing pour PUT avec upload de fichier (FormData) ---
if ($method === 'POST' && isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT') {
    $method = 'PUT';
}

$resource = $segments[0] ?? '';
$action = $segments[1] ?? null;
$subAction = $segments[2] ?? null;

/** @var array|null $membreConnecte */
$membreConnecte = null;

// --- Liste des ressources réservées à l'admin ---
const ADMIN_RESOURCES = ['membres', 'admin']; // ajout ici de toute future ressource admin (ex: 'stats', 'livres', 'membres', ...)

// Routes publiques mais nécessitant une connexion (n'importe quel membre)
const AUTH_REQUIRED_RESOURCES = ['livres', 'emprunts'];

try {
    // --- Protection centralisée des routes admin ---
    if (in_array($resource, ADMIN_RESOURCES, true)) {
        $membreConnecte = Auth::check();
        Auth::checkRole($membreConnecte, 1); // 1 = admin
    }

    // --- Routes nécessitant juste d'être connecté (peu importe le rôle) ---
    elseif (in_array($resource, AUTH_REQUIRED_RESOURCES, true)) {
        $membreConnecte = Auth::check(); // bloque automatiquement si non connecté
    }

    if ($resource === 'auth' && $action === 'register' && $method === 'POST') {
        AuthController::register($body);
    } elseif ($resource === 'auth' && $action === 'login' && $method === 'POST') {
        AuthController::login($body);
    } elseif ($resource === 'auth' && $action === 'logout' && $method === 'POST') {
        $membre = Auth::check();
        AuthController::logout($membre);
    } 

    // --- Routes admin ---
    elseif ($resource === 'membres' && $action === null && $method === 'GET') {
        AdminMembreController::index();
    } elseif ($resource === 'membres' && is_numeric($action) && $subAction === 'statut' && $method === 'PATCH') {
        AdminMembreController::updateStatut($body, (int)$action);

    }

    // --- Routes livres (admin) : CRUD complet, admin only ---
    elseif ($resource === 'admin' && $action === 'livres' && $subAction === null && $method === 'GET') {
        AdminLivreController::index();
    } elseif ($resource === 'admin' && $action === 'livres' && is_numeric($subAction) && $method === 'GET') {
        AdminLivreController::show((int)$subAction);
    } elseif ($resource === 'admin' && $action === 'livres' && $subAction === null && $method === 'POST') {
        AdminLivreController::store();
    } elseif ($resource === 'admin' && $action === 'livres' && is_numeric($subAction) && $method === 'PUT') {
        AdminLivreController::update((int)$subAction);
    } elseif ($resource === 'admin' && $action === 'livres' && is_numeric($subAction) && $method === 'DELETE') {
        AdminLivreController::destroy((int)$subAction);
    }

    // --- Routes livres (publiques) : lecture seule, connexion requise ---
    elseif ($resource === 'livres' && $action === null && $method === 'GET') {
        LivreController::index();
    } elseif ($resource === 'livres' && is_numeric($action) && $method === 'GET') {
        LivreController::show((int)$action);

    } 

    // --- Routes emprunts (admin) ---
    elseif ($resource === 'admin' && $action === 'emprunts' && $subAction === null && $method === 'POST') {
        AdminEmpruntController::store($body);
    }
    elseif ($resource === 'admin' && $action === 'emprunts' && $subAction === null && $method === 'GET') {
        AdminEmpruntController::index();
    } elseif ($resource === 'admin' && $action === 'emprunts' && is_numeric($subAction) && $method === 'GET') {
        AdminEmpruntController::show((int)$subAction);
    } elseif ($resource === 'admin' && $action === 'emprunts' && is_numeric($subAction) && $method === 'PATCH') {
        AdminEmpruntController::retourner((int)$subAction);
    }

    // --- Routes emprunts (membre connecté) ---
    elseif ($resource === 'emprunts' && $action === null && $method === 'GET') {
        EmpruntController::mine($membreConnecte);
    } elseif ($resource === 'emprunts' && $action === null && $method === 'POST') {
        EmpruntController::store($body, $membreConnecte);

    } elseif ($resource === 'emprunts' && is_numeric($action) && $subAction === 'prolonger' && $method === 'PATCH') {
        EmpruntController::prolonger((int)$action, $membreConnecte);
    }

    else {
        Response::error('Route non trouvée', 404);
    }
} catch (Throwable $e) {
    Response::error('Erreur serveur : ' . $e->getMessage(), 500);
}