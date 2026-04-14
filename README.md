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
- [Known Gaps / Notes](#known-gaps--notes)
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

### Get closet by id (current route name uses `imdb`)

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

## Known Gaps / Notes

- Several naming artifacts still reference movie-style terms (`imdb`, `trailer`, `reviewIds`) while domain is closets/coats.
- Frontend and backend payload/field names are not fully aligned in all flows.
- No authentication/authorization is implemented yet.
- Frontend API URL is hardcoded to localhost.

## Troubleshooting

- **Mongo connection issues:** verify `.env` values and network access to your Mongo cluster.
- **CORS issues:** backend currently allows `http://localhost:3000` only.
- **Frontend cannot reach backend:** ensure backend is running on port `8080`.

