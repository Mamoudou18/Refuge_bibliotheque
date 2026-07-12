<?php

class LivreController
{
    public static function index(): void
    {
        $livreModel = new Livre();
        $livres = $livreModel->getAllDisponibles(); // PUBLIC → dispo seulement

        Response::success(['livres' => $livres]);
    }

    public static function show(int $idLivre): void
    {
        $livreModel = new Livre();
        $livre = $livreModel->findById($idLivre);

        if (!$livre || $livre['nb_disponibles'] <= 0) {
            Response::error('Livre introuvable', 404);
            return;
        }

        Response::success(['livre' => $livre]);
    }
}