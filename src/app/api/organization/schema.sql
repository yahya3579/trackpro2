-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  photo_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- If the photo_url column doesn't exist yet, add it
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'organizations' 
                AND COLUMN_NAME = 'photo_url'
                AND TABLE_SCHEMA = DATABASE());
SET @sqlstmt := IF(@exist = 0, 
                   'ALTER TABLE organizations ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL',
                   'SELECT "Column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add organization_id to employees table if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'employees' 
                AND COLUMN_NAME = 'organization_id'
                AND TABLE_SCHEMA = DATABASE());
SET @sqlstmt := IF(@exist = 0, 
                   'ALTER TABLE employees ADD COLUMN organization_id INT, ADD CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)',
                   'SELECT "Column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create password_reset_tokens table if not exists
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_type VARCHAR(50) NOT NULL, -- 'organization', 'super_admin', etc.
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create directory for profile images if it doesn't exist
-- Note: This is normally done at the application level, not in SQL
-- But we include it here for documentation purposes
-- The application needs to create '/public/images/' directory 