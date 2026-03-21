<?php
define('DB_HOST', '211.47.74.10'); //db.plane01.gabia.io
define('DB_USER', 'plane01');       // DB 계정으로 변경
define('DB_PASS', 'plane01!@#');           // DB 비밀번호로 변경
define('DB_NAME', 'dbplane01');    // DB명으로 변경
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset='.DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
    return $pdo;
}
