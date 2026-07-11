<?php

class Auth
{
    /**
     * Vérifie le token d'authentification envoyé dans le header Authorization.
     * Retourne les infos du membre connecté ou bloque la requête (401).
     */
    public static function check(): array
    {
        $token = self::getBearerToken();

        if (!$token) {
            Response::error('Non authentifié : token manquant', 401);
            exit;
        }

        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT t.id_token, t.id_membre, t.date_expiration, t.utilise,
                   m.id_membre, m.nom, m.prenom, m.email, m.id_role, m.is_actif
            FROM token t
            INNER JOIN membre m ON m.id_membre = t.id_membre
            WHERE t.api_token = :token
              AND t.type = 'connexion'
            LIMIT 1
        ");
        $stmt->execute(['token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            Response::error('Non authentifié : token invalide', 401);
            exit;
        }

        if ($result['utilise']) {
            Response::error('Non authentifié : session terminée', 401);
            exit;
        }

        $dateExpiration = new DateTime($result['date_expiration']);
        if ($dateExpiration < new DateTime()) {
            Response::error('Non authentifié : session expirée', 401);
            exit;
        }

        if (!$result['is_actif']) {
            Response::error('Compte désactivé', 403);
            exit;
        }

        // On retourne les infos utiles du membre connecté
        return [
            'id_membre' => $result['id_membre'],
            'nom'       => $result['nom'],
            'prenom'    => $result['prenom'],
            'email'     => $result['email'],
            'id_role'   => $result['id_role'],
        ];
    }

    /**
     * Vérifie que le membre connecté a un rôle précis (ex: admin = 1).
     */
    public static function checkRole(array $membre, int $idRoleRequis): void
    {
        if ((int)$membre['id_role'] !== $idRoleRequis) {
            Response::error('Accès refusé : permissions insuffisantes', 403);
            exit;
        }
    }

    /**
     * Récupère le token depuis le header Authorization: Bearer xxx
     */
    private static function getBearerToken(): ?string
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }

        return trim(str_replace('Bearer ', '', $authHeader));
    }
}