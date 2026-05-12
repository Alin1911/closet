# Closet Mobile App (Expo + React Native)

Companion mobile app for the Closet platform. It mirrors core web flows by using the same Java REST API:
- Home and browse closets
- Closet details and lookbook trailer playback
- Closet item notes CRUD
- Saved closets/favorites
- Login/register/profile update/logout

## Setup

```bash
cd /home/runner/work/closet/closet/mobile-app
npm install
cp .env.example .env
npx expo start
```

Set API URL in `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

## Structure

- `screens/` mobile screens (home, browse, saved, profile, detail, coats, trailer)
- `components/` shared UI components
- `services/api/` axios client + API calls
- `navigation/` React Navigation stack + tabs
- `context/` shared app/auth/data state orchestration
