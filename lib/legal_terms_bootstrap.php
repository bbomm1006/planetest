<?php
/**
 * 프론트(lib/_ft.php, legal_terms_view.php) — admin 쪽 단일 정의 로드
 */
$_legal_boot = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'legal_terms_bootstrap.php';
if (is_readable($_legal_boot)) {
    require_once $_legal_boot;
}
