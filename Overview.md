# E-Commerce Platform

This project is a full-stack e-commerce application designed to allow customers to browse products, add them to a cart and wishlist, and place orders. Sellers can manage their products, view sales data, and track orders.

## Overview

The application is composed of two main components:

- **Backend:** A Node.js/Express application responsible for the API, business logic, and database interactions. (Likely uses MongoDB as the database).
- **Frontend:** A Next.js/React application providing the user interface for customers and sellers.

The entire application is containerized using Docker for ease of setup and deployment.

## Backend

The backend is built with Node.js and Express. It serves as the API for the frontend, handles all business logic, manages user authentication, and interacts with the database (presumed to be MongoDB).

Key responsibilities include:

- User registration and login
- Product management (creating, updating, deleting, listing products by sellers)
- Shopping cart and wishlist functionalities
- Order processing and management
- Dashboard data aggregation for both customers and sellers

For detailed API documentation, please refer to the [Backend README](./backend/README.md).

## Frontend

The frontend is a Next.js (React) application that provides a dynamic and responsive user interface for both customers and sellers.

Key features include:

- User-friendly interface for browsing products, managing cart and wishlist.
- Customer dashboard for viewing order history, managing addresses, and tracking active orders.
- Seller dashboard for product management, order fulfillment, and viewing sales analytics.
- Secure registration and login forms.
- Checkout process.

The frontend interacts with the backend via RESTful API calls to fetch and display data, as well as to perform user actions.

## Running the Application

The application is designed to be run using Docker and Docker Compose.

### Prerequisites

- Docker: Make sure you have Docker installed on your system.
- Docker Compose: Make sure you have Docker Compose installed.

### Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Environment Variables (Backend):**
    The backend service requires environment variables to be set. There is an existing `.env` file at `backend/.env`. You may need to review and adjust this file, or create it if it's not included in the clone (e.g., if it's in `.gitignore`). Common variables include:

    - `MONGO_URI`: MongoDB connection string.
    - `JWT_SECRET`: Secret key for JWT token generation.
    - `PORT`: Port for the backend server (e.g., 5000).

    Ensure the `backend/.env` file is correctly configured before starting the application.

3.  **Environment Variables (Frontend):**
    The frontend may also require environment variables, typically for connecting to the backend API. These would usually be prefixed with `NEXT_PUBLIC_`. For example:

    - `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (if your backend runs on port 5000)
    - `NEXT_PUBLIC_BACKEND_BASE_URL=http://127.0.0.1:5000`

    These might be set directly in the `docker-compose.yml` or require a `.env.local` file in the `frontend` directory. Check the `frontend/Dockerfile` and `docker-compose.yml` for specifics.

### Starting the Application

Once the environment variables are configured, you can start the application using Docker Compose:

```bash
docker compose up -d
```

This command will build the images (if not already built) and start the frontend and backend services in detached mode.

- The frontend should typically be accessible at `http://localhost:3000` (or the port specified in `docker-compose.yml`).
- The backend API will be running on its configured port (e.g., `http://localhost:5000`).

### Stopping the Application

To stop the application:

```bash
docker compose down
```
