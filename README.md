# AI Interview Prep Kit

AI Interview Prep Kit is a production-oriented full-stack JavaScript foundation for creating structured, research-backed interview preparation workflows. The first version intentionally provides clean boundaries and placeholders rather than fake AI behavior.

## Architecture

The backend follows a thin-controller architecture:

```text
controller -> service -> researcher / generator -> LLM
```

Controllers handle HTTP concerns only. Business logic belongs in services, while future web research, extraction, generation, scheduling, coverage, and validation capabilities remain isolated under `server/src/services`.

## Tech Stack

- Frontend: Next.js App Router, React, JavaScript, Tailwind CSS, ESLint, Axios
- Backend: Node.js, Express, MongoDB/Mongoose
- Supporting services: CORS, dotenv, JWT, bcryptjs, cookie-parser, Axios, Cheerio, Zod
- Testing: Jest and Supertest

## Folder Structure

```text
client/                 Next.js application
server/                 Express API and domain services
scripts/                Evaluation and automation scripts
cases/                  Example preparation cases
output/                 Generated output files (ignored by Git)
```

## Setup

```bash
git clone <repository-url>
cd ai-interview-prep-kit
copy .env.example server/.env
cd server && npm install
cd ../client && npm install
```

Add local values to `server/.env` before enabling database or authentication features. Never commit real secrets.

## Environment Variables

The server reads `PORT`, `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `CLIENT_URL`. See `.env.example` for the complete template.

## Backend Commands

Run from `server/`:

```bash
npm run dev
npm start
npm test
npm run test:coverage
```

## Frontend Commands

Run from `client/`:

```bash
npm run dev
npm run build
npm start
npm run lint
```

## API Health Check

With the backend running, request `GET http://localhost:5000/api/health`. It returns:

```json
{ "success": true, "message": "API is running" }
```

## Development Roadmap

1. Add persistence models and authentication flows.
2. Implement web research and source extraction with explicit validation.
3. Add LLM orchestration behind generation services.
4. Build coverage analysis, question review, flashcards, and scheduling.
5. Add end-to-end workflows, observability, rate limits, and production deployment configuration.