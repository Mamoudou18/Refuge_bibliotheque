<?php

use MongoDB\Client;
use MongoDB\Database as MongoDBDatabase;

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: 'db';
            $port = getenv('DB_PORT') ?: '5432';
            $dbname = getenv('DB_NAME') ?: 'refugeBibliotheque_db';
            $user = getenv('DB_USER') ?: 'postgres';
            $password = getenv('DB_PASSWORD') ?: 'postgres';

            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

            try {
                self::$instance = new PDO($dsn, $user, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur de connexion à la base de données']);
                exit;
            }
        }

        return self::$instance;
    }
}

class MongoConfig
{
    private static ?Client $client = null;
    private static ?MongoDBDatabase $db = null;

    public static function getDatabase(): MongoDBDatabase
    {
        if (self::$db === null) {
            $dbname = getenv('MONGO_DB') ?: 'refugeBibliotheque_db';
            $fullUri = getenv('MONGO_URI');

            try {
                if ($fullUri) {
                    // Utilise l'URI complète (Atlas, mongodb+srv://, etc.)
                    $uri = $fullUri;
                } else {
                    // Fallback : construction manuelle (dev local)
                    $host = getenv('MONGO_HOST') ?: 'mongo';
                    $port = getenv('MONGO_PORT') ?: '27017';
                    $user = getenv('MONGO_USER') ?: '';
                    $password = getenv('MONGO_PASSWORD') ?: '';

                    if ($user && $password) {
                        $uri = "mongodb://{$user}:{$password}@{$host}:{$port}/?authSource=admin";
                    } else {
                        $uri = "mongodb://{$host}:{$port}";
                    }
                }

                self::$client = new Client($uri);
                self::$db = self::$client->selectDatabase($dbname);
                self::$db->command(['ping' => 1]);

            } catch (\Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur de connexion à MongoDB: ' . $e->getMessage()]);
                exit;
            }
        }

        return self::$db;
    }
}