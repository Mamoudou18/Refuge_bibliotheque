<?php

class Token
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Crée un token de connexion pour un membre, valide X heures.
     */
    public function createConnexionToken(int $idMembre, ?int $dureeValiditeHeures = null): string
    {
        $dureeValiditeHeures ??= (int) (getenv('TOKEN_CONNEXION_DUREE_HEURES') ?: 24);

        $apiToken = bin2hex(random_bytes(32));
        $dateExpiration = (new DateTime())->modify("+{$dureeValiditeHeures} hours")->format('Y-m-d H:i:s');

        $stmt = $this->db->prepare("
            INSERT INTO token (id_membre, api_token, type, date_expiration, utilise)
            VALUES (:id_membre, :api_token, 'connexion', :date_expiration, false)
        ");
        $stmt->execute([
            'id_membre'       => $idMembre,
            'api_token'       => $apiToken,
            'date_expiration' => $dateExpiration,
        ]);

        return $apiToken;
    }

    /**
     * Marque un token comme utilisé (déconnexion).
     */
    public function invalidate(string $apiToken): bool
    {
        $stmt = $this->db->prepare("
            UPDATE token SET utilise = true
            WHERE api_token = :api_token
                AND type = 'connexion' 
                AND utilise = false
        ");
        $stmt->execute(['api_token' => $apiToken]);

        return $stmt->rowCount() > 0;
    }

    /**
     * Supprime les tokens expirés ou invalidés depuis plus de X jours.
     * Conserve un historique de rétention avant purge définitive.
     */
    public function cleanup(?int $retentionJours = null): int
    {
        $retentionJours ??= (int) (getenv('TOKEN_JOUR_RETENTION') ?: 7);
        $stmt = $this->db->prepare("
            DELETE FROM token
            WHERE (date_expiration < NOW() OR utilise = true)
            AND date_expiration < NOW() - (:jours || ' days')::interval
        ");
        $stmt->execute(['jours' => $retentionJours]);

        return $stmt->rowCount();
    }
}