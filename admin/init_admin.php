<?php
/**
 * 최초 관리자 계정 생성 스크립트
 * 사용 후 반드시 삭제하세요!
 * 브라우저에서 한 번 실행: https://도메인/admin/init_admin.php
 */
require_once __DIR__ . '/config/db.php';

$username = 'admin';
$password = 'admin1234';   // ← 원하는 비밀번호로 변경
$name     = '최고관리자';

$pdo  = getDB();
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare('INSERT INTO admins (username, password, name) VALUES (?, ?, ?)');
    $stmt->execute([$username, $hash, $name]);
    echo "✅ 관리자 계정이 생성되었습니다.<br>";
    echo "아이디: {$username}<br>";
    echo "비밀번호: {$password}<br><br>";
    echo "<strong style='color:red'>보안을 위해 이 파일을 즉시 삭제하세요!</strong>";
} catch (PDOException $e) {
    echo "❌ 오류: " . $e->getMessage();
}
