# 🤖 Aviator Game - Telegram Admin Bot

## 📋 Overview

The Aviator Game Telegram Admin Bot is a powerful administrative tool that allows game administrators to manage their entire gaming platform directly from Telegram. Monitor users, approve transactions, control game settings, and broadcast messages - all without opening a web browser.

---

## 🔐 Authentication

### Login System

- **Secure Login**: Admins must authenticate using email and password
- **Session Management**: Stay logged in until you manually logout
- **Command**: `/login email password`
- **Example**: `/login admin@aviator.com 1234`

### Commands

- `/start` - Initialize the bot and see login instructions
- `/login <email> <password>` - Login as admin
- `/help` - Display all available commands
- `🔓 Logout` - End your admin session

---

## 👥 User Management

### Features

- **View All Users**: See the last 10 registered users
- **Search Users**: Find specific users by username, email, contact, or user ID
- **Top Users**: View top 10 users ranked by balance
- **User Details**: Complete profile including balance, status, and registration date

### Available Options

- `👥 Users` - Access user management menu
- `📋 All Users` - List recent users
- `👤 Search User` - Find specific user
- `🔝 Top Users` - View highest balance users

### Commands

- `/searchuser <query>` - Search for a user by name, email, or ID

### Information Displayed

- Username and User ID
- Email and Contact Number
- Current Balance
- Last Recharge Amount
- Account Status (Active/Inactive)
- Registration Date

---

## 💰 Payment Management

### Recharge Requests

- **View Pending**: See all pending recharge requests
- **User Details**: Username, contact, and amount
- **Payment Type**: UPI, Bank Transfer, etc.
- **Quick Actions**: Approve or reject with one command

### Withdrawal Requests

- **View Pending**: See all pending withdrawal requests
- **Balance Check**: View user's current balance
- **Validation**: Ensure sufficient balance before approval
- **Quick Actions**: Approve or reject instantly

### All Transactions

- **Complete History**: View last 20 transactions
- **Transaction Types**: Both recharge and withdrawal
- **Status Indicators**:
  - ✅ Approved
  - ⏳ Pending
  - ❌ Rejected
- **Detailed Info**: User, amount, date, and transaction ID

### Available Options

- `💰 Payments` - Access payment management menu
- `💳 Recharge Requests` - View pending recharges
- `💸 Withdrawal Requests` - View pending withdrawals
- `📜 All Transactions` - View complete transaction history

### Commands

- `/approve <transaction_id>` - Approve a pending transaction
- `/reject <transaction_id>` - Reject a pending transaction

### Transaction Processing

- **Automatic Balance Update**: User balance updates instantly on approval
- **Recharge**: Adds amount to user balance
- **Withdrawal**: Deducts amount from user balance
- **Validation**: Checks for sufficient balance before withdrawal approval

---

## 📊 Statistics Dashboard

### Platform Overview

Get real-time statistics about your gaming platform:

**User Statistics:**

- Total registered users
- Active users count

**Transaction Statistics:**

- Total transactions processed
- Pending payment requests

**Financial Statistics:**

- Total recharge amount (₹)
- Total withdrawal amount (₹)
- Net revenue calculation

### Access

- `📊 Statistics` - View complete platform statistics

---

## 🎮 Game Control

### Game Status Management

- **Enable/Disable Game**: Turn the game on or off instantly
- **Real-time Control**: Changes take effect immediately
- **Status Display**: See current game status (Active/Inactive)

### Game Settings Display

- Minimum Bet Amount
- Maximum Bet Amount
- Minimum Recharge Amount
- Minimum Withdrawal Amount

### Available Options

- `🎮 Game Control` - Access game control panel
- Interactive buttons for Enable/Disable

---

## ⚙️ Settings Management

### Game Settings

View and monitor all game configuration:

- **Game Status**: Active or Inactive
- **Betting Limits**: Min and Max bet amounts
- **Initial Bonus**: Welcome bonus for new users
- **Transaction Limits**: Min recharge and withdrawal amounts
- **Withdrawal Fee**: Percentage fee on withdrawals
- **Game Timers**: Start and end game range timers

### Bank Details

View configured payment methods:

- Bank Name and Account Number
- Account Holder Name
- IFSC Code
- UPI ID
- Mobile Number
- Up to 5 bank accounts displayed

### Promo Settings

Manage promotional codes:

- **Active Promo Codes**: View all promo codes
- **Reward Amount**: See reward value for each code
- **Expiration Status**: Active or Expired
- **Expiration Date**: When the promo expires
- Last 10 promo codes displayed

### Crash Percentage Settings

View game crash probability configuration:

- **Multiplier Ranges**: e.g., 1.0x - 2.0x
- **Crash Probability**: Percentage chance of crash
- **Multiple Ranges**: Different settings for different multipliers
- Controls game fairness and house edge

### Available Options

- `⚙️ Settings` - Access settings menu
- `🎯 Game Settings` - View game configuration
- `🏦 Bank Details` - View payment methods
- `🎁 Promo Settings` - View promo codes
- `📊 Crash %` - View crash probability settings

---

## 📢 Broadcasting System

### Mass Communication

Send announcements to all users instantly:

- **Reach All Users**: Message sent to every registered user
- **Delivery Report**: See how many messages were sent/failed
- **Formatted Messages**: Support for Markdown formatting

### Usage

1. Click `📢 Broadcast` button
2. Use command: `/broadcast Your message here`
3. Bot sends to all users with Telegram accounts
4. Receive delivery statistics

### Example

```
/broadcast 🎉 New game update! Minimum bet reduced to ₹5. Play now!
```

---

## 🎯 Key Features Summary

### ✅ Real-time Management

- Instant transaction approvals
- Live game control
- Real-time statistics

### ✅ User-Friendly Interface

- Interactive menu buttons
- Clear status indicators
- Formatted messages with emojis

### ✅ Comprehensive Control

- User management
- Payment processing
- Game configuration
- Broadcasting

### ✅ Security

- Secure authentication
- Session management
- Admin-only access

### ✅ Mobile-First

- Manage from anywhere
- No web browser needed
- Quick actions on the go

---

## 📱 Menu Structure

```
Main Menu
├── 👥 Users
│   ├── 👤 Search User
│   ├── 📋 All Users
│   ├── 🔝 Top Users
│   └── 🔙 Back to Menu
│
├── 💰 Payments
│   ├── 💳 Recharge Requests
│   ├── 💸 Withdrawal Requests
│   ├── 📜 All Transactions
│   └── 🔙 Back to Menu
│
├── 📊 Statistics
│
├── ⚙️ Settings
│   ├── 🎯 Game Settings
│   ├── 🏦 Bank Details
│   ├── 🎁 Promo Settings
│   ├── 📊 Crash %
│   └── 🔙 Back to Menu
│
├── 🎮 Game Control
│
├── 📢 Broadcast
│
└── 🔓 Logout
```

---

## 🚀 Quick Start Guide

### 1. Start the Bot

```bash
cd backend
node bot/startBot.js
```

### 2. Open Telegram

Search for your bot using the bot username

### 3. Initialize

Send `/start` command

### 4. Login

```
/login admin@aviator.com 1234
```

### 5. Start Managing

Use the menu buttons to navigate and manage your platform

---

## 💡 Use Cases

### Daily Operations

- **Morning**: Check statistics and pending transactions
- **Throughout Day**: Approve/reject payment requests as they come
- **Evening**: Review user activity and top players

### Emergency Control

- **Game Issues**: Quickly disable game if problems occur
- **Announcements**: Broadcast maintenance notifications
- **User Support**: Search and verify user accounts instantly

### Financial Management

- **Transaction Monitoring**: Track all recharges and withdrawals
- **Revenue Tracking**: Monitor platform earnings
- **Payment Processing**: Fast approval workflow

### User Management

- **Account Verification**: Search and verify user details
- **Balance Checks**: View user balances before withdrawal approval
- **Activity Monitoring**: Track top users and active players

---

## 🔒 Security Features

- **Authentication Required**: All actions require admin login
- **Session Management**: Secure session handling
- **Password Encryption**: Bcrypt password hashing
- **Database Security**: MongoDB with proper access controls
- **Error Handling**: Graceful error messages without exposing system details

---

## 📊 Data Displayed

### Currency Format

All amounts displayed in Indian Rupees (₹) with 2 decimal places

### Date Format

- Full dates: DD/MM/YYYY
- Timestamps: Localized date and time

### Status Indicators

- ✅ Success/Active/Approved
- ⏳ Pending/Processing
- ❌ Failed/Inactive/Rejected
- 🟢 Game Active
- 🔴 Game Inactive

---

## 🛠️ Technical Details

### Built With

- **Node.js**: Backend runtime
- **node-telegram-bot-api**: Telegram Bot API wrapper
- **MongoDB**: Database
- **Mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing

### Database Collections

- `admin` - Admin accounts
- `users` - Player accounts
- `transactions` - Payment records
- `bankdetails` - Payment methods
- `promocode` - Promotional codes
- `planecrash` - Game crash settings
- `setting` - Game configuration

### Connection

- **Polling**: Real-time message updates
- **Auto-reconnect**: Handles connection issues
- **Error Recovery**: Graceful error handling

---

## 📝 Command Reference

### Authentication

- `/start` - Start bot
- `/login <email> <password>` - Admin login
- `/help` - Show help

### User Management

- `/searchuser <query>` - Search user

### Payment Management

- `/approve <txn_id>` - Approve transaction
- `/reject <txn_id>` - Reject transaction

### Broadcasting

- `/broadcast <message>` - Send message to all users

### Navigation

- Use menu buttons for easy navigation
- `🔙 Back to Menu` - Return to main menu
- `🔓 Logout` - End session

---

## 🎯 Benefits

### For Admins

- ✅ Manage platform from mobile device
- ✅ Quick transaction approvals
- ✅ Real-time monitoring
- ✅ No need for web browser
- ✅ Instant notifications

### For Platform

- ✅ Faster payment processing
- ✅ Better user experience
- ✅ Reduced response time
- ✅ Improved admin efficiency
- ✅ 24/7 management capability

### For Users

- ✅ Faster payment approvals
- ✅ Quick support response
- ✅ Timely announcements
- ✅ Better service quality

---

## 🔄 Future Enhancements (Potential)

- Push notifications for new transactions
- Automated transaction approval rules
- User ban/unban functionality
- Detailed analytics and reports
- Export transaction data
- Multi-admin support with roles
- Transaction filters and search
- User activity logs
- Automated responses
- Integration with payment gateways

---

## 📞 Support

For issues or questions:

1. Check `/help` command in bot
2. Review this documentation
3. Check bot console logs for errors
4. Verify MongoDB connection
5. Ensure admin account exists

---

## ✨ Conclusion

The Aviator Game Telegram Admin Bot provides a complete mobile-first administrative solution for managing your gaming platform. With real-time updates, intuitive interface, and comprehensive features, you can efficiently manage users, process payments, control game settings, and communicate with players - all from the convenience of Telegram.

**Start managing your platform smarter, not harder!** 🚀
