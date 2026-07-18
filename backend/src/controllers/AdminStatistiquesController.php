<?php

class AdminStatistiquesController
{
    public static function index(): void
    {
        $db = Database::getConnection();
        $statistiques = new Statistiques($db);
        $stats = $statistiques->getToutesLesStats();

        Response::success($stats);
    }
}