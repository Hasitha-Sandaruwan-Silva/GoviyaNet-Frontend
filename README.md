# 🌾 GoviyaNet Frontend

**GoviyaNet** is a modern Farm-to-Table Direct Market Platform designed for Sri Lanka, enabling farmers, buyers, delivery riders, and administrators to connect through a unified digital marketplace.

Built with **React 18**, **Vite**, and **TypeScript**, the platform provides a scalable, responsive, and user-friendly experience while supporting role-based access, secure authentication, and real-time business operations.

---

## 🚀 Features

### 👨‍🌾 Farmer Portal

* Manage farm products
* Add, update, and remove listings
* Track orders and sales
* Monitor inventory availability
* View revenue and analytics

### 🛒 Buyer Portal

* Browse available farm products
* Search and filter products
* Place and track orders
* Manage shopping cart
* Secure user authentication

### 🚚 Rider Portal

* View assigned deliveries
* Update delivery status
* Manage delivery routes
* Track completed deliveries

### 👨‍💼 Admin Portal

* User management
* Product moderation
* Order monitoring
* Platform analytics
* System administration

---

## 🛠 Technology Stack

### Frontend Framework

* React 18
* Vite
* TypeScript (Strict Mode)

### UI & Styling

* Tailwind CSS v3
* shadcn/ui
* Radix UI
* Lucide React Icons
* Framer Motion

### State Management

* Zustand
* Zustand Persist Middleware

### Data Fetching

* TanStack Query v5
* Axios

### Forms & Validation

* React Hook Form
* Zod

### Routing

* React Router DOM v6

### Visualization & Notifications

* Recharts
* Sonner

---

## 📦 Installation

### Prerequisites

Make sure you have installed:

* Node.js (v18 or higher)
* npm (v9 or higher)

### Clone Repository

```bash
git clone https://github.com/your-username/goviyanet-frontend.git

cd goviyanet-frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file from the example configuration:

```bash
cp .env.example .env
```

Example configuration:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Run Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:5173
```

---

## 📁 Project Structure

```text
src/
├── api/                    # Axios client and API services
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shared/             # Shared reusable components
│   ├── layout/             # Layout components
│   ├── farmer/             # Farmer-specific components
│   ├── buyer/              # Buyer-specific components
│   ├── rider/              # Rider-specific components
│   └── admin/              # Admin-specific components
│
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, constants, helpers
├── pages/                  # Application pages
├── providers/              # Context providers
├── store/                  # Zustand stores
├── styles/                 # Global styling
├── types/                  # TypeScript types
└── assets/                 # Static resources
```

---

## 🔐 Authentication

The application implements:

* JWT Authentication
* Access Token Management
* Refresh Token Handling
* Protected Routes
* Role-Based Access Control (RBAC)
* Persistent Login Sessions

Supported Roles:

* FARMER
* BUYER
* RIDER
* ADMIN

---

## 📊 Development Roadmap

### ✅ Phase 1 – Project Foundation

* Vite + React + TypeScript setup
* Tailwind CSS configuration
* Path aliases
* Environment configuration

### ✅ Phase 2 – Core Architecture

* Type definitions
* API layer implementation
* Authentication store
* React Query integration
* Utility functions

### ✅ Phase 3 – Shared UI System

* Reusable components
* shadcn/ui integration
* Design system foundation

### 🚧 Phase 4 – Application Layout

* Navbar
* Sidebar
* Dashboard shell
* Protected routing

### 🚧 Phase 5 – Role Dashboards

* Farmer Dashboard
* Buyer Dashboard
* Rider Dashboard
* Admin Dashboard

### 🚧 Phase 6 – Marketplace Features

* Product management
* Order processing
* Delivery workflow
* Payment integration

### 🚧 Phase 7 – Analytics & Reporting

* Business insights
* Performance dashboards
* Reporting tools

---

## 📈 Architecture

```text
Frontend (React + Vite)
        │
        ▼
API Gateway
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
Auth  Farmer  Product
Service Service Service
        │
        ▼
 Order / Delivery Services
```

---

## 🧪 Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the application for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint checks.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

---

## 👨‍💻 Development Team

**GoviyaNet Project Team**

National Institute of Business Management (NIBM)
School of Computing & Engineering

---

## 📄 License

This project is developed for educational and academic purposes as part of a final year software engineering project.

© 2026 GoviyaNet. All Rights Reserved.
