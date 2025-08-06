# 📝 Blog App API

A full-featured Blog Application built with **Node.js**, **Express.js**, and **MongoDB**, with secure **OTP-based Email Authentication** and **JWT token protection**.

## 🚀 Features

- ✅ User Signup & Login via OTP (Email-based)
- 🔐 JWT Authentication Middleware
- ✍️ Create, Read, Update, Delete (CRUD) blogs
- 📧 Email notification on blog creation (Gmail API)
- 🧾 Input validation using express-validator
- 📬 Tested using Postman (collection included)
- 📦 Modular and clean code structure

---

## 📁 Project Structure
blog-app/
├── controllers/ # Route handler logic (user & blog)
│ ├── user.js
│ └── blog.js
├── models/ # Mongoose schemas
│ ├── user.js
│ └── blog.js
├── routes/ # Express route definitions
│ ├── user.js
│ └── blog.js
├── middleware/ # Custom middleware (auth, etc.)
│ └── authentication.js
├── utils/ # Utility functions (email service)
│ └── sendMail.js
├── config/ # Database connection config
│ └── db.js
├── app.js # Main entry point
├── .env # Environment variables
└── README.md # This file

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web application framework
- **MongoDB + Mongoose** – NoSQL database & ODM
- **JWT (jsonwebtoken)** – For secure authentication
- **Nodemailer** – For sending OTPs and notifications
- **Express-validator** – For backend input validation


---

## 📦 Installation

1. **Clone the repo**
```bash
git clone https://github.com/AmanRathore-1/blog_Login.git
cd blog_Login

2.npm install

3.create .env file
PORT=5000
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password



