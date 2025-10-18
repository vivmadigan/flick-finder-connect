# CineMatch - Premium Cinema Dating App

A sophisticated web application for matching movie enthusiasts based on shared cinematic taste.

## Features

- 🎬 **Movie Discovery**: Swipe through curated films matching your preferences
- 💫 **Smart Matching**: Connect with users who share your movie taste
- 💬 **Private Chat**: Plan your movie date together
- 🎨 **Premium Design**: Elegant bokeh aesthetics with cinematic feel

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **Animation**: Framer Motion
- **API**: Axios (configured for ASP.NET Web API)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

Visit `http://localhost:8080`

### Build

```bash
npm run build
```

### Testing

```bash
npx playwright install
npx playwright test
```

## Connecting to Your ASP.NET Web API

All API calls are currently mocked. To connect your backend:

1. **Set API URL**: Update `VITE_API_BASE_URL` in `.env`

2. **Review Service Files**:
   - `src/lib/services/AuthService.ts` - Authentication endpoints
   - `src/lib/services/MoviesService.ts` - Movie data endpoints
   - `src/lib/services/MatchService.ts` - Matching logic
   - `src/lib/services/ChatService.ts` - Real-time chat (SignalR)

3. **Implement Endpoints**:
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/movies` - Get movies with filters
   - `POST /api/movies/like` - Like a movie
   - `POST /api/matches/find` - Find matches
   - `POST /api/matches/respond` - Accept/reject match
   - SignalR Hub at `/api/chat` - Real-time messaging

Each service file has detailed TODO comments with expected request/response formats.

## Project Structure

```
src/
├── components/          # Shared UI components
├── features/           # Feature-specific components
│   ├── auth/
│   ├── onboarding/
│   ├── discover/
│   ├── match/
│   ├── chat/
│   └── profile/
├── context/            # React contexts
├── lib/
│   ├── api.ts         # Axios configuration
│   └── services/      # API service layer
├── pages/             # Route pages
└── types/             # TypeScript types

## Design System

The app uses a premium cinema-inspired design with:

- **Colors**: Ink Black, Night Teal, Marquee Gold, Electric Cyan
- **Typography**: DM Serif Display (headings) + Inter (UI)
- **Effects**: Bokeh blur, film grain, glass morphism
- **Motion**: Framer Motion with reduced-motion support

All design tokens are defined in:
- `src/index.css` - CSS variables and global styles
- `tailwind.config.ts` - Tailwind theme extensions

## License

MIT
