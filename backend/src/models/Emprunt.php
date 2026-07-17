<?php

class Emprunt
{
    private PDO $db;

    const STATUT_EN_COURS = 1;
    const STATUT_BIENTOT = 2;
    const STATUT_EN_RETARD = 3;
    const STATUT_PROLONGE = 4;
    const STATUT_RENDU = 5;

    const MAX_PROLONGATIONS = 1;
    const DUREE_EMPRUNT_JOURS = 14;
    const DUREE_PROLONGATION_JOURS = 7;
    const SEUIL_BIENTOT_JOURS = 3;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    private function formatDates(array $emprunt): array
    {
        if (!empty($emprunt['date_emprunt'])) {
            $emprunt['date_emprunt'] = (new DateTime($emprunt['date_emprunt']))->format('d/m/Y');
        }
        if (!empty($emprunt['date_retour_prevue'])) {
            $emprunt['date_retour_prevue'] = (new DateTime($emprunt['date_retour_prevue']))->format('d/m/Y');
        }
        if (!empty($emprunt['date_retour_effective'])) {
            $emprunt['date_retour_effective'] = (new DateTime($emprunt['date_retour_effective']))->format('d/m/Y');
        }
        return $emprunt;
    }

    /**
     * Tous les emprunts, avec infos livre + membre (usage ADMIN)
     */
    public function getAll(): array
    {
        $this->majStatuts();

        $stmt = $this->db->prepare("
            SELECT e.*, l.titre AS titre_livre, l.auteur, l.url_couverture,
                   m.nom, m.prenom, m.email,
                   s.libelle AS statut_libelle
            FROM emprunt e
            JOIN livre l ON l.id_livre = e.id_livre
            JOIN membre m ON m.id_membre = e.id_membre
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            ORDER BY e.date_emprunt DESC
        ");
        $stmt->execute();
        $emprunts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'formatDates'], $emprunts);
    }

    /**
     * Emprunts d'un membre (usage ESPACE MEMBRE)
     */
    public function getByMembre(int $idMembre): array
    {
        $this->majStatuts();

        $stmt = $this->db->prepare("
            SELECT e.*, l.titre AS titre_livre, l.auteur, l.url_couverture,
                   s.libelle AS statut_libelle
            FROM emprunt e
            JOIN livre l ON l.id_livre = e.id_livre
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            WHERE e.id_membre = :id_membre
            ORDER BY e.date_emprunt DESC
        ");
        $stmt->execute(['id_membre' => $idMembre]);
        $emprunts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'formatDates'], $emprunts);
    }

    public function findById(int $idEmprunt): ?array
    {
        $stmt = $this->db->prepare("
            SELECT e.*, l.titre AS titre_livre, l.auteur, l.url_couverture,
                   m.nom, m.prenom, m.email,
                   s.libelle AS statut_libelle
            FROM emprunt e
            JOIN livre l ON l.id_livre = e.id_livre
            JOIN membre m ON m.id_membre = e.id_membre
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            WHERE e.id_emprunt = :id
        ");
        $stmt->execute(['id' => $idEmprunt]);
        $emprunt = $stmt->fetch(PDO::FETCH_ASSOC);

        return $emprunt ? $this->formatDates($emprunt) : null;
    }

    public function empruntEnCoursExists(int $idMembre, int $idLivre): bool
    {
        $stmt = $this->db->prepare("
            SELECT 1 FROM emprunt
            WHERE id_membre = :id_membre
            AND id_livre = :id_livre
            AND id_statut != :statut_rendu
            LIMIT 1
        ");
        $stmt->execute([
            'id_membre' => $idMembre,
            'id_livre' => $idLivre,
            'statut_rendu' => self::STATUT_RENDU,
        ]);

        return (bool) $stmt->fetch();
    }

    public function nbEmpruntsEnCours(int $idMembre): int
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM emprunt
            WHERE id_membre = :id_membre
            AND id_statut != :statut_rendu
        ");
        $stmt->execute([
            'id_membre' => $idMembre,
            'statut_rendu' => self::STATUT_RENDU,
        ]);

        return (int) $stmt->fetchColumn();
    }

    public function create(int $idMembre, int $idLivre): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO emprunt (id_membre, id_livre, date_emprunt, date_retour_prevue, nb_prolongations, id_statut)
            VALUES (:id_membre, :id_livre, NOW(), NOW() + INTERVAL '" . self::DUREE_EMPRUNT_JOURS . " days', 0, :statut_encours)
            RETURNING *
        ");

        $stmt->execute([
            'id_membre' => $idMembre,
            'id_livre' => $idLivre,
            'statut_encours' => self::STATUT_EN_COURS,
        ]);

        $emprunt = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatDates($emprunt);
    }

    public function retourner(int $idEmprunt): array
    {
        $stmt = $this->db->prepare("
            UPDATE emprunt SET
                date_retour_effective = NOW(),
                id_statut = :statut_rendu
            WHERE id_emprunt = :id
            RETURNING *
        ");

        $stmt->execute([
            'id' => $idEmprunt,
            'statut_rendu' => self::STATUT_RENDU,
        ]);

        $emprunt = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatDates($emprunt);
    }

    public function prolonger(int $idEmprunt): array
    {
        $stmt = $this->db->prepare("
            UPDATE emprunt SET
                date_retour_prevue = date_retour_prevue + INTERVAL '" . self::DUREE_PROLONGATION_JOURS . " days',
                nb_prolongations = nb_prolongations + 1,
                id_statut = :statut_prolonge
            WHERE id_emprunt = :id
            RETURNING *
        ");

        $stmt->execute([
            'id' => $idEmprunt,
            'statut_prolonge' => self::STATUT_PROLONGE,
        ]);

        $emprunt = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatDates($emprunt);
    }

    public function majStatuts(): void
    {
        // 1. PRIORITÉ : en retard (écrase tout sauf rendu)
        $sqlRetard = "
            UPDATE emprunt
            SET id_statut = :statut_retard
            WHERE id_statut != :statut_rendu
            AND id_statut != :statut_retard
            AND date_retour_prevue < NOW()
            AND date_retour_effective IS NULL
        ";
        $stmt = $this->db->prepare($sqlRetard);
        $stmt->execute([
            'statut_retard' => self::STATUT_EN_RETARD,
            'statut_rendu' => self::STATUT_RENDU,
        ]);

        // 2. "bientot" depuis "en_cours" OU "prolonge"
        $sqlBientot = "
            UPDATE emprunt
            SET id_statut = :statut_bientot
            WHERE id_statut IN (:statut_encours, :statut_prolonge)
            AND date_retour_prevue BETWEEN NOW() AND NOW() + INTERVAL '" . self::SEUIL_BIENTOT_JOURS . " days'
            AND date_retour_effective IS NULL
        ";
        $stmt = $this->db->prepare($sqlBientot);
        $stmt->execute([
            'statut_bientot' => self::STATUT_BIENTOT,
            'statut_encours' => self::STATUT_EN_COURS,
            'statut_prolonge' => self::STATUT_PROLONGE,
        ]);
    }
}