<?php

class Livre
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    private function formatDates(array $livre): array
    {
        if (!empty($livre['date_ajout'])) {
            $livre['date_ajout'] = (new DateTime($livre['date_ajout']))->format('d/m/Y');
        }
        if (!empty($livre['date_maj'])) {
            $livre['date_maj'] = (new DateTime($livre['date_maj']))->format('d/m/Y');
        }
        return $livre;
    }

    /**
     * Tous les livres, sans filtre (usage ADMIN)
     */
    public function getAll(): array
    {
        $stmt = $this->db->prepare("SELECT * FROM livre ORDER BY date_ajout DESC");
        $stmt->execute();
        $livres = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'formatDates'], $livres);
    }

    /**
     * Livres disponibles uniquement (usage CATALOGUE PUBLIC)
     */
    public function getAllDisponibles(): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM livre
            WHERE nb_disponibles > 0
            ORDER BY date_ajout DESC
        ");
        $stmt->execute();
        $livres = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map([$this, 'formatDates'], $livres);
    }

    public function findById(int $idLivre): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM livre WHERE id_livre = :id");
        $stmt->execute(['id' => $idLivre]);
        $livre = $stmt->fetch(PDO::FETCH_ASSOC);

        return $livre ? $this->formatDates($livre) : null;
    }

    public function titreExists(string $titre, ?int $excludeId = null): bool
    {
        $sql = "SELECT 1 FROM livre WHERE LOWER(titre) = LOWER(:titre)";
        $params = ['titre' => $titre];

        if ($excludeId !== null) {
            $sql .= " AND id_livre != :excludeId";
            $params['excludeId'] = $excludeId;
        }

        $sql .= " LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return (bool) $stmt->fetch();
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO livre (titre, auteur, annee_publication, categorie, description, nb_exemplaires, nb_disponibles, url_couverture)
            VALUES (:titre, :auteur, :annee_publication, :categorie, :description, :nb_exemplaires, :nb_disponibles, :url_couverture)
            RETURNING *
        ");

        $nbExemplaires = !empty($data['nb_exemplaires']) ? (int)$data['nb_exemplaires'] : 1;
        $nbDisponibles = !empty($data['nb_disponibles']) ? (int)$data['nb_disponibles'] : $nbExemplaires;

        $stmt->execute([
            'titre' => $data['titre'],
            'auteur' => $data['auteur'],
            'annee_publication' => !empty($data['annee_publication']) ? (int)$data['annee_publication'] : null,
            'categorie' => $data['categorie'] ?? null,
            'description' => $data['description'] ?? null,
            'nb_exemplaires' => $nbExemplaires,
            'nb_disponibles' => $nbDisponibles,
            'url_couverture' => $data['url_couverture'] ?? null,
        ]);

        $livre = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatDates($livre);
    }

    public function update(int $idLivre, array $data): array
    {
        $stmt = $this->db->prepare("
            UPDATE livre SET
                titre = :titre,
                auteur = :auteur,
                annee_publication = :annee_publication,
                categorie = :categorie,
                description = :description,
                nb_exemplaires = :nb_exemplaires,
                nb_disponibles = :nb_disponibles,
                url_couverture = :url_couverture,
                date_maj = NOW()
            WHERE id_livre = :id
            RETURNING *
        ");

        $stmt->execute([
            'titre' => $data['titre'],
            'auteur' => $data['auteur'],
            'annee_publication' => !empty($data['annee_publication']) ? (int)$data['annee_publication'] : null,
            'categorie' => $data['categorie'] ?? null,
            'description' => $data['description'] ?? null,
            'nb_exemplaires' => (int)($data['nb_exemplaires'] ?? 0),
            'nb_disponibles' => (int)($data['nb_disponibles'] ?? 0),
            'url_couverture' => $data['url_couverture'] ?? null,
            'id' => $idLivre,
        ]);

        $livre = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatDates($livre);
    }

    public function delete(int $idLivre): void
    {
        $stmt = $this->db->prepare("DELETE FROM livre WHERE id_livre = :id");
        $stmt->execute(['id' => $idLivre]);
    }
}