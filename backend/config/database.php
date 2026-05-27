<?php

require_once __DIR__ . '/env.php';

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $dsn = sprintf(
                'pgsql:host=%s;port=%s;dbname=%s',
                envValue('DB_HOST', 'localhost'),
                envValue('DB_PORT', '5432'),
                envValue('DB_DATABASE', '')
            );

            self::$instance = new PDO($dsn, envValue('DB_USERNAME', ''), envValue('DB_PASSWORD', ''), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }

        return self::$instance;
    }
}