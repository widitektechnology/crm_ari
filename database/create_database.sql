-- =====================================================
-- CRM ARI - Database Schema Creation Script
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS crm_ari CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_ari;

-- =====================================================
-- 1. SISTEMA DE AUTENTICACIÓN Y USUARIOS
-- =====================================================

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Tabla de roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de relación usuarios-roles
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de sesiones de usuario
CREATE TABLE user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 2. GESTIÓN DE EMPRESAS
-- =====================================================

-- Tabla de empresas/compañías
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200),
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    
    -- Información de contacto
    email VARCHAR(100),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),
    
    -- Dirección
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'España',
    
    -- Información financiera
    annual_revenue DECIMAL(15,2),
    employee_count INT,
    
    -- Metadatos
    status ENUM('active', 'inactive', 'prospect', 'client') DEFAULT 'prospect',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    source VARCHAR(100), -- De dónde viene el lead
    assigned_to INT, -- Usuario asignado
    
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_by (created_by),
    FULLTEXT(name, legal_name, description)
);

-- =====================================================
-- 3. GESTIÓN DE EMPLEADOS
-- =====================================================

-- Tabla de empleados
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    
    -- Información personal
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
    email VARCHAR(100),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    
    -- Información profesional
    job_title VARCHAR(100),
    department VARCHAR(100),
    employee_id VARCHAR(50), -- ID interno de la empresa
    hire_date DATE,
    salary DECIMAL(10,2),
    
    -- Dirección personal
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'España',
    
    -- Información adicional
    birth_date DATE,
    avatar_url VARCHAR(255),
    notes TEXT,
    
    -- Estado
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    
    -- Metadatos
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_company_id (company_id),
    INDEX idx_email (email),
    INDEX idx_full_name (full_name),
    INDEX idx_status (status),
    FULLTEXT(first_name, last_name, job_title, department)
);

-- =====================================================
-- 4. SISTEMA DE CORREO ELECTRÓNICO
-- =====================================================

-- Tabla de cuentas de correo
CREATE TABLE mail_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- Usuario propietario de la cuenta
    
    -- Información básica
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    provider VARCHAR(50) DEFAULT 'imap',
    
    -- Configuración del servidor entrante (IMAP)
    imap_server VARCHAR(200) NOT NULL,
    imap_port INT NOT NULL DEFAULT 993,
    imap_ssl BOOLEAN DEFAULT TRUE,
    imap_username VARCHAR(200) NOT NULL,
    imap_password VARCHAR(500) NOT NULL, -- Encriptado
    
    -- Configuración del servidor saliente (SMTP)
    smtp_server VARCHAR(200) NOT NULL,
    smtp_port INT NOT NULL DEFAULT 587,
    smtp_ssl BOOLEAN DEFAULT TRUE,
    smtp_username VARCHAR(200) NOT NULL,
    smtp_password VARCHAR(500) NOT NULL, -- Encriptado
    
    -- Estado y configuración
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    auto_sync BOOLEAN DEFAULT TRUE,
    sync_interval INT DEFAULT 15, -- minutos
    
    -- Estadísticas
    last_sync DATETIME NULL,
    unread_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_default (is_default)
);

-- Tabla de carpetas de correo
CREATE TABLE mail_folders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    
    -- Información de la carpeta
    name VARCHAR(200) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    type ENUM('inbox', 'sent', 'drafts', 'trash', 'spam', 'custom', 'archive') DEFAULT 'custom',
    path VARCHAR(500) NOT NULL, -- Ruta completa en el servidor
    parent_id INT NULL, -- Para carpetas anidadas
    
    -- Atributos IMAP
    attributes JSON, -- \\Drafts, \\Sent, etc.
    
    -- Configuración
    color VARCHAR(7), -- Color hex
    icon VARCHAR(50),
    is_selectable BOOLEAN DEFAULT TRUE,
    auto_expunge BOOLEAN DEFAULT FALSE,
    
    -- Estadísticas
    unread_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES mail_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES mail_folders(id) ON DELETE SET NULL,
    
    INDEX idx_account_id (account_id),
    INDEX idx_type (type),
    INDEX idx_parent_id (parent_id),
    UNIQUE KEY unique_account_path (account_id, path)
);

-- Tabla de mensajes de correo
CREATE TABLE mail_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    folder_id INT NOT NULL,
    
    -- Identificadores únicos
    message_id VARCHAR(500) NOT NULL, -- Message-ID del header
    uid VARCHAR(100), -- UID del servidor IMAP
    thread_id VARCHAR(100), -- Para agrupar conversaciones
    
    -- Headers principales
    subject TEXT,
    from_name VARCHAR(200),
    from_email VARCHAR(200) NOT NULL,
    to_addresses JSON, -- Array de {name, email}
    cc_addresses JSON,
    bcc_addresses JSON,
    reply_to_email VARCHAR(200),
    
    -- Contenido
    body_text LONGTEXT,
    body_html LONGTEXT,
    snippet TEXT, -- Preview del contenido
    
    -- Estados y flags
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Metadatos del mensaje
    size_bytes INT DEFAULT 0,
    has_attachments BOOLEAN DEFAULT FALSE,
    labels JSON, -- Array de labels/etiquetas
    
    -- Referencias para hilos de conversación
    in_reply_to VARCHAR(500),
    references TEXT, -- Message-IDs de referencia
    
    -- Fechas
    sent_at DATETIME,
    received_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES mail_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES mail_folders(id) ON DELETE CASCADE,
    
    INDEX idx_account_id (account_id),
    INDEX idx_folder_id (folder_id),
    INDEX idx_message_id (message_id),
    INDEX idx_thread_id (thread_id),
    INDEX idx_from_email (from_email),
    INDEX idx_is_read (is_read),
    INDEX idx_is_starred (is_starred),
    INDEX idx_received_at (received_at),
    INDEX idx_sent_at (sent_at),
    FULLTEXT(subject, body_text, from_name, from_email)
);

-- Tabla de archivos adjuntos
CREATE TABLE mail_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    
    -- Información del archivo
    filename VARCHAR(500) NOT NULL,
    content_type VARCHAR(200),
    content_id VARCHAR(200), -- Para imágenes inline
    size_bytes INT DEFAULT 0,
    
    -- Almacenamiento
    file_path VARCHAR(1000), -- Ruta en el sistema de archivos
    is_inline BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES mail_messages(id) ON DELETE CASCADE,
    
    INDEX idx_message_id (message_id),
    INDEX idx_filename (filename),
    INDEX idx_content_type (content_type)
);

-- =====================================================
-- 5. SISTEMA DE ACTIVIDADES Y SEGUIMIENTO
-- =====================================================

-- Tabla de actividades (llamadas, reuniones, emails, etc.)
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Relaciones
    company_id INT,
    employee_id INT,
    user_id INT NOT NULL, -- Usuario que registra la actividad
    
    -- Información básica
    type ENUM('call', 'meeting', 'email', 'task', 'note', 'follow_up') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Estado y prioridad
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    
    -- Fechas y tiempo
    scheduled_at DATETIME,
    due_date DATETIME,
    completed_at DATETIME,
    duration_minutes INT,
    
    -- Ubicación (para reuniones)
    location VARCHAR(200),
    
    -- Resultado
    outcome TEXT,
    next_action TEXT,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_company_id (company_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_due_date (due_date)
);

-- =====================================================
-- 6. SISTEMA DE NOTAS Y DOCUMENTOS
-- =====================================================

-- Tabla de notas
CREATE TABLE notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Relaciones
    company_id INT,
    employee_id INT,
    user_id INT NOT NULL,
    
    -- Contenido
    title VARCHAR(200),
    content LONGTEXT NOT NULL,
    content_type ENUM('text', 'markdown', 'html') DEFAULT 'text',
    
    -- Categorización
    category VARCHAR(100),
    tags JSON, -- Array de tags
    
    -- Privacidad
    is_private BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_company_id (company_id),
    INDEX idx_employee_id (employee_id),
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    FULLTEXT(title, content)
);

-- =====================================================
-- 7. SISTEMA DE CONFIGURACIÓN
-- =====================================================

-- Tabla de configuración del sistema
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value JSON,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Si es visible para todos los usuarios
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_category_key (category, key_name),
    INDEX idx_category (category),
    INDEX idx_public (is_public)
);

-- Tabla de configuración de usuario
CREATE TABLE user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category_key (user_id, category, key_name),
    INDEX idx_user_category (user_id, category)
);

-- =====================================================
-- 8. LOGS Y AUDITORÍA
-- =====================================================

-- Tabla de logs de auditoría
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    
    -- Información de la acción
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- users, companies, employees, etc.
    entity_id INT,
    
    -- Detalles del cambio
    old_values JSON,
    new_values JSON,
    
    -- Contexto
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 9. DATOS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador del sistema', '["*"]'),
('manager', 'Gerente con acceso completo', '["companies.*", "employees.*", "activities.*", "notes.*", "mail.read"]'),
('user', 'Usuario estándar', '["companies.read", "employees.read", "activities.*", "notes.*", "mail.*"]'),
('readonly', 'Solo lectura', '["companies.read", "employees.read", "activities.read", "notes.read"]');

-- Usuario administrador por defecto
INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin, is_superuser) VALUES
('admin', 'admin@crm.arifamilyassets.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsGD.jzQe', 'Administrador', 'Sistema', TRUE, TRUE);

-- Asignar rol admin al usuario admin
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1);

-- Configuraciones del sistema por defecto
INSERT INTO system_settings (category, key_name, value, description, is_public) VALUES
('general', 'company_name', '"CRM ARI Family Assets"', 'Nombre de la empresa', TRUE),
('general', 'timezone', '"Europe/Madrid"', 'Zona horaria del sistema', TRUE),
('general', 'language', '"es"', 'Idioma por defecto', TRUE),
('mail', 'sync_interval', '15', 'Intervalo de sincronización de correo en minutos', FALSE),
('mail', 'max_attachment_size', '25', 'Tamaño máximo de archivos adjuntos en MB', TRUE),
('security', 'session_timeout', '480', 'Tiempo de sesión en minutos', FALSE),
('security', 'password_min_length', '8', 'Longitud mínima de contraseña', TRUE);

-- =====================================================
-- 10. TRIGGERS Y PROCEDIMIENTOS
-- =====================================================

-- Trigger para actualizar el contador de no leídos en cuentas de correo
DELIMITER //
CREATE TRIGGER update_account_unread_count 
AFTER UPDATE ON mail_messages
FOR EACH ROW
BEGIN
    IF OLD.is_read != NEW.is_read THEN
        UPDATE mail_accounts 
        SET unread_count = (
            SELECT COUNT(*) 
            FROM mail_messages 
            WHERE account_id = NEW.account_id AND is_read = FALSE AND is_deleted = FALSE
        )
        WHERE id = NEW.account_id;
    END IF;
END//

-- Trigger para actualizar el contador de mensajes en carpetas
CREATE TRIGGER update_folder_counts
AFTER INSERT ON mail_messages
FOR EACH ROW
BEGIN
    UPDATE mail_folders 
    SET 
        total_count = total_count + 1,
        unread_count = unread_count + IF(NEW.is_read = FALSE, 1, 0)
    WHERE id = NEW.folder_id;
END//

-- Trigger para log de auditoría en usuarios
CREATE TRIGGER audit_users_changes
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
            JSON_OBJECT('username', OLD.username, 'email', OLD.email, 'is_active', OLD.is_active),
            JSON_OBJECT('username', NEW.username, 'email', NEW.email, 'is_active', NEW.is_active));
END//

DELIMITER ;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Mostrar información sobre las tablas creadas
SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'crm_ari'
ORDER BY TABLE_NAME;

-- Mostrar estadísticas finales
SELECT 'Base de datos CRM ARI creada exitosamente' as Status;
SELECT COUNT(*) as 'Total de tablas' FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'crm_ari';