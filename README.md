# Repstack - Open Source Hypertrophy Training Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Vision

Repstack is an open source alternative to commercial hypertrophy training applications, inspired by evidence-based training principles from Renaissance Periodization. Our mission is to make scientifically-backed muscle building programs accessible to everyone, completely free.

## 🚀 Project Goals

- **Open Source & Free**: Core functionality will always remain free and open source
- **Progressive Web App**: Runs seamlessly on all platforms (iOS, Android, Desktop, Web)
- **Science-Based**: Built on proven hypertrophy training principles
- **Privacy-First**: Your training data stays with you - works offline
- **Community-Driven**: Built by lifters, for lifters

## ✨ Features

### Phase 1: Core Training Engine ✅
- [x] Personalized training program generator
- [x] Auto-regulation based on user feedback (pump, soreness, recovery)
- [x] Progressive overload tracking
- [x] Mesocycle management (4-6 week training blocks)
- [x] Deload week scheduling
- [x] Exercise library with user-created exercises and categories (machine, barbell, dumbbell, bodyweight, cable)

### Phase 2: Enhanced Experience ✅
- [x] Workout logging and history
- [x] Progress tracking and analytics (1RM, volume, personal records)
- [x] Custom exercise creation
- [x] Template library (programs for upper/lower, push/pull/legs, full body splits)
- [x] Volume landmarks and recovery indicators
- [ ] Exercise substitution recommendations

### Phase 3: Advanced Features ✅
- [x] Offline-first PWA capabilities
- [x] Data export/import
- [x] Training insights and visualizations
- [x] Multiple training styles (hypertrophy, strength, hybrid)
- [x] Equipment-based program filtering
- [x] Mobile and desktop responsive design

### Future: SaaS Layer (Optional, Paid)
- Premium coaching features
- Advanced analytics
- Team/coach management
- Cloud sync across devices
- Community features and challenges

**Note:** The core application will always remain open source and free. SaaS features will be optional add-ons.

## 🛠️ Technology Stack

**Framework & Build:**
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast dev server and build tool

**PWA Capabilities:**
- **vite-plugin-pwa** - PWA configuration and service worker generation
- **Workbox** - Service worker management
- **IndexedDB** - Local data storage via Dexie.js

**Code Quality:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Type checking

## 💻 Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wulfland/Repstack.git
   cd Repstack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest (watch mode)
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright

### PWA Features

The app includes full Progressive Web App capabilities:

- ✅ **Offline Support** - Service Workers cache assets for offline use
- ✅ **Installable** - Can be installed on any device (iOS, Android, Desktop)
- ✅ **Local Storage** - IndexedDB stores user data locally
- ✅ **Responsive** - Mobile-first design that works on all screen sizes
- ✅ **Fast** - Optimized build with code splitting

📖 **[Complete Offline Functionality Guide](docs/OFFLINE_FUNCTIONALITY.md)** - Learn how Repstack works 100% offline

### Testing PWA Features

**Local Development:**
- PWA features are enabled in development mode
- Service Worker registers automatically
- Test offline mode by stopping the dev server after initial load

**Production Build:**
```bash
npm run build
npm run preview
```
Then open in your browser and test:
1. Install the app (look for install prompt)
2. Go offline (DevTools → Network → Offline)
3. App should still work

### Project Structure

```
Repstack/
├── public/              # Static assets
│   ├── pwa-192x192.png  # PWA icon (192x192)
│   ├── pwa-512x512.png  # PWA icon (512x512)
│   ├── apple-touch-icon.png  # iOS home screen icon
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/      # Feature UI components
│   │   ├── common/      # Shared UI (toasts, dialogs)
│   │   ├── exercises/   # Exercise library management
│   │   ├── mesocycles/  # Mesocycle/program management
│   │   ├── onboarding/  # First-time setup wizard
│   │   ├── progress/    # Progress tracking & analytics
│   │   ├── settings/    # App settings
│   │   ├── templates/   # Pre-built training templates
│   │   └── workouts/    # Workout session logging
│   ├── layouts/         # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── db/              # IndexedDB database setup (Dexie)
│   ├── lib/             # Utility functions and algorithms
│   ├── types/           # TypeScript type definitions
│   ├── test/            # Test utilities and helpers
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global CSS
├── e2e/                 # Playwright end-to-end tests
├── docs/                # Documentation
├── screenshots/         # App screenshots
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── .prettierrc          # Prettier configuration
```

### Database Schema

The app uses IndexedDB (via Dexie.js) with the following tables:

- **users** - User profiles and preferences (experience level, units, theme)
- **exercises** - Exercise library (user-created and built-in starter exercises)
- **workouts** - Workout logs with sets, reps, and weights
- **workoutSets** - Individual sets with reps, weight, and RIR data
- **trainingSessions** - Auto-regulation feedback (pump, soreness, fatigue ratings)
- **mesocycles** - Training blocks (4-6 week programs with split configuration)

See `src/db/index.ts` for the complete schema and `src/types/models.ts` for TypeScript interfaces.

### Performance Targets

- ⚡ Initial load: < 3 seconds on 3G
- ⚡ Time to interactive: < 5 seconds
- 📦 Bundle size: Optimized for mobile
- 🚀 Lighthouse score: 90+ across all metrics

## 📋 Project Status

**Current Phase:** ✅ Core Application Complete → 🚀 Refining & Expanding

The core application is fully functional with:
- ✅ React + TypeScript + Vite
- ✅ PWA capabilities (offline, installable)
- ✅ IndexedDB for local storage (Dexie.js)
- ✅ Responsive mobile-first layout
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Production build pipeline
- ✅ Unit tests (Vitest) and E2E tests (Playwright)
- ✅ Onboarding wizard for new users
- ✅ Exercise library with starter exercises
- ✅ Workout session logging with auto-save
- ✅ Mesocycle planning with split configuration
- ✅ Progress tracking with 1RM calculations and personal records
- ✅ Auto-regulation (pump, soreness, fatigue feedback)
- ✅ Pre-built training program templates
- ✅ Data export/import for portability
- ✅ Dark/light/system theme support
- ✅ Accessibility (WCAG 2.1 AA compliance)

**Next Steps:**
- Exercise substitution recommendations
- Advanced analytics and visualizations
- Optional cloud sync (SaaS layer)

## 🤝 Contributing

We welcome contributions! This project is in early stages, but we're excited to build this together with the community.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

### How You Can Help

- **Requirements Definition**: Help us define features and user stories
- **Design & UX**: Design mockups and user flows
- **Development**: Code contributions once architecture is defined
- **Testing**: Test the app and provide feedback
- **Documentation**: Improve docs and create tutorials
- **Exercise Content**: Contribute exercise descriptions and form cues

## 📖 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture decisions and data flow
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/OFFLINE_FUNCTIONALITY.md](docs/OFFLINE_FUNCTIONALITY.md) - How offline mode works
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) - Accessibility implementation details
- [docs/TESTING.md](docs/TESTING.md) - Testing strategy and how to run tests

## 🎓 Learning Resources

Interested in the science behind the app? Check out:

- [Renaissance Periodization YouTube Channel](https://www.youtube.com/c/RenaissancePeriodization)
- [Hypertrophy Training Principles](https://rpstrength.com/expert-advice)
- [Progressive Overload Explained](https://rpstrength.com/blogs/articles/progressive-overload)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This means:
- ✅ Free to use, modify, and distribute
- ✅ Can be used in commercial projects
- ✅ Can be used to create derivative works
- ⚠️ Provided "as is" without warranty

## 🔮 Project Roadmap

1. **Phase 1 (Complete)**: Core training engine — workout logging, exercise library, mesocycle planning
2. **Phase 2 (Complete)**: Progress tracking — analytics, 1RM calculations, personal records, templates
3. **Phase 3 (Complete)**: PWA features — offline support, installable, data export/import
4. **Phase 4 (In Progress)**: Polish & expand — exercise substitutions, advanced analytics, optional cloud sync

## 💬 Community & Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Contributing**: See CONTRIBUTING.md for contribution guidelines

## 🙏 Acknowledgments

This project is inspired by the work of:
- Dr. Mike Israetel and the Renaissance Periodization team
- The open source fitness community
- Evidence-based training research

**Disclaimer**: This is an independent open source project and is not affiliated with or endorsed by Renaissance Periodization.

---

**Built with ❤️ by the open source fitness community**