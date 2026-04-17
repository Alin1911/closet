# Closet

A full-stack web app for discovering closets, exploring visual details, and managing coats.

## Project Overview

Closet combines a Spring Boot API and a React client to present closet items in a visual browsing experience (carousel + detail screens).

### Target users
- Style-conscious users browsing curated closet collections
- Users who want quick visual exploration and item notes
- Early-stage product teams validating wardrobe-inspired experiences

### Key value proposition
- Simple browse-first experience
- Fast transition from discovery to detail (coats/trailer screens)
- Lightweight full-stack foundation that can evolve into a richer commerce/community product

---

## Current Features

### Implemented today
- Browse closets from MongoDB-backed API with server-side filtering/sorting (`style`, `season`, `color`, `sort`)
- Hero carousel + dedicated Browse experience
- Closet detail page with metadata, related closets, and clear next actions
- Trailer/watch lookbook screen per closet
- Coat notes management: create, update, delete
- Saved closets/favorites per user profile
- Recently viewed / continue browsing on Home
- Auth/profile basics (register/login) wired to header actions
- Token-based auth sessions with guarded routes for saved/profile/favorites and write APIs
- Profile editing (display name/password) for authenticated users
- Search + pagination support for closets API and browse UI
- Toast feedback + skeleton loading states across core screens
- DTO validation + consistent API response envelope for write/auth flows
- REST API with Spring Web + Spring Data MongoDB, CORS enabled for `http://localhost:3000`
- OpenAPI docs (`/swagger-ui/index.html`) and Actuator health/metrics
- GitHub Actions CI quality gates for backend and frontend

### Known current gaps in implementation
- Automated test coverage is still limited (especially backend controller/service tests)
- Search ranking and relevance scoring are still basic

### Proposed new features (high-impact, realistic)
- **[Next] Auth hardening** (token/session, guarded routes, profile editing)
- **[Next] API docs and CI quality gates**
- **[Next] Search + pagination for larger datasets**
- **[Next] Observability and analytics**

---

## Architecture

### Backend
- Framework: Spring Boot 3.3.0 (Java 22 target)
- Modules:
  - Controllers: `ClosetController`, `CoatController`, `AuthController`
  - Services: `ClosetService`, `CoatService`, `AuthService`
  - Repositories: `ClosetRepository`, `CoatRepository`, `UserRepository`
  - Domain models: `Closet`, `Coat`, `UserProfile`
  - Validation and response DTOs for closet/coat/auth payloads
- Data store: MongoDB Atlas (configured via env vars)
- Config:
  - `src/main/resources/application.properties`
  - `spring-dotenv` loads `.env` style values

### Frontend
- Framework: React 18 (Create React App)
- Routing: `react-router-dom` v6
- UI: React Bootstrap + Bootstrap + MUI + Font Awesome
- HTTP client: Axios (`src/api/axiosConfig.js`)
- Main screens/components:
  - Home + Hero + continue browsing
  - Browse (filter/sort)
  - Closet detail
  - Coats screen + coat note CRUD
  - Saved closets
  - Profile (login/register)
  - Trailer screen

### Communication model
- Frontend calls backend REST endpoints via Axios (`REACT_APP_API_BASE_URL` with localhost fallback)
- Backend serves JSON resources from `/api/v1/closets`
- Services mediate controller ↔ repository/database interactions

---

## User Flows

### 1) Discover closets
1. User lands on Home
2. Frontend fetches all closets
3. Hero carousel renders each closet card

### 2) Watch closet video
1. User clicks play icon on a closet card
2. App routes to trailer screen
3. Embedded YouTube player loads selected video

### 3) View and manage coat notes
1. User clicks `View items` on a closet card/detail page
2. App fetches closet-specific data
3. User submits note text in form
4. Frontend calls nested coat-note endpoints
5. User can edit/delete notes inline

### 4) Save favorites
1. User registers or logs in from Profile page
2. User saves/removes closets from Browse/Home/Detail
3. Saved closets appear under the `Saved` route

### 5) Continue browsing
1. User opens closet detail/coats
2. App stores recently viewed closet IDs locally
3. Home displays `Continue browsing` cards

---

## UX / UI Improvement Opportunities

Most high-impact quick wins are implemented (IA, CTA clarity, basic loading/error/empty handling, mobile touch targets).

Next UX opportunities:
- Add skeleton states instead of text-only loading states
- Add toasts/snackbars for save/update/delete feedback consistency
- Improve browse filter discoverability and reset controls

---

## Technical / Product Enhancements

- ✅ API contract alignment with DTO validation
- ✅ Closet and coat CRUD completion (including coat note update/delete)
- ✅ Frontend API base URL externalized via env variable fallback
- ✅ Auth/profile basics + favorites persistence
- ⏳ Centralized frontend query/state (React Query or equivalent)
- ⏳ API docs (OpenAPI/Swagger)
- ⏳ CI quality gates and broader automated tests
- ⏳ Scaling patterns: pagination, search indexing, caching, observability

---

## Improvements Roadmap

### Quick wins (low effort, high impact)
- ✅ Fix broken/unused routes and rename unclear CTAs
- ✅ Add loading/empty/error UI states for core API calls
- ✅ Move frontend API URL to env config
- ✅ Align coat payload shape between frontend and backend
- ✅ Improve mobile spacing/CTA tap targets in hero and coats screens

### Medium improvements
- ✅ Add favorites and recently viewed
- ✅ Implement closet detail page with richer metadata
- ✅ Introduce DTO validation and consistent API response structure
- ✅ Add update/delete operations for coats
- ⏳ Add basic analytics events for conversion funnels

### Major upgrades (long-term vision)
- ✅ Add authentication/profile basics and saved experiences
- ⏳ Domain naming cleanup/migration away from legacy movie-template artifacts
- Search/filter platform with scalable pagination and ranking
- CI/CD with quality gates and broader automated test coverage
- Observability stack (structured logs, metrics, tracing)

---

## Tech Stack

### Backend
- Java 22 (project target)
- Spring Boot 3.3.0
- Spring Web
- Spring Data MongoDB
- MongoDB Atlas
- Lombok
- spring-dotenv
- Maven Wrapper

### Frontend
- React 18 (CRA)
- React Router DOM 6
- Axios
- React Bootstrap + Bootstrap
- MUI
- Font Awesome
- React Player
- React Material UI Carousel

### Tooling
- Maven
- npm
- Postman collection (`closets.postman_collection.json`)

---

## Setup & Development

## Prerequisites
- Java 22 (required by `pom.xml` release target)
- Node.js + npm
- MongoDB Atlas (or compatible MongoDB instance)

### 1) Backend setup
```bash
cd /home/runner/work/closet/closet
cp src/main/resources/.env.example src/main/resources/.env
```

Fill `src/main/resources/.env`:
```env
APP_NAME=closets
MONGO_DATABASE=your_database
MONGO_USER=your_user
MONGO_PASSWORD=your_password
MONGO_CLUSTER=your_cluster
```

Run backend:
```bash
./mvnw spring-boot:run
```

Run backend tests:
```bash
./mvnw test
```

### 2) Frontend setup
```bash
cd /home/runner/work/closet/closet/closet-client-v1
npm install
npm start
```

Build frontend:
```bash
npm run build
```

Run frontend tests:
```bash
CI=true npm test -- --watchAll=false --passWithNoTests
```

### Default local URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

---

## API Snapshot

Closets:
- `GET /api/v1/closets` → list closets (`style`, `season`, `color`, `sort`, `q`, `page`, `size` query params supported)
- `GET /api/v1/closets/{id}` → get single closet
- `GET /api/v1/closets/imdb/{imdbId}` → legacy get-by-id route kept for compatibility
- `POST /api/v1/closets` → create closet
- `PUT /api/v1/closets/{id}` → update closet
- `DELETE /api/v1/closets/{id}` → delete closet

Coat notes:
- `GET /api/v1/closets/{closetId}/coats` → list coat notes for closet
- `POST /api/v1/closets/{closetId}/coats` → create coat note
- `PUT /api/v1/closets/{closetId}/coats/{coatId}` → update coat note
- `DELETE /api/v1/closets/{closetId}/coats/{coatId}` → delete coat note

Auth/profile + favorites:
- `POST /api/v1/auth/register` → register user
- `POST /api/v1/auth/login` → login user
- `PUT /api/v1/users/{userId}/profile` → update display name/password (auth required)
- `GET /api/v1/users/{userId}/favorites` → list saved closets
- `PUT /api/v1/users/{userId}/favorites/{closetId}` → save closet
- `DELETE /api/v1/users/{userId}/favorites/{closetId}` → remove saved closet

Protected API calls require: `Authorization: Bearer <token>`

---

## Repository Structure

```text
closet/
├── src/main/java/dev/closet/closets/   # Spring Boot backend
├── src/main/resources/                  # Backend config
├── src/test/java/dev/closet/closets/   # Backend tests
├── closet-client-v1/                    # React frontend
├── closets.postman_collection.json
└── README.md
```
