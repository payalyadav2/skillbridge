# 🤝 SkillBridge — Local Skill Exchange Platform

A production-ready full-stack web application that connects people who want to exchange skills. Teach what you know, learn what you want — no money needed.

[![Tech Stack](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black)](https://socket.io)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple)](https://ai.google.dev)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Architecture](#architecture)

---

## ✨ Features

### Authentication
- ✅ JWT-based signup / login / logout
- ✅ Email verification with secure tokens
- ✅ Forgot password & reset password
- ✅ Refresh tokens + auto-refresh

### User Profiles
- ✅ Name, bio, headline, avatar (Cloudinary)
- ✅ Skills Offered + Skills Wanted lists
- ✅ Experience levels & skill verification
- ✅ Geolocation with Google Maps
- ✅ Social links (GitHub, LinkedIn, Website)
- ✅ Profile completeness score

### Skill Exchange
- ✅ Skill Listing (offered / wanted)
- ✅ Advanced search & category filters
- ✅ Skill Matching Engine (algorithmic + AI)
- ✅ Exchange Request System (send / accept / reject / cancel / complete)
- ✅ Exchange history & status tracking

### Real-Time Chat
- ✅ Socket.io live messaging
- ✅ Typing indicators
- ✅ Online / offline status
- ✅ File & image attachments (Cloudinary)
- ✅ Message deletion & read receipts
- ✅ Unread counts

### Video Calling
- ✅ WebRTC peer-to-peer video
- ✅ Audio / video toggle
- ✅ Screen sharing
- ✅ ICE / STUN negotiation
- ✅ Call timer & session recording

### AI Tools (Gemini)
- ✅ Skill Recommendations
- ✅ Skill Gap Analysis with readiness score
- ✅ Learning Roadmap Generator
- ✅ AI Chat Assistant (context-aware)
- ✅ AI-powered skill matching

### Session Management
- ✅ Schedule sessions from accepted exchanges
- ✅ Video call room generation
- ✅ Session notes & agenda
- ✅ Session recap after completion

### Community
- ✅ Nearby Users with Google Maps
- ✅ Ratings & Reviews (with sub-ratings)
- ✅ Achievement System (9 badges, 5 tiers)
- ✅ Points & Level system
- ✅ Community Leaderboard

### Dashboard
- ✅ Stats overview
- ✅ Upcoming sessions
- ✅ Pending requests alerts
- ✅ Top skill matches
- ✅ Recent reviews
- ✅ Learning progress tracking

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Redux Toolkit |
| Router | React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Real-time | Socket.io v4 |
| Video | WebRTC (native) |
| AI | Google Gemini 1.5 Flash |
| Storage | Cloudinary |
| Maps | Google Maps JS API |
| Email | Nodemailer |
| Deploy | Vercel (FE) + Render (BE) |

---

## 📁 Project Structure

```
skillbridge/
├── backend/
│   ├── server.js               # Express + Socket.io entry
│   ├── src/
│   │   ├── config/             # DB, Cloudinary, Email configs
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Skill.js
│   │   │   ├── ExchangeRequest.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Review.js
│   │   │   ├── Session.js
│   │   │   ├── Achievement.js
│   │   │   └── Notification.js
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # Express routers
│   │   ├── middleware/         # Auth, error, rate limiting
│   │   ├── services/           # Email, AI, matching, achievements
│   │   ├── socket/             # Socket.io + WebRTC signaling
│   │   └── utils/              # Token, OTP, response helpers
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/                # Axios instance with interceptors
    │   ├── components/
    │   │   └── common/         # Navbar, Loader, Modal, ProtectedRoute
    │   ├── context/            # Socket.io context provider
    │   ├── pages/              # All route pages
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx / Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Profile.jsx / EditProfile.jsx
    │   │   ├── Skills.jsx / SkillDetail.jsx
    │   │   ├── Chat.jsx
    │   │   ├── Exchanges.jsx
    │   │   ├── Sessions.jsx
    │   │   ├── SessionRoom.jsx  # WebRTC video call
    │   │   ├── NearbyUsers.jsx  # Google Maps
    │   │   ├── AITools.jsx      # Gemini AI tools
    │   │   ├── Achievements.jsx
    │   │   └── Reviews.jsx
    │   ├── store/              # Redux Toolkit slices
    │   └── utils/              # Constants, formatters
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Google Gemini API key (free at ai.google.dev)
- Google Maps API key

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/skillbridge.git
cd skillbridge

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
```

### 3. Configure Frontend

```bash
cd frontend
cp .env.example .env
# Fill in your API keys
```

### 4. Seed Achievements

```bash
# After starting backend, run in another terminal:
curl -X POST http://localhost:5000/api/achievements/seed \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Run Development Servers

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillbridge

# JWT (use long random strings)
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=SkillBridge <noreply@skillbridge.com>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google Maps (backend validation)
GOOGLE_MAPS_API_KEY=your_maps_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

---

## 📡 API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/verify-email?token=&id=
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/refresh-token
PUT  /api/auth/change-password
```

### Users
```
GET    /api/users/search?q=&skill=&category=
GET    /api/users/nearby?latitude=&longitude=&maxDistance=
GET    /api/users/matches
GET    /api/users/dashboard
GET    /api/users/:id
PUT    /api/users/profile
PUT    /api/users/avatar
PUT    /api/users/location
POST   /api/users/skills/offered
DELETE /api/users/skills/offered/:skillId
POST   /api/users/skills/wanted
DELETE /api/users/skills/wanted/:skillId
PUT    /api/users/learning-progress
```

### Skills
```
GET    /api/skills?q=&category=&level=&type=
POST   /api/skills
GET    /api/skills/:id
PUT    /api/skills/:id
DELETE /api/skills/:id
GET    /api/skills/mine
GET    /api/skills/categories
```

### Exchanges
```
GET  /api/exchanges
POST /api/exchanges
GET  /api/exchanges/:id
PUT  /api/exchanges/:id/accept
PUT  /api/exchanges/:id/reject
PUT  /api/exchanges/:id/cancel
PUT  /api/exchanges/:id/complete
```

### Chat
```
GET  /api/chat/conversations
GET  /api/chat/conversations/:userId/with
GET  /api/chat/conversations/:conversationId/messages
POST /api/chat/messages
DELETE /api/chat/messages/:messageId
POST /api/chat/upload
```

### Reviews
```
POST /api/reviews
GET  /api/reviews/user/:userId
PUT  /api/reviews/:id/respond
POST /api/reviews/:id/report
```

### Sessions
```
GET  /api/sessions
POST /api/sessions
GET  /api/sessions/room/:roomId
GET  /api/sessions/:id
PUT  /api/sessions/:id/start
PUT  /api/sessions/:id/end
PUT  /api/sessions/:id/cancel
PUT  /api/sessions/:id/notes
```

### AI Tools
```
GET  /api/ai/recommendations
POST /api/ai/gap-analysis       { targetRole }
POST /api/ai/roadmap            { skillName, currentLevel, targetLevel, timeframe }
POST /api/ai/chat               { messages: [] }
GET  /api/ai/matches
POST /api/ai/verify-questions   { skillName, level }
```

### Notifications
```
GET /api/notifications
GET /api/notifications/unread-count
PUT /api/notifications/read-all
PUT /api/notifications/:id/read
DELETE /api/notifications/:id
```

---

## 🌐 Deployment

### Backend → Render

1. Push to GitHub
2. Create new Web Service on render.com
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables
6. Deploy

### Frontend → Vercel

1. Push to GitHub
2. Import project on vercel.com
3. Set root directory to `frontend`
4. Add environment variables:
   - `VITE_API_URL=https://your-render-app.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-render-app.onrender.com`
   - `VITE_GOOGLE_MAPS_KEY=your_key`
5. Deploy

### MongoDB → Atlas

1. Create free M0 cluster at mongodb.com/atlas
2. Create database user
3. Whitelist `0.0.0.0/0` for Render
4. Get connection string → paste as `MONGO_URI`

---

## 🏗 Architecture

```
Client (React + Vite)
  │
  ├── REST API ──────────► Express + Node.js
  │                              │
  ├── Socket.io ─────────►  Socket.io Server
  │   (Real-time chat,          │
  │    WebRTC signaling,        │
  │    Notifications)           │
  │                             │
  └── Direct WebRTC ──────────► Peer ◄──── Other Peer
       (Video calls via STUN)   │
                                │
                          MongoDB Atlas
                          Cloudinary (media)
                          Gemini AI (intelligence)
                          Nodemailer (email)
```

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `send_message` | Client→Server | Send a chat message |
| `receive_message` | Server→Client | Receive a message |
| `typing_start/stop` | Client→Server | Typing indicator |
| `user_typing` | Server→Client | Peer is typing |
| `join_room` | Client→Server | Join WebRTC room |
| `webrtc_offer` | Client→Server | SDP offer |
| `webrtc_answer` | Client→Server | SDP answer |
| `ice_candidate` | Bidirectional | ICE candidate exchange |
| `call_ended` | Client→Server | End video call |
| `notification` | Server→Client | Push notification |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📄 License

MIT License — feel free to use this for learning and commercial projects.

---

Built with ❤️ by Yamak Digital — for SkillBridge
