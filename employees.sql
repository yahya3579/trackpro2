-- Create the employees table if it doesn't exist
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Query to add a new employee
-- Example query that can be used in the application
-- INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary)
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- Add dummy data
INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary, status)
VALUES 
('John', 'Doe', 'john.doe@example.com', '555-123-4567', 'Software Engineer', 'Engineering', '2022-01-15', 75000.00, 'active'),
('Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', 'Project Manager', 'Product', '2021-05-22', 85000.00, 'active'),
('Michael', 'Johnson', 'michael.j@example.com', '555-456-7890', 'UX Designer', 'Design', '2022-03-10', 70000.00, 'active'),
('Emily', 'Williams', 'emily.w@example.com', '555-789-0123', 'Data Analyst', 'Analytics', '2021-11-05', 72000.00, 'on_leave'),
('Robert', 'Brown', 'robert.b@example.com', '555-234-5678', 'DevOps Engineer', 'Engineering', '2022-02-28', 80000.00, 'active'),
('Sarah', 'Davis', 'sarah.d@example.com', '555-345-6789', 'HR Specialist', 'Human Resources', '2021-08-14', 65000.00, 'active'),
('David', 'Miller', 'david.m@example.com', '555-456-7890', 'Marketing Specialist', 'Marketing', '2022-04-05', 68000.00, 'active'),
('Lisa', 'Wilson', 'lisa.w@example.com', '555-567-8901', 'Software Engineer', 'Engineering', '2021-09-30', 78000.00, 'active'),
('James', 'Taylor', 'james.t@example.com', '555-678-9012', 'Financial Analyst', 'Finance', '2022-01-20', 76000.00, 'terminated'),
('Jennifer', 'Anderson', 'jennifer.a@example.com', '555-789-0123', 'Customer Support', 'Operations', '2021-12-10', 60000.00, 'active');

-- Query to get all employees
-- SELECT id, first_name, last_name, email, phone, position, department, hire_date, salary, status FROM employees;

-- Query to get employees by department
-- SELECT * FROM employees WHERE department = ?;

-- Query to get employees by status
-- SELECT * FROM employees WHERE status = ?;

-- Query to update employee information
-- UPDATE employees SET 
--     first_name = ?,
--     last_name = ?,
--     email = ?,
--     phone = ?,
--     position = ?,
--     department = ?,
--     salary = ?,
--     status = ?
-- WHERE id = ?;

-- Query to delete an employee
-- DELETE FROM employees WHERE id = ?;

-- Query to search employees by name
-- SELECT * FROM employees WHERE first_name LIKE CONCAT('%', ?, '%') OR last_name LIKE CONCAT('%', ?, '%');

-- Query to get employee count by department
-- SELECT department, COUNT(*) as employee_count FROM employees GROUP BY department;

-- Query to get average salary by department
-- SELECT department, AVG(salary) as average_salary FROM employees GROUP BY department;

-- Query to get employees hired after a specific date
-- SELECT * FROM employees WHERE hire_date > ?;

-- Query to get employees with salary in a specific range
-- SELECT * FROM employees WHERE salary BETWEEN ? AND ?; 