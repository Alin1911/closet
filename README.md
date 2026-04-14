# Closet

Full-stack project with a **Spring Boot + MongoDB backend** and a **React frontend**.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [How It Works](#how-it-works)
- [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
- [Frontend Setup (React)](#frontend-setup-react)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Run Tests](#run-tests)
- [Missing / Not Implemented Features](#missing--not-implemented-features)
- [Nice-to-have / Future Improvements](#nice-to-have--future-improvements)
- [Troubleshooting](#troubleshooting)

## Project Overview

This repository contains:

- A Java backend that exposes REST endpoints for closets and coats.
- A React client that fetches closet data and renders pages for home, trailer, and coats.
- A Postman collection for basic endpoint testing.

## Tech Stack

### Backend

- Java 22
- Spring Boot 3.3.0
- Spring Web
- Spring Data MongoDB
- Lombok
- Maven Wrapper (`./mvnw`)

### Frontend

- React 18 (Create React App)
- React Router DOM v6
- Axios
- React Bootstrap + Bootstrap
- Material UI (MUI)
- Font Awesome

## Repository Structure

```text
closet/
├── src/                              # Spring Boot backend
│   ├── main/java/dev/closet/closets/
│   │   ├── ClosetController.java
│   │   ├── CoatController.java
│   │   ├── ClosetService.java
│   │   ├── CoatService.java
│   │   ├── ClosetRepository.java
│   │   ├── CoatRepository.java
│   │   ├── Closet.java
│   │   ├── Coat.java
│   │   └── ClosetsApplication.java
│   └── main/resources/
│       ├── application.properties
│       └── .env.example
├── closet-client-v1/                 # React frontend
│   ├── src/
│   │   ├── api/axiosConfig.js
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── closets.postman_collection.json   # Postman requests
├── pom.xml                           # Backend Maven config
└── README.md
```

## How It Works

1. React app runs on `http://localhost:3000`.
2. Frontend calls backend APIs at `http://localhost:8080` using Axios (`closet-client-v1/src/api/axiosConfig.js`).
3. Spring controllers handle requests under `/api/v1/closets`.
4. Services call repositories and MongoTemplate to read/write MongoDB data.
5. JSON responses are returned to the frontend and rendered by React components.

## Backend Setup (Spring Boot)

From repository root:

```bash
cd /home/runner/work/closet/closet
```

1. Ensure Java 22 is installed.
2. Create a `.env` file in:

```text
/home/runner/work/closet/closet/src/main/resources/.env
```

3. Use values from `.env.example`:

```env
APP_NAME=closets
MONGO_DATABASE=your_database
MONGO_USER=your_user
MONGO_PASSWORD=your_password
MONGO_CLUSTER=your_cluster
```

4. Run backend:

```bash
./mvnw spring-boot:run
```

Backend default URL: `http://localhost:8080`

## Frontend Setup (React)

From repository root:

```bash
cd /home/runner/work/closet/closet/closet-client-v1
npm install
npm start
```

Frontend default URL: `http://localhost:3000`

## Environment Variables

### Backend

Defined in `src/main/resources/application.properties`:

- `MONGO_DATABASE`
- `MONGO_USER`
- `MONGO_PASSWORD`
- `MONGO_CLUSTER`

### Frontend

No `.env` usage is configured currently. API base URL is hardcoded in:

```text
closet-client-v1/src/api/axiosConfig.js
```

## API Endpoints

Base path: `/api/v1/closets`

### Get all closets

- **Method:** `GET`
- **Route:** `/api/v1/closets`
- **Controller:** `ClosetController#getAllClosets`

### Get closet by ID (route currently uses `imdb` naming)

- **Method:** `GET`
- **Route:** `/api/v1/closets/imdb/{imdbId}`
- **Controller:** `ClosetController#getClosetByImdbId`

### Create coat

- **Method:** `POST`
- **Route:** `/api/v1/closets`
- **Controller:** `CoatController#createCoat`

> A Postman collection is available at:
> `/home/runner/work/closet/closet/closets.postman_collection.json`

## Run Tests

### Backend tests

```bash
cd /home/runner/work/closet/closet
./mvnw test
```

### Frontend tests

```bash
cd /home/runner/work/closet/closet/closet-client-v1
npm test
```

## Missing / Not Implemented Features

- **Working closet-by-id endpoint contract:** backend route uses `/imdb/{imdbId}` but controller currently expects a path variable named `id`; this can break fetching a single closet by ID.
- **Coat creation payload alignment:** frontend posts `{ body, id }` while backend expects `{ name, description, images }`; coat creation does not match end-to-end contract yet.
- **Closet-linked coat writes from UI:** backend supports adding a coat to a specific closet via `createCoat(..., id)`, but current controller path uses the generic create method and does not attach coats to a closet.
- **Consistent domain naming migration:** multiple frontend/backend fields still use movie terms (`trailerLink`, `backdrops`, `title`, `reviewIds`, `imdb`) instead of closet-domain naming.
- **Auth flows behind header actions:** Login/Register buttons are visible in UI, but no authentication/authorization flow is implemented.
- **Error/loading states in UI:** API calls log to console, but user-facing loading, empty, and failure states are largely missing.

## Nice-to-have / Future Improvements

- **Environment-based frontend API URL** instead of hardcoded `http://localhost:8080`.
- **CRUD completeness** for closets/coats (update/delete endpoints and UI actions).
- **Validation and request schemas** (backend DTO validation + better frontend form validation).
- **Automated API documentation** (Swagger/OpenAPI).
- **Role-based access control** once auth is added.
- **Improved test coverage** (controller/service tests for backend and component/integration tests for frontend).
- **CI workflow for lint/test/build** on pull requests.
- **Pagination/filter/search** for closet listings.

## Troubleshooting

- **Mongo connection issues:** verify `.env` values and network access to your Mongo cluster.
- **CORS issues:** backend currently allows `http://localhost:3000` only.
- **Frontend cannot reach backend:** ensure backend is running on port `8080`.
