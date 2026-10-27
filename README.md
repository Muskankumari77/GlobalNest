# GlobalNest

International student support platform. Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + SQLite**.

## Setup
```bash
npm install
cp .env.example .env.local      # set JWT_SECRET to a long random string
npm run dev                     # http://localhost:3000
```
The SQLite database (`data/globalnest.db`) is created and seeded with demo data on first start.

Production: `npm run build && npm start` (if you serve over plain http locally, set `COOKIE_INSECURE=1`).

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run seed` | Delete the database (it re-seeds on next start) |
| `BASE=http://localhost:3000 npm test` | Integration tests (server must be running) |

## Demo accounts
| Role | Email | Password |
|---|---|---|
| Student | student@globalnest.dev | Student@123 |
| Admin | admin@globalnest.dev | Admin@123 |
| Support staff | support@globalnest.dev | Support@123 |

## What is implemented
- Auth: sign up, log in, log out, bcrypt hashing, signed JWT in an HttpOnly SameSite cookie (7 days), server-side role checks, rate limiting on login/signup, disabled accounts blocked
- Dashboard with live numbers from SQLite
- Guides: search, category/country filters, sort, pagination, save, helpful feedback, related guides, official vs sample labels
- Tasks: add/edit/delete/complete, filters, sorting, list and calendar-style view, overdue highlight, progress
- Community: match score (interests, languages, university), connection requests (send/accept/decline/cancel), report, block, privacy setting
- Messages between connected students only (enforced on the server)
- Campus services directory with search, filters, details, bookmarks, emergency notice
- Notifications (unread count, mark read/all), global search with suggestions
- Admin/support panel: live stats, reports, guide usage, announcements, user enable/disable (admin only)

## Not included (be honest in your demo)
- Password reset by email, refresh-token rotation, CSRF tokens, real-time chat (messages refresh on send/reload), email or push reminders. These need an email service or extra work.
- Guides and services are **sample data**; add verified official links before real use.
- SQLite instead of PostgreSQL, so no extra database install is needed.
- Images in `public/images` are crops from the design screenshot; replace them with licensed images for production.

## API (JSON `{ ok, data }` or `{ ok:false, error }`)
`POST /api/auth/signup|login|logout` · `POST /api/tasks` · `PATCH|DELETE /api/tasks/:id` · `POST /api/guides/:id/save|feedback` · `POST /api/services/:id/save` · `POST /api/connections` · `PATCH /api/connections/:id {action}` · `POST|PATCH /api/messages` · `PATCH /api/notifications` · `PATCH /api/profile` · `GET /api/search?q=` · `POST /api/community/report|block` · `POST /api/admin/announcements` · `PATCH /api/admin/users/:id`
