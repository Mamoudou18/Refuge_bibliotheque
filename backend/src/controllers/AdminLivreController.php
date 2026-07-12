<?php

class AdminLivreController
{
    public static function index(): void
    {
        $livreModel = new Livre();
        $livres = $livreModel->getAll(); // ADMIN → tous les livres

        Response::success(['livres' => $livres]);
    }

    public static function show(int $idLivre): void
    {
        $livreModel = new Livre();
        $livre = $livreModel->findById($idLivre);

        if (!$livre) {
            Response::error('Livre introuvable', 404);
            return;
        }

        Response::success(['livre' => $livre]);
    }

    public static function store(array $body): void
    {
        $validation = new Validation();
        $validation
            ->required($body, ['titre', 'auteur'])
            ->maxLength($body, 'titre', 200)
            ->maxLength($body, 'auteur', 100)
            ->maxLength($body, 'categorie', 100);

        if (!empty($body['annee_publication']) && !is_numeric($body['annee_publication'])) {
            Response::error("Le champ 'annee_publication' doit être un nombre", 422);
            return;
        }

        if (isset($body['nb_exemplaires']) && (!is_numeric($body['nb_exemplaires']) || $body['nb_exemplaires'] < 0)) {
            Response::error("Le champ 'nb_exemplaires' doit être un entier positif", 422);
            return;
        }

        if ($validation->fails()) {
            Response::error(implode(' | ', $validation->getErrors()), 422);
            return;
        }

        $livreModel = new Livre();

        if ($livreModel->titreExists($body['titre'])) {
            Response::error('Un livre avec ce titre existe déjà', 409);
            return;
        }

        $livre = $livreModel->create($body);

        Response::success(['livre' => $livre], 'Livre créé avec succès', 201);
    }

    public static function update(array $body, int $idLivre): void
    {
        $livreModel = new Livre();
        $livreExistant = $livreModel->findById($idLivre);

        if (!$livreExistant) {
            Response::error('Livre introuvable', 404);
            return;
        }

        $validation = new Validation();
        $validation
            ->required($body, ['titre', 'auteur'])
            ->maxLength($body, 'titre', 200)
            ->maxLength($body, 'auteur', 100)
            ->maxLength($body, 'categorie', 100);

        if (!empty($body['annee_publication']) && !is_numeric($body['annee_publication'])) {
            Response::error("Le champ 'annee_publication' doit être un nombre", 422);
            return;
        }

        if (!isset($body['nb_exemplaires']) || !is_numeric($body['nb_exemplaires']) || $body['nb_exemplaires'] < 0) {
            Response::error("Le champ 'nb_exemplaires' doit être un entier positif", 422);
            return;
        }

        if (!isset($body['nb_disponibles']) || !is_numeric($body['nb_disponibles']) || $body['nb_disponibles'] < 0) {
            Response::error("Le champ 'nb_disponibles' doit être un entier positif", 422);
            return;
        }

        if ($body['nb_disponibles'] > $body['nb_exemplaires']) {
            Response::error("Le nombre de disponibles ne peut pas dépasser le nombre d'exemplaires", 422);
            return;
        }

        if ($validation->fails()) {
            Response::error(implode(' | ', $validation->getErrors()), 422);
            return;
        }

        if ($livreModel->titreExists($body['titre'], $idLivre)) {
            Response::error('Un livre avec ce titre existe déjà', 409);
            return;
        }

        $livreMaj = $livreModel->update($idLivre, $body);

        Response::success(['livre' => $livreMaj], 'Livre mis à jour avec succès');
    }

    public static function destroy(int $idLivre): void
    {
        $livreModel = new Livre();
        $livreExistant = $livreModel->findById($idLivre);

        if (!$livreExistant) {
            Response::error('Livre introuvable', 404);
            return;
        }

        $livreModel->delete($idLivre);

        Response::success([], 'Livre supprimé avec succès');
    }
}