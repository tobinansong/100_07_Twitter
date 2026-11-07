# Twitter Clone

A Twitter-style social media backend with accounts, profiles, follows, posts, likes, comments and image uploads. Built as a learning project with Express and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20.19%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-images-3448C5?logo=cloudinary&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)

> **Status:** the REST API is in place. The `frontend` folder is still the Vite + React starter template and isn't connected to the API yet. See [Current limitations](#current-limitations).

## Features

- **Accounts:** sign up, log in and log out, with passwords hashed using bcrypt
- **Sessions:** a 15-day JWT stored in an `httpOnly`, `SameSite=Strict` cookie, marked `Secure` in production
- **Profiles:** view any profile and edit your own details, including your password
- **Social graph:** follow and unfollow users, and get suggestions for who to follow
- **Posts:** create posts with text, an image or both, then like, comment on and delete them
- **Feeds:** browse all posts, posts from people you follow, one user's posts, or a user's liked posts
- **Images:** post images are uploaded to Cloudinary, and removed when the post is deleted
- **Privacy:** password hashes are never returned, and other users' email addresses are hidden

## Tech stack

| Area | Technology |
| --- | --- |
| Server | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | JSON Web Tokens, bcryptjs, cookie-parser |
| Image storage | Cloudinary |
| Frontend (starter only) | React 19, Vite 8 |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or newer (the frontend's Vite needs 20.19+ or 22.12+)
- A MongoDB database, such as a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Cloudinary](https://cloudinary.com/) account, for post images

### Installation

```bash
git clone https://github.com/tobinansong/100_07_Twitter.git
cd 100_07_Twitter
npm install
cp .env.example .env    # Windows Command Prompt: copy .env.example .env
```

Fill in `.env` using the table below, then start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Use `npm start` to run it without auto-reload.

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

### Running the frontend starter

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL when it starts, usually `http://localhost:5173`.

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

### Example

Log in, save the cookie, then use it to fetch posts:

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"your-password"}'

curl -b cookies.txt http://localhost:5000/api/posts/all
```

### Postman

Import [`twitter_clone.postman_collection.json`](twitter_clone.postman_collection.json) to try the auth routes. It doesn't include the user or post routes yet.

## Project structure

```text
.
├── backend/
│   ├── controllers/      # Route handlers: auth, user, post
│   ├── db/               # MongoDB connection
│   ├── lib/utils/        # JWT and cookie helper
│   ├── middleware/       # protectRoute login check
│   ├── models/           # User, Post, Notification schemas
│   ├── routes/           # Route definitions: auth, user, post
│   └── server.js         # App entry point
├── frontend/             # Vite + React starter
├── .env.example          # Environment variable template
└── twitter_clone.postman_collection.json
```

## Current limitations

- **Frontend:** it's the unmodified starter template and makes no API calls. The `cors` package is installed but not enabled yet.
- **Notifications:** liking someone's post saves a notification, but no route reads them yet, and follows don't create one.
- **Profile images:** `profileImg` and `coverImg` are saved as plain text. Only post images are uploaded to Cloudinary.
- **Base64 images:** Express's default 100 KB request limit applies, so larger base64 images are rejected. Image URLs aren't affected.
- **Tests:** there's no automated test suite yet.

## License

ISC, as declared in `package.json`. The repository doesn't include a separate license file.
