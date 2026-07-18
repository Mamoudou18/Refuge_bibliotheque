<?php

class HistoriqueEmprunt {
    private \MongoDB\Collection $collection;

    public function __construct() {
        $db = MongoConfig::getDatabase();
        $this->collection = $db->selectCollection('historique_emprunts');
    }

    public function enregistrerChangement(
        int $idEmprunt,
        int $idMembre,
        string $nomMembre,
        string $prenomMembre,
        int $idLivre,
        string $titreLivre,
        string $ancienStatut,
        string $nouveauStatut
    ): void {
        $this->collection->insertOne([
            'id_emprunt' => $idEmprunt,
            'id_membre' => $idMembre,
            'membre' => trim($prenomMembre . ' ' . $nomMembre),
            'id_livre' => $idLivre,
            'titre_livre' => $titreLivre,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => $nouveauStatut,
            'date_changement' => new \MongoDB\BSON\UTCDateTime(),
        ]);
    }

    public function getHistoriqueParEmprunt(int $idEmprunt): array {
        $cursor = $this->collection->find(
            ['id_emprunt' => $idEmprunt],
            [
                'sort' => ['date_changement' => -1],
                'typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array'],
            ]
        );

        return array_map([$this, 'formatHistorique'], $cursor->toArray());
    }

    /**
     * Compte les changements vers un statut donné dans le mois en cours
     */
    public function compterChangementsCeMois(string $statutCible): int {
        $debutMois = new \MongoDB\BSON\UTCDateTime(strtotime(date('Y-m-01 00:00:00')) * 1000);

        return $this->collection->countDocuments([
            'nouveau_statut' => $statutCible,
            'date_changement' => ['$gte' => $debutMois],
        ]);
    }

    /**
     * Formate un document d'historique pour l'API (conversion date Mongo -> string lisible)
     */
    private function formatHistorique(array $doc): array
    {
        return [
            'id_emprunt'      => $doc['id_emprunt'],
            'id_membre'       => $doc['id_membre'],
            'membre'          => $doc['membre'],
            'id_livre'        => $doc['id_livre'],
            'titre_livre'     => $doc['titre_livre'],
            'ancien_statut'   => $doc['ancien_statut'] ?? null,
            'nouveau_statut'  => $doc['nouveau_statut'],
            'date_changement' => $doc['date_changement']->toDateTime()->format('Y-m-d H:i:s'),
        ];
    }
}