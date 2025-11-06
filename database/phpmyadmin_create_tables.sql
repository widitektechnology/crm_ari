-- =====================================================
-- SCRIPT SQL COMPLETO PARA PHPMYADMIN - CRM ARI
-- =====================================================
-- Base de datos: crm_ari
-- Ejecutar este script completo en phpMyAdmin > SQL
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. SISTEMA DE AUTENTICACIÓN Y USUARIOS
-- =====================================================

-- Tabla de usuarios del sistema
CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) UNIQUE NOT NULL,
  `email` varchar(100) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `avatar_url` varchar(255) NULL,
  `is_active` boolean DEFAULT TRUE,
  `is_admin` boolean DEFAULT FALSE,
  `is_superuser` boolean DEFAULT FALSE,
  `last_login` datetime NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de roles
CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(50) UNIQUE NOT NULL,
  `description` text,
  `permissions` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación usuarios-roles
CREATE TABLE `user_roles` (
  `user_id` int,
  `role_id` int,
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` int,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sesiones de usuario
CREATE TABLE `user_sessions` (
  `id` varchar(255) PRIMARY KEY,
  `user_id` int NOT NULL,
  `ip_address` varchar(45),
  `user_agent` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  `is_active` boolean DEFAULT TRUE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_expires` (`expires_at`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. GESTIÓN DE EMPRESAS
-- =====================================================

-- Tabla de empresas/compañías
CREATE TABLE `companies` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `legal_name` varchar(200),
  `tax_id` varchar(50),
  `industry` varchar(100),
  `website` varchar(255),
  `description` text,
  `logo_url` varchar(255),
  
  -- Información de contacto
  `email` varchar(100),
  `phone` varchar(50),
  `mobile` varchar(50),
  `fax` varchar(50),
  
  -- Dirección
  `address_line1` varchar(200),
  `address_line2` varchar(200),
  `city` varchar(100),
  `state` varchar(100),
  `postal_code` varchar(20),
  `country` varchar(100) DEFAULT 'España',
  
  -- Información financiera
  `annual_revenue` decimal(15,2),
  `employee_count` int,
  
  -- Metadatos
  `status` enum('active', 'inactive', 'prospect', 'client') DEFAULT 'prospect',
  `priority` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `source` varchar(100),
  `assigned_to` int,
  `created_by` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  
  INDEX `idx_name` (`name`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assigned_to` (`assigned_to`),
  INDEX `idx_created_by` (`created_by`),
  FULLTEXT(`name`, `legal_name`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. GESTIÓN DE EMPLEADOS
-- =====================================================

-- Tabla de empleados
CREATE TABLE `employees` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `company_id` int NOT NULL,
  
  -- Información personal
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `full_name` varchar(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
  `email` varchar(100),
  `phone` varchar(50),
  `mobile` varchar(50),
  
  -- Información profesional
  `job_title` varchar(100),
  `department` varchar(100),
  `employee_id` varchar(50),
  `hire_date` date,
  `salary` decimal(10,2),
  
  -- Dirección personal
  `address_line1` varchar(200),
  `address_line2` varchar(200),
  `city` varchar(100),
  `state` varchar(100),
  `postal_code` varchar(20),
  `country` varchar(100) DEFAULT 'España',
  
  -- Información adicional
  `birth_date` date,
  `avatar_url` varchar(255),
  `notes` text,
  
  -- Estado
  `status` enum('active', 'inactive', 'terminated') DEFAULT 'active',
  
  -- Metadatos
  `created_by` int,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_full_name` (`full_name`),
  INDEX `idx_status` (`status`),
  FULLTEXT(`first_name`, `last_name`, `job_title`, `department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. SISTEMA DE CORREO ELECTRÓNICO
-- =====================================================

-- Tabla de cuentas de correo
CREATE TABLE `mail_accounts` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  
  -- Información básica
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `provider` varchar(50) DEFAULT 'imap',
  
  -- Configuración del servidor entrante (IMAP)
  `imap_server` varchar(200) NOT NULL,
  `imap_port` int NOT NULL DEFAULT 993,
  `imap_ssl` boolean DEFAULT TRUE,
  `imap_username` varchar(200) NOT NULL,
  `imap_password` varchar(500) NOT NULL,
  
  -- Configuración del servidor saliente (SMTP)
  `smtp_server` varchar(200) NOT NULL,
  `smtp_port` int NOT NULL DEFAULT 587,
  `smtp_ssl` boolean DEFAULT TRUE,
  `smtp_username` varchar(200) NOT NULL,
  `smtp_password` varchar(500) NOT NULL,
  
  -- Estado y configuración
  `is_active` boolean DEFAULT TRUE,
  `is_default` boolean DEFAULT FALSE,
  `auto_sync` boolean DEFAULT TRUE,
  `sync_interval` int DEFAULT 15,
  
  -- Estadísticas
  `last_sync` datetime NULL,
  `unread_count` int DEFAULT 0,
  `total_count` int DEFAULT 0,
  
  -- Metadatos
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de carpetas de correo
CREATE TABLE `mail_folders` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `account_id` int NOT NULL,
  
  -- Información de la carpeta
  `name` varchar(200) NOT NULL,
  `display_name` varchar(200) NOT NULL,
  `type` enum('inbox', 'sent', 'drafts', 'trash', 'spam', 'custom', 'archive') DEFAULT 'custom',
  `path` varchar(500) NOT NULL,
  `parent_id` int NULL,
  
  -- Atributos IMAP
  `attributes` json,
  
  -- Configuración
  `color` varchar(7),
  `icon` varchar(50),
  `is_selectable` boolean DEFAULT TRUE,
  `auto_expunge` boolean DEFAULT FALSE,
  
  -- Estadísticas
  `unread_count` int DEFAULT 0,
  `total_count` int DEFAULT 0,
  
  -- Metadatos
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`account_id`) REFERENCES `mail_accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `mail_folders`(`id`) ON DELETE SET NULL,
  
  INDEX `idx_account_id` (`account_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_parent_id` (`parent_id`),
  UNIQUE KEY `unique_account_path` (`account_id`, `path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de mensajes de correo
CREATE TABLE `mail_messages` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `folder_id` int NOT NULL,
  
  -- Identificadores únicos
  `message_id` varchar(500) NOT NULL,
  `uid` varchar(100),
  `thread_id` varchar(100),
  
  -- Headers principales
  `subject` text,
  `from_name` varchar(200),
  `from_email` varchar(200) NOT NULL,
  `to_addresses` json,
  `cc_addresses` json,
  `bcc_addresses` json,
  `reply_to_email` varchar(200),
  
  -- Contenido
  `body_text` longtext,
  `body_html` longtext,
  `snippet` text,
  
  -- Estados y flags
  `is_read` boolean DEFAULT FALSE,
  `is_starred` boolean DEFAULT FALSE,
  `is_flagged` boolean DEFAULT FALSE,
  `is_important` boolean DEFAULT FALSE,
  `is_deleted` boolean DEFAULT FALSE,
  
  -- Metadatos del mensaje
  `size_bytes` int DEFAULT 0,
  `has_attachments` boolean DEFAULT FALSE,
  `labels` json,
  
  -- Referencias para hilos de conversación
  `in_reply_to` varchar(500),
  `references` text,
  
  -- Fechas
  `sent_at` datetime,
  `received_at` datetime NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`account_id`) REFERENCES `mail_accounts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`folder_id`) REFERENCES `mail_folders`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_account_id` (`account_id`),
  INDEX `idx_folder_id` (`folder_id`),
  INDEX `idx_message_id` (`message_id`),
  INDEX `idx_thread_id` (`thread_id`),
  INDEX `idx_from_email` (`from_email`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_is_starred` (`is_starred`),
  INDEX `idx_received_at` (`received_at`),
  INDEX `idx_sent_at` (`sent_at`),
  FULLTEXT(`subject`, `body_text`, `from_name`, `from_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de archivos adjuntos
CREATE TABLE `mail_attachments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `message_id` int NOT NULL,
  
  -- Información del archivo
  `filename` varchar(500) NOT NULL,
  `content_type` varchar(200),
  `content_id` varchar(200),
  `size_bytes` int DEFAULT 0,
  
  -- Almacenamiento
  `file_path` varchar(1000),
  `is_inline` boolean DEFAULT FALSE,
  
  -- Metadatos
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`message_id`) REFERENCES `mail_messages`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_message_id` (`message_id`),
  INDEX `idx_filename` (`filename`),
  INDEX `idx_content_type` (`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. SISTEMA DE ACTIVIDADES Y SEGUIMIENTO
-- =====================================================

-- Tabla de actividades (llamadas, reuniones, emails, etc.)
CREATE TABLE `activities` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  
  -- Relaciones
  `company_id` int,
  `employee_id` int,
  `user_id` int NOT NULL,
  
  -- Información básica
  `type` enum('call', 'meeting', 'email', 'task', 'note', 'follow_up') NOT NULL,
  `subject` varchar(200) NOT NULL,
  `description` text,
  
  -- Estado y prioridad
  `status` enum('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
  `priority` enum('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- Fechas y tiempo
  `scheduled_at` datetime,
  `due_date` datetime,
  `completed_at` datetime,
  `duration_minutes` int,
  
  -- Ubicación (para reuniones)
  `location` varchar(200),
  
  -- Resultado
  `outcome` text,
  `next_action` text,
  
  -- Metadatos
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_scheduled_at` (`scheduled_at`),
  INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. SISTEMA DE NOTAS Y DOCUMENTOS
-- =====================================================

-- Tabla de notas
CREATE TABLE `notes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  
  -- Relaciones
  `company_id` int,
  `employee_id` int,
  `user_id` int NOT NULL,
  
  -- Contenido
  `title` varchar(200),
  `content` longtext NOT NULL,
  `content_type` enum('text', 'markdown', 'html') DEFAULT 'text',
  
  -- Categorización
  `category` varchar(100),
  `tags` json,
  
  -- Privacidad
  `is_private` boolean DEFAULT FALSE,
  
  -- Metadatos
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_category` (`category`),
  FULLTEXT(`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. SISTEMA DE CONFIGURACIÓN
-- =====================================================

-- Tabla de configuración del sistema
CREATE TABLE `system_settings` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `value` json,
  `description` text,
  `is_public` boolean DEFAULT FALSE,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_category_key` (`category`, `key_name`),
  INDEX `idx_category` (`category`),
  INDEX `idx_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de configuración de usuario
CREATE TABLE `user_settings` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `value` json,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_category_key` (`user_id`, `category`, `key_name`),
  INDEX `idx_user_category` (`user_id`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. LOGS Y AUDITORÍA
-- =====================================================

-- Tabla de logs de auditoría
CREATE TABLE `audit_logs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int,
  
  -- Información de la acción
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` int,
  
  -- Detalles del cambio
  `old_values` json,
  `new_values` json,
  
  -- Contexto
  `ip_address` varchar(45),
  `user_agent` text,
  
  -- Timestamp
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. DATOS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO `roles` (`name`, `description`, `permissions`) VALUES
('admin', 'Administrador del sistema', JSON_ARRAY('*')),
('manager', 'Gerente con acceso completo', JSON_ARRAY('companies.*', 'employees.*', 'activities.*', 'notes.*', 'mail.read')),
('user', 'Usuario estándar', JSON_ARRAY('companies.read', 'employees.read', 'activities.*', 'notes.*', 'mail.*')),
('readonly', 'Solo lectura', JSON_ARRAY('companies.read', 'employees.read', 'activities.read', 'notes.read'));

-- Usuario administrador por defecto
-- NOTA: La contraseña está hasheada con bcrypt para 'admin123'
INSERT INTO `users` (`username`, `email`, `password_hash`, `first_name`, `last_name`, `is_admin`, `is_superuser`) VALUES
('admin', 'admin@crm.arifamilyassets.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsGD.jzQe', 'Administrador', 'Sistema', TRUE, TRUE);

-- Asignar rol admin al usuario admin
INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_by`) VALUES
(1, 1, 1);

-- Configuraciones del sistema por defecto
INSERT INTO `system_settings` (`category`, `key_name`, `value`, `description`, `is_public`) VALUES
('general', 'company_name', '"CRM ARI Family Assets"', 'Nombre de la empresa', TRUE),
('general', 'timezone', '"Europe/Madrid"', 'Zona horaria del sistema', TRUE),
('general', 'language', '"es"', 'Idioma por defecto', TRUE),
('mail', 'sync_interval', '15', 'Intervalo de sincronización de correo en minutos', FALSE),
('mail', 'max_attachment_size', '25', 'Tamaño máximo de archivos adjuntos en MB', TRUE),
('security', 'session_timeout', '480', 'Tiempo de sesión en minutos', FALSE),
('security', 'password_min_length', '8', 'Longitud mínima de contraseña', TRUE);

-- =====================================================
-- 10. TRIGGERS PARA CONTADORES AUTOMÁTICOS
-- =====================================================

DELIMITER //

-- Trigger para actualizar el contador de no leídos en cuentas de correo
CREATE TRIGGER `update_account_unread_count` 
AFTER UPDATE ON `mail_messages`
FOR EACH ROW
BEGIN
    IF OLD.is_read != NEW.is_read THEN
        UPDATE `mail_accounts` 
        SET `unread_count` = (
            SELECT COUNT(*) 
            FROM `mail_messages` 
            WHERE `account_id` = NEW.account_id AND `is_read` = FALSE AND `is_deleted` = FALSE
        )
        WHERE `id` = NEW.account_id;
    END IF;
END//

-- Trigger para actualizar el contador de mensajes en carpetas
CREATE TRIGGER `update_folder_counts`
AFTER INSERT ON `mail_messages`
FOR EACH ROW
BEGIN
    UPDATE `mail_folders` 
    SET 
        `total_count` = `total_count` + 1,
        `unread_count` = `unread_count` + IF(NEW.is_read = FALSE, 1, 0)
    WHERE `id` = NEW.folder_id;
END//

-- Trigger para log de auditoría en usuarios
CREATE TRIGGER `audit_users_changes`
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
            JSON_OBJECT('username', OLD.username, 'email', OLD.email, 'is_active', OLD.is_active),
            JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'is_active', NEW.is_active));
END//

DELIMITER ;

-- =====================================================
-- REACTIVAR FOREIGN KEY CHECKS
-- =====================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Mostrar información sobre las tablas creadas
SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Mostrar estadísticas finales
SELECT 'Base de datos CRM ARI creada exitosamente' as Status;
SELECT COUNT(*) as 'Total de tablas' FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE();