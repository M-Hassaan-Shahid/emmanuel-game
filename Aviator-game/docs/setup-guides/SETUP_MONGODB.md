# 🗄️ MongoDB Setup Guide

## Overview

MongoDB is the database used to store all user data, bets, transactions, and game information.

---

## Option 1: Local MongoDB (Development)

### Step 1: Install MongoDB

**Windows:**

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Install MongoDB Compass (GUI tool)

**Mac:**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Verify Installation

```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell
# Type 'exit' to quit
```

### Step 3: Configure .env

Open `backend/.env` and add:

```env
MONGODB_URI=mongodb://localhost:27017/aviator-game
```

### Step 4: Test Connection

```bash
cd backend
npm start
```

**Expected output:**

```
MongoDB connected successfully
Server is running on http://localhost:8000
```

---

## Option 2: MongoDB Atlas (Production/Cloud)

### Step 1: Create Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email or Google
4. Verify your email

### Step 2: Create Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select cloud provider: AWS
4. Select region: Closest to you
5. Cluster name: "aviator-game"
6. Click "Create"

**Wait 3-5 minutes for cluster creation**

### Step 3: Create Database User

1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `aviator_admin`
5. Password: Click "Autogenerate Secure Password" (copy it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 4: Whitelist IP Address

1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your server's IP address
5. Click "Confirm"

### Step 5: Get Connection String

1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 4.1 or later
6. Copy the connection string

**Example:**

```
mongodb+srv://aviator_admin:<password>@aviator-game.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 6: Configure .env

Open `backend/.env` and add:

```env
MONGODB_URI=mongodb+srv://aviator_admin:YOUR_PASSWORD@aviator-game.xxxxx.mongodb.net/aviator-game?retryWrites=true&w=majority
```

**Replace:**

- `YOUR_PASSWORD` with the password you copied
- `aviator-game.xxxxx.mongodb.net` with your cluster URL

### Step 7: Test Connection

```bash
cd backend
npm start
```

**Expected output:**

```
MongoDB connected successfully
Server is running on http://localhost:8000
```

---

## MongoDB Compass (GUI Tool)

### Install Compass

Download from: https://www.mongodb.com/try/download/compass

### Connect to Local MongoDB

1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"

### Connect to MongoDB Atlas

1. Open MongoDB Compass
2. Paste your Atlas connection string
3. Replace `<password>` with your password
4. Click "Connect"

### View Your Data

1. Database: `aviator-game`
2. Collections:
   - `users` - User accounts
   - `bets` - Game bets
   - `transactions` - Payments
   - `settings` - App settings

---

## Database Structure

### Collections Created Automatically:

1. **users**

   - User accounts
   - Authentication data
   - Balance information

2. **bets**

   - Game bets
   - Win/loss records
   - Bet history

3. **transactions**

   - Deposits
   - Withdrawals
   - Payment history

4. **settings**
   - App configuration
   - Game settings

---

## Troubleshooting

### Error: "MongoNetworkError"

**Cause:** Can't connect to MongoDB

**Fix:**

- Check if MongoDB is running: `mongosh`
- Verify connection string in .env
- Check firewall settings
- For Atlas: Verify IP whitelist

---

### Error: "Authentication failed"

**Cause:** Wrong username or password

**Fix:**

- Verify credentials in MongoDB Atlas
- Check connection string format
- Ensure password doesn't contain special characters (URL encode if needed)

---

### Error: "Database not found"

**Cause:** Database doesn't exist yet

**Fix:**

- Don't worry! MongoDB creates database automatically
- Database is created when first data is inserted
- Just start the backend server

---

### Error: "Connection timeout"

**Cause:** Network issues or wrong URL

**Fix:**

- Check internet connection
- Verify cluster URL
- Check if cluster is active in Atlas
- Try different region

---

## Best Practices

### Development:

- ✅ Use local MongoDB
- ✅ Free and fast
- ✅ No internet required
- ✅ Easy to reset data

### Production:

- ✅ Use MongoDB Atlas
- ✅ Automatic backups
- ✅ High availability
- ✅ Scalable
- ✅ Secure

---

## Backup & Restore

### Local MongoDB Backup:

```bash
mongodump --db aviator-game --out ./backup
```

### Local MongoDB Restore:

```bash
mongorestore --db aviator-game ./backup/aviator-game
```

### Atlas Backup:

- Automatic daily backups (free tier)
- Manual backups available
- Point-in-time recovery (paid tiers)

---

## Monitoring

### Local MongoDB:

- Use MongoDB Compass
- Check logs: `C:\Program Files\MongoDB\Server\6.0\log\mongod.log`

### Atlas:

- Dashboard shows metrics
- Real-time performance monitoring
- Alerts for issues

---

## Pricing

### Local MongoDB:

- **Cost:** FREE
- **Storage:** Unlimited (your disk space)
- **Performance:** Depends on your hardware

### MongoDB Atlas:

- **Free Tier (M0):**
  - 512 MB storage
  - Shared RAM
  - Good for development/small apps
- **Paid Tiers:**
  - M10: $0.08/hour (~$57/month)
  - M20: $0.20/hour (~$144/month)
  - M30: $0.54/hour (~$389/month)

---

## Migration (Local to Atlas)

### Step 1: Export from Local

```bash
mongodump --db aviator-game --out ./backup
```

### Step 2: Import to Atlas

```bash
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net" --db aviator-game ./backup/aviator-game
```

---

## Security Tips

### For Production:

1. ✅ Use strong passwords
2. ✅ Whitelist specific IPs only
3. ✅ Enable authentication
4. ✅ Use SSL/TLS connections
5. ✅ Regular backups
6. ✅ Monitor access logs

### Never:

- ❌ Commit .env file to git
- ❌ Share database credentials
- ❌ Use default passwords
- ❌ Allow access from anywhere (production)

---

## Quick Reference

### Local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/aviator-game
```

### Atlas MongoDB:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aviator-game?retryWrites=true&w=majority
```

### Test Connection:

```bash
cd backend
npm start
# Look for: "MongoDB connected successfully"
```

---

## Support

### MongoDB Documentation:

- Local: https://docs.mongodb.com/manual/
- Atlas: https://docs.atlas.mongodb.com/

### Community:

- Forum: https://www.mongodb.com/community/forums/
- Stack Overflow: Tag `mongodb`

---

**Status:** ✅ Setup complete when you see "MongoDB connected successfully"

**Next Step:** Configure other services (Email, Twilio, Razorpay)

---

_Last Updated: October 14, 2025_
