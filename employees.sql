-- Create the employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(50),
    department VARCHAR(50),
    hire_date DATE,
    salary DECIMAL(10, 2),
    org_id INT,
    status ENUM('active', 'invited', 'on_leave', 'terminated') DEFAULT 'invited',
    invite_token VARCHAR(255),
    invite_expiry DATETIME,
    activated_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Add organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Query to add a new employee
-- Example query that can be used in the application
-- INSERT INTO employees (name, email, position, department, phone, org_id)
-- VALUES (?, ?, ?, ?, ?, ?);

-- Add dummy data for organizations
INSERT INTO organizations (name, email)
VALUES 
('Acme Corporation', 'admin@acme.com'),
('TechSolutions Inc.', 'admin@techsolutions.com');

-- Add dummy data for employees
INSERT INTO employees (name, email, phone, position, department, hire_date, salary, org_id, status)
VALUES 
('John Doe', 'john.doe@example.com', '555-123-4567', 'Software Engineer', 'Engineering', '2022-01-15', 75000.00, 1, 'active'),
('Jane Smith', 'jane.smith@example.com', '555-987-6543', 'Project Manager', 'Product', '2021-05-22', 85000.00, 1, 'active'),
('Michael Johnson', 'michael.j@example.com', '555-456-7890', 'UX Designer', 'Design', '2022-03-10', 70000.00, 2, 'active'),
('Emily Williams', 'emily.w@example.com', '555-789-0123', 'Data Analyst', 'Analytics', '2021-11-05', 72000.00, 2, 'on_leave'),
('Robert Brown', 'robert.b@example.com', '555-234-5678', 'DevOps Engineer', 'Engineering', '2022-02-28', 80000.00, 1, 'active'),
('Sarah Davis', 'sarah.d@example.com', '555-345-6789', 'HR Specialist', 'Human Resources', '2021-08-14', 65000.00, 1, 'active'),
('David Miller', 'david.m@example.com', '555-456-7890', 'Marketing Specialist', 'Marketing', '2022-04-05', 68000.00, 2, 'active');

-- Add example of an invited employee (not yet active)
INSERT INTO employees (name, email, phone, position, department, org_id, status, invite_token, invite_expiry)
VALUES
('Lisa Wilson', 'lisa.w@example.com', '555-567-8901', 'Software Engineer', 'Engineering', 1, 'invited', 'sample_token_123456', DATE_ADD(NOW(), INTERVAL 7 DAY)),
('James Taylor', 'james.t@example.com', '555-678-9012', 'Financial Analyst', 'Finance', 2, 'invited', 'sample_token_789012', DATE_ADD(NOW(), INTERVAL 7 DAY));

-- Query to get all employees by organization
-- SELECT * FROM employees WHERE org_id = ?;

-- Query to get employees by status
-- SELECT * FROM employees WHERE status = ?;

-- Query to update employee information
-- UPDATE employees SET 
--     name = ?,
--     email = ?,
--     phone = ?,
--     position = ?,
--     department = ?,
--     status = ?
-- WHERE id = ?;

-- Query to verify an invite token
-- SELECT id, name, email, invite_expiry FROM employees WHERE invite_token = ? AND status = 'invited';

-- Query to accept an invitation
-- UPDATE employees 
-- SET status = 'active', 
--     password = ?, 
--     invite_token = NULL, 
--     invite_expiry = NULL,
--     activated_at = NOW()
-- WHERE id = ?;

-- Query to search employees by name
-- SELECT * FROM employees WHERE name LIKE CONCAT('%', ?, '%');

-- Query to get employee count by department
-- SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department;

-- Query to get employees by organization and department
-- SELECT * FROM employees WHERE org_id = ? AND department = ?; 