<?php

class EmpruntController
{
    public static function mine(array $membreConnecte): void
    {
        $empruntModel = new Emprunt();
        $emprunts = $empruntModel->getByMembre($membreConnecte['id_membre']);

        Response::success($emprunts);
    }

    public static function store(array $body, array $membreConnecte): void
    {
        $validation = new Validation();
        $validation->required($body, ['id_livre'])
                ->integer($body, 'id_livre');

        if ($validation->fails()) {
            Response::validationError($validation->getErrors());
            return;
        }

        $idMembre = $membreConnecte['id_membre'];
        $idLivre = (int) $body['id_livre'];

        $empruntModel = new Emprunt();
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

        if ($empruntModel->empruntEnCoursExists($idMembre, $idLivre)) {
            Response::error('Vous avez déjà un emprunt en cours pour ce livre.', 409);
            return;
        }

        if ($empruntModel->nbEmpruntsEnCours($idMembre) >= 2) {
            Response::error("Vous avez déjà 2 emprunts en cours. Impossible d'emprunter davantage.", 409);
            return;
        }

        try {
            $livreModel->decrementerDisponibles($idLivre);
        } catch (Exception $e) {
            // Un autre emprunt a pris le dernier exemplaire entre-temps
            Response::error($e->getMessage(), 409);
            return;
        }

        $emprunt = $empruntModel->create($idMembre, $idLivre);

        Response::success($emprunt, 'Emprunt créé avec succès.', 201);
    }

    public static function prolonger(int $idEmprunt, array $membreConnecte): void
    {
        $empruntModel = new Emprunt();

        $emprunt = $empruntModel->findById($idEmprunt);
        if (!$emprunt) {
            Response::error('Emprunt introuvable.', 404);
            return;
        }

        if ((int) $emprunt['id_membre'] !== $membreConnecte['id_membre']) {
            Response::error('Cet emprunt ne vous appartient pas.', 403);
            return;
        }

        $statut = (int) $emprunt['id_statut'];

        if ($statut === Emprunt::STATUT_RENDU) {
            Response::error('Cet emprunt a déjà été rendu.', 409);
            return;
        }

        if ($statut === Emprunt::STATUT_EN_RETARD) {
            Response::error('Impossible de prolonger un emprunt en retard.', 409);
            return;
        }

        if ((int) $emprunt['nb_prolongations'] >= Emprunt::MAX_PROLONGATIONS) {
            Response::error('Nombre maximum de prolongations atteint.', 409);
            return;
        }

        $empruntMisAJour = $empruntModel->prolonger($idEmprunt);

        Response::success($empruntMisAJour, 'Emprunt prolongé avec succès.');
    }
}