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



