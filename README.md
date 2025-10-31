# Aviator Game Platform

A full-stack multiplayer Aviator game platform with real-time gameplay, multiple authentication methods, and integrated payment systems.

## 🎮 Features

- **Real-time Multiplayer Game** - Live betting and crash mechanics using Socket.io
- **Multiple Authentication** - Email, Phone (OTP), Google OAuth, Telegram Login
- **Payment Integration** - Telegram Stars, Razorpay
- **Admin Panel** - Comprehensive dashboard for game management
- **Telegram Bot** - Admin controls and notifications
- **User Management** - KYC, wallet, transaction history
- **Promo Codes & Rewards** - Daily rewards and referral system

## 📁 Project Structure

```
Aviator-game/
├── backend/          # Node.js/Express API server
├── frontend/         # React Admin Panel
├── aviatorGameWeb/   # React/Vite User Game Interface
└── docs/            # Setup guides and documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd emmanuel-game/Aviator-game
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
copy .env.example .env
# Edit .env with your credentials (MongoDB, JWT, Email, Twilio, etc.)

# Start the backend server
npm start
```

Backend runs on: `http://localhost:8000`

### 3. Frontend (Admin Panel) Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
copy .env.example .env
# Edit .env with backend URL

# Start the admin panel
npm start
```

Admin Panel runs on: `http://localhost:3000`

### 4. Game Web (User Interface) Setup

```bash
cd aviatorGameWeb

# Install dependencies
npm install

# Configure environment variables (if .env exists)
# Edit .env with backend URL

# Start the game interface
npm run dev
```

Game Interface runs on: `http://localhost:5173`

## ⚙️ Configuration

### Required Environment Variables

**Backend (.env):**

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` & `EMAIL_PASS` - Email service credentials
- `TWILIO_SID` & `TWILIO_AUTH_TOKEN` - SMS OTP service
- `TELEGRAM_BOT_TOKEN` - Telegram bot for payments

**Frontend (.env):**

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

See `backend/.env.example` for complete configuration options.

## 📚 Documentation

Detailed setup guides are available in the `docs/` folder:

- **Quick Start**: `docs/quick-start/QUICK_START_GUIDE.md`
- **Setup Guides**: `docs/setup-guides/SETUP_GUIDES_INDEX.md`
- **Admin Guide**: `docs/admin-guides/CREATE_ADMIN_GUIDE.md`
- **Telegram Integration**: `docs/telegram-guides/`

## 🎯 Creating Admin Account

```bash
cd backend
node createAdmin.js
```

Or use the batch file:

```bash
create-admin.bat
```

## 🔧 Useful Scripts

### Backend

- `npm start` - Start server
- `node createAdmin.js` - Create admin account
- `node listAdmins.js` - List all admins

### Frontend

- `npm start` - Start development server
- `npm run build` - Build for production

### Game Web

- `npm run dev` - Start development server
- `npm run build` - Build for production

## 🛠️ Tech Stack

**Backend:**

- Node.js, Express
- MongoDB, Mongoose
- Socket.io
- JWT Authentication
- Nodemailer, Twilio
- Telegram Bot API

**Frontend:**

- React
- React Router
- Axios
- Tailwind CSS

**Game Web:**

- React, Vite
- Socket.io Client
- Chart.js
- Tailwind CSS

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues and questions, refer to the documentation in the `docs/` folder or contact the development team.
