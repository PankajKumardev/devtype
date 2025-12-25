# DevType - Master Your Coding Speed

A typing speed application designed for programmers. Practice typing with real code snippets and improve your WPM and accuracy.

![DevType](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

## Features

- **Real Code Snippets** - Practice with TypeScript, JavaScript, Python, Rust, Go, Java, and C++
- **Multiple Themes** - Dark themes including default, mocha, nord, ocean, and dracula
- **Timed & Practice Modes** - Choose 15s, 30s, 60s timed tests or unlimited practice mode
- **Live WPM Counter** - See your speed in real-time while typing
- **Personal Best Tracking** - Confetti celebration when you beat your record
- **Daily Streak** - Track consecutive days of practice
- **Achievement Badges** - Unlock achievements for speed, accuracy, and consistency
- **Problem Keys** - See which keys you miss most often
- **Leaderboard** - Compete globally with other developers
- **Dashboard** - Track your progress with charts and stats
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js v5 (Google Provider)
- **State Management**: Zustand
- **Charts**: Recharts
- **Confetti**: canvas-confetti

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console account for OAuth

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devtype.git
   cd devtype-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
devtype-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── leaderboard/
│   │   └── scores/
│   ├── dashboard/
│   ├── leaderboard/
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── TestConfig.tsx
│   ├── TypingTest.tsx
│   ├── TypingTestContainer.tsx
│   ├── ResultsModal.tsx
│   └── ThemeSelector.tsx
├── data/
│   └── snippets.json
├── lib/
│   ├── mongodb.ts
│   ├── snippets.ts
│   └── achievements.ts
├── models/
│   ├── User.ts
│   └── Score.ts
├── store/
│   ├── typingStore.ts
│   └── themeStore.ts
└── auth.ts
```

## How to Use

1. Select **timed** or **practice** mode
2. Choose duration (15s, 30s, 60s) for timed mode
3. Pick a language or select "all languages"
4. Click the code area and start typing
5. View results when done
6. Login to save scores to leaderboard

## Keyboard Shortcuts

- **Tab** - Insert 4 spaces
- **Enter** - New line
- **Esc** - Exit test
- **Space** - Resume from pause

## WPM & Accuracy

```
WPM = (Correct Characters / 5) / Minutes
Accuracy = (Correct Keystrokes / Total Keystrokes) × 100%
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Run ESLint

## License

MIT License

---

**Made for developers**
