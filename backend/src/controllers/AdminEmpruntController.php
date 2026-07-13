<?php

class AdminEmpruntController
{
    public static function index(): void
    {
        $empruntModel = new Emprunt();
        $emprunts = $empruntModel->getAll();

        Response::success($emprunts);
    }

    public static function store(array $body): void
    {
        $idMembre = $body['id_membre'] ?? null;
        $idLivre = $body['id_livre'] ?? null;

        if (!$idMembre || !is_numeric($idMembre) || !$idLivre || !is_numeric($idLivre)) {
            Response::error('id_membre et id_livre sont requis et doivent être numériques.', 400);
            return;
        }

        $idMembre = (int) $idMembre;
        $idLivre = (int) $idLivre;

        // Vérifier que le membre existe
        $membreModel = new Membre();
        $membre = $membreModel->findById($idMembre);
        if (!$membre) {
            Response::error('Membre introuvable.', 404);
            return;
        }

        // Vérifier que le livre existe
        $livreModel = new Livre();
        $livre = $livreModel->findById($idLivre);
        if (!$livre) {
            Response::error('Livre introuvable.', 404);
            return;
        }

        if ($livre['nb_disponibles'] <= 0) {
            Response::error('Aucun exemplaire disponible pour ce livre.', 409);
            return;
        }

        $empruntModel = new Emprunt();

        if ($empruntModel->empruntEnCoursExists($idMembre, $idLivre)) {
            Response::error('Ce membre a déjà un emprunt en cours pour ce livre.', 409);
            return;
        }

        if ($empruntModel->nbEmpruntsEnCours($idMembre) >= 2) {
            Response::error("Ce membre a déjà 2 emprunts en cours. Impossible d'emprunter davantage.", 409);
            return;
        }

        try {
            $livreModel->decrementerDisponibles($idLivre);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 409);
            return;
        }

        $emprunt = $empruntModel->create($idMembre, $idLivre);

        Response::success($emprunt, 'Emprunt créé avec succès pour le membre.', 201);
    }

    public static function show(int $idEmprunt): void
    {
        $empruntModel = new Emprunt();
        $emprunt = $empruntModel->findById($idEmprunt);

        if (!$emprunt) {
            Response::error('Emprunt introuvable.', 404);
            return;
        }

        Response::success($emprunt);
    }

    public static function retourner(int $idEmprunt): void
    {
        $empruntModel = new Emprunt();

        $emprunt = $empruntModel->findById($idEmprunt);
        if (!$emprunt) {
            Response::error('Emprunt introuvable.', 404);
            return;
        }

        if ((int) $emprunt['id_statut'] === Emprunt::STATUT_RENDU) {
            Response::error('Cet emprunt a déjà été rendu.', 409);
            return;
        }

        $empruntMisAJour = $empruntModel->retourner($idEmprunt);

        $livreModel = new Livre();
        $livreModel->incrementerDisponibles((int) $emprunt['id_livre']);

        Response::success($empruntMisAJour, 'Retour enregistré avec succès.');
    }
}