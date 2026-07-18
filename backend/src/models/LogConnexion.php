<?php

class LogConnexion
{
    private \MongoDB\Collection $collection;

    public function __construct()
    {
        $db = MongoConfig::getDatabase();
        $this->collection = $db->selectCollection('logs_connexion');
    }

    public function enregistrer(int $idMembre, string $email, bool $succes, string $ip = ''): void
    {
        $this->collection->insertOne([
            'id_membre' => $idMembre,
            'email' => $email,
            'succes' => $succes,
            'ip' => $ip ?: ($_SERVER['REMOTE_ADDR'] ?? 'inconnu'),
            'date_connexion' => new \MongoDB\BSON\UTCDateTime(),
        ]);
    }

    public function getHistoriqueParMembre(int $idMembre, int $limite = 20): array
    {
        $cursor = $this->collection->find(
            ['id_membre' => $idMembre],
            ['sort' => ['date_connexion' => -1], 'limit' => $limite]
        );

        $logs = [];
        foreach ($cursor as $doc) {
            $logs[] = [
                'id_membre'      => $doc['id_membre'],
                'email'          => $doc['email'],
                'succes'         => $doc['succes'],
                'ip'             => $doc['ip'],
                'date_connexion' => $doc['date_connexion']->toDateTime()->format('Y-m-d H:i:s'),
            ];
        }
        return $logs;
    }

    public function getConnexionsRecentes(int $limite = 50): array
    {
        $cursor = $this->collection->find(
            [],
            ['sort' => ['date_connexion' => -1], 'limit' => $limite]
        );

        $logs = [];
        foreach ($cursor as $doc) {
            $logs[] = [
                'id_membre'      => $doc['id_membre'],
                'email'          => $doc['email'],
                'succes'         => $doc['succes'],
                'ip'             => $doc['ip'],
                'date_connexion' => $doc['date_connexion']->toDateTime()->format('Y-m-d H:i:s'),
            ];
        }
        return $logs;
    }
}