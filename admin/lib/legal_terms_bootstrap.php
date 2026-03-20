<?php
/**
 * 법적 약관 DB 테이블 (관리자 api / 프론트 공용)
 * PHP 5.6+ 호환 (void / ?? / 스칼라 타입 힌트 없음)
 */
if (!function_exists('legal_terms_ensure_tables')) {
    function legal_terms_ensure_tables($pdo)
    {
        $pdo->exec("CREATE TABLE IF NOT EXISTS legal_term_categories (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(100) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_legal_cat_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("CREATE TABLE IF NOT EXISTS legal_term_versions (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      category_id INT UNSIGNED NOT NULL,
      version_label VARCHAR(100) NOT NULL,
      body LONGTEXT NOT NULL,
      effective_date DATE DEFAULT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 0,
      is_visible TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_legal_ver_cat (category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        legal_terms_migrate_version_visible($pdo);

        $n = (int) $pdo->query('SELECT COUNT(*) FROM legal_term_categories')->fetchColumn();
        if ($n === 0) {
            $pdo->exec("INSERT INTO legal_term_categories (name, slug, sort_order, is_active) VALUES
          ('이용약관', 'terms', 1, 1),
          ('개인정보처리방침', 'privacy', 2, 1)");
        }
    }
}

if (!function_exists('legal_terms_migrate_version_visible')) {
    function legal_terms_migrate_version_visible($pdo)
    {
        try {
            $db = $pdo->query('SELECT DATABASE()')->fetchColumn();
            if ($db === null || $db === '') {
                return;
            }
            $st = $pdo->prepare(
                'SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?'
            );
            $st->execute(array($db, 'legal_term_versions', 'is_visible'));
            if ((int) $st->fetchColumn() === 0) {
                $pdo->exec(
                    'ALTER TABLE legal_term_versions ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1 AFTER is_active'
                );
            }
        } catch (Exception $e) {
            /* 마이그레이션 실패 시 무시 (권한/구버전 등) */
        }
    }
}
