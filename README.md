# 💬 Real-Time Chat Application

A scalable, production-ready **Real-Time Chat Application** built with the **MERN Stack** and **Socket.IO**, designed to deliver seamless, low-latency messaging with modern UX patterns and robust backend architecture.

This project demonstrates strong expertise in **full-stack development**, **real-time systems**, **authentication strategies**, and **scalable application design**—making it suitable for showcasing in professional portfolios and technical interviews.

---

## 🚀 Overview

This application enables real-time one-to-one messaging with advanced features such as delivery tracking, read receipts, typing indicators, and live user presence.

It is architected using **modular backend design**, **WebSocket-based communication**, and **secure JWT authentication with refresh token rotation**.

---

## 🎓 Academic Context

This project was developed as a 2nd Year End Semester Project for MERN Stack Development.
It was designed and implemented collaboratively by a team of four students:

* **Takunda Leonard Gorogodo**
* **Budwell K Nyamhamba**
* **Lokesh Karri**
* **Abi Lash**

---

## 🧠 Key Highlights

* ⚡ Real-time communication using WebSockets
* 🔐 Secure authentication with JWT (access + refresh tokens)
* 📦 Clean, scalable backend architecture (MVC + modular sockets)
* 🔄 Token lifecycle management with session invalidation
* 📊 Efficient message handling with pagination and status tracking
* 🎯 Production-oriented design patterns and best practices

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.IO
* JSON Web Token (JWT)
* bcrypt
* crypto

### Frontend

* React.js
* Vite
* Axios
* Socket.IO Client
* Context API
* React Router DOM

---

## ✨ Core Features

### 🔐 Authentication & Security

* JWT-based authentication (access + refresh tokens)
* Secure password hashing using bcrypt
* Token rotation and session invalidation
* Protected routes and middleware-based authorization

---

### 💬 Real-Time Messaging

* Instant private messaging using WebSockets
* Message lifecycle tracking:

  * ✓ Sent
  * ✓✓ Delivered
  * ✓✓ Read
* Message editing with version control
* Soft delete with UI indication
* Pagination for chat history (optimized queries)

---

### ⚡ Real-Time Interactions

* Typing indicators (start/stop events)
* Online/offline presence detection
* Last seen timestamps
* Instant UI updates via Socket.IO events

---

### 🎨 User Experience

* WhatsApp-inspired UI design
* Responsive layout for multiple screen sizes
* Auto-scroll to latest messages
* Interactive message actions (edit/delete)
* Smooth transitions and animations

---

## 🏗️ Architecture

### Backend Design

* **MVC Pattern** for separation of concerns
* **Socket Layer Abstraction** for real-time logic
* **Middleware-based Authentication**
* **Token + Session Management System**

### Frontend Design

* **Context API** for global state management
* **Component-based architecture**
* **API abstraction using Axios**
* **Socket Provider for real-time state sync**

---

## 📂 Project Structure (Simplified)

```
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── socket/
└── utils/

frontend/
├── src/
│   ├── api/
│   ├── context/
│   ├── pages/
│   └── components/
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v14 or higher)
* MongoDB (local or cloud)
* npm or yarn

---

### 🔧 Backend Setup

```bash
git clone https://github.com/takundagorogodo/realtime-chat-app.git
cd realtime-chat-app/backend

npm install
```

Create `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/realtime_chat_app
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=30m
REFRESH_TOKEN_EXPIRY=7d
```

Run:

```bash
npm run dev
```

---

### 💻 Frontend Setup

```bash
cd realtime-chat-app/frontend
npm install
npm run dev
```

---

## 📡 API Overview

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/refresh`
* `POST /api/auth/logout`

### Messaging

* `GET /api/messages/:roomId?page=0`

### Users

* `GET /api/users`
* `GET /api/rooms/private/:userId`

---

## 🧪 Sample Test Users

```
alice@example.com   | alice123
bob@example.com     | bob123
charlie@example.com | charlie123
```

---

## 🎯 Learning Outcomes

This project demonstrates:

* Designing **real-time systems using WebSockets**
* Implementing **secure authentication flows (JWT + refresh tokens)**
* Structuring **scalable backend architectures**
* Managing **state in real-time frontend applications**
* Applying **database design for messaging systems**
* Building **production-level full-stack applications**

---

## 🐛 Known Fixes

### Fix bcrypt hashing issue

```js
bcrypt.hash(password, 10);
```

### Fix crypto hash algorithm

```js
crypto.createHash("sha256");
```

---

## 🔮 Future Enhancements

* Group chat functionality
* Media/file sharing
* Voice & video calling (WebRTC)
* End-to-end encryption
* Push notifications
* Dark mode
* Progressive Web App (PWA) support
* Message search & filtering

---

## 👨‍💻 Author

**Takunda Leonard Gorogodo**

Full-Stack Developer | Computer Science Student

---

## 📄 License

This project is intended for educational and portfolio use.

---

## ⭐ Show Your Support

If you found this project useful or impressive:

👉 Give it a **star ⭐ on GitHub**
👉 Share it with others

---

## 📬 Contact

* GitHub Issues (preferred)
* Email: [gorogodotakundah26@gmail.com](mailto:gorogodotakundah26@gmail.com)

---

> 💡 *Tip: This project is ideal to showcase in interviews when discussing real-time systems, authentication, and scalable backend design.*
