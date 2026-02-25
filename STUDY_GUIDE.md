# E-Commerce Project: Comprehensive Code & Functionality Study Guide

This guide provides a structural and functional breakdown of the E-commerce platform (Jersey Store).

---

## 1. Project Architecture (MERN Stack)
The application follows a standard **MERN** (MongoDB, Express, React, Node.js) architecture:
- **Backend**: Node.js & Express server handling API requests, business logic, and MongoDB interactions via Mongoose.
- **Frontend**: React.js (Vite) handling the user interface, state, and routing.
- **Database**: MongoDB (Atlas) for persistent storage of Users, Products, and Orders.

---

## 2. Backend Breakdown (`/backend`)

### A. Models (`/models`)
- **User.js**: Defines user schema (name, email, password, role).
- **Product.js**: Stores jersey details (team, price, category, images, sizes, stock, sales price, expiry).
- **Order.js**: Records transactions (linking user, items, total, shipping address, payment status).

### B. Controllers (`/controllers`)
- **authController.js**: Handles user registration, login, and profile updates.
- **productController.js**: Manages product fetching (filters/search) and CRUD operations for admins.
- **orderController.js**: Processes order creation and retrieval.
- **cartController.js**: Synchronizes user cart between frontend and database.
- **admincontroller.js**: Specific logic for admin-level user/order management.

### C. Routes & Middleware (`/routes`, `/middleware`)
- **Routes**: Map URL endpoints (e.g., `/api/products`) to controller functions.
- **authmiddleware.js**: Verifies JWT tokens to protect private routes.
- **adminMiddleware.js**: Ensures only users with `role: 'admin'` can access sensitive endpoints.

---

## 3. Frontend Breakdown (`/frondend/src`)

### A. Core Routing (`App.jsx`)
- Defines all public routes (`/`, `/products`, `/cart`).
- Defines protected user routes (`/orders`, `/checkout`).
- Defines nested admin routes under `/admin` (Dashboard, Products, Users, Orders).

### B. Principal Pages (`/Pages`)
- **Home.jsx**: Hero section and featured categories.
- **Products.jsx**: The main catalog with searching, filtering (by kit type), and sorting (by price).
- **ViewProduct.jsx**: Detailed view of a single jersey with size selection and "Buy Now" logic.
- **Cart.jsx**: Management of items added for purchase.
- **Checkout.jsx**: Form-based shipping details and order finalization.
- **Orders.jsx**: User's historical purchase records.

### C. Admin Dashboard (`/Admin.jsx`)
- **AdminSidebar.jsx**: Navigation for admin panels.
- **AdminProducts.jsx**: Full CRUD for jerseys (Add new, Edit prices/images, Delete).
- **AdminOrders.jsx**: High-level view of all customer orders for fulfillment.

---

## 4. Key Functionalities & Workflows

### 🛡️ Authentication Flow
1. User submits Login/Register form.
2. Backend validates credentials/creates user and returns a **JWT Token**.
3. Frontend stores the token and user data in `localStorage`.
4. Subsequent API calls include the token in the `Authorization` header.

### ⚽ Shopping Workflow
1. **Browse**: Users search/filter jerseys in `Products.jsx`.
2. **Select**: `ViewProduct.jsx` handles size Auswahl.
3. **Cart**: Items are saved in `localStorage` for guests and synced to the DB for logged-in users via `cartController`.
4. **Checkout**: `Checkout.jsx` gathers data and calls `createOrder` in the backend.
5. **Success**: Cart is cleared, and user is redirected to their `Orders` history.

### 🏷️ Timed Offers (Flash Sales)
- Admins set a `salePrice` and `offerExpiry` date for products.
- Frontend logic compares `new Date()` with `offerExpiry` to decide whether to show the discounted price and the "Limited Offer!" badge.

### 🛠️ Admin Management
- Admins can oversee all user accounts, update order statuses (e.g., Pending to Shipped), and fully manage the product inventory without touching the code.

---

## 5. Development Utilities
- **.env**: Stores sensitive data like MongoDB URI and JWT Secret.
- **API Service (`/api/api.js`)**: A centralized Axios instance that automatically attaches the auth token to every request.
