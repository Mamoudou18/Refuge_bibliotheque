<?php

class Membre
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function emailExists(string $email): bool
    {
        $stmt = $this->db->prepare("SELECT 1 FROM membre WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
        return (bool) $stmt->fetch();
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO membre (nom, prenom, email, mot_de_passe, numero_tel, date_naissance)
            VALUES (:nom, :prenom, :email, :mot_de_passe, :numero_tel, :date_naissance)
            RETURNING id_membre, nom, prenom, email, numero_tel, date_naissance, id_role, is_actif, date_inscription
        ");
        $stmt->execute([
            'nom'            => $data['nom'],
            'prenom'         => $data['prenom'],
            'email'          => $data['email'],
            'mot_de_passe'   => $data['mot_de_passe'],
            'numero_tel'     => $data['numero_tel'],
            'date_naissance' => $data['date_naissance'],
        ]);
        $membre = $stmt->fetch(PDO::FETCH_ASSOC);

        // Reformater pour le front (jj/mm/aaaa)
        if (!empty($membre['date_naissance'])) {
            $membre['date_naissance'] = (new DateTime($membre['date_naissance']))->format('d/m/Y');
        }

        return $membre;
    }
}