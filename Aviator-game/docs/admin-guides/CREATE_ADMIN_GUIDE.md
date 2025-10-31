# 👤 Create Admin User Guide

## 🚀 Quick Method (Recommended)

### Step 1: Make sure MongoDB is running

```bash
mongod
# Or if running as service: net start MongoDB
```

### Step 2: Run the admin creation script

```bash
cd backend
create-admin.bat
```

**Default Credentials Created:**

- **Email:** `admin@aviator.com`
- **Password:** `admin123`
- **Contact:** `+1234567890`

---

## 🔧 Custom Admin Credentials

If you want to create an admin with custom credentials:

### Option 1: Edit the Script

1. Open `backend/createAdmin.js`
2. Change these lines:

```javascript
const ADMIN_EMAIL = "your-email@example.com";
const ADMIN_PASSWORD = "your-secure-password";
const ADMIN_CONTACT = "+1234567890";
```

3. Save and run: `node createAdmin.js`

### Option 2: Use Command Line

```bash
cd backend
node createAdmin.js
```

---

## 📋 Manual Method (Using MongoDB)

If you prefer to create admin manually:

### Step 1: Generate Password Hash

Create a file `backend/hashPassword.js`:

```javascript
const bcrypt = require("bcryptjs");

const password = "your-password-here";
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("Hashed Password:", hash);
});
```

Run it:

```bash
node hashPassword.js
```

### Step 2: Insert into MongoDB

```bash
mongosh
use aviator
db.admin.insertOne({
    email: "admin@aviator.com",
    password: "PASTE_HASHED_PASSWORD_HERE",
    contact: "+1234567890",
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date()
})
```

---

## ✅ Verify Admin Creation

### Method 1: Check MongoDB

```bash
mongosh
use aviator
db.admin.find().pretty()
```

### Method 2: Try Logging In

**Web Login:**

1. Go to http://localhost:3000
2. Enter email: `admin@aviator.com`
3. Enter password: `admin123`
4. Click Login

**Telegram Bot Login:**

1. Open your Telegram bot
2. Send: `/login admin@aviator.com admin123`

---

## 🔐 Security Best Practices

### After Creating Admin:

1. **Change Default Password Immediately**

   - Login to admin panel
   - Go to settings/profile
   - Update password

2. **Use Strong Password**

   - At least 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `MyStr0ng!P@ssw0rd2024`

3. **Keep Credentials Safe**
   - Don't share admin credentials
   - Use password manager
   - Enable 2FA if available

---

## 🐛 Troubleshooting

### Error: "Admin already exists"

**Solution:** Admin with that email already exists. Either:

- Use a different email
- Delete existing admin first:

```bash
mongosh
use aviator
db.admin.deleteOne({ email: "admin@aviator.com" })
```

### Error: "MongoDB connection failed"

**Solution:** Make sure MongoDB is running:

```bash
mongod
# Or: net start MongoDB
```

### Error: "Cannot find module 'bcryptjs'"

**Solution:** Install dependencies:

```bash
cd backend
npm install
```

### Can't Login After Creating Admin

**Checklist:**

- [ ] Backend is running (port 8000)
- [ ] Frontend is running (port 3000)
- [ ] MongoDB is running
- [ ] Using correct email and password
- [ ] Check browser console for errors

---

## 📊 Multiple Admins

To create multiple admin accounts:

### Method 1: Run Script Multiple Times

1. Edit `createAdmin.js` with new email
2. Run: `node createAdmin.js`
3. Repeat for each admin

### Method 2: Create Array Script

Create `backend/createMultipleAdmins.js`:

```javascript
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./Models/Admin");

const admins = [
  { email: "admin1@aviator.com", password: "admin123", contact: "+1111111111" },
  { email: "admin2@aviator.com", password: "admin456", contact: "+2222222222" },
  { email: "admin3@aviator.com", password: "admin789", contact: "+3333333333" },
];

async function createMultipleAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected\n");

    for (const admin of admins) {
      const exists = await Admin.findOne({ email: admin.email });

      if (exists) {
        console.log(`⚠️  Skipping ${admin.email} - already exists`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await Admin.create({
        email: admin.email,
        password: hashedPassword,
        contact: admin.contact,
        status: 1,
      });

      console.log(`✅ Created: ${admin.email}`);
    }

    console.log("\n✅ All admins created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createMultipleAdmins();
```

Run it:

```bash
node createMultipleAdmins.js
```

---

## 🎯 Quick Reference

### Default Admin Credentials

```
Email: admin@aviator.com
Password: admin123
```

### Create Admin Command

```bash
cd backend
node createAdmin.js
```

### Check Admins in Database

```bash
mongosh
use aviator
db.admin.find()
```

### Delete Admin

```bash
mongosh
use aviator
db.admin.deleteOne({ email: "admin@aviator.com" })
```

---

## 📞 Need Help?

If you're still having issues:

1. Check MongoDB is running: `mongosh`
2. Check backend logs for errors
3. Verify .env file has correct MONGODB_URI
4. Try manual method using MongoDB shell

---

## ✅ Success Checklist

After creating admin, verify:

- [ ] Admin appears in MongoDB: `db.admin.find()`
- [ ] Can login via web interface
- [ ] Can login via Telegram bot
- [ ] Password is hashed (not plain text in database)
- [ ] Status is set to 1 (active)

---

## 🎉 You're All Set!

Your admin account is ready. You can now:

- Login to admin panel
- Manage users and payments
- Control game settings
- Use Telegram admin bot

**Remember to change the default password after first login!**
