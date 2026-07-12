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

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("
            SELECT id_membre, nom, prenom, email, mot_de_passe, numero_tel, date_naissance, id_role, is_actif, date_inscription
            FROM membre
            WHERE email = :email
            LIMIT 1
        ");
        $stmt->execute(['email' => $email]);
        $membre = $stmt->fetch(PDO::FETCH_ASSOC);

        return $membre ?: null;
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
    public function getAll(): array
    {
        $stmt = $this->db->prepare("
            SELECT m.id_membre, m.nom, m.prenom, m.email, m.numero_tel,
                m.is_actif, m.id_role, r.libelle AS role, m.date_inscription
            FROM membre m
            INNER JOIN role r ON r.id_role = m.id_role
            ORDER BY m.date_inscription DESC
        ");
        $stmt->execute();
        $membres = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Reformater les dates pour le front
        foreach ($membres as &$membre) {
            if (!empty($membre['date_inscription'])) {
                $membre['date_inscription'] = (new DateTime($membre['date_inscription']))->format('d/m/Y');
            }
        }

        return $membres;
    }

    public function updateStatut(int $idMembre, bool $isActif): ?array
    {
        $stmt = $this->db->prepare("
            UPDATE membre
            SET is_actif = :is_actif, date_maj = NOW()
            WHERE id_membre = :id_membre
            RETURNING id_membre, nom, prenom, email, is_actif
        ");
        $stmt->execute([
            'is_actif'  => $isActif ? 'true' : 'false',
            'id_membre' => $idMembre,
        ]);
        $membre = $stmt->fetch(PDO::FETCH_ASSOC);

        return $membre ?: null;
    }

    public function findById(int $idMembre): ?array
    {
        $stmt = $this->db->prepare("
            SELECT id_membre, nom, prenom, email, numero_tel, is_actif, id_role, date_inscription
            FROM membre
            WHERE id_membre = :id_membre
            LIMIT 1
        ");
        $stmt->execute(['id_membre' => $idMembre]);
        $membre = $stmt->fetch(PDO::FETCH_ASSOC);

        return $membre ?: null;
    }
}