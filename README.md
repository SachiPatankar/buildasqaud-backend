<p align="center">
  <img src="https://build-a-squad.s3.ap-south-1.amazonaws.com/buildasquad_logo.png" alt="BuildASquad Logo" height="200"/>
</p>


# 🚀 BuildASquad Backend

[![Render](https://img.shields.io/badge/deployed%20on-Render-000?logo=render)](https://buildasqaud-backend.onrender.com/)
    <img src="https://img.shields.io/github/last-commit/SachiPatankar/buildasquad-backend?style=default&logo=git&logoColor=white&color=ff781a" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/SachiPatankar/buildasquad-backend?style=default&color=ff781a" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/SachiPatankar/buildasquad-backend?style=default&color=ff781a" alt="repo-language-count">


> **TypeScript Nx Monorepo** | GraphQL + REST API | Redis | Socket.IO | MongoDB | AWS S3

---

## 📍 Project Description

**BuildASquad** is a platform for discovering teammates and collaborating on projects. The backend powers features like:
- Project posts and applications
- Real-time chat and notifications
- OAuth login (Google, GitHub)
- File uploads (AWS S3)
- Session and notification management

---

## 🏗️ Monorepo Structure

This backend is organized as a **TypeScript Nx monorepo**:

```
backend2/
├── apps/
│   └── backend/         # Main API server (GraphQL + REST)
├── libs/
│   ├── db/             # MongoDB models, connection logic
│   ├── aws/            # AWS S3 file upload helpers
│   └── socket/         # Socket.IO gateway, helpers
├── codegen/            # GraphQL codegen config
├── ...                 # Nx config, scripts, etc.
```
- **apps/**: Application entrypoints (API server)
- **libs/**: Shared libraries for database, sockets, AWS, etc.

---

## ⚡ Setup Instructions

1. **Clone the repo**:
   ```bash
   git clone <repo-url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a `.env` file** (see below)
4. **Start the server**:
   ```bash
   npm start
   ```

### Sample `.env`
```
# ─── DATABASE ─────────────────────────────
NX_MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/buildasquad

# ─── AWS S3 FILE STORAGE ──────────────────
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=buildasquad-bucket

# ─── FRONTEND ORIGINS ─────────────────────
FRONTEND_URL=http://localhost:5173

# ─── JWT / SESSION SECRETS ────────────────
JWT_SECRET=supersecretjwt
SESSION_SECRET=sessionsecret
EXPRESS_SESSION_SECRET=expresssecret

# Access/Refresh token config
ACCESS_TOKEN_SECRET=accesssupersecret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=refreshsupersecret
REFRESH_TOKEN_EXPIRY=7d

# ─── OAUTH CONFIG (Google + GitHub) ───────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/v1/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/v1/auth/github/callback

OAUTH_SUCCESS_REDIRECT=http://localhost:5173/oauth-callback
OAUTH_FAILURE_REDIRECT=http://localhost:5173/login

# ─── EMAIL CONFIG (Nodemailer) ────────────
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASS=your-email-app-password
RESET_PASSWORD_BASE_URL=http://localhost:5173/reset-password

# ─── REDIS CONFIG ─────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=yourredispassword
REDIS_URL=redis://default:yourredispassword@localhost:6379

```

---

## 🔐 Auth System

- **JWT**: Used for stateless authentication. Access and refresh tokens are issued on login/signup, stored as HTTP-only cookies.
- **OAuth**: Google and GitHub login via Passport.js strategies. On success, user is created/linked and tokens are issued.
- **Session Handling**: `express-session` is used for session management (required for Passport). User info is serialized/deserialized for OAuth flows.
- **Middleware**: Custom middleware (`requireAuth`) checks JWTs for protected routes. User info is attached to `req.user`.

---

## 📨 Redis Usage

- **Notifications & Chat Unread Counts**: Redis is used for fast pub/sub and caching of unread chat counts and notification totals.
- **Key Structure**:
  - `user:{userId}:chats` (hash): Unread count per chat
  - `user:{userId}:total` (string): Total unread messages
- **Logic**:
  - On new message: increment unread count in Redis, emit via Socket.IO
  - On read: reset count, recalculate total
  - On connect: initial counts loaded from Redis (fallback to MongoDB if needed)

---

## 📡 GraphQL vs REST

- **GraphQL** (Apollo): All core features (projects, applications, chat, notifications, profiles) are exposed via GraphQL endpoints.
- **REST**: Only used for authentication (login, signup, OAuth callbacks, password reset).

---

## 🔌 Socket.IO (Real-Time)

- **Used for**: Real-time chat, notifications, friend requests, unread counts
- **Key Events**:
  - `receiveMessage`: New chat message
  - `chatUnreadUpdate`: Unread count for a chat
  - `totalUnreadUpdate`: Total unread messages
  - `notification`: New notification (e.g., friend request)
  - `friendRequestDecrement`: Friend request count update
- **Rooms**: Users join `user-{userId}` for personal notifications, and chat rooms for each chat
- **Auth**: Socket connections are authenticated via JWT in cookies

---

## 🗄️ Database (MongoDB)

- **ODM**: Mongoose
- **Models**: Defined in `libs/db` (User, Post, Application, Chat, Message, Connection, Profile, etc.)
- **Schema Highlights**:
  - **User**: OAuth IDs, password hash, refresh token, profile info
  - **Post**: Project details, requirements, status, applications
  - **Chat/Message**: Participant IDs, message content, read status, deleted flags
  - **Connection**: Friend requests, status, chat linkage
- **Indexes**: Used for efficient querying (e.g., unique constraints, status, timestamps)

---

## ☁️ File Uploads (AWS S3)

- **Integration**: Uses AWS SDK for S3 uploads
- **Usage**: Profile images, project assets, etc.

---

## 🚀 Deployment

- **Hosting**: Deployed on [Render](https://buildasqaud-backend.onrender.com/) 
- **Build**: `npm run build:prod` and `npm run start:prod` for production

---

## 📄 License

This project is licensed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) license (see frontend for details). Non-commercial use only, with attribution.
