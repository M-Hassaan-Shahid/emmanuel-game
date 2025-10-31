require('dotenv').config();

const express = require("express");
const app = express();
const http = require("http");
const { Server: SocketIoServer } = require('socket.io');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8000;

// Import your routes
const GameRoutes = require("./Routes/GameRoutes");
const AdminRoute = require("./Routes/AdminRoute");
const UserRoute = require("./Routes/UserRoute");
const BetRoutes = require("./Routes/BetRoutes");
const SettingRoutes = require("./Routes/SettingRoutes");
const BankRoutes = require("./Routes/BankRoutes");
const PlayerRoutes = require("./Routes/PlayerRoutes");
const PaymentRoutes = require("./Routes/PaymentRoutes");
const PlaneCrashRoutes = require("./Routes/PlaneCrashRoutes");
const UserKycRoutes = require("./Routes/UserKycRoutes");
const PromoCodeRoutes = require("./Routes/PromoCodeRoutes");
const TestEmailRoute = require("./Routes/TestEmailRoute");
const OAuthRoutes = require("./Routes/OAuthRoutes");
const TelegramStarsRoutes = require("./Routes/TelegramStarsRoutes");
const TelegramLinkRoutes = require("./Routes/TelegramLinkRoutes");
const BroadcastRoutes = require("./Routes/BroadcastRoutes");
const passport = require('./config/passport');

// Initialize Telegram Stars Bot (for payment processing)
if (process.env.TELEGRAM_BOT_TOKEN) {
  try {
    require('./bot/telegramStarsBot');
    console.log('✅ Telegram Stars Bot initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram Stars Bot:', error.message);
  }
}

// Connect to the database
connectDB();
const allowedOrigins = [
  "https://aviatorgame-frontend.vercel.app",  // Website frontend
  "https://aviatorgame-web.vercel.app",
  "http://localhost:3000",  // Frontend (Create React App)
  "http://localhost:5173",  // Frontend (Vite)
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:8000",
];
const corsOptions = {
  origin: function (origin, callback) {
    // Check if the incoming request's origin is in the allowed origins
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
  optionsSuccessStatus: 204,
};
// Apply CORS middleware FIRST (before any routes)
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // Parse cookies

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new SocketIoServer(server, {
  path: '/socket.io', // Correct path for Socket.IO
  cors: {
    origin: allowedOrigins, // Use the same allowed origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Use your routes
app.use('/api', GameRoutes(io));
app.use("/api", UserRoute);
app.use("/api", AdminRoute);
app.use("/api", BetRoutes);
app.use("/api", SettingRoutes);
app.use("/api", BankRoutes);
app.use("/api", PlayerRoutes);
app.use("/api", PaymentRoutes);
app.use("/api", PlaneCrashRoutes);
app.use("/api", UserKycRoutes);
app.use("/api", PromoCodeRoutes);
app.use("/api", TestEmailRoute);
app.use("/api", OAuthRoutes);
app.use("/api/telegram", TelegramStarsRoutes);
app.use("/api/telegram-link", TelegramLinkRoutes);
app.use("/api", BroadcastRoutes);

// Initialize Passport
app.use(passport.initialize());

// Google Auth Routes
const GoogleAuthRoutes = require("./Routes/GoogleAuthRoutes");
app.use("/api/auth", GoogleAuthRoutes);

// Telegram Auth Routes
const TelegramAuthRoutes = require("./Routes/TelegramAuthRoutes");
app.use("/api/auth", TelegramAuthRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World !");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`🎮 Game engine initialized and running`);
});

// Disable default server timeout
server.timeout = 0;
