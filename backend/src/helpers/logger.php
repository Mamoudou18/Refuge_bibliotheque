<?php

class Logger {

    private static string $logFile = __DIR__ . '/../logs/app.log';

    /**
     * Écrit un message dans le fichier de log
     * @param string $niveau ex: INFO, ERROR, WARNING
     * @param string $message Le message à logger
     */
    private static function ecrire(string $niveau, string $message): void {
        $date = date('Y-m-d H:i:s');
        $ligne = "[$date] [$niveau] $message" . PHP_EOL;

        file_put_contents(self::$logFile, $ligne, FILE_APPEND);
    }

    public static function info(string $message): void {
        self::ecrire('INFO', $message);
    }

    public static function warning(string $message): void {
        self::ecrire('WARNING', $message);
    }

    public static function error(string $message): void {
        self::ecrire('ERROR', $message);
    }

}