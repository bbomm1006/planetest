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
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_legal_ver_cat (category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $n = (int) $pdo->query('SELECT COUNT(*) FROM legal_term_categories')->fetchColumn();
        if ($n === 0) {
            $pdo->exec("INSERT INTO legal_term_categories (name, slug, sort_order, is_active) VALUES
          ('이용약관', 'terms', 1, 1),
          ('개인정보처리방침', 'privacy', 2, 1)");
        }
    }
}
