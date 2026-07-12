<?php

class AdminLivreController
{
    public static function store(): void
    {
        $body = $_POST;

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

        // --- Upload image si présente ---
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            try {
                $cloudinary = new CloudinaryService();
                $body['url_couverture'] = $cloudinary->uploadImage($_FILES['image']);
            } catch (\RuntimeException $e) {
                Response::error($e->getMessage(), 422);
                return;
            }
        }

        $livre = $livreModel->create($body);

        Response::success(['livre' => $livre], 'Livre créé avec succès', 201);
    }

    public static function update(int $idLivre): void
    {
        $body = $_POST;

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

        // --- Nouvelle image envoyée → remplace l'ancienne ---
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            try {
                $cloudinary = new CloudinaryService();
                $newImageUrl = $cloudinary->uploadImage($_FILES['image']);

                if (!empty($livreExistant['url_couverture'])) {
                    $cloudinary->deleteImageByUrl($livreExistant['url_couverture']);
                }

                $body['url_couverture'] = $newImageUrl;
            } catch (\RuntimeException $e) {
                Response::error($e->getMessage(), 422);
                return;
            }
        } else {
            // Pas de nouvelle image → on garde l'ancienne
            $body['url_couverture'] = $livreExistant['url_couverture'] ?? null;
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

        if (!empty($livreExistant['url_couverture'])) {
            $cloudinary = new CloudinaryService();
            $cloudinary->deleteImageByUrl($livreExistant['url_couverture']);
        }

        $livreModel->delete($idLivre);

        Response::success([], 'Livre supprimé avec succès');
    }

    public static function index(): void
    {
        $livreModel = new Livre();
        $livres = $livreModel->getAll();

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
}