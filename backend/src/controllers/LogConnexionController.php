<?php

class LogConnexionController
{
    /**
     * GET /admin/logs-connexion
     */
    public static function index(array $query): void
    {
        $idMembre = $query['id_membre'] ?? null;
        $limite = isset($query['limite']) && is_numeric($query['limite'])
            ? (int) $query['limite']
            : 50;

        $logModel = new LogConnexion();

        if ($idMembre !== null) {
            if (!is_numeric($idMembre)) {
                Response::error('id_membre doit être numérique.', 400);
                return;
            }

            $membreModel = new Membre();
            $membre = $membreModel->findById((int) $idMembre);
            if (!$membre) {
                Response::error('Membre introuvable.', 404);
                return;
            }

            $logs = $logModel->getHistoriqueParMembre((int) $idMembre, $limite);
        } else {
            $logs = $logModel->getConnexionsRecentes($limite);
        }

        Response::success($logs);
    }
}