<?php

class AdminMembreController
{
    public static function index(): void
    {
        $membreModel = new Membre();
        $membres = $membreModel->getAll();

        Response::success(['membres' => $membres]);
    }

    public static function updateStatut(array $body, int $idMembre): void
    {
        if (!isset($body['is_actif']) || !is_bool($body['is_actif'])) {
            Response::error('Le champ is_actif est requis et doit être un booléen', 422);
            return;
        }

        $membreModel = new Membre();
        $membreExistant = $membreModel->findById($idMembre);

        if (!$membreExistant) {
            Response::error('Membre introuvable', 404);
            return;
        }

        $membreMaj = $membreModel->updateStatut($idMembre, $body['is_actif']);

        Response::success(['membre' => $membreMaj], 'Statut mis à jour avec succès');
    }
}