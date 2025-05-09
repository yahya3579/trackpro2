# TrackPro Server

Backend server for TrackPro employee monitoring system.

## Setup Instructions

### Prerequisites

- Node.js (v14+ recommended)
- MySQL server (XAMPP, WAMP, or standalone MySQL)
- npm or yarn

### Database Setup

1. Start your MySQL server (through XAMPP or other means)
2. Create the database and tables by running the SQL script in `config/database.sql`
3. You can run the script through phpMyAdmin or using the MySQL command line

### Installation

1. Navigate to the server directory:
   ```
   cd my-app/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

4. The server will run on http://localhost:5000

## API Endpoints

### Authentication

- **POST /api/auth/signup**
  - Register a new organization
  - Body: `{ name, email, password }`

- **POST /api/auth/login**
  - Login to an organization account
  - Body: `{ email, password }`

## Database Schema

### Organizations Table

This table stores information about companies that register for TrackPro:

- `id`: Auto-incrementing primary key
- `name`: Company/organization name
- `email`: Email address (unique)
- `password`: Hashed password
- `subscription_status`: 'trial', 'active', or 'inactive'
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated

### Users Table

This table stores information about employees within organizations:

- `id`: Auto-incrementing primary key
- `organization_id`: Foreign key to organizations table
- `first_name`: User's first name
- `last_name`: User's last name
- `email`: Email address (unique)
- `password`: Hashed password
- `role`: 'admin', 'manager', or 'employee'
- `department`: User's department
- `position`: User's job position
- `is_active`: Boolean indicating if the user is active
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated

### Super Admins Table

This table stores information about TrackPro system administrators:

- `id`: Auto-incrementing primary key
- `username`: Admin username (unique)
- `email`: Email address (unique)
- `password`: Hashed password
- `name`: Admin's full name
- `created_at`: Timestamp when the record was created
- `updated_at`: Timestamp when the record was last updated 