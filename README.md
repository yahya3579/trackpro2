# TrackPro - Employee Monitoring and Management System

TrackPro is a comprehensive employee monitoring and management system built with Next.js, React, and MySQL. It provides organizations with tools to track employee activity, manage time, and boost productivity.

## Features

- **User Authentication** - Secure login and registration system
- **Dashboard Overview** - Visual representation of employee activities and statistics
- **Employee Management**
  - Invite employees via email
  - Track employee information and status
  - Manage employee permissions and roles
- **Activity Monitoring** - Track applications usage, website visits, and productivity
- **Time Tracking** - Record working hours, breaks, and attendance
- **Screenshots & Timelapse** - Capture screen activity for accountability
- **Reporting System** - Generate detailed reports on employee performance

## Employee Invitation System

TrackPro includes a comprehensive employee invitation system:

1. **Sending Invitations**
   - Admins can invite employees via the dedicated invitation page
   - Required information includes name, email, and optional details like position and department
   - System generates a secure invitation token valid for 7 days

2. **Email Notifications**
   - Employees receive personalized invitation emails
   - Emails include a secure link to accept the invitation
   - Organization branding is included in the email

3. **Accepting Invitations**
   - Employees click on the link in their email
   - They land on a dedicated acceptance page
   - Once accepted, their status changes from "Invited" to "Active"

4. **Management**
   - Admins can track invitation status in the employees dashboard
   - Invitations can be resent if needed
   - Expired invitations can be managed through the employee detail page

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/trackpro.git
   cd trackpro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Configure database connection and other settings

4. Set up the database:
   ```
   npm run db:setup
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [MySQL](https://mysql.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Aceternity UI](https://ui.aceternity.com/) - Modern UI components

## License

This project is licensed under the MIT License - see the LICENSE file for details.



// pcusonxw Temp password for super-admin login