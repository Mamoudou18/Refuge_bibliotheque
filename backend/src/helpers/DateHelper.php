<?php

class DateHelper
{
    /**
     * Convertit une date jj/mm/aaaa vers le format SQL Y-m-d
     * Retourne null si la date est vide ou invalide
     */
    public static function toSqlDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }
        $d = DateTime::createFromFormat('d/m/Y', $date);
        if (!$d) {
            return null;
        }
        return $d->format('Y-m-d');
    }
}