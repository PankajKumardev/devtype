# DevType - Master Your Coding Speed

A typing speed application designed for programmers. Practice typing with real code snippets and improve your WPM and accuracy.

[![GitHub stars](https://img.shields.io/github/stars/pankajkumardev/devtype?style=social)](https://github.com/pankajkumardev/devtype)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

🔗 **Live Demo:** [devtype.pankajk.tech](https://devtype.pankajk.tech)

## Features

### Core Features
- **Real Code Snippets** - Practice with TypeScript, JavaScript, Python, Rust, Go, Java, C#, and C++
- **Multiple Themes** - Dark and light themes (default, mocha, nord, ocean, forest, sunset)
- **Timed & Practice Modes** - Choose 15s, 30s, 60s, 120s, or custom duration; unlimited practice mode
- **Live WPM Counter** - Real-time speed tracking with error penalty
- **Smart WPM Calculation** - WPM = (Correct Chars - Errors) / 5 / Minutes (prevents spam)

### Progress Tracking
- **Personal Best Tracking** - Confetti celebration when you beat your record
- **Daily Streak** - Track consecutive days of practice
- **Achievement Badges** - Unlock achievements for speed, accuracy, and consistency
- **Problem Keys** - See which keys you miss most often
- **Progress Charts** - Visualize your improvement over time

### Competitive Features
- **Global Leaderboard** - Compete with developers worldwide
- **Weighted Scoring** - Ranks by WPM × Accuracy (both matter!)
- **Per-Language Rankings** - Separate leaderboards for each language
- **Anti-Spam Protection** - Minimum 70% accuracy required, prevents random key mashing

### User Experience
- **Smooth Caret** - Animated cursor that glides smoothly between characters
- **Instant Loading** - Smart caching makes pages load instantly
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Keyboard Shortcuts** - Tab, Enter, Esc for efficient navigation
- **Restart Mid-Test** - Restart button to get a new snippet anytime
- **Skeleton Loaders** - Smooth loading experience
- **Toast Notifications** - Clean UI feedback for actions

### Results & Analytics
- **MonkeyType-Style Results** - Beautiful results modal with WPM graph
- **Typing Replay** - Watch your typing session playback with variable speed
- **Copy Results Image** - Share your results as an image on social media
- **Export Data** - Download your typing history as JSON or CSV
- **WPM History Graph** - Live WPM + Raw WPM chart with error markers

### SEO & PWA
- **Meta Tags** - Complete SEO with Open Graph and Twitter cards
- **Dynamic OG Images** - Auto-generated social preview images
- **Sitemap & Robots.txt** - Full search engine optimization
- **PWA Manifest** - Installable as a progressive web app

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js v5 (Google Provider)
- **State Management**: Zustand (with smart caching)
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
   git clone https://github.com/pankajkumardev/devtype.git
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
│   ├── opengraph-image.tsx    # Dynamic OG image generation
│   ├── twitter-image.tsx       # Twitter card generation
│   ├── sitemap.ts              # SEO sitemap
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── TestConfig.tsx
│   ├── TypingTest.tsx
│   ├── TypingTestContainer.tsx
│   ├── ResultsModal.tsx
│   ├── ThemeSelector.tsx
│   └── Skeletons.tsx           # Loading skeletons
├── data/
│   └── snippets.json           # 140 code snippets
├── lib/
│   ├── mongodb.ts
│   ├── snippets.ts
│   └── achievements.ts
├── models/
│   ├── User.ts
│   └── Score.ts
├── store/
│   ├── typingStore.ts
│   ├── themeStore.ts
│   └── dataCacheStore.ts       # Smart caching
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── site.webmanifest
└── auth.ts
```

## How to Use

1. Select **timed** or **practice** mode
2. Choose duration (15s, 30s, 60s, 120s, or custom) for timed mode
3. Pick a programming language (TypeScript, JavaScript, Python, Rust, Go, Java, C++)
4. Click the code area and start typing
5. View results when done
6. Login to save scores to leaderboard

## Keyboard Shortcuts

- **Tab** - Focus restart button (like MonkeyType)
- **Tab + Enter** - Restart test with new snippet
- **Enter** - New line with auto-indentation
- **Esc** - Exit test / Return to typing
- **Space** - Resume from pause

## WPM & Accuracy

```
Net Characters = Correct Characters - Incorrect Characters
WPM = (Net Characters / 5) / Minutes
Accuracy = (Correct Keystrokes / Total Keystrokes) × 100%
Weighted Score = WPM × (Accuracy / 100)
```

**Anti-Spam**: Wrong characters reduce your WPM! This prevents random key mashing.

## Performance Features

### Smart Caching
- **Dashboard & Leaderboard** cache data for 1 minute
- **Instant Loading** - Pages open immediately with cached data
- **Background Refresh** - Stale data updates silently
- **Auto-Invalidation** - Cache clears when you add a new score

See [CACHING.md](./CACHING.md) for technical details.

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

---

**Made for developers by [Pankaj Kumar](https://github.com/pankajkumardev)**
