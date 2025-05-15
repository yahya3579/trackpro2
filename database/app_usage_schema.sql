-- Database Schema for Activity Tracking

-- app_usage Table
CREATE TABLE IF NOT EXISTS app_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  application_name VARCHAR(255) NOT NULL,
  window_title TEXT,
  url TEXT,
  category VARCHAR(50) DEFAULT 'other',
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_seconds INT DEFAULT 0,
  date DATE NOT NULL,
  productive TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes for app_usage Table
CREATE INDEX idx_app_usage_employee ON app_usage(employee_id);
CREATE INDEX idx_app_usage_date ON app_usage(date);
CREATE INDEX idx_app_usage_category ON app_usage(category);
CREATE INDEX idx_app_usage_application ON app_usage(application_name); 