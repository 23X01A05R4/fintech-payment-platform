# 🚀 Smart Payment Failure & Recovery Platform

A premium, full-stack Fintech web application designed to simulate real-world payment failures, retry mechanisms, and transaction logging. Built with a modern tech stack to demonstrate senior-level backend business logic and high-end frontend UI/UX.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18** + **Vite**
- **Tailwind CSS** (for glassmorphism and modern fintech aesthetics)
- **Framer Motion** (for dynamic micro-animations)
- **Lucide React** (icons)
- **React Router v6** (navigation)
- **qrcode.react** (dynamic QR code generation for payments)

### **Backend**
- **Python / FastAPI** (high-performance async API)
- **SQLAlchemy** (ORM for relational data)
- **SQLite** (local zero-setup database for Users and Invoices)
- **MongoDB Atlas + Motor** (cloud NoSQL database for asynchronous transaction audit logs)
- **bcrypt & python-jose** (JWT Authentication and role-based security)

---

## ✨ Core Features & Business Logic

1. **Real-World Payment Simulation**
   - The `/pay` endpoint uses a weighted probability engine to simulate **Success (40%)**, **Gateway Failure/Declined (30%)**, and **Network Timeouts (30%)**.
   
2. **Safe Retry Mechanism & Limits**
   - Users can only retry a failed payment up to a maximum of **3 times**. After 3 attempts, the invoice is locked to prevent abuse.
   - **Idempotency check**: The system actively prevents duplicate payments on an already `PAID` invoice.

3. **Hybrid Database Architecture**
   - **SQLite**: Handles structured, relational data (`Users` and `Invoices`).
   - **MongoDB Atlas**: Handles unstructured, high-volume event data (`TransactionLogs`). Every single payment attempt (success or fail) is asynchronously streamed to the cloud for audit trails.

4. **Basic Fraud Detection System**
   - If a user triggers 3 transaction attempts globally within 60 seconds, the backend flags the account and the frontend actively displays an alert.

5. **Dynamic QR Code Payment Scanner**
   - Generates a dynamic QR code containing encoded invoice and user data, simulating a mobile banking app scan feature.

6. **Role-Based Admin Dashboard**
   - Normal users see their personal invoices.
   - Users promoted to `Admin` in the database gain access to the Admin Dashboard, which pulls live, global `TransactionLogs` directly from MongoDB.

---

## 💻 Local Setup Instructions

**Prerequisites:** Python 3.10+ and Node.js installed.

### 1. Database Setup (MongoDB Atlas)
Navigate to the `backend` folder and rename `.env.example` to `.env` (or create a new `.env` file). 
Add your own MongoDB Atlas connection string:
```ini
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.yourcluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=fintech_logs
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
```
*(SQLite requires no setup and will generate `fintech.db` automatically on first run).*

### 2. Run the Backend (FastAPI)
Open a terminal in the `/backend` directory:
```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The API documentation will be available at: `http://localhost:8000/docs`

### 3. Run the Frontend (React + Vite)
Open a new terminal in the `/frontend` directory:
```bash
# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
The React dashboard will be available at: `http://localhost:5173`

---

## 📝 Testing the Application

1. Go to the frontend URL and **Register** a new account.
2. The UI will log you into the User Dashboard.
3. Use the **Simulate Invoice** panel to generate a test invoice.
4. Click **Pay Now** to trigger the API. Watch the micro-animations as it simulates the gateway.
5. Check your **MongoDB Atlas** console to see the real-time record inserted into the `transaction_logs` collection!
