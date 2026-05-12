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
- Dedicated Saved flow recovery UX with retry + browse actions on fetch errors
- Recently viewed / continue browsing on Home
- Auth/profile basics (register/login) wired to header actions
- Token-based auth with access + refresh lifecycle (rotation + logout revocation) and guarded routes
- Profile editing (display name/password) for authenticated users
- Search + pagination support with relevance ranking, typo tolerance, and faceted counts
- Toast feedback + skeleton loading states across core screens
- DTO validation + consistent API response envelope for write/auth flows
- REST API with Spring Web + Spring Data MongoDB, CORS enabled for `http://localhost:3000`
- OpenAPI docs (`/swagger-ui/index.html`) and Actuator health/metrics/prometheus
- Request correlation via `X-Request-Id`, structured request logging, and request-level metrics
- Auth and browse domain metrics for core product/auth flows
- GitHub Actions CI quality gates for backend and frontend
- Centralized frontend query/state orchestration for browse/auth/closet data flows
- Legacy route normalization with backward-compatible redirects (`/Trailer/*`, `/Coats/*`)
- Production observability assets: Prometheus alert rules + Grafana dashboard template

### Known current gaps in implementation
- Automated test coverage now includes backend web MVC controller coverage, frontend interaction tests, and browser-level e2e user journeys; broader cross-browser/device matrices remain environment-dependent
- Observability now includes dashboards, SLO burn-rate alerting, and incident-routing templates, but fully managed production rollout (hosted Grafana/Prometheus/Alertmanager + incident integrations) is environment-dependent

### Proposed new features (high-impact, realistic)
- ✅ Full browser e2e coverage (multi-page user journeys + auth/session refresh)
- ✅ Advanced observability operations (SLO burn-rate alerts + incident auto-routing template)

---

## Architecture

### Backend
- Framework: Spring Boot 3.3.0 (Java 17 target)
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
- ✅ Expanded accessibility baseline for keyboard users (skip-to-content, visible focus styles, live-region messaging, focusable main landmark)
- ✅ Improved guided recovery UX in key empty/error states (clear retry/browse actions in Saved and Coats flows)
- Continue accessibility QA depth (contrast audits and broader screen-reader walkthroughs)

---

## Technical / Product Enhancements

- ✅ API contract alignment with DTO validation
- ✅ Closet and coat CRUD completion (including coat note update/delete)
- ✅ Frontend API base URL externalized via env variable fallback
- ✅ Auth/profile basics + favorites persistence
- ✅ API docs (OpenAPI/Swagger)
- ✅ CI quality gates (GitHub Actions backend/frontend checks)
- ✅ Basic analytics event hooks for key UX actions
- ✅ Security maturity baseline (refresh-token rotation + logout revocation + stricter route policy)
- ✅ Search relevance baseline (weighted ranking + typo tolerance + faceted counts)
- ✅ Broader automated test coverage baseline (backend service + frontend interaction tests)
- ✅ Expanded auth/session test coverage (service + controller) and frontend profile interaction tests
- ✅ Request-correlation logging baseline (`X-Request-Id` + structured request logs)
- ✅ Production observability baseline expansion (Prometheus endpoint + request/domain metrics)
- ✅ Added coat-service edge-case tests and saved/favorites frontend interaction tests
- ✅ Expanded integration-depth test coverage (backend web MVC + frontend coat interaction paths)
- ✅ Centralized frontend query/state (React Query equivalent via shared query/state hook and cache)
- ✅ Browser e2e regression coverage for core multi-page journeys and auth refresh flow
- ✅ SLO burn-rate alerting and Alertmanager incident-routing template for production operations
- ⏳ Scaling patterns: search relevance, indexing, caching, advanced observability

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
- ✅ Add basic analytics events for conversion funnels

### Major upgrades (long-term vision)
- ✅ Add authentication/profile basics and saved experiences
- ✅ Domain naming cleanup/migration away from legacy movie-template artifacts
- ✅ Search/filter platform with scalable pagination foundation
- ✅ CI/CD quality gates baseline
- ✅ Broader automated test coverage baseline
- ✅ Observability stack expansion baseline (dashboards/alerting assets + tracing-enriched logging; Prometheus + request/domain metrics baseline is in place)

---

## Tech Stack

### Backend
- Java 17 (project target)
- Spring Boot 3.3.0
- Spring Web
- Spring Data MongoDB
- Micrometer + Prometheus registry
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
- Playwright (browser e2e)
- Postman collection (`closets.postman_collection.json`)
- Observability assets:
  - `observability/prometheus/closet-alerts.yml`
  - `observability/grafana/closet-overview-dashboard.json`
  - `observability/alertmanager/closet-alertmanager-routing.example.yml`

---

## Setup & Development

## Prerequisites
- Java 17 (required by `pom.xml` release target)
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

## Mobile Application (React Native)

### What it does
The `mobile-app` project is an Expo React Native companion app that mirrors the website flows: browse closets, view closet details, watch lookbooks, manage item notes, save favorites, and handle profile/auth actions against the same Java REST APIs.

### Setup Instructions
```bash
cd /home/runner/work/closet/closet/mobile-app
npm install
cp .env.example .env
npx expo start
```

Set the API base URL in `mobile-app/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Implemented Features
- [x] Home flow with closet list and recently viewed section
- [x] Browse flow with search/filter/sort controls
- [x] Closet detail flow with related closets
- [x] Lookbook trailer screen (YouTube embed)
- [x] Item notes CRUD for a closet
- [x] Saved closets flow (auth-protected behavior)
- [x] Profile flow for login/register/update/logout
- [x] Shared Axios API client with bearer-token + refresh handling
- [x] React Navigation stack + tabs with functional components

### New APIs Created
- None. Existing backend endpoints already cover the mobile feature set.

### TODOs / Future Work
- Add richer browse UX parity for facet counts and pagination metadata headers
- Improve mobile media optimization (image placeholders, progressive loading, caching)
- Add deeper offline handling and retry UX across all screens
- Add end-to-end tests for mobile flows (auth, saved, coats CRUD, trailer)
- Add push-notification hooks for future product alerts/recommendations
- Harden secure token storage strategy for production mobile release

Build frontend:
```bash
npm run build
```

Run frontend tests:
```bash
CI=true npm test -- --watchAll=false --passWithNoTests
```

Run browser e2e tests:
```bash
cd closet-client-v1
npx playwright install --with-deps chromium
CI=true npm run test:e2e
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
- `POST /api/v1/auth/refresh` → rotate access/refresh tokens
- `POST /api/v1/auth/logout` → revoke active session
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
│   └── e2e/                             # Playwright browser e2e tests
├── observability/                       # Prometheus/Grafana/Alertmanager assets
├── closets.postman_collection.json
└── README.md
```

## Future Features and Roadmap (User Stories)

> **1) Outfit Planner Calendar**
> As a logged-in user, I want to plan outfits on a calendar so that I can organize what I will wear ahead of time.
>
> **Acceptance Criteria**
> - Users can create, edit, and remove outfit plans for specific dates.
> - An outfit plan can reference one or more closets and clothing items already saved in the app.
> - Planned outfits are shown in both calendar view and a simple upcoming list view.

> **2) Personalized Closet Recommendations**
> As a user, I want personalized closet recommendations so that I can discover styles that better match my preferences.
>
> **Acceptance Criteria**
> - Recommendations are based on user interactions (recently viewed, saved, and filter usage).
> - The home screen displays a dedicated “Recommended for you” section.
> - Recommendations degrade gracefully to popular closets for new users with limited activity.

> **3) Image Upload with Auto-Tagging**
> As a user, I want to upload closet and coat images with suggested tags so that organizing my wardrobe is faster.
>
> **Acceptance Criteria**
> - Users can upload images during closet/clothing-item create and update flows.
> - The system suggests tags (e.g., color, season, style) that users can accept or edit.
> - Uploaded assets are validated for type/size and stored with associated closet/coat records.

> **4) Advanced Search Alerts**
> As a user, I want to save searches and receive alerts for new matching closets so that I do not miss relevant additions.
>
> **Acceptance Criteria**
> - Users can save a search query with active filters (style, season, color, text query).
> - The system checks new/updated closets against saved searches.
> - Users can manage alert preferences (in-app and/or email) from profile settings.

> **5) Closet Sharing & Collaboration**
> As a user, I want to share selected closets with friends or collaborators so that we can plan looks together.
>
> **Acceptance Criteria**
> - Users can generate share links for specific closets with configurable visibility.
> - Users can invite collaborators with view-only or edit permissions.
> - Audit metadata tracks who updated closet details and when.

> **6) Weather-Aware Outfit Suggestions**
> As a user, I want outfit suggestions based on my local weather so that I can choose practical looks faster.
>
> **Acceptance Criteria**
> - Users can enable location-based weather integration in settings.
> - Outfit suggestions adapt to current and forecasted weather conditions.
> - Users can override weather-based recommendations manually.

> **7) Capsule Wardrobe Generator**
> As a user, I want the app to generate a capsule wardrobe from my saved items so that I can simplify daily outfit choices.
>
> **Acceptance Criteria**
> - Users can generate a capsule set by selecting season, style, and item count.
> - The generator balances categories (tops, bottoms, outerwear, shoes, accessories).
> - Users can save, edit, and regenerate capsule sets.

> **8) Outfit History & Rewear Insights**
> As a user, I want to track what I wore and how often so that I can improve wardrobe usage and avoid unused items.
>
> **Acceptance Criteria**
> - Users can log outfits by date from planned or completed looks.
> - The app tracks wear counts per clothing item and shows last-worn metadata.
> - The insights view highlights most-worn and least-worn pieces over configurable date ranges.

> **9) Smart Wardrobe Gap Detection**
> As a user, I want the app to identify missing basics in my closet so that I can shop more intentionally.
>
> **Acceptance Criteria**
> - The app evaluates closet composition against selected style profiles and season needs.
> - Gap suggestions are ranked by expected utility and rewear potential.
> - Users can dismiss suggestions or convert them into wishlist items.

> **10) Size/Fit Profile + Brand Fit Notes**
> As a user, I want to save fit notes by brand/item so that future purchases are more accurate.
>
> **Acceptance Criteria**
> - Users can store body measurements and fit preferences in profile settings.
> - Users can attach brand-specific and item-specific fit notes to closet and wishlist entries.
> - Fit notes are surfaced during save/add flows as contextual guidance.

> **11) Wishlist + Price Drop Tracking**
> As a user, I want to track desired items and receive price-drop alerts so that I can buy at the right time.
>
> **Acceptance Criteria**
> - Users can add and organize wishlist items by category, brand, and priority.
> - Users can set target prices and alert thresholds per item.
> - The app sends alerts when prices drop below configured thresholds.

> **12) Occasion-Based Outfit Builder**
> As a user, I want outfit suggestions by event type (work, travel, formal, casual) so that I can prepare quickly for specific contexts.
>
> **Acceptance Criteria**
> - Users can select an occasion template and optional constraints (weather, dress code, color palette).
> - The builder proposes complete outfits with interchangeable alternatives.
> - Users can save occasion presets for repeat use.

> **13) Packing List Planner (Trip Mode)**
> As a user, I want to build packing lists from my closet so that travel prep is faster and I avoid overpacking.
>
> **Acceptance Criteria**
> - Users can create trip plans with destination, dates, and expected weather.
> - The planner suggests items by outfit count, activities, and laundry access assumptions.
> - Users can track packed status and export/share the packing checklist.

> **14) Community Lookbook / Public Collections**
> As a user, I want to publish selected outfits and browse others’ looks so that I get inspiration.
>
> **Acceptance Criteria**
> - Users can publish outfits with visibility controls and optional tags.
> - Users can browse, search, and filter public lookbooks by style, season, and occasion.
> - Moderation controls exist for reporting and hiding inappropriate content.

> **15) Wardrobe Health Dashboard**
> As a user, I want insights like most-used colors/styles and underused items so that I can optimize my closet decisions.
>
> **Acceptance Criteria**
> - The dashboard shows usage metrics (wear frequency, color distribution, category balance).
> - The dashboard highlights underused items and recommends actionable next looks.
> - Users can view trends over weekly, monthly, and seasonal intervals.
