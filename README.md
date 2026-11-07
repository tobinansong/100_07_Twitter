# Twitter Clone

A Twitter-style social network called Perigee, with accounts, profiles, follows, posts, likes, comments, notifications and image uploads. Built as a learning project with React, Express and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-22.22%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-images-3448C5?logo=cloudinary&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)

## Features

- **Accounts:** sign up, log in and log out, with passwords hashed using bcrypt
- **Sessions:** a 15-day JWT stored in an `httpOnly`, `SameSite=Strict` cookie, marked `Secure` in production
- **Profiles:** view any profile and edit your own details, including your password
- **Social graph:** follow and unfollow users, and get suggestions for who to follow
- **Posts:** create posts with text, an image or both, then like, comment on and delete them
- **Feeds:** browse all posts, posts from people you follow, one user's posts, or a user's liked posts
- **Notifications:** see who followed you or liked your posts, with an unread badge, and clear your notifications
- **Images:** post images are compressed in the browser, uploaded to Cloudinary, and removed when the post is deleted
- **Privacy:** password hashes are never returned, and other users' email addresses are hidden
- **Interface:** a responsive orbital console design that works from phones up to wide monitors

## Tech stack

| Area | Technology |
| --- | --- |
| Server | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Image storage | Cloudinary |
| Frontend | React 19, Vite 8, React Router 8, TanStack Query 5, hand-written CSS |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.22 or newer (React Router 8's minimum)
- A MongoDB database, such as a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Cloudinary](https://cloudinary.com/) account, for post images

### Installation

```bash
git clone https://github.com/tobinansong/100_07_Twitter.git
cd 100_07_Twitter
npm install
npm install --prefix frontend
cp .env.example .env    # Windows Command Prompt: copy .env.example .env
```

Fill in `.env` using the table below.

### Running the app

The API and the frontend run as two processes, so use two terminals:

```bash
# Terminal 1: the API, at http://localhost:5000
npm run dev

# Terminal 2: the frontend, at http://localhost:3000
cd frontend
npm run dev
```

Open `http://localhost:3000`. Vite forwards every `/api` request to port 5000, so the browser sees one origin and the login cookie works. If you change `PORT`, change the proxy target in `frontend/vite.config.js` to match. Use `npm start` to run the API without auto-reload.

### Environment variables

| Variable | Description |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string. Replace the whole example value with your own |
| `PORT` | Port for the API. Defaults to `5000` |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `NODE_ENV` | `development` or `production`. In production, the login cookie is only sent over HTTPS |
| `CLOUDINARY_CLOUD_NAME` | Cloud name from your Cloudinary console |
| `CLOUDINARY_API_KEY` | API key from your Cloudinary console |
| `CLOUDINARY_API_SECRET` | API secret from your Cloudinary console |

To generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Interface

The design is a mission console in orbit. Cool ion blue marks information, and hot plasma orange marks anything you can act on or that needs attention. All the design tokens are in `frontend/src/styles/tokens.css`, and the product name is set in `frontend/src/lib/brand.js`.

| Route | Screen |
| --- | --- |
| `/login`, `/signup` | Log in or create an account |
| `/` | Composer plus the All and Following feeds (`?feed=following`) |
| `/notifications` | Follows and likes, with new ones highlighted |
| `/profile/:username` | Profile, Posts and Likes tabs (`?tab=likes`), follow or edit |

A few things work around how the API behaves:

- **Image size:** requests are limited to 100 KB, so `frontend/src/lib/image.js` shrinks images in the browser until they fit. A large or detailed photo can lose visible quality.
- **Unread badge:** `GET /api/notifications` marks everything as read, so polling it can't show what's unread. The browser remembers the newest notification it has shown instead, in `localStorage`, so unread state isn't shared between devices.
- **Radar:** suggested users are drawn as blips. Their position comes from their user id, and the rescan button asks the API for a new random sample.
- **Limits set by the interface:** the API doesn't limit lengths, so the 280-character limit on posts and replies and the 160-character limit on bios only apply in the frontend.

## API reference

The base URL is `http://localhost:5000`. Request bodies can be JSON or URL-encoded form data. Errors are returned as `{ "error": "message" }`.

Routes marked **Login** need the `jwt` cookie set by signup or login, and return `401` without it.

### Auth: `/api/auth`

| Method | Path | Access | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Public | `username`, `fullName`, `email`, `password` | Create an account and log in. Passwords need at least 6 characters |
| `POST` | `/api/auth/login` | Public | `username`, `password` | Log in |
| `POST` | `/api/auth/logout` | Public | None | Clear the login cookie |
| `GET` | `/api/auth/me` | Login | None | Get the logged-in user |

### Users: `/api/users`

| Method | Path | Access | Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/users/profile/:username` | Login | None | Get a user's public profile |
| `GET` | `/api/users/suggested` | Login | None | Get up to 4 random users you don't follow |
| `POST` | `/api/users/follow/:id` | Login | None | Follow a user, or unfollow if you already follow them |
| `POST` | `/api/users/update` | Login | Any of the fields below | Update your profile |

Fields accepted by `/api/users/update`: `fullName`, `username`, `email`, `bio`, `link`, `profileImg` and `coverImg`. To change your password, send both `currentPassword` and `newPassword`.

### Posts: `/api/posts`

| Method | Path | Access | Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/posts/all` | Login | None | Get all posts, newest first |
| `GET` | `/api/posts/following` | Login | None | Get posts from users you follow |
| `GET` | `/api/posts/likes/:id` | Login | None | Get the posts a user has liked |
| `GET` | `/api/posts/user/:username` | Login | None | Get one user's posts |
| `POST` | `/api/posts/create` | Login | `text`, `img` | Create a post. At least one of the two is required |
| `POST` | `/api/posts/like/:id` | Login | None | Like a post, or unlike it if you already liked it |
| `POST` | `/api/posts/comment/:id` | Login | `text` | Comment on a post |
| `DELETE` | `/api/posts/:id` | Login | None | Delete your own post |

`img` must be an `http(s)` image URL or a base64 `data:image/...` string.

### Notifications: `/api/notifications`

| Method | Path | Access | Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/notifications` | Login | None | Get your notifications, newest first, and mark them as read |
| `DELETE` | `/api/notifications` | Login | None | Delete all your notifications |

The `GET` response shows each notification's `read` value from before the request, so new ones can be highlighted. The next request returns them as read.

### Example

Log in, save the cookie, then use it to fetch posts:

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"your-password"}'

curl -b cookies.txt http://localhost:5000/api/posts/all
```

### Postman

Import [`twitter_clone.postman_collection.json`](twitter_clone.postman_collection.json) to try the auth and notification routes. It doesn't include the user or post routes yet.

## Project structure

```text
.
├── backend/
│   ├── controllers/      # Route handlers: auth, user, post, notification
│   ├── db/               # MongoDB connection
│   ├── lib/utils/        # JWT and cookie helper
│   ├── middleware/       # protectRoute login check
│   ├── models/           # User, Post, Notification schemas
│   ├── routes/           # Route definitions: auth, user, post, notification
│   └── server.js         # App entry point
├── frontend/
│   ├── public/           # Favicon and preset avatars
│   ├── src/
│   │   ├── components/   # App shell, feed, radar, dialogs and shared UI
│   │   ├── hooks/        # Data fetching: auth, posts, users, notifications
│   │   ├── lib/          # API client, image compression, formatting, toasts
│   │   ├── pages/        # Auth, home, notifications, profile, not found
│   │   └── styles/       # Design tokens and component styles
│   └── vite.config.js    # Dev server port and /api proxy
├── .env.example          # Environment variable template
├── notifications.postman_collection.json
└── twitter_clone.postman_collection.json
```

## Current limitations

- **Deployment:** Express doesn't serve the built frontend and CORS isn't enabled, so the app only runs through Vite's proxy (`npm run dev` or `npm run preview` in `frontend`). Hosting it needs one of those two added.
- **Notifications:** they don't record which post was liked. Unliking or unfollowing doesn't remove a notification, so liking or following again creates another one.
- **Profile images:** `profileImg` and `coverImg` are saved as plain text, and only post images are uploaded to Cloudinary. Uploaded avatars and covers are heavily compressed and stored in MongoDB as base64, and they're sent with every post in a feed, so they make feed responses larger.
- **Base64 images:** Express's default 100 KB request limit applies. The frontend compresses images to fit, but larger uploads through the API directly are rejected. Image URLs aren't affected.
- **Missing endpoints:** there's no search, trending, direct messaging, follower lists or pagination, so the interface doesn't offer them and feeds load every post.
- **Tests:** there's no automated test suite yet.

## License

ISC, as declared in `package.json`. The repository doesn't include a separate license file.
