<?php

class HistoriqueEmpruntController
{
    /**
     * GET /admin/emprunts/{id}/historique
     */
    public static function indexAdmin(int $idEmprunt): void
    {
        $empruntModel = new Emprunt();
        $emprunt = $empruntModel->findById($idEmprunt);

        if (!$emprunt) {
            Response::error('Emprunt introuvable.', 404);
            return;
        }

        $historiqueModel = new HistoriqueEmprunt();
        $historique = $historiqueModel->getHistoriqueParEmprunt($idEmprunt);

        Response::success($historique);
    }

    /**
     * GET /emprunts/{id}/historique
     */
    public static function indexMembre(int $idEmprunt, array $membreConnecte): void
    {
        $idMembreConnecte = (int) $membreConnecte['id_membre'];

        $empruntModel = new Emprunt();
        $emprunt = $empruntModel->findById($idEmprunt);

        if (!$emprunt) {
            Response::error('Emprunt introuvable.', 404);
            return;
        }

        if ((int) $emprunt['id_membre'] !== $idMembreConnecte) {
            Response::error('Accès refusé : cet emprunt ne vous appartient pas.', 403);
            return;
        }

        $historiqueModel = new HistoriqueEmprunt();
        $historique = $historiqueModel->getHistoriqueParEmprunt($idEmprunt);

        Response::success($historique);
    }
}