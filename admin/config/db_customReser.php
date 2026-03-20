<?php
/**
 * 예약 모듈 PDO — db.php 와 동일 호스트·계정·DB(DB_NAME) 사용.
 * 테이블은 customReser_* 접두사로 메인 테이블과 구분합니다.
 * (가비아 등 공유 호스팅은 새 DB 생성·권한이 없어 별도 DB customReser 를 쓰지 않습니다.)
 */
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function getCustomReserDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // JSON 컬럼 조회 시 native prepare + 일부 서버(mysqlnd/MariaDB)에서 SQLSTATE 2036 나는 경우 방지
            PDO::ATTR_EMULATE_PREPARES   => true,
        ]);
    }
    return $pdo;
}
