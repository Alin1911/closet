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
- Browse all closets from MongoDB-backed API (`GET /api/v1/closets`)
- Hero carousel UI for featured closet records
- Navigate to a trailer/video screen per closet
- Navigate to a coats screen per closet
- Submit new coat entries from UI (create endpoint exists)
- REST API with Spring Web + Spring Data MongoDB
- CORS enabled for local frontend (`http://localhost:3000`)

### Known current gaps in implementation
- Domain naming is partially inherited from a movie template (`imdb`, `trailerLink`, `backdrops`, `title`, `reviewIds`)
- Coat creation contract is inconsistent between frontend payload and backend model
- Header includes `Login` / `Register` actions but no auth flow
- Limited loading, empty, and error states in UI
- Broken/unused navigation path (`/closets`) in header

### Proposed new features (high-impact, realistic)
- **[Proposed] Smart filtering and sorting** (style, season, color, newest) to improve discovery and conversion
- **[Proposed] Saved closets / favorites** to increase retention and repeat sessions
- **[Proposed] Recently viewed + continue browsing** to improve engagement
- **[Proposed] Closet detail page** with complete metadata, related closets, and clear next actions
- **[Proposed] Editable coat notes** (create/update/delete) for practical utility
- **[Proposed] Auth + profile basics** (email/password + saved lists) behind existing header CTAs

---

## Architecture

### Backend
- Framework: Spring Boot 3.3.0 (Java 22 target)
- Modules:
  - Controllers: `ClosetController`, `CoatController`
  - Services: `ClosetService`, `CoatService`
  - Repositories: `ClosetRepository`, `CoatRepository`
  - Domain models: `Closet`, `Coat`
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
  - Header/navigation
  - Home + Hero carousel
  - Trailer screen
  - Coats screen + coat form

### Communication model
- Frontend calls backend REST endpoints via Axios (`http://localhost:8080` hardcoded today)
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

### 3) View and add coats
1. User clicks `Coats` on a closet card
2. App fetches closet-specific data
3. User submits coat text in form
4. Frontend posts to coat creation endpoint
5. UI appends new entry to local list

---

## UX / UI Improvement Opportunities

### Navigation and structure
- Replace broken `/closets` nav link with a valid route (or add real listing page)
- Add consistent top-level IA: Home, Browse, Saved, Profile
- Add breadcrumb/back actions on detail screens

### Clarity of actions and flows
- Replace ambiguous labels (`Coats`, `Trailer`) with clearer CTA copy (`View items`, `Watch lookbook`)
- Add explicit primary CTA per screen and secondary actions below fold
- Add success/error feedback for form submission

### Visual hierarchy
- Standardize card typography and spacing tokens
- Improve contrast and text overlays on carousel backgrounds
- Add skeleton/loading states and empty-state cards

### Mobile experience
- Reduce hero height and CTA crowding on small screens
- Increase touch target sizes for play and coat actions
- Make coats form and list vertically optimized with sticky submit area

---

## Technical / Product Enhancements

- Align API contracts with frontend payloads using DTOs + validation
- Complete CRUD for closets/coats and align route naming to closet domain
- Introduce centralized frontend state/query handling (React Query or equivalent)
- Externalize frontend API base URL via environment variables
- Add API docs (OpenAPI/Swagger)
- Add CI pipeline for backend tests + frontend build/test checks
- Improve test strategy: controller/service tests, component tests, and key user-flow tests
- Prepare scaling patterns: pagination, search indexing, response caching, and observability

---

## Improvements Roadmap

### Quick wins (low effort, high impact)
- Fix broken/unused routes and rename unclear CTAs
- Add loading/empty/error UI states for core API calls
- Move frontend API URL to env config
- Align coat payload shape between frontend and backend
- Improve mobile spacing/CTA tap targets in hero and coats screens

### Medium improvements
- Add favorites and recently viewed
- Implement closet detail page with richer metadata
- Introduce DTO validation and consistent API response structure
- Add update/delete operations for coats
- Add basic analytics events for conversion funnels

### Major upgrades (long-term vision)
- Add authentication, profiles, and saved experiences
- Domain naming cleanup/migration away from movie-template fields
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

Base path: `/api/v1/closets`

- `GET /api/v1/closets` → list closets
- `GET /api/v1/closets/imdb/{imdbId}` → get single closet (legacy route naming)
- `POST /api/v1/closets` → create coat (current implementation)

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
