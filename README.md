# CoreInventory

Welcome to **CoreInventory**, a comprehensive and robust inventory management system built to streamline supply chain operations, warehouse management, and stock tracking. 

## 🚀 Overview

CoreInventory is a full-stack web application designed to handle the complexities of modern inventory management. It provides intuitive interfaces for administrators and staff to manage products, track stock movements, handle suppliers, process deliveries, and generate insightful reports.

### Key Features

- **Authentication & Authorization**: Secure login system with role-based access control.
- **Dashboard & Analytics**: Real-time overview of critical inventory metrics and activities using Recharts.
- **Product & Category Management**: Seamlessly categorize and manage product catalogs.
- **Stock Tracking**: Monitor stock levels, handle adjustments, and manage transfers across multiple locations and warehouses.
- **Supplier & Procurement**: Manage supplier information, process receipts, and maintain a ledger.
- **Deliveries**: Streamline outbound order fulfillment and delivery tracking.
- **Reporting**: Generate detailed transaction, stock, and ledger reports for better decision-making.

## 🛠️ Technology Stack

### Frontend
- **React 18** & **Vite**: For a fast, responsive, and modern user interface.
- **Tailwind CSS**: Utility-first framework for rapid and customizable styling.
- **React Router v6**: For dynamic client-side routing.
- **Axios**: Handling API requests efficiently.
- **Recharts**: For interactive and dynamic data visualization (dashboards).

### Backend
- **Node.js** & **Express**: Scalable and fast server-side framework.
- **Prisma ORM**: Type-safe database interactions and schema management.
- **PostgreSQL**: Robust relational database (provisioned via Neon DB/local).
- **JWT (JSON Web Tokens)** & **Bcrypt**: For secure user authentication and password hashing.
- **Nodemailer**: For email services (e.g., password resets via Brevo SMTP).

## 📁 Project Structure

```text
CoreInventory/
├── backend/                  # Express.js REST API
│   ├── prisma/               # Prisma schema and migrations
│   ├── src/
│   │   ├── controllers/      # Business logic (Auth, Products, Stock, etc.)
│   │   ├── middlewares/      # Express middlewares (Auth guards, error handling)
│   │   ├── routes/           # API Endpoint definitions
│   │   ├── utils/            # Helper functions and utilities
│   │   └── server.js         # Entry point for the backend server
│   ├── .env                  # Environment variables (DB connection, JWT secrets, SMTP)
│   └── package.json          # Backend dependencies
│
└── frontend/                 # React UI
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── context/          # React Context providers (Auth, Theme)
    │   ├── layouts/          # Page layouts (Sidebar, Header)
    │   ├── pages/            # Application views (Dashboard, Products, etc.)
    │   ├── routes/           # Application routing configurations
    │   ├── services/         # API integration services (Axios instances)
    │   ├── App.jsx           # Root application component
    │   └── main.jsx          # Entry point for the frontend application
    ├── tailwind.config.js    # Tailwind typography and theme configurations
    ├── vite.config.js        # Vite bundler configuration
    └── package.json          # Frontend dependencies
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- Git

### 1. Clone & Install Dependencies

Open your terminal and navigate to the project root directory.

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Configuration

You will need an `.env` file in your `backend/` directory. Create one and populate it with the appropriate values:

```env
# Database configuration
DATABASE_URL="postgresql://user:password@host/dbname?schema=public"

# Authentication
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN="1d"

# Email Configuration (e.g., Brevo SMTP)
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-password"
```

### 3. Database Setup

Navigate to the `backend` directory and run the Prisma migrations to set up your database schema:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed # (Optional) If a seed script is configured to populate initial data
```

### 4. Running the Application

To run the application locally, you will need two terminal tabs/windows.

**Start the Backend Server:**
```bash
cd backend
npm run dev
```

**Start the Frontend App:**
```bash
cd frontend
npm run dev
```

The frontend will start typically on `http://localhost:5173` and the backend on `http://localhost:5000` (depending on your port configuration).

## 🚀 Deployment Guide

### 1. Deploying the Backend on Render
You can deploy your Express backend using Render's Web Services:
1. Push your repository to GitHub.
2. Log into [Render](https://render.com/) and create a new **Web Service**.
3. Point it to your GitHub repository and configure the following settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment Variables:** Add all the variables from your `backend/.env` (like `DATABASE_URL`, `JWT_SECRET`, etc.) directly into the Render Dashboard's Environment tab.
5. Click **Deploy**. Render will install dependencies and start your Node.js server. 
*(Note your newly generated Render URL, e.g., `https://coreinventory-backend.onrender.com`)*.

### 2. Deploying the Frontend on Vercel
Deploy your Vite frontend seamlessly with Vercel:

**Option A: Using the CLI**
1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Navigate to your frontend directory and run:
   ```bash
   cd frontend
   vercel
   ```
3. Follow the CLI wizard:
   - *Set up and deploy?* **Y**
   - *Scope?* **Select your account**
   - *Link to existing project?* **N**
   - *Project name?* **coreinventory-frontend**
   - *Directory?* **./**
   - *Auto-detect Framework (Vite)?* **Yes**
4. Set your production API URL! During deployment, set an environment variable pointing to your backend Render URL (e.g., `VITE_API_BASE_URL="https://your-backend.onrender.com"`).
5. For a production deploy, run:
   ```bash
   vercel --prod
   ```

**Option B: Using the Vercel Dashboard**
1. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Ensure the framework preset is detected as **Vite**.
5. Add your Environment Variables (like your backend Render URL).
6. Click **Deploy**.

## 🧑‍💻 Development Best Practices

- **Commits:** Write clear and descriptive commit messages summarizing the changes.
- **Branching:** Use feature branches for new developments or bug fixes before merging.
- **Environment Variables:** Never commit `.env` files to source control. They are ignored by default via `.gitignore`.
- **Formatting:** Adhere to standard linting configurations defined in the respective directories.

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this repository is strictly prohibited.
