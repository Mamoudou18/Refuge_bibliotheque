<?php

class Statistiques {
    private PDO $db;
    private HistoriqueEmprunt $historiqueEmprunt;

    public function __construct(PDO $db) {
        $this->db = $db;
        $this->historiqueEmprunt = new HistoriqueEmprunt();
    }

    public function getStatsGenerales(): array {
        $livresTotal = $this->db->query("SELECT COUNT(*) FROM livre")->fetchColumn();
        $membresTotal = $this->db->query("SELECT COUNT(*) FROM membre WHERE id_role = 2")->fetchColumn();

        $empruntsEnCours = $this->db->query("
            SELECT COUNT(*) 
            FROM emprunt e
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            WHERE s.libelle IN ('en cours', 'prolonge', 'bientot')
        ")->fetchColumn();

        $empruntsEnRetard = $this->db->query("
            SELECT COUNT(*) 
            FROM emprunt e
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            WHERE s.libelle = 'en retard'
        ")->fetchColumn();

        return [
            'livresTotal' => (int)$livresTotal,
            'membresTotal' => (int)$membresTotal,
            'empruntsEnCours' => (int)$empruntsEnCours,
            'empruntsEnRetard' => (int)$empruntsEnRetard,
        ];
    }

    public function getTopLivres(int $limite = 4): array {
        $stmt = $this->db->prepare("
            SELECT l.titre, l.auteur, COUNT(e.id_emprunt) AS nb_emprunts
            FROM emprunt e
            JOIN livre l ON l.id_livre = e.id_livre
            GROUP BY l.id_livre, l.titre, l.auteur
            ORDER BY nb_emprunts DESC
            LIMIT :limite
        ");
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRepartitionCategories(): array {
        $stmt = $this->db->query("
            SELECT categorie, COUNT(*) AS nombre_livres
            FROM livre
            GROUP BY categorie
            ORDER BY nombre_livres DESC
        ");
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $total = array_sum(array_column($result, 'nombre_livres'));

        foreach ($result as &$row) {
            $row['pourcentage'] = $total > 0
                ? round(($row['nombre_livres'] / $total) * 100, 1)
                : 0;
        }

        return $result;
    }

    public function getMembresEnRetard(): array {
        $stmt = $this->db->query("
            SELECT 
                CONCAT(m.prenom, ' ', m.nom) AS nom_membre,
                l.titre AS titre_livre,
                DATE_PART('day', NOW() - e.date_retour_prevue) AS jours_retard
            FROM emprunt e
            JOIN membre m ON m.id_membre = e.id_membre
            JOIN livre l ON l.id_livre = e.id_livre
            JOIN statut_emprunt s ON s.id_statut = e.id_statut
            WHERE s.libelle = 'en retard'
            ORDER BY jours_retard DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getNouveauxMembres(): array {
        $stmt = $this->db->query("
            SELECT 
                CONCAT(prenom, ' ', nom) AS nom_complet,
                date_inscription
            FROM membre
            WHERE date_inscription >= date_trunc('month', NOW())
              AND id_role = 2
            ORDER BY date_inscription DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getActiviteMois(): array {
        $empruntModel = new Emprunt();
        
        $libelleEnCours = $empruntModel->getLibelleStatut(Emprunt::STATUT_EN_COURS);
        $libelleRendu = $empruntModel->getLibelleStatut(Emprunt::STATUT_RENDU);

        $empruntsCeMois = $this->historiqueEmprunt->compterChangementsCeMois($libelleEnCours);
        $retoursCeMois = $this->historiqueEmprunt->compterChangementsCeMois($libelleRendu);

        $stats = $this->getStatsGenerales();
        $tauxDeRetard = $stats['empruntsEnCours'] > 0
            ? round(($stats['empruntsEnRetard'] / $stats['empruntsEnCours']) * 100, 1)
            : 0;

        return [
            'empruntsCeMois' => $empruntsCeMois,
            'retoursCeMois' => $retoursCeMois,
            'tauxDeRetard' => $tauxDeRetard,
        ];
    }

    public function getToutesLesStats(): array {
        return [
            'general' => $this->getStatsGenerales(),
            'activite' => $this->getActiviteMois(),
            'topLivres' => $this->getTopLivres(),
            'repartitionCategories' => $this->getRepartitionCategories(),
            'membresEnRetard' => $this->getMembresEnRetard(),
            'nouveauxMembres' => $this->getNouveauxMembres(),
        ];
    }
}