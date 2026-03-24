# NASA Simple Auth App (Next.js)

Simple Next.js app with:
- Signup/login using a JSON file as storage
- JWT session stored in an `httpOnly` cookie
- Protected NASA endpoint that returns random space data (APOD)

## Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- File-based data storage (`data/users.json`)

## Features
- `POST /api/auth/signup`: create user with `email` + `password`
- `POST /api/auth/login`: verify user and set JWT cookie (`session`)
- `GET /api/nasa/fact`: protected endpoint, returns random NASA APOD entry
- Frontend page with:
  - signup/login form
  - button to generate a random space fact after login

## Project Structure
- `app/page.tsx`: UI (signup/login + generate fact)
- `app/api/auth/signup/route.ts`: signup API
- `app/api/auth/login/route.ts`: login API
- `app/api/nasa/fact/route.ts`: protected NASA API proxy
- `lib/user-store.ts`: read/write users in JSON file
- `lib/session.ts`: JWT creation and verification
- `data/users.json`: local user storage

## Environment Variables
Create `.env.local` in project root:

```env
NASA_API_KEY=YOUR_NASA_API_KEY
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
```

Notes:
- `NASA_API_KEY` is required for `/api/nasa/fact`
- `JWT_SECRET` signs/verifies the JWT in the `session` cookie
- Do not commit real keys/secrets to git

## Run Locally
```bash
pnpm install
pnpm dev
```

Open: `http://localhost:3000`

## API Reference

### 1) Signup
`POST /api/auth/signup`

Body:
```json
{
  "email": "test@example.com",
  "password": "secret123"
}
```

Responses:
- `200` `{ "ok": true }`
- `400` missing fields
- `409` email already exists

### 2) Login
`POST /api/auth/login`

Body:
```json
{
  "email": "test@example.com",
  "password": "secret123"
}
```

Responses:
- `200` `{ "ok": true, "email": "test@example.com" }` + `Set-Cookie: session=...`
- `400` missing fields
- `401` invalid credentials

### 3) Get NASA Fact (Protected)
`GET /api/nasa/fact`

Requires valid `session` cookie from login.

Responses:
- `200`:
```json
{
  "title": "Some APOD title",
  "date": "2026-03-24",
  "explanation": "....",
  "url": "https://...",
  "mediaType": "image"
}
```
- `401` unauthorized (no/invalid/expired JWT)
- `500` missing `NASA_API_KEY`
- `502` NASA API request failed

## Postman Quick Test
1. `POST /api/auth/signup`
2. `POST /api/auth/login` and confirm `Set-Cookie` has `session=`
3. `GET /api/nasa/fact` (authenticated) -> expect `200`
4. Clear cookie jar, call `GET /api/nasa/fact` -> expect `401`

## Important Security Note
This is intentionally simple for learning/demo purposes:
- Passwords are currently stored in plain text in `data/users.json`
- No rate limiting or brute-force protection

For production, add:
- password hashing (bcrypt/argon2)
- DB storage (not JSON file)
- rate limiting
- structured auth/session management
