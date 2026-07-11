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
    public function createConnexionToken(int $idMembre, int $dureeValiditeHeures = 24): string
    {
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
}