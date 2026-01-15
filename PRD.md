# Product Requirements Document: Zai Game Client

**Document Version:** 1.0  
**Date:** January 12, 2026  
**Target Framework:** Next.js 16 (App Router)  
**Status:** Final Specification

---

## Executive Summary

This document constitutes the comprehensive technical specification for the Zai Game Client, a high-performance, offline-first progressive web application engineered to deliver console-quality gaming experiences through modern web technologies. The client implements a sophisticated local-first architecture wherein all game state, user data, and media assets persist within browser-native storage mechanisms, enabling seamless offline gameplay and instantaneous application responsiveness.

The visual design philosophy draws inspiration from premium racing franchises such as Asphalt Legends, employing dynamic particle systems, fluid animations, glassmorphic UI components, and immersive audio landscapes to create an engagement profile that rivals native mobile applications. The application shall operate as a fully installable Progressive Web Application (PWA), providing users with icon-based home screen access, push notification capabilities, and offline functionality indistinguishable from platform-native implementations.

Central to the architectural approach lies the commitment to zero-latency interactions through aggressive client-side prediction, optimistic UI updates, and intelligent background synchronization. The client maintains authoritative game state locally within IndexedDB, synchronizing with the remote server only when network connectivity permits, thereby ensuring that network instability never compromises the user experience.

---

## Table of Contents

1. [Technical Architecture](#1-technical-architecture)
2. [Technology Stack Specification](#2-technology-stack-specification)
3. [Visual Design System](#3-visual-design-system)
4. [Offline-First Architecture](#4-offline-first-architecture)
5. [Game Rendering Engine](#5-game-rendering-engine)
6. [Audio System](#6-audio-system)
7. [State Management](#7-state-management)
8. [API Integration Layer](#8-api-integration-layer)
9. [Progressive Web App Implementation](#9-progressive-web-app-implementation)
10. [Performance Requirements](#10-performance-requirements)
11. [Component Architecture](#11-component-architecture)
12. [Animation System](#12-animation-system)
13. [Accessibility Requirements](#13-accessibility-requirements)
14. [Security Implementation](#14-security-implementation)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment Workflow](#16-deployment-workflow)

---

## 1. Technical Architecture

### 1.1 Architectural Philosophy

The client architecture embodies three foundational principles that govern all implementation decisions:

**First Principle: Local-First Sovereignty**

The application treats the local device as the source of truth for all user-generated data and game state. Network synchronization occurs as a background process that enhances rather than enables functionality. Users experience instantaneous interactions regardless of connectivity status, with the system intelligently reconciling local changes with server state when connections restore.

This approach necessitates sophisticated conflict resolution mechanisms, optimistic update patterns, and comprehensive offline capabilities that extend beyond mere data caching to encompass full application functionality including AI opponent gameplay, move validation, and game state progression.

**Second Principle: Performance as User Experience**

Performance characteristics directly constitute user experience rather than serving as technical metrics. The application targets 60 frames per second for all animations, sub-100ms response times for all interactions, and instantaneous perceived load times through intelligent preloading and code splitting strategies.

Visual feedback occurs within 16 milliseconds of user input (single frame at 60fps), establishing immediate responsiveness that builds user confidence and engagement. Network operations execute asynchronously with optimistic UI updates, ensuring that backend latency never manifests as frontend sluggishness.

**Third Principle: Progressive Enhancement Through Modern APIs**

The application leverages cutting-edge web platform capabilities while maintaining graceful degradation pathways. Features such as Canvas-based game rendering, Web Audio API spatial sound, IndexedDB persistent storage, Service Worker offline functionality, and Web Share API social integration enhance the experience on capable devices while ensuring core functionality remains accessible on constrained platforms.

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZAI GAME CLIENT (PWA)                         │
│                      Next.js 16 Application                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Presentation Layer (React)                 │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │    Route     │  │   Layout     │  │   Page       │ │    │
│  │  │  Components  │  │  Components  │  │  Components  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │         │                  │                  │         │    │
│  │         └──────────────────┼──────────────────┘         │    │
│  │                            ↓                            │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │         UI Component Library (shadcn/ui)        │   │    │
│  │  │  • Glassmorphic cards                           │   │    │
│  │  │  • Animated buttons                             │   │    │
│  │  │  • Modal dialogs                                │   │    │
│  │  │  • Form controls                                │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          Business Logic Layer (Hooks/Services)          │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  useGame     │  │  useAuth     │  │useMatchmaking│ │    │
│  │  │   Hook       │  │   Hook       │  │    Hook      │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │ GameService  │  │AuthService   │  │  APIService  │ │    │
│  │  │ (zai_engine) │  │ (JWT/tokens) │  │ (REST/WS)    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            State Management Layer (Zustand)             │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  Game Store  │  │  User Store  │  │  UI Store    │ │    │
│  │  │              │  │              │  │              │ │    │
│  │  │ • Active     │  │ • Auth state │  │ • Theme      │ │    │
│  │  │   games      │  │ • Profile    │  │ • Modals     │ │    │
│  │  │ • Board      │  │ • Settings   │  │ • Toasts     │ │    │
│  │  │   state      │  │              │  │              │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │     Persistence Middleware (IndexedDB Sync)     │   │    │
│  │  │  • Auto-save on state changes                   │   │    │
│  │  │  • Conflict resolution                          │   │    │
│  │  │  • Background sync queue                        │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Data Access Layer                          │    │
│  │                                                          │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐   │    │
│  │  │   IndexedDB Manager  │  │   Cache Manager      │   │    │
│  │  │                      │  │                      │   │    │
│  │  │ Stores:              │  │ • Static assets      │   │    │
│  │  │ • users              │  │ • API responses      │   │    │
│  │  │ • games              │  │ • Media files        │   │    │
│  │  │ • moves              │  │                      │   │    │
│  │  │ • settings           │  │                      │   │    │
│  │  │ • sync_queue         │  │                      │   │    │
│  │  └──────────────────────┘  └──────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            Rendering & Media Layer                      │    │
│  │                                                          │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐   │    │
│  │  │  Canvas Renderer     │  │  Audio Engine        │   │    │
│  │  │                      │  │                      │   │    │
│  │  │ • Hexagonal grid     │  │ • Sound effects      │   │    │
│  │  │ • Stone animations   │  │ • Background music   │   │    │
│  │  │ • Particle effects   │  │ • Spatial audio      │   │    │
│  │  │ • Win animations     │  │ • Dynamic mixing     │   │    │
│  │  └──────────────────────┘  └──────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          Network Layer (API Integration)                │    │
│  │                                                          │    │
│  │  ┌──────────────────────┐  ┌──────────────────────┐   │    │
│  │  │   REST API Client    │  │  WebSocket Manager   │   │    │
│  │  │                      │  │                      │   │    │
│  │  │ • Fetch wrapper      │  │ • Connection pool    │   │    │
│  │  │ • Auto-retry         │  │ • Reconnection logic │   │    │
│  │  │ • Token refresh      │  │ • Message queue      │   │    │
│  │  │ • Request queue      │  │ • Heartbeat system   │   │    │
│  │  └──────────────────────┘  └──────────────────────┘   │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │        Sync Engine (Background Sync)            │   │    │
│  │  │  • Optimistic updates                           │   │    │
│  │  │  • Conflict resolution                          │   │    │
│  │  │  • Retry with exponential backoff               │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          Service Worker (PWA Infrastructure)            │    │
│  │                                                          │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │  • Offline page serving                         │   │    │
│  │  │  • Asset caching (Cache API)                    │   │    │
│  │  │  • Background sync registration                 │   │    │
│  │  │  • Push notification handling                   │   │    │
│  │  │  • Network-first/Cache-first strategies         │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow Architecture

The application implements a unidirectional data flow pattern with optimistic updates:

```
User Interaction
    ↓
React Component (optimistic UI update)
    ↓
Action Dispatch to Store
    ↓
Zustand Store Update (immediate)
    ↓
├─→ IndexedDB Persistence (async, non-blocking)
│   └─→ Sync Queue Entry (if offline)
│
└─→ API Call (async, non-blocking)
    ↓
    [If Online] → Server Processing
    ↓
    Server Response
    ↓
    Store Update (reconcile with optimistic state)
    ↓
    IndexedDB Update (finalize)
    ↓
    React Re-render (actual state)
```

**Conflict Resolution Strategy:**

When local optimistic updates conflict with server responses:

1. **Timestamp Comparison**: Server timestamp newer than local → Server wins
2. **Operation Type Analysis**: Certain operations (moves, resignations) are irreversible → First committed wins
3. **User Notification**: If conflict affects user-visible state → Show notification with option to reload
4. **Automatic Retry**: Transient errors → Exponential backoff retry up to 5 attempts

### 1.4 Module Organization

The codebase adheres to a strict modular structure that enforces separation of concerns:

```
src/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (game)/                   # Game route group
│   │   ├── play/
│   │   │   └── [gameId]/
│   │   │       └── page.tsx
│   │   ├── matchmaking/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (profile)/                # Profile route group
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── stats/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── leaderboard/
│   │   └── page.tsx
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── error.tsx                 # Error boundary
│   ├── loading.tsx               # Loading UI
│   └── not-found.tsx             # 404 page
│
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── game/                     # Game-specific components
│   │   ├── Board.tsx
│   │   ├── Stone.tsx
│   │   ├── MoveIndicator.tsx
│   │   ├── GameControls.tsx
│   │   ├── PlayerInfo.tsx
│   │   └── WinAnimation.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   │
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   │
│   ├── matchmaking/              # Matchmaking components
│   │   ├── QueueDisplay.tsx
│   │   ├── OpponentCard.tsx
│   │   └── MatchFound.tsx
│   │
│   └── shared/                   # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── OfflineIndicator.tsx
│       └── AnimatedBackground.tsx
│
├── lib/                          # Core libraries
│   ├── api/                      # API integration
│   │   ├── client.ts             # REST API client
│   │   ├── websocket.ts          # WebSocket manager
│   │   ├── endpoints.ts          # API endpoint definitions
│   │   └── types.ts              # API type definitions
│   │
│   ├── game/                     # Game logic
│   │   ├── engine.ts             # Zai engine wrapper
│   │   ├── validator.ts          # Move validation
│   │   ├── ai-opponent.ts        # Local AI player
│   │   └── replay.ts             # Game replay system
│   │
│   ├── storage/                  # Data persistence
│   │   ├── indexeddb.ts          # IndexedDB manager
│   │   ├── cache.ts              # Cache manager
│   │   └── sync.ts               # Sync engine
│   │
│   ├── rendering/                # Canvas rendering
│   │   ├── board-renderer.ts    # Board drawing
│   │   ├── stone-renderer.ts    # Stone drawing
│   │   ├── particle-system.ts   # Particle effects
│   │   └── animation-engine.ts  # Animation controller
│   │
│   ├── audio/                    # Audio system
│   │   ├── audio-engine.ts      # Web Audio API wrapper
│   │   ├── sound-manager.ts     # Sound effect manager
│   │   ├── music-manager.ts     # Background music
│   │   └── spatial-audio.ts     # 3D audio positioning
│   │
│   ├── auth/                     # Authentication
│   │   ├── jwt.ts                # JWT handling
│   │   ├── session.ts            # Session management
│   │   └── token-refresh.ts     # Token refresh logic
│   │
│   └── utils/                    # Utility functions
│       ├── hex-math.ts           # Hexagonal grid math
│       ├── animation.ts          # Animation helpers
│       ├── color.ts              # Color utilities
│       └── format.ts             # Formatting functions
│
├── hooks/                        # Custom React hooks
│   ├── useGame.ts                # Game state hook
│   ├── useAuth.ts                # Authentication hook
│   ├── useMatchmaking.ts         # Matchmaking hook
│   ├── useWebSocket.ts           # WebSocket hook
│   ├── useOffline.ts             # Offline detection hook
│   ├── useCanvas.ts              # Canvas rendering hook
│   ├── useAudio.ts               # Audio playback hook
│   └── usePWA.ts                 # PWA installation hook
│
├── store/                        # Zustand stores
│   ├── game-store.ts             # Game state store
│   ├── user-store.ts             # User state store
│   ├── ui-store.ts               # UI state store
│   ├── settings-store.ts         # Settings store
│   └── middleware/
│       ├── persistence.ts        # IndexedDB middleware
│       └── logger.ts             # Logging middleware
│
├── types/                        # TypeScript types
│   ├── api.ts                    # API types
│   ├── game.ts                   # Game types
│   ├── user.ts                   # User types
│   └── ui.ts                     # UI types
│
├── styles/                       # Global styles
│   ├── globals.css               # Global CSS
│   ├── animations.css            # Animation keyframes
│   └── themes.css                # Theme variables
│
├── public/                       # Static assets
│   ├── icons/                    # App icons
│   ├── sounds/                   # Audio files
│   ├── images/                   # Image assets
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
│
└── config/                       # Configuration
    ├── constants.ts              # App constants
    ├── env.ts                    # Environment variables
    └── theme.ts                  # Theme configuration
```

---

## 2. Technology Stack Specification

### 2.1 Core Framework Dependencies

The following dependencies constitute the foundational technology stack. All packages shall be installed via terminal commands without version specification, allowing npm to resolve the latest compatible versions within Next.js 16's peer dependency constraints.

**Installation Command Sequence:**

```bash
# Create Next.js 16 application
npx create-next-app@latest zai-game-client --typescript --tailwind --app --no-src-dir

cd zai-game-client

# Core UI framework dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-avatar @radix-ui/react-progress

# Icon library
npm install lucide-react

# Utility libraries
npm install class-variance-authority clsx tailwind-merge

# State management
npm install zustand immer

# Form handling
npm install react-hook-form @hookform/resolvers zod

# Data fetching & caching
npm install @tanstack/react-query

# IndexedDB wrapper
npm install idb

# Canvas utilities
npm install konva react-konva

# Audio library
npm install howler

# Animation library
npm install framer-motion

# Date utilities
npm install date-fns

# UUID generation
npm install uuid

# JWT decoding
npm install jwt-decode

# Type definitions
npm install --save-dev @types/uuid @types/howler

# Tailwind CSS plugins
npm install --save-dev tailwindcss-animate @tailwindcss/typography

# PWA support
npm install next-pwa workbox-window

# Development tools
npm install --save-dev @types/node @types/react @types/react-dom eslint eslint-config-next
```

### 2.2 Technology Rationale Matrix

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Next.js 16** | Application framework | Latest version provides enhanced App Router performance, improved React Server Components, optimized bundling, and superior developer experience |
| **Tailwind CSS 4+** | Utility-first styling | Atomic CSS approach enables rapid UI development, minimal bundle size through purging, and consistent design system implementation |
| **shadcn/ui** | Component library | Unstyled, accessible components built on Radix UI primitives; copy-paste architecture allows full customization while maintaining accessibility standards |
| **Lucide React** | Icon system | Modern, tree-shakeable icon library with consistent design language and extensive icon coverage |
| **Zustand** | State management | Minimal boilerplate, excellent TypeScript support, middleware system for persistence, and superior performance compared to Redux/Context API |
| **React Hook Form** | Form management | Uncontrolled components reduce re-renders, built-in validation, excellent TypeScript support, and minimal bundle impact |
| **Zod** | Schema validation | Runtime type checking, automatic TypeScript type inference, composable schemas, and comprehensive error messaging |
| **TanStack Query** | Server state management | Intelligent caching, automatic background refetching, optimistic updates, and excellent offline support |
| **idb** | IndexedDB wrapper | Promise-based API simplifies IndexedDB usage while maintaining full feature access |
| **Konva** | Canvas rendering | High-performance canvas library with scene graph abstraction, event handling, and animation support |
| **Howler.js** | Audio engine | Cross-browser audio API with spatial audio support, sprite sheets, and intelligent pooling |
| **Framer Motion** | Animation library | Declarative animation API, gesture support, layout animations, and excellent performance |
| **next-pwa** | PWA functionality | Automatic service worker generation, precaching, offline support, and app manifest management |

### 2.3 Tailwind CSS 4 Configuration

**tailwind.config.ts:**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Asphalt Legends-inspired color palette
        'neon-cyan': '#00F0FF',
        'neon-magenta': '#FF00E5',
        'neon-purple': '#B026FF',
        'neon-yellow': '#FFE500',
        'racing-blue': '#0066FF',
        'racing-red': '#FF0033',
        
        // Semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in': {
          from: {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-out': {
          from: {
            transform: 'translateX(0)',
            opacity: '1',
          },
          to: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'zoom-in': {
          from: {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 240, 255, 1)',
          },
        },
        'particle-float': {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-100vh) rotate(360deg)',
            opacity: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'particle-float': 'particle-float 10s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'racing-stripes': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,240,255,0.1) 10px, rgba(0,240,255,0.1) 20px)',
        'holographic': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.5)',
        'neon-magenta': '0 0 20px rgba(255, 0, 229, 0.5)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-sm': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}

export default config
```

### 2.4 TypeScript Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/store/*": ["./store/*"],
      "@/types/*": ["./types/*"],
      "@/styles/*": ["./styles/*"],
      "@/config/*": ["./config/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 3. Visual Design System

### 3.1 Design Philosophy: Racing-Inspired Aesthetics

The visual language draws profound inspiration from premium racing franchises (Asphalt Legends, Need for Speed) to create an immersive, high-energy gaming experience that transcends traditional board game presentations. The design system employs five core visual principles:

**Principle 1: Velocity Through Motion**

Every interface element communicates energy and movement through sophisticated animation choreography. Static elements receive subtle breathing animations; active elements exhibit pronounced kinetic energy through spring-based physics. Transitions employ easing curves that mimic acceleration and deceleration patterns, creating visceral connections to racing dynamics.

**Principle 2: Luminosity and Depth**

The interface leverages volumetric lighting effects through layered glassmorphic surfaces, neon accents, and dynamic glow effects. Background elements employ parallax scrolling to establish depth hierarchy. Active game elements cast simulated shadows and emit particle effects that respond to user interactions.

**Principle 3: Premium Material Palette**

UI components utilize semi-transparent glass surfaces with backdrop blur, metallic gradients, and holographic shimmer effects. Color selections emphasize neon cyan, electric magenta, and deep purples against dark backgrounds, creating high-contrast focal points that guide user attention.

**Principle 4: Typographic Hierarchy**

Typography employs bold, geometric sans-serif fonts with strategic use of letter-spacing and weight variation. Headings receive chromatic aberration effects and subtle animations. Status text incorporates monospaced numerals for tactical information display.

**Principle 5: Responsive Feedback**

Every interaction receives immediate visual and auditory feedback. Button presses trigger ripple effects and glow pulses. Hover states initiate smooth color transitions and scale transforms. Success states explode with particle celebrations while failure states employ shake animations and red pulse effects.

### 3.2 Color Palette Specification

**Primary Palette (Neon Accents):**

```css
/* Neon Cyan - Primary accent, active states */
--neon-cyan-rgb: 0, 240, 255;
--neon-cyan: rgb(var(--neon-cyan-rgb));
--neon-cyan-10: rgba(var(--neon-cyan-rgb), 0.1);
--neon-cyan-20: rgba(var(--neon-cyan-rgb), 0.2);
--neon-cyan-50: rgba(var(--neon-cyan-rgb), 0.5);

/* Neon Magenta - Secondary accent, highlights */
--neon-magenta-rgb: 255, 0, 229;
--neon-magenta: rgb(var(--neon-magenta-rgb));
--neon-magenta-10: rgba(var(--neon-magenta-rgb), 0.1);
--neon-magenta-50: rgba(var(--neon-magenta-rgb), 0.5);

/* Neon Purple - Tertiary accent, gradients */
--neon-purple-rgb: 176, 38, 255;
--neon-purple: rgb(var(--neon-purple-rgb));
--neon-purple-10: rgba(var(--neon-purple-rgb), 0.1);
--neon-purple-50: rgba(var(--neon-purple-rgb), 0.5);

/* Neon Yellow - Warning, attention */
--neon-yellow-rgb: 255, 229, 0;
--neon-yellow: rgb(var(--neon-yellow-rgb));
```

**Game State Colors:**

```css
/* Player colors */
--player-white: #FFFFFF;
--player-white-glow: rgba(255, 255, 255, 0.8);
--player-red: #FF0033;
--player-red-glow: rgba(255, 0, 51, 0.8);

/* Status colors */
--success: #00FF88;
--success-glow: rgba(0, 255, 136, 0.6);
--error: #FF0055;
--error-glow: rgba(255, 0, 85, 0.6);
--warning: var(--neon-yellow);
--info: var(--neon-cyan);
```

**Background Palette:**

```css
/* Dark mode (primary) */
--bg-primary: #0A0B14;
--bg-secondary: #12141F;
--bg-tertiary: #1A1D2E;
--bg-elevated: #22253A;

/* Glass surfaces */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-highlight: rgba(255, 255, 255, 0.15);
```

### 3.3 Component Styling Patterns

**Glassmorphic Card:**

```tsx
const GlassCard = ({ children, className, glow = false }: Props) => {
  return (
    <div
      className={cn(
        // Base glass effect
        "relative overflow-hidden",
        "bg-white/5 backdrop-blur-xl",
        "border border-white/10",
        "rounded-2xl",
        // Shadows and depth
        "shadow-glass",
        // Optional neon glow
        glow && "shadow-neon-cyan",
        // Animation
        "transition-all duration-300",
        "hover:bg-white/10 hover:border-white/20",
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

**Neon Button:**

```tsx
const NeonButton = ({ children, variant = 'primary', ...props }: Props) => {
  const variants = {
    primary: cn(
      "bg-gradient-to-r from-neon-cyan to-neon-purple",
      "text-white font-bold",
      "shadow-neon-cyan",
      "hover:shadow-neon-purple hover:scale-105",
      "active:scale-95",
      "transition-all duration-200"
    ),
    secondary: cn(
      "bg-white/5 backdrop-blur-md",
      "border-2 border-neon-cyan",
      "text-neon-cyan font-bold",
      "hover:bg-neon-cyan/10 hover:scale-105",
      "active:scale-95",
      "transition-all duration-200"
    ),
    ghost: cn(
      "bg-transparent",
      "text-neon-cyan",
      "hover:bg-neon-cyan/10",
      "transition-all duration-200"
    ),
  }
  
  return (
    <motion.button
      className={cn(
        "relative px-6 py-3 rounded-xl",
        "overflow-hidden",
        variants[variant]
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear"
        }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
```

**Animated Background:**

```tsx
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-magenta/20 rounded-full blur-3xl animate-pulse-glow delay-1000" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />
      
      {/* Particle system */}
      <ParticleSystem count={50} />
    </div>
  )
}
```

### 3.4 Typography System

**Font Stack:**

```css
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

**Type Scale:**

```css
/* Display (Hero headings) */
--text-display: 4rem / 1; /* 64px */
--text-display-sm: 3rem / 1.1; /* 48px */

/* Headings */
--text-h1: 2.5rem / 1.2; /* 40px */
--text-h2: 2rem / 1.25; /* 32px */
--text-h3: 1.5rem / 1.3; /* 24px */
--text-h4: 1.25rem / 1.4; /* 20px */

/* Body */
--text-lg: 1.125rem / 1.5; /* 18px */
--text-base: 1rem / 1.5; /* 16px */
--text-sm: 0.875rem / 1.5; /* 14px */
--text-xs: 0.75rem / 1.5; /* 12px */
```

**Typography Components:**

```tsx
const Display = ({ children, className }: Props) => (
  <h1 className={cn(
    "text-display font-bold tracking-tight",
    "bg-clip-text text-transparent",
    "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta",
    "animate-gradient-x",
    className
  )}>
    {children}
  </h1>
)

const GameStat = ({ label, value, trend }: Props) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-bold font-mono text-neon-cyan">{value}</span>
    {trend && (
      <span className={cn(
        "text-xs font-mono",
        trend > 0 ? "text-success" : "text-error"
      )}>
        {trend > 0 ? "+" : ""}{trend}
      </span>
    )}
  </div>
)
```

---

## 4. Offline-First Architecture

### 4.1 Local-First Principles

The application implements a comprehensive offline-first architecture wherein local data constitutes the primary source of truth. This architectural decision stems from three critical observations about modern web gaming:

**Observation 1: Network Latency Destroys Engagement**

Traditional client-server architectures wherein every user interaction requires round-trip server communication introduce perceptible latency that destroys the immediacy essential to gaming experiences. Users expect instantaneous feedback; delays of even 200-300ms create perceptions of sluggishness that diminish engagement.

**Observation 2: Connectivity Remains Unreliable**

Despite advances in mobile networks, users frequently encounter connectivity disruptions: elevator transitions, subway tunnels, building dead zones, network congestion, and intermittent WiFi. Applications that cease functioning during brief connectivity losses frustrate users and lose session engagement.

**Observation 3: Server Dependencies Create Fragility**

Applications that depend entirely on server availability inherit all server reliability characteristics. Server maintenance, deployment errors, traffic spikes, and infrastructure failures translate directly into application unavailability. Local-first architecture provides resilience against backend disruptions.

### 4.2 IndexedDB Schema

The application maintains five primary IndexedDB object stores that persist all critical application state:

**Database Name:** `zai-game-db`  
**Version:** 1  
**Size Limit:** Browser-dependent (typically 50MB-1GB)

**Store 1: users**

```typescript
interface UserStore {
  user_id: string;           // Primary key
  username: string;
  display_name: string;
  email?: string;
  elo_rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  is_guest: boolean;
  created_at: number;
  last_login_at: number;
  last_synced_at: number;
}

// Indexes
const userIndexes = {
  'by-username': 'username',
  'by-elo': 'elo_rating',
  'by-last-login': 'last_login_at'
};
```

**Store 2: games**

```typescript
interface GameStore {
  game_id: string;           // Primary key
  white_user_id: string;
  red_user_id: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  winner?: 'white' | 'red' | 'draw';
  win_condition?: 'encirclement' | 'territory' | 'network' | 'isolation';
  current_turn: 'white' | 'red';
  turn_number: number;
  phase: 'placement' | 'expansion';
  board_state: {
    stones: Array<{
      player: 'white' | 'red' | 'void';
      position: { q: number; r: number };
    }>;
  };
  legal_moves: Array<Move>;
  started_at: number;
  completed_at?: number;
  last_move_at: number;
  is_ai_opponent: boolean;
  local_only: boolean;       // True if game never synced to server
  last_synced_at: number;
}

// Indexes
const gameIndexes = {
  'by-status': 'status',
  'by-player': ['white_user_id', 'red_user_id'], // Composite
  'by-started': 'started_at',
  'by-last-move': 'last_move_at'
};
```

**Store 3: moves**

```typescript
interface MoveStore {
  move_id: string;           // Primary key (UUID)
  game_id: string;
  move_number: number;
  player: 'white' | 'red';
  move_type: 'placement' | 'sacrifice';
  position?: { q: number; r: number };
  sacrifice_position?: { q: number; r: number };
  placements?: Array<{ q: number; r: number }>;
  time_taken?: number;
  created_at: number;
  synced: boolean;
}

// Indexes
const moveIndexes = {
  'by-game': 'game_id',
  'by-game-move': ['game_id', 'move_number'], // Composite
  'by-created': 'created_at'
};
```

**Store 4: settings**

```typescript
interface SettingsStore {
  key: string;               // Primary key
  value: any;
  updated_at: number;
}

// Settings keys
const settingsKeys = {
  AUDIO_ENABLED: 'audio_enabled',
  AUDIO_VOLUME: 'audio_volume',
  MUSIC_ENABLED: 'music_enabled',
  MUSIC_VOLUME: 'music_volume',
  THEME: 'theme',
  ANIMATIONS_ENABLED: 'animations_enabled',
  PARTICLE_EFFECTS: 'particle_effects',
  BOARD_THEME: 'board_theme',
  SHOW_LEGAL_MOVES: 'show_legal_moves',
  AUTO_QUEEN_MOVES: 'auto_queen_moves',
  CONFIRM_MOVES: 'confirm_moves',
  PREFERRED_COLOR: 'preferred_color',
  TIME_CONTROL_PREF: 'time_control_pref',
};
```

**Store 5: sync_queue**

```typescript
interface SyncQueueStore {
  id: string;                // Primary key (UUID)
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: 'game' | 'move' | 'user' | 'invitation';
  entity_id: string;
  data: any;
  created_at: number;
  retry_count: number;
  last_attempt_at?: number;
  error?: string;
}

// Indexes
const syncQueueIndexes = {
  'by-created': 'created_at',
  'by-entity': ['entity_type', 'entity_id'] // Composite
};
```

### 4.3 Database Initialization

**lib/storage/indexeddb.ts:**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ZaiDB extends DBSchema {
  users: {
    key: string;
    value: UserStore;
    indexes: {
      'by-username': string;
      'by-elo': number;
      'by-last-login': number;
    };
  };
  games: {
    key: string;
    value: GameStore;
    indexes: {
      'by-status': string;
      'by-started': number;
      'by-last-move': number;
    };
  };
  moves: {
    key: string;
    value: MoveStore;
    indexes: {
      'by-game': string;
      'by-created': number;
    };
  };
  settings: {
    key: string;
    value: SettingsStore;
  };
  sync_queue: {
    key: string;
    value: SyncQueueStore;
    indexes: {
      'by-created': number;
    };
  };
}

class IndexedDBManager {
  private db: IDBPDatabase<ZaiDB> | null = null;
  private readonly DB_NAME = 'zai-game-db';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    this.db = await openDB<ZaiDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'user_id' });
          userStore.createIndex('by-username', 'username', { unique: true });
          userStore.createIndex('by-elo', 'elo_rating');
          userStore.createIndex('by-last-login', 'last_login_at');
        }

        // Create games store
        if (!db.objectStoreNames.contains('games')) {
          const gameStore = db.createObjectStore('games', { keyPath: 'game_id' });
          gameStore.createIndex('by-status', 'status');
          gameStore.createIndex('by-started', 'started_at');
          gameStore.createIndex('by-last-move', 'last_move_at');
        }

        // Create moves store
        if (!db.objectStoreNames.contains('moves')) {
          const moveStore = db.createObjectStore('moves', { keyPath: 'move_id' });
          moveStore.createIndex('by-game', 'game_id');
          moveStore.createIndex('by-created', 'created_at');
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by-created', 'created_at');
        }
      },
    });
  }

  async getGame(gameId: string): Promise<GameStore | undefined> {
    if (!this.db) await this.initialize();
    return this.db!.get('games', gameId);
  }

  async saveGame(game: GameStore): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('games', {
      ...game,
      last_synced_at: Date.now()
    });
  }

  async getActiveGames(userId: string): Promise<GameStore[]> {
    if (!this.db) await this.initialize();
    const allGames = await this.db!.getAllFromIndex('games', 'by-status', 'active');
    return allGames.filter(
      game => game.white_user_id === userId || game.red_user_id === userId
    );
  }

  async saveMoves(moves: MoveStore[]): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction('moves', 'readwrite');
    await Promise.all([
      ...moves.map(move => tx.store.put(move)),
      tx.done
    ]);
  }

  async getGameMoves(gameId: string): Promise<MoveStore[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('moves', 'by-game', gameId);
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.db) await this.initialize();
    const setting = await this.db!.get('settings', key);
    return setting ? setting.value : defaultValue;
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('settings', {
      key,
      value,
      updated_at: Date.now()
    });
  }

  async addToSyncQueue(item: Omit<SyncQueueStore, 'id' | 'created_at' | 'retry_count'>): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.add('sync_queue', {
      ...item,
      id: crypto.randomUUID(),
      created_at: Date.now(),
      retry_count: 0
    });
  }

  async getSyncQueue(): Promise<SyncQueueStore[]> {
    if (!this.db) await this.initialize();
    return this.db!.getAllFromIndex('sync_queue', 'by-created');
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete('sync_queue', id);
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initialize();
    const tx = this.db!.transaction(['games', 'moves', 'sync_queue'], 'readwrite');
    await Promise.all([
      tx.objectStore('games').clear(),
      tx.objectStore('moves').clear(),
      tx.objectStore('sync_queue').clear(),
      tx.done
    ]);
  }
}

export const db = new IndexedDBManager();
```

### 4.4 Background Synchronization Engine

**lib/storage/sync.ts:**

```typescript
import { db } from './indexeddb';
import { apiClient } from '../api/client';
import { useOnlineStatus } from '@/hooks/useOffline';

class SyncEngine {
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_RETRY_COUNT = 5;

  startAutoSync(): void {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.performSync();
      }
    }, this.SYNC_INTERVAL_MS);

    // Also sync on reconnection
    window.addEventListener('online', () => {
      if (!this.isSyncing) {
        this.performSync();
      }
    });
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async performSync(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      const queue = await db.getSyncQueue();
      
      for (const item of queue) {
        try {
          await this.syncItem(item);
          await db.removeSyncQueueItem(item.id);
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          
          // Update retry count
          if (item.retry_count >= this.MAX_RETRY_COUNT) {
            console.error(`Max retries exceeded for item ${item.id}, removing from queue`);
            await db.removeSyncQueueItem(item.id);
          }
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncItem(item: SyncQueueStore): Promise<void> {
    switch (item.entity_type) {
      case 'game':
        await this.syncGame(item);
        break;
      case 'move':
        await this.syncMove(item);
        break;
      case 'user':
        await this.syncUser(item);
        break;
      case 'invitation':
        await this.syncInvitation(item);
        break;
    }
  }

  private async syncGame(item: SyncQueueStore): Promise<void> {
    const game = await db.getGame(item.entity_id);
    if (!game) return;

    // Don't sync local-only games (vs AI)
    if (game.local_only) return;

    switch (item.operation) {
      case 'CREATE':
        await apiClient.post('/games', game);
        break;
      case 'UPDATE':
        await apiClient.patch(`/games/${item.entity_id}`, game);
        break;
      case 'DELETE':
        await apiClient.delete(`/games/${item.entity_id}`);
        break;
    }
  }

  private async syncMove(item: SyncQueueStore): Promise<void> {
    const moves = await db.getGameMoves(item.entity_id);
    const unsyncedMoves = moves.filter(m => !m.synced);

    for (const move of unsyncedMoves) {
      await apiClient.post(`/games/${move.game_id}/moves`, {
        type: move.move_type,
        position: move.position,
        sacrifice_position: move.sacrifice_position,
        placements: move.placements
      });

      // Mark as synced
      await db.saveMoves([{ ...move, synced: true }]);
    }
  }

  private async syncUser(item: SyncQueueStore): Promise<void> {
    // User profile updates
    await apiClient.patch(`/users/${item.entity_id}`, item.data);
  }

  private async syncInvitation(item: SyncQueueStore): Promise<void> {
    // Invitation operations
    switch (item.operation) {
      case 'CREATE':
        await apiClient.post('/invitations', item.data);
        break;
      case 'UPDATE':
        await apiClient.patch(`/invitations/${item.entity_id}`, item.data);
        break;
    }
  }
}

export const syncEngine = new SyncEngine();
```

---

## 5. Game Rendering Engine

### 5.1 Canvas-Based Rendering Architecture

The game employs a high-performance Canvas rendering system using Konva.js to deliver smooth 60fps gameplay with sophisticated visual effects. The rendering engine operates independently of React's render cycle, updating the canvas directly through imperative drawing commands that execute within `requestAnimationFrame` callbacks.

**Core Rendering Principles:**

1. **Separation of Concerns**: Game logic (Zustand store) is decoupled from rendering (Canvas operations)
2. **Frame-Based Updates**: All animations use `requestAnimationFrame` for smooth, synchronized rendering
3. **Layered Rendering**: Board, stones, effects, and UI overlays render in distinct layers for optimal performance
4. **Responsive Scaling**: Canvas automatically scales to container dimensions while maintaining hexagonal grid aspect ratio

### 5.2 Hexagonal Grid Rendering

**lib/rendering/board-renderer.ts:**

```typescript
import { Stage, Layer, Group, Circle, Line } from 'react-konva';
import { hexToPixel, pixelToHex, getHexNeighbors } from '@/lib/utils/hex-math';

interface HexCoordinate {
  q: number;
  r: number;
}

interface Stone {
  player: 'white' | 'red' | 'void';
  position: HexCoordinate;
}

class BoardRenderer {
  private stage: Stage | null = null;
  private layer: Layer | null = null;
  private hexSize: number = 30;
  private boardRadius: number = 5; // Number of hex rings from center
  
  initialize(canvasRef: React.RefObject<HTMLDivElement>): void {
    // Initialize Konva stage with responsive dimensions
    const container = canvasRef.current;
    if (!container) return;
    
    this.stage = new Stage({
      container: container,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });
    
    this.layer = new Layer();
    this.stage.add(this.layer);
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  renderBoard(stones: Stone[], legalMoves: HexCoordinate[], selectedHex: HexCoordinate | null): void {
    if (!this.layer) return;
    
    this.layer.destroyChildren();
    
    // Render hexagonal grid background
    this.renderGrid();
    
    // Render legal move indicators
    legalMoves.forEach(hex => {
      this.renderLegalMoveIndicator(hex);
    });
    
    // Render stones
    stones.forEach(stone => {
      if (stone.player !== 'void') {
        this.renderStone(stone);
      }
    });
    
    // Render selected hex highlight
    if (selectedHex) {
      this.renderSelection(selectedHex);
    }
    
    // Render last move highlight
    // Render network connections
    this.renderNetworks(stones);
    
    this.layer.draw();
  }
  
  private renderGrid(): void {
    // Generate all hex coordinates within board radius
    const hexes: HexCoordinate[] = [];
    for (let q = -this.boardRadius; q <= this.boardRadius; q++) {
      const r1 = Math.max(-this.boardRadius, -q - this.boardRadius);
      const r2 = Math.min(this.boardRadius, -q + this.boardRadius);
      for (let r = r1; r <= r2; r++) {
        hexes.push({ q, r });
      }
    }
    
    // Render each hex cell
    hexes.forEach(hex => {
      const { x, y } = hexToPixel(hex, this.hexSize);
      const points = this.getHexPoints(x, y, this.hexSize);
      
      new Line({
        points: points.flat(),
        closed: true,
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        fill: 'rgba(0, 0, 0, 0.3)',
        listening: false,
      }).addTo(this.layer!);
    });
  }
  
  private renderStone(stone: Stone): void {
    const { x, y } = hexToPixel(stone.position, this.hexSize);
    const color = stone.player === 'white' ? '#FFFFFF' : '#FF0033';
    const glowColor = stone.player === 'white' 
      ? 'rgba(255, 255, 255, 0.6)' 
      : 'rgba(255, 0, 51, 0.6)';
    
    // Outer glow
    new Circle({
      x,
      y,
      radius: this.hexSize * 0.6,
      fill: glowColor,
      opacity: 0.3,
      blur: 10,
      listening: false,
    }).addTo(this.layer!);
    
    // Main stone
    new Circle({
      x,
      y,
      radius: this.hexSize * 0.4,
      fill: color,
      stroke: stone.player === 'white' ? '#00F0FF' : '#FF00E5',
      strokeWidth: 2,
      shadowBlur: 15,
      shadowColor: color,
      listening: true,
      onClick: () => this.handleStoneClick(stone.position),
    }).addTo(this.layer!);
    
    // Inner highlight
    new Circle({
      x: x - this.hexSize * 0.1,
      y: y - this.hexSize * 0.1,
      radius: this.hexSize * 0.15,
      fill: 'rgba(255, 255, 255, 0.4)',
      listening: false,
    }).addTo(this.layer!);
  }
  
  private renderLegalMoveIndicator(hex: HexCoordinate): void {
    const { x, y } = hexToPixel(hex, this.hexSize);
    
    // Pulsing ring animation
    new Circle({
      x,
      y,
      radius: this.hexSize * 0.3,
      stroke: '#00F0FF',
      strokeWidth: 2,
      dash: [5, 5],
      opacity: 0.6,
      listening: true,
      onClick: () => this.handleMoveClick(hex),
    }).addTo(this.layer!);
  }
  
  private renderNetworks(stones: Stone[]): void {
    // Group stones by player
    const whiteStones = stones.filter(s => s.player === 'white');
    const redStones = stones.filter(s => s.player === 'red');
    
    // Render network connections for each player
    this.renderPlayerNetwork(whiteStones, '#00F0FF');
    this.renderPlayerNetwork(redStones, '#FF00E5');
  }
  
  private renderPlayerNetwork(stones: Stone[], color: string): void {
    // Find connected components using BFS
    const visited = new Set<string>();
    const components: Stone[][] = [];
    
    stones.forEach(stone => {
      const key = `${stone.position.q},${stone.position.r}`;
      if (visited.has(key)) return;
      
      const component: Stone[] = [];
      const queue: Stone[] = [stone];
      visited.add(key);
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);
        
        const neighbors = getHexNeighbors(current.position);
        neighbors.forEach(neighbor => {
          const neighborKey = `${neighbor.q},${neighbor.r}`;
          const neighborStone = stones.find(s => 
            s.position.q === neighbor.q && s.position.r === neighbor.r
          );
          
          if (neighborStone && !visited.has(neighborKey)) {
            visited.add(neighborKey);
            queue.push(neighborStone);
          }
        });
      }
      
      if (component.length > 1) {
        components.push(component);
      }
    });
    
    // Render connection lines between adjacent stones in each component
    components.forEach(component => {
      component.forEach((stone, i) => {
        const { x: x1, y: y1 } = hexToPixel(stone.position, this.hexSize);
        
        component.slice(i + 1).forEach(otherStone => {
          const { x: x2, y: y2 } = hexToPixel(otherStone.position, this.hexSize);
          
          // Check if stones are adjacent
          const neighbors = getHexNeighbors(stone.position);
          const isAdjacent = neighbors.some(n => 
            n.q === otherStone.position.q && n.r === otherStone.position.r
          );
          
          if (isAdjacent) {
            new Line({
              points: [x1, y1, x2, y2],
              stroke: color,
              strokeWidth: 2,
              opacity: 0.4,
              dash: [3, 3],
              listening: false,
            }).addTo(this.layer!);
          }
        });
      });
    });
  }
  
  private getHexPoints(centerX: number, centerY: number, size: number): number[][] {
    const points: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  }
  
  private handleResize(): void {
    if (!this.stage || !this.stage.container()) return;
    const container = this.stage.container();
    this.stage.width(container.offsetWidth);
    this.stage.height(container.offsetHeight);
    this.stage.draw();
  }
  
  handleStoneClick(position: HexCoordinate): void {
    // Emit event to game store
    // This will be connected to the game logic
  }
  
  handleMoveClick(position: HexCoordinate): void {
    // Emit move event
  }
}

export const boardRenderer = new BoardRenderer();
```

### 5.3 Particle System for Visual Effects

**lib/rendering/particle-system.ts:**

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  
  initialize(canvasRef: React.RefObject<HTMLCanvasElement>): void {
    this.canvas = canvasRef.current!;
    this.ctx = this.canvas.getContext('2d')!;
    this.startAnimation();
  }
  
  emitBurst(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
      });
    }
  }
  
  emitTrail(x: number, y: number, color: string): void {
    // Continuous particle trail
    if (Math.random() < 0.3) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 20,
        size: 1 + Math.random() * 2,
        color,
        alpha: 0.8,
      });
    }
  }
  
  private startAnimation(): void {
    const animate = () => {
      if (!this.ctx || !this.canvas) return;
      
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and render particles
      this.particles = this.particles.filter(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update life
        particle.life++;
        particle.alpha = 1 - (particle.life / particle.maxLife);
        
        // Apply gravity/friction
        particle.vy += 0.1;
        particle.vx *= 0.98;
        
        // Render
        if (particle.alpha > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = particle.alpha;
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
        
        return particle.life < particle.maxLife;
      });
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.particles = [];
  }
}

export const particleSystem = new ParticleSystem();
```

### 5.4 Win Animation System

**lib/rendering/win-animation.ts:**

```typescript
class WinAnimation {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isAnimating = false;
  
  async playWinAnimation(winner: 'white' | 'red', winCondition: string): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const color = winner === 'white' ? '#00F0FF' : '#FF00E5';
    
    // Phase 1: Explosion burst
    await this.explosionBurst(color);
    
    // Phase 2: Confetti rain
    await this.confettiRain(color);
    
    // Phase 3: Victory text reveal
    await this.victoryTextReveal(winner, winCondition);
    
    this.isAnimating = false;
  }
  
  private async explosionBurst(color: string): Promise<void> {
    // Large particle burst from center
    const centerX = this.canvas!.width / 2;
    const centerY = this.canvas!.height / 2;
    
    for (let i = 0; i < 100; i++) {
      const angle = (Math.PI * 2 * i) / 100;
      const speed = 5 + Math.random() * 10;
      // Emit particle
    }
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  private async confettiRain(color: string): Promise<void> {
    // Continuous confetti for 3 seconds
    return new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  private async victoryTextReveal(winner: 'white' | 'red', condition: string): Promise<void> {
    // Animated text reveal with glow effects
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
}

export const winAnimation = new WinAnimation();
```

---

## 6. Audio System

### 6.1 Web Audio API Integration via Howler.js

The application employs Howler.js as the primary audio engine, providing cross-browser compatibility, spatial audio support, and intelligent sound pooling. All audio assets are cached in IndexedDB for offline playback.

**lib/audio/audio-engine.ts:**

```typescript
import { Howl, Howler } from 'howler';

interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
  sprite?: { [key: string]: [number, number] };
}

class AudioEngine {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.6;
  private sfxVolume: number = 1.0;
  private isMuted: boolean = false;
  
  async initialize(): Promise<void> {
    // Load all sound effects
    await this.loadSoundEffects();
    
    // Load background music
    await this.loadMusic();
    
    // Apply saved volume settings
    const savedVolume = await db.getSetting('audio_volume', 1.0);
    const savedMusicVolume = await db.getSetting('music_volume', 0.6);
    this.setMasterVolume(savedVolume);
    this.setMusicVolume(savedMusicVolume);
    
    // Check if audio is enabled
    const audioEnabled = await db.getSetting('audio_enabled', true);
    if (!audioEnabled) {
      this.mute();
    }
  }
  
  private async loadSoundEffects(): Promise<void> {
    const soundEffects = {
      'stone-place': {
        src: ['/sounds/stone-place.mp3', '/sounds/stone-place.ogg'],
        volume: 0.7,
      },
      'stone-sacrifice': {
        src: ['/sounds/stone-sacrifice.mp3', '/sounds/stone-sacrifice.ogg'],
        volume: 0.8,
      },
      'move-invalid': {
        src: ['/sounds/move-invalid.mp3', '/sounds/move-invalid.ogg'],
        volume: 0.5,
      },
      'game-win': {
        src: ['/sounds/game-win.mp3', '/sounds/game-win.ogg'],
        volume: 1.0,
      },
      'game-lose': {
        src: ['/sounds/game-lose.mp3', '/sounds/game-lose.ogg'],
        volume: 0.8,
      },
      'button-click': {
        src: ['/sounds/button-click.mp3', '/sounds/button-click.ogg'],
        volume: 0.4,
      },
      'notification': {
        src: ['/sounds/notification.mp3', '/sounds/notification.ogg'],
        volume: 0.6,
      },
    };
    
    for (const [key, config] of Object.entries(soundEffects)) {
      const howl = new Howl({
        ...config,
        preload: true,
        html5: false, // Use Web Audio API
      });
      
      this.sounds.set(key, howl);
    }
  }
  
  private async loadMusic(): Promise<void> {
    const musicTracks = [
      '/sounds/music-menu.mp3',
      '/sounds/music-gameplay.mp3',
      '/sounds/music-victory.mp3',
    ];
    
    // Load menu music by default
    this.music = new Howl({
      src: [musicTracks[0]],
      volume: this.musicVolume,
      loop: true,
      html5: false,
      preload: true,
    });
  }
  
  playSound(soundName: string, options?: { volume?: number; position?: { x: number; y: number } }): void {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }
    
    // Handle spatial audio if position provided
    if (options?.position) {
      this.playSpatialSound(sound, options.position, options.volume);
    } else {
      const volume = options?.volume ?? sound.volume();
      sound.volume(volume * this.sfxVolume * this.masterVolume);
      sound.play();
    }
  }
  
  private playSpatialSound(sound: Howl, position: { x: number; y: number }, volume?: number): void {
    // Calculate pan based on position relative to screen center
    const screenCenterX = window.innerWidth / 2;
    const pan = (position.x - screenCenterX) / screenCenterX;
    const clampedPan = Math.max(-1, Math.min(1, pan));
    
    // Use Web Audio API panner node for spatial audio
    const soundId = sound.play();
    const soundNode = sound._sounds[soundId]?._node;
    
    if (soundNode && soundNode.context) {
      const panner = soundNode.context.createStereoPanner();
      panner.pan.value = clampedPan;
      soundNode.connect(panner);
      panner.connect(soundNode.context.destination);
    }
    
    sound.volume((volume ?? sound.volume()) * this.sfxVolume * this.masterVolume, soundId);
  }
  
  playMusic(track: 'menu' | 'gameplay' | 'victory'): void {
    if (this.isMuted) return;
    
    // Stop current music
    if (this.music?.playing()) {
      this.music.stop();
    }
    
    const trackMap = {
      menu: '/sounds/music-menu.mp3',
      gameplay: '/sounds/music-gameplay.mp3',
      victory: '/sounds/music-victory.mp3',
    };
    
    this.music = new Howl({
      src: [trackMap[track]],
      volume: this.musicVolume * this.masterVolume,
      loop: track !== 'victory',
      html5: false,
    });
    
    this.music.play();
  }
  
  stopMusic(): void {
    if (this.music?.playing()) {
      this.music.stop();
    }
  }
  
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
    await db.saveSetting('audio_volume', this.masterVolume);
  }
  
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.music) {
      this.music.volume(this.musicVolume * this.masterVolume);
    }
    await db.saveSetting('music_volume', this.musicVolume);
  }
  
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    await db.saveSetting('sfx_volume', this.sfxVolume);
  }
  
  mute(): void {
    this.isMuted = true;
    Howler.mute(true);
    await db.saveSetting('audio_enabled', false);
  }
  
  unmute(): void {
    this.isMuted = false;
    Howler.mute(false);
    await db.saveSetting('audio_enabled', true);
  }
  
  cleanup(): void {
    // Stop all sounds
    this.sounds.forEach(sound => sound.unload());
    this.sounds.clear();
    
    if (this.music) {
      this.music.unload();
      this.music = null;
    }
  }
}

export const audioEngine = new AudioEngine();
```

### 6.2 Sound Manager Hook

**hooks/useAudio.ts:**

```typescript
import { useEffect } from 'react';
import { audioEngine } from '@/lib/audio/audio-engine';

export function useAudio() {
  useEffect(() => {
    audioEngine.initialize();
    
    return () => {
      audioEngine.cleanup();
    };
  }, []);
  
  return {
    playSound: audioEngine.playSound.bind(audioEngine),
    playMusic: audioEngine.playMusic.bind(audioEngine),
    stopMusic: audioEngine.stopMusic.bind(audioEngine),
    setMasterVolume: audioEngine.setMasterVolume.bind(audioEngine),
    setMusicVolume: audioEngine.setMusicVolume.bind(audioEngine),
    mute: audioEngine.mute.bind(audioEngine),
    unmute: audioEngine.unmute.bind(audioEngine),
  };
}
```

---

## 7. State Management

### 7.1 Zustand Store Architecture

The application employs Zustand for state management, providing minimal boilerplate, excellent TypeScript support, and middleware capabilities for persistence and logging.

**store/game-store.ts:**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { db } from '@/lib/storage/indexeddb';
import { zaiEngine } from '@/lib/game/engine';

interface GameState {
  activeGames: Map<string, Game>;
  currentGameId: string | null;
  selectedHex: { q: number; r: number } | null;
  legalMoves: Array<{ type: string; position: { q: number; r: number } }>;
  moveHistory: Move[];
  isThinking: boolean;
}

interface GameActions {
  setCurrentGame: (gameId: string) => void;
  makeMove: (move: Move) => Promise<void>;
  selectHex: (hex: { q: number; r: number } | null) => void;
  updateGameState: (gameId: string, state: Partial<Game>) => void;
  addMove: (gameId: string, move: Move) => void;
  resignGame: (gameId: string) => Promise<void>;
  clearCurrentGame: () => void;
}

const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
      activeGames: new Map(),
      currentGameId: null,
      selectedHex: null,
      legalMoves: [],
      moveHistory: [],
      isThinking: false,
      
      setCurrentGame: (gameId: string) => {
        set((state) => {
          state.currentGameId = gameId;
          const game = state.activeGames.get(gameId);
          if (game) {
            state.legalMoves = game.legal_moves || [];
            state.moveHistory = game.move_history || [];
          }
        });
      },
      
      makeMove: async (move: Move) => {
        const state = get();
        if (!state.currentGameId) return;
        
        set((draft) => {
          draft.isThinking = true;
        });
        
        try {
          // Optimistic update
          const game = state.activeGames.get(state.currentGameId);
          if (!game) return;
          
          // Validate move locally
          const isValid = zaiEngine.validateMove(game, move);
          if (!isValid) {
            throw new Error('Invalid move');
          }
          
          // Apply move locally
          const updatedGame = zaiEngine.applyMove(game, move);
          
          set((draft) => {
            draft.activeGames.set(state.currentGameId!, updatedGame);
            draft.moveHistory.push(move);
            draft.legalMoves = updatedGame.legal_moves;
            draft.selectedHex = null;
            draft.isThinking = false;
          });
          
          // Save to IndexedDB
          await db.saveGame(updatedGame);
          
          // Queue for sync
          await db.addToSyncQueue({
            operation: 'UPDATE',
            entity_type: 'game',
            entity_id: state.currentGameId,
            data: updatedGame,
          });
          
          // Send via WebSocket or HTTP
          // (handled by API service)
        } catch (error) {
          set((draft) => {
            draft.isThinking = false;
          });
          throw error;
        }
      },
      
      selectHex: (hex) => {
        set((draft) => {
          draft.selectedHex = hex;
        });
      },
      
      updateGameState: (gameId: string, state: Partial<Game>) => {
        set((draft) => {
          const game = draft.activeGames.get(gameId);
          if (game) {
            Object.assign(game, state);
            draft.activeGames.set(gameId, game);
          }
        });
      },
      
      addMove: (gameId: string, move: Move) => {
        set((draft) => {
          draft.moveHistory.push(move);
          const game = draft.activeGames.get(gameId);
          if (game) {
            game.move_history = draft.moveHistory;
          }
        });
      },
      
      resignGame: async (gameId: string) => {
        // Implementation
      },
      
      clearCurrentGame: () => {
        set((draft) => {
          draft.currentGameId = null;
          draft.selectedHex = null;
          draft.legalMoves = [];
          draft.moveHistory = [];
        });
      },
    })),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const value = await db.getSetting(name, null);
          return value ? JSON.stringify(value) : null;
        },
        setItem: async (name: string, value: string) => {
          await db.saveSetting(name, JSON.parse(value));
        },
        removeItem: async (name: string) => {
          await db.saveSetting(name, null);
        },
      })),
      partialize: (state) => ({
        activeGames: Array.from(state.activeGames.entries()),
        currentGameId: state.currentGameId,
      }),
    }
  )
);

export { useGameStore };
```

### 7.2 User Store

**store/user-store.ts:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: string;
  username: string;
  display_name: string;
  email?: string;
  elo_rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  is_guest: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (tokens: { access_token: string; refresh_token: string; expires_at: number }, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const useUserStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      
      setAuth: (tokens, user) => {
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_at,
          user,
          isAuthenticated: true,
        });
      },
      
      setUser: (user) => {
        set({ user });
      },
      
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        });
      },
      
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token');
        
        // Call API refresh endpoint
        const response = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (!response.ok) {
          get().logout();
          throw new Error('Token refresh failed');
        }
        
        const { access_token, expires_at } = await response.json();
        set({
          accessToken: access_token,
          expiresAt: expires_at,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await db.getSetting(name, null);
          return value ? JSON.stringify(value) : null;
        },
        setItem: async (name: string, value: string) => {
          await db.saveSetting(name, JSON.parse(value));
        },
        removeItem: async (name: string) => {
          await db.saveSetting(name, null);
        },
      },
    }
  )
);

export { useUserStore };
```

---

## 8. API Integration Layer

### 8.1 Complete API Client Implementation

The API client implements all endpoints from the API reference with automatic token refresh, retry logic, rate limit handling, and offline queue management.

**lib/api/client.ts:**

```typescript
import { useUserStore } from '@/store/user-store';

interface ApiError {
  error: string;
  message: string;
  details?: any;
  timestamp: number;
  request_id: string;
}

class ApiClient {
  private baseURL: string;
  private retryCount: number = 3;
  private retryDelay: number = 1000;
  
  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.zai.com/api/v1') {
    this.baseURL = baseURL;
  }
  
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { accessToken } = useUserStore.getState();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }
  
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle rate limiting
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
    
    // Handle token expiration
    if (response.status === 401) {
      try {
        await useUserStore.getState().refreshAccessToken();
        // Retry request with new token
        return this.handleResponse<T>(response);
      } catch (error) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        throw error;
      }
    }
    
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };
    
    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await fetch(url, config);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        if (i < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError || new Error('Request failed');
  }
  
  // Authentication Endpoints
  
  async register(data: {
    username: string;
    password: string;
    email?: string;
  }): Promise<{
    user_id: string;
    username: string;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    elo_rating: number;
    games_played: number;
    is_guest: boolean;
  }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async login(data: { username: string; password: string }): Promise<{
    user_id: string;
    username: string;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    elo_rating: number;
    games_played: number;
    is_guest: boolean;
  }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async guestLogin(data: { display_name: string }): Promise<{
    user_id: string;
    username: string;
    access_token: string;
    expires_at: number;
    elo_rating: number;
    games_played: number;
    is_guest: boolean;
    warning: string;
  }> {
    return this.request('/auth/guest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async convertGuest(data: {
    username: string;
    password: string;
    email?: string;
  }): Promise<{
    user_id: string;
    username: string;
    is_guest: boolean;
    message: string;
  }> {
    return this.request('/auth/convert-guest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async refreshToken(refresh_token: string): Promise<{
    access_token: string;
    expires_at: number;
  }> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
  }
  
  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }
  
  // User Management Endpoints
  
  async getUserProfile(userId: string): Promise<{
    user_id: string;
    username: string;
    display_name: string;
    elo_rating: number;
    games_played: number;
    games_won: number;
    games_lost: number;
    games_drawn: number;
    win_rate: number;
    created_at: number;
    last_login_at: number;
    is_online: boolean;
  }> {
    return this.request(`/users/${userId}`);
  }
  
  async updateUserProfile(
    userId: string,
    data: { display_name?: string; email?: string }
  ): Promise<{
    user_id: string;
    username: string;
    display_name: string;
    email?: string;
    elo_rating: number;
    games_played: number;
    games_won: number;
    games_lost: number;
    games_drawn: number;
    win_rate: number;
    created_at: number;
    last_login_at: number;
    is_online: boolean;
  }> {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  async getUserGameHistory(
    userId: string,
    params?: {
      limit?: number;
      offset?: number;
      status?: 'completed' | 'active' | 'abandoned';
    }
  ): Promise<{
    games: Array<{
      game_id: string;
      opponent: {
        user_id: string;
        username: string;
        elo_rating: number;
      };
      player_color: 'white' | 'red';
      result: 'win' | 'loss' | 'draw' | 'ongoing';
      win_condition?: string;
      elo_change?: number;
      total_moves: number;
      started_at: number;
      completed_at?: number;
    }>;
    total: number;
    has_more: boolean;
    next_offset?: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.status) queryParams.set('status', params.status);
    
    const query = queryParams.toString();
    return this.request(`/users/${userId}/games${query ? `?${query}` : ''}`);
  }
  
  // Game Management Endpoints
  
  async createGame(data: {
    opponent_id: string;
    player_color?: 'white' | 'red' | 'random';
    time_control?: 'blitz' | 'rapid' | 'classical';
    is_rated?: boolean;
    is_private?: boolean;
  }): Promise<{
    game_id: string;
    white_user_id: string;
    red_user_id: string;
    status: 'pending' | 'active' | 'completed' | 'abandoned';
    current_turn: 'white' | 'red';
    started_at: number;
    websocket_url: string;
  }> {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async getGameState(gameId: string): Promise<{
    game_id: string;
    white_player: {
      user_id: string;
      username: string;
      elo_rating: number;
    };
    red_player: {
      user_id: string;
      username: string;
      elo_rating: number;
    };
    status: 'pending' | 'active' | 'completed' | 'abandoned';
    current_turn: 'white' | 'red';
    turn_number: number;
    phase: 'placement' | 'expansion' | 'encirclement' | 'endgame';
    legal_moves: Array<{ type: string; position: { q: number; r: number } }>;
    board_state: {
      stones: Array<{
        player: 'white' | 'red' | 'void';
        position: { q: number; r: number };
      }>;
    };
    move_history: Array<{
      move_number: number;
      player: 'white' | 'red';
      move_type: 'placement' | 'sacrifice';
      position?: { q: number; r: number };
      sacrifice_position?: { q: number; r: number };
      placements?: Array<{ q: number; r: number }>;
      time_taken?: number;
      created_at: number;
    }>;
    started_at: number;
    last_move_at: number;
  }> {
    return this.request(`/games/${gameId}`);
  }
  
  async makeMove(
    gameId: string,
    move: {
      type: 'placement' | 'sacrifice';
      position?: { q: number; r: number };
      sacrifice_position?: { q: number; r: number };
      placements?: Array<{ q: number; r: number }>;
    }
  ): Promise<{
    move_id: number;
    game_id: string;
    move_number: number;
    player: 'white' | 'red';
    move: {
      type: 'placement' | 'sacrifice';
      position?: { q: number; r: number };
      sacrifice_position?: { q: number; r: number };
      placements?: Array<{ q: number; r: number }>;
    };
    game_status: 'pending' | 'active' | 'completed' | 'abandoned';
    next_turn: 'white' | 'red';
    created_at: number;
  }> {
    return this.request(`/games/${gameId}/moves`, {
      method: 'POST',
      body: JSON.stringify(move),
    });
  }
  
  async resignGame(gameId: string): Promise<{
    game_id: string;
    status: 'completed';
    winner: 'white' | 'red';
    resignation: true;
    resigned_by: 'white' | 'red';
    elo_changes: {
      white: number;
      red: number;
    };
    completed_at: number;
  }> {
    return this.request(`/games/${gameId}/resign`, {
      method: 'POST',
    });
  }
  
  async getGameMoveHistory(
    gameId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<{
    game_id: string;
    moves: Array<{
      move_number: number;
      player: 'white' | 'red';
      move_type: 'placement' | 'sacrifice';
      position?: { q: number; r: number };
      sacrifice_position?: { q: number; r: number };
      placements?: Array<{ q: number; r: number }>;
      time_taken?: number;
      created_at: number;
    }>;
    total: number;
    has_more: boolean;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request(`/games/${gameId}/moves${query ? `?${query}` : ''}`);
  }
  
  async getActiveGames(params?: { limit?: number }): Promise<{
    games: Array<{
      game_id: string;
      opponent: {
        user_id: string;
        username: string;
        elo_rating: number;
      };
      player_color: 'white' | 'red';
      current_turn: 'white' | 'red';
      turn_number: number;
      last_move_at: number;
      started_at: number;
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return this.request(`/games/active${query ? `?${query}` : ''}`);
  }
  
  // Matchmaking Endpoints
  
  async joinMatchmaking(data: {
    preferred_color?: 'white' | 'red' | 'random';
    time_control?: 'blitz' | 'rapid' | 'classical';
    is_rated?: boolean;
    elo_range?: { min: number; max: number };
  }): Promise<{
    queue_position: number;
    estimated_wait_time: number;
    matched_at: number | null;
    status: 'waiting';
  }> {
    return this.request('/matchmaking/join', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async leaveMatchmaking(): Promise<void> {
    return this.request('/matchmaking/leave', {
      method: 'POST',
    });
  }
  
  async getMatchmakingStatus(): Promise<{
    in_queue: boolean;
    queue_position?: number;
    estimated_wait_time?: number;
    entered_at?: number;
    preferences?: {
      preferred_color: 'white' | 'red' | 'random';
      time_control?: 'blitz' | 'rapid' | 'classical';
      is_rated: boolean;
      elo_range?: { min: number; max: number };
    };
  }> {
    return this.request('/matchmaking/status');
  }
  
  async getMatchmakingStatistics(): Promise<{
    queue_length: number;
    average_wait_time: number;
    median_wait_time: number;
    elo_distribution: {
      min: number;
      max: number;
      mean: number;
    };
  }> {
    return this.request('/matchmaking/statistics');
  }
  
  // Invitation Endpoints
  
  async createInvitation(data: {
    invitee_user_id?: string;
    inviter_color?: 'white' | 'red' | 'random';
    time_control?: 'blitz' | 'rapid' | 'classical';
    is_rated?: boolean;
    is_public?: boolean;
    max_uses?: number;
    expires_in?: number;
  }): Promise<{
    invitation_id: string;
    inviter_user_id: string;
    invitee_user_id: string | null;
    inviter_color: 'white' | 'red' | 'random';
    time_control?: 'blitz' | 'rapid' | 'classical';
    is_rated: boolean;
    is_public: boolean;
    expires_at: number;
    invitation_url: string | null;
  }> {
    return this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async listInvitations(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    invitations: Array<{
      invitation_id: string;
      inviter_user_id: string;
      invitee_user_id: string | null;
      inviter_color: 'white' | 'red' | 'random';
      time_control?: 'blitz' | 'rapid' | 'classical';
      is_rated: boolean;
      is_public: boolean;
      created_at: number;
      expires_at: number;
    }>;
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request(`/invitations${query ? `?${query}` : ''}`);
  }
  
  async acceptInvitation(invitationId: string): Promise<{
    invitation_id: string;
    game_id: string;
    status: 'accepted';
  }> {
    return this.request(`/invitations/${invitationId}/accept`, {
      method: 'POST',
    });
  }
  
  async declineInvitation(invitationId: string): Promise<{
    invitation_id: string;
    status: 'declined';
  }> {
    return this.request(`/invitations/${invitationId}/decline`, {
      method: 'POST',
    });
  }
  
  // Leaderboard Endpoint
  
  async getLeaderboard(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{
    entries: Array<{
      rank: number;
      user_id: string;
      username: string;
      elo_rating: number;
      games_played: number;
      win_rate: number;
    }>;
    total: number;
    updated_at: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    
    const query = queryParams.toString();
    return this.request(`/leaderboard${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient();
```

### 8.2 WebSocket Manager

**lib/api/websocket.ts:**

```typescript
import { useUserStore } from '@/store/user-store';
import { useGameStore } from '@/store/game-store';

interface WebSocketMessage {
  type: string;
  game_id: string;
  payload?: any;
  state?: any;
  timestamp: number;
  sequence?: number;
}

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private maxReconnectAttempts: number = 5;
  private baseReconnectDelay: number = 1000;
  private pingInterval: number = 30000; // 30 seconds
  private wsBaseURL: string = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.zai.com/ws';
  
  async connect(gameId: string): Promise<WebSocket> {
    // Close existing connection if any
    if (this.connections.has(gameId)) {
      this.disconnect(gameId);
    }
    
    const { accessToken } = useUserStore.getState();
    if (!accessToken) {
      throw new Error('No access token available');
    }
    
    const url = `${this.wsBaseURL}/game/${gameId}?token=${accessToken}`;
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for game ${gameId}`);
      this.reconnectAttempts.set(gameId, 0);
      this.startPingInterval(gameId);
      this.handleConnectionOpen(gameId);
    };
    
    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(gameId, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for game ${gameId}:`, error);
      this.handleConnectionError(gameId);
    };
    
    ws.onclose = (event) => {
      console.log(`WebSocket closed for game ${gameId}:`, event.code, event.reason);
      this.stopPingInterval(gameId);
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000 && !event.wasClean) {
        this.attemptReconnect(gameId);
      }
    };
    
    this.connections.set(gameId, ws);
    return ws;
  }
  
  disconnect(gameId: string): void {
    const ws = this.connections.get(gameId);
    if (ws) {
      ws.close(1000, 'Client disconnect');
      this.connections.delete(gameId);
    }
    
    this.stopPingInterval(gameId);
    this.clearReconnectTimer(gameId);
  }
  
  sendMessage(gameId: string, type: string, payload: any): void {
    const ws = this.connections.get(gameId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot send message: WebSocket not connected for game ${gameId}`);
      return;
    }
    
    const message: WebSocketMessage = {
      type,
      game_id: gameId,
      payload,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    ws.send(JSON.stringify(message));
  }
  
  makeMove(gameId: string, move: {
    type: 'placement' | 'sacrifice';
    position?: { q: number; r: number };
    sacrifice_position?: { q: number; r: number };
    placements?: Array<{ q: number; r: number }>;
  }): void {
    this.sendMessage(gameId, 'move', move);
  }
  
  resignGame(gameId: string): void {
    this.sendMessage(gameId, 'resign', {});
  }
  
  requestGameState(gameId: string): void {
    this.sendMessage(gameId, 'get_state', {});
  }
  
  private startPingInterval(gameId: string): void {
    const interval = setInterval(() => {
      this.sendMessage(gameId, 'ping', {});
    }, this.pingInterval);
    
    this.pingIntervals.set(gameId, interval);
  }
  
  private stopPingInterval(gameId: string): void {
    const interval = this.pingIntervals.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(gameId);
    }
  }
  
  private handleMessage(gameId: string, message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(gameId);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }
    
    // Handle specific message types
    switch (message.type) {
      case 'game_state':
        this.handleGameState(gameId, message);
        break;
      case 'move_accepted':
        this.handleMoveAccepted(gameId, message);
        break;
      case 'move_rejected':
        this.handleMoveRejected(gameId, message);
        break;
      case 'state_update':
        this.handleStateUpdate(gameId, message);
        break;
      case 'game_end':
        this.handleGameEnd(gameId, message);
        break;
      case 'pong':
        // Heartbeat response, no action needed
        break;
      case 'error':
        this.handleError(gameId, message);
        break;
      case 'connection_closed':
        this.handleConnectionClosed(gameId, message);
        break;
    }
  }
  
  private handleGameState(gameId: string, message: WebSocketMessage): void {
    const { updateGameState } = useGameStore.getState();
    if (message.state) {
      updateGameState(gameId, message.state);
    }
  }
  
  private handleMoveAccepted(gameId: string, message: WebSocketMessage): void {
    const { addMove } = useGameStore.getState();
    if (message.payload) {
      addMove(gameId, message.payload);
    }
  }
  
  private handleMoveRejected(gameId: string, message: WebSocketMessage): void {
    // Show error notification
    console.error('Move rejected:', message.payload?.message);
    // Trigger error notification via store or event system
  }
  
  private handleStateUpdate(gameId: string, message: WebSocketMessage): void {
    const { updateGameState } = useGameStore.getState();
    if (message.payload) {
      updateGameState(gameId, message.payload);
    }
  }
  
  private handleGameEnd(gameId: string, message: WebSocketMessage): void {
    const { updateGameState } = useGameStore.getState();
    if (message.payload) {
      updateGameState(gameId, {
        status: message.payload.status,
        winner: message.payload.winner,
        win_condition: message.payload.win_condition,
      });
    }
  }
  
  private handleError(gameId: string, message: WebSocketMessage): void {
    console.error('WebSocket error:', message.payload);
  }
  
  private handleConnectionOpen(gameId: string): void {
    // Request initial game state
    this.requestGameState(gameId);
  }
  
  private handleConnectionError(gameId: string): void {
    // Connection error handling
  }
  
  private handleConnectionClosed(gameId: string, message: WebSocketMessage): void {
    console.log('Connection closed:', message.payload?.reason);
  }
  
  private attemptReconnect(gameId: string): void {
    const attempts = this.reconnectAttempts.get(gameId) || 0;
    if (attempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for game ${gameId}`);
      return;
    }
    
    const delay = this.baseReconnectDelay * Math.pow(2, attempts);
    this.reconnectAttempts.set(gameId, attempts + 1);
    
    const timer = setTimeout(() => {
      console.log(`Attempting to reconnect to game ${gameId} (attempt ${attempts + 1})`);
      this.connect(gameId).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
    
    this.reconnectTimers.set(gameId, timer);
  }
  
  private clearReconnectTimer(gameId: string): void {
    const timer = this.reconnectTimers.get(gameId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(gameId);
    }
  }
  
  onMessage(gameId: string, handler: (message: WebSocketMessage) => void): () => void {
    if (!this.messageHandlers.has(gameId)) {
      this.messageHandlers.set(gameId, new Set());
    }
    
    const handlers = this.messageHandlers.get(gameId)!;
    handlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
    };
  }
  
  isConnected(gameId: string): boolean {
    const ws = this.connections.get(gameId);
    return ws !== undefined && ws.readyState === WebSocket.OPEN;
  }
  
  cleanup(): void {
    // Disconnect all connections
    this.connections.forEach((ws, gameId) => {
      this.disconnect(gameId);
    });
    
    // Clear all timers
    this.pingIntervals.forEach(interval => clearInterval(interval));
    this.reconnectTimers.forEach(timer => clearTimeout(timer));
    
    this.connections.clear();
    this.reconnectAttempts.clear();
    this.reconnectTimers.clear();
    this.pingIntervals.clear();
    this.messageHandlers.clear();
  }
}

export const wsManager = new WebSocketManager();
```

### 8.3 Offline Queue and Sync Manager

**lib/api/sync-manager.ts:**

```typescript
import { db } from '@/lib/storage/indexeddb';
import { apiClient } from './client';

interface SyncOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity_type: 'game' | 'move' | 'user';
  entity_id: string;
  data: any;
  timestamp: number;
  retry_count: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;
  
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.startSync();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.stopSync();
      });
    }
  }
  
  async initialize(): Promise<void> {
    // Check initial online status
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (this.isOnline) {
      await this.startSync();
    }
  }
  
  async startSync(): Promise<void> {
    if (this.syncInterval) return;
    
    // Sync immediately
    await this.syncQueue();
    
    // Then sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncQueue();
    }, 30000);
  }
  
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  async syncQueue(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;
    
    this.isSyncing = true;
    
    try {
      const operations = await db.getSyncQueue();
      
      for (const operation of operations) {
        if (operation.status === 'pending' || operation.status === 'failed') {
          try {
            await this.processOperation(operation);
            await db.markSyncOperationComplete(operation.id);
          } catch (error) {
            console.error('Sync operation failed:', error);
            operation.retry_count++;
            
            if (operation.retry_count >= 5) {
              await db.markSyncOperationFailed(operation.id);
            } else {
              await db.updateSyncOperation(operation);
            }
          }
        }
      }
    } catch (error) {
      console.error('Sync queue processing error:', error);
    } finally {
      this.isSyncing = false;
    }
  }
  
  private async processOperation(operation: SyncOperation): Promise<void> {
    switch (operation.entity_type) {
      case 'game':
        await this.syncGameOperation(operation);
        break;
      case 'move':
        await this.syncMoveOperation(operation);
        break;
      case 'user':
        await this.syncUserOperation(operation);
        break;
    }
  }
  
  private async syncGameOperation(operation: SyncOperation): Promise<void> {
    if (operation.operation === 'UPDATE') {
      // Game state updates are handled via WebSocket
      // This is mainly for game creation
      if (operation.operation === 'CREATE') {
        // Game creation is already handled via API
      }
    }
  }
  
  private async syncMoveOperation(operation: SyncOperation): Promise<void> {
    if (operation.operation === 'CREATE') {
      const { game_id, move } = operation.data;
      await apiClient.makeMove(game_id, move);
    }
  }
  
  private async syncUserOperation(operation: SyncOperation): Promise<void> {
    if (operation.operation === 'UPDATE') {
      const { user_id, ...data } = operation.data;
      await apiClient.updateUserProfile(user_id, data);
    }
  }
  
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retry_count' | 'status'>): Promise<void> {
    const syncOp: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retry_count: 0,
      status: 'pending',
    };
    
    await db.addToSyncQueue(syncOp);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncQueue();
    }
  }
  
  cleanup(): void {
    this.stopSync();
  }
}

export const syncManager = new SyncManager();
```

---

## 9. IndexedDB Storage Layer

### 9.1 Database Schema and Initialization

**lib/storage/indexeddb.ts:**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ZaiDB extends DBSchema {
  games: {
    key: string;
    value: Game;
    indexes: { 'by-status': string; 'by-updated': number };
  };
  moves: {
    key: string;
    value: Move;
    indexes: { 'by-game': string; 'by-timestamp': number };
  };
  users: {
    key: string;
    value: User;
  };
  settings: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: string;
    value: SyncOperation;
    indexes: { 'by-status': string; 'by-timestamp': number };
  };
  audio_cache: {
    key: string;
    value: { data: Blob; url: string; timestamp: number };
  };
}

class IndexedDBManager {
  private db: IDBPDatabase<ZaiDB> | null = null;
  private dbName: string = 'zai-game-db';
  private version: number = 1;
  
  async initialize(): Promise<void> {
    this.db = await openDB<ZaiDB>(this.dbName, this.version, {
      upgrade(db) {
        // Games store
        if (!db.objectStoreNames.contains('games')) {
          const gamesStore = db.createObjectStore('games', { keyPath: 'game_id' });
          gamesStore.createIndex('by-status', 'status');
          gamesStore.createIndex('by-updated', 'last_move_at');
        }
        
        // Moves store
        if (!db.objectStoreNames.contains('moves')) {
          const movesStore = db.createObjectStore('moves', { keyPath: 'id' });
          movesStore.createIndex('by-game', 'game_id');
          movesStore.createIndex('by-timestamp', 'created_at');
        }
        
        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'user_id' });
        }
        
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('by-status', 'status');
          syncStore.createIndex('by-timestamp', 'timestamp');
        }
        
        // Audio cache store
        if (!db.objectStoreNames.contains('audio_cache')) {
          db.createObjectStore('audio_cache', { keyPath: 'key' });
        }
      },
    });
  }
  
  // Game operations
  async saveGame(game: Game): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('games', game);
  }
  
  async getGame(gameId: string): Promise<Game | undefined> {
    if (!this.db) await this.initialize();
    return await this.db!.get('games', gameId);
  }
  
  async getAllGames(): Promise<Game[]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAll('games');
  }
  
  async getGamesByStatus(status: string): Promise<Game[]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAllFromIndex('games', 'by-status', status);
  }
  
  async deleteGame(gameId: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete('games', gameId);
  }
  
  // Move operations
  async saveMove(move: Move): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('moves', move);
  }
  
  async getMovesByGame(gameId: string): Promise<Move[]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAllFromIndex('moves', 'by-game', gameId);
  }
  
  // User operations
  async saveUser(user: User): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('users', user);
  }
  
  async getUser(userId: string): Promise<User | undefined> {
    if (!this.db) await this.initialize();
    return await this.db!.get('users', userId);
  }
  
  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('settings', { key, value });
  }
  
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.db) await this.initialize();
    const result = await this.db!.get('settings', key);
    return result ? result.value : defaultValue;
  }
  
  async deleteSetting(key: string): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.delete('settings', key);
  }
  
  // Sync queue operations
  async addToSyncQueue(operation: SyncOperation): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('sync_queue', operation);
  }
  
  async getSyncQueue(): Promise<SyncOperation[]> {
    if (!this.db) await this.initialize();
    return await this.db!.getAllFromIndex('sync_queue', 'by-status', 'pending');
  }
  
  async markSyncOperationComplete(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    const operation = await this.db!.get('sync_queue', id);
    if (operation) {
      operation.status = 'completed';
      await this.db!.put('sync_queue', operation);
    }
  }
  
  async markSyncOperationFailed(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    const operation = await this.db!.get('sync_queue', id);
    if (operation) {
      operation.status = 'failed';
      await this.db!.put('sync_queue', operation);
    }
  }
  
  async updateSyncOperation(operation: SyncOperation): Promise<void> {
    if (!this.db) await this.initialize();
    await this.db!.put('sync_queue', operation);
  }
  
  // Audio cache operations
  async cacheAudio(key: string, blob: Blob): Promise<string> {
    if (!this.db) await this.initialize();
    const url = URL.createObjectURL(blob);
    await this.db!.put('audio_cache', {
      key,
      data: blob,
      url,
      timestamp: Date.now(),
    });
    return url;
  }
  
  async getCachedAudio(key: string): Promise<string | null> {
    if (!this.db) await this.initialize();
    const cached = await this.db!.get('audio_cache', key);
    if (cached && Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) {
      // Cache valid for 7 days
      return cached.url;
    }
    return null;
  }
  
  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.initialize();
    const cache = await this.db!.getAll('audio_cache');
    const now = Date.now();
    
    for (const item of cache) {
      if (now - item.timestamp > maxAge) {
        URL.revokeObjectURL(item.url);
        await this.db!.delete('audio_cache', item.key);
      }
    }
  }
}

export const db = new IndexedDBManager();
```

---

## 10. Progressive Web App (PWA) Configuration

### 10.1 Service Worker and Offline Support

**public/sw.js:**

```javascript
const CACHE_NAME = 'zai-game-v1';
const RUNTIME_CACHE = 'zai-runtime-v1';
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip API requests (handled by IndexedDB sync)
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Skip WebSocket connections
  if (url.protocol === 'wss:' || url.protocol === 'ws:') {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
    })
  );
});

// Background sync for game state
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-state') {
    event.waitUntil(syncGameState());
  }
});

async function syncGameState() {
  // Trigger sync manager to process queue
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_GAME_STATE' });
  });
}
```

### 10.2 PWA Manifest Configuration

**public/manifest.json:**

```json
{
  "name": "Zai Legends - Strategic Hexagonal Racing",
  "short_name": "Zai Legends",
  "description": "High-speed strategic racing game with hexagonal board mechanics",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#00f0ff",
  "orientation": "any",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["games", "entertainment"],
  "shortcuts": [
    {
      "name": "Quick Match",
      "short_name": "Match",
      "description": "Join matchmaking queue",
      "url": "/matchmaking",
      "icons": [{ "src": "/icons/shortcut-match.png", "sizes": "96x96" }]
    },
    {
      "name": "Active Games",
      "short_name": "Games",
      "description": "View active games",
      "url": "/games",
      "icons": [{ "src": "/icons/shortcut-games.png", "sizes": "96x96" }]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

### 10.3 Next.js PWA Integration

**next.config.js:**

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.zai\.com\/api\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|ogg|wav)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.zai.com', 'localhost:8000'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

module.exports = withPWA(nextConfig);
```

**app/layout.tsx:**

```typescript
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Zai Legends - Strategic Hexagonal Racing',
  description: 'High-speed strategic racing game with hexagonal board mechanics',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zai Legends',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Zai Legends',
    title: 'Zai Legends - Strategic Hexagonal Racing',
    description: 'High-speed strategic racing game',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zai Legends',
    description: 'Strategic hexagonal racing game',
  },
};

export const viewport: Viewport = {
  themeColor: '#00f0ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## 11. UI Components with shadcn/ui and Asphalt Legends Theme

### 11.1 Theme Configuration

**lib/theme/colors.ts:**

```typescript
export const asphaltLegendsTheme = {
  colors: {
    // Primary neon colors
    primary: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff',
      600: '#00f0ff', // Main cyan
      700: '#0099cc',
      800: '#006699',
      900: '#003366',
    },
    // Secondary accent colors
    secondary: {
      50: '#fff0f6',
      100: '#ffd6e7',
      200: '#ffadd6',
      300: '#ff85c2',
      400: '#ff5cad',
      500: '#ff00e5', // Main magenta
      600: '#cc00b8',
      700: '#99008a',
      800: '#66005c',
      900: '#33002e',
    },
    // Dark backgrounds
    dark: {
      50: '#1a1a2e',
      100: '#16213e',
      200: '#0f1419',
      300: '#0a0a0f',
      400: '#050508',
      500: '#000000',
    },
    // Racing track colors
    track: {
      asphalt: '#1a1a2a',
      line: '#ffd700',
      glow: '#00f0ff',
    },
    // Status colors
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff3366',
    info: '#00f0ff',
  },
};
```

**app/globals.css:**

```css
@import 'tailwindcss';

@theme {
  --color-primary-50: #e6f7ff;
  --color-primary-600: #00f0ff;
  --color-secondary-500: #ff00e5;
  --color-dark-300: #0a0a0f;
  --color-track-asphalt: #1a1a2a;
  
  --font-sans: 'Inter', system-ui, sans-serif;
  
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-dark-300 text-white antialiased;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 0, 229, 0.1) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
    background-attachment: fixed;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-dark-200;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-primary-600 rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-primary-500;
  }
}

@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent;
  }
  
  .glow-primary {
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.5);
  }
  
  .glow-secondary {
    box-shadow: 0 0 20px rgba(255, 0, 229, 0.5);
  }
  
  .racing-border {
    border: 2px solid transparent;
    background: linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                linear-gradient(135deg, #00f0ff, #ff00e5) border-box;
  }
}
```

### 11.2 Core UI Components

**components/ui/button.tsx:**

```typescript
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-500 glow-primary active:scale-95',
        destructive: 'bg-error text-white hover:bg-red-600',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600/10',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 glow-secondary',
        ghost: 'hover:bg-white/10 hover:text-primary-600',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        racing: 'racing-border bg-gradient-to-r from-primary-600/20 to-secondary-500/20 text-white hover:from-primary-600/30 hover:to-secondary-500/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**components/game/GameBoard.tsx:**

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { useGameStore } from '@/store/game-store';
import { boardRenderer } from '@/lib/rendering/board-renderer';
import { particleSystem } from '@/lib/rendering/particle-system';

export function GameBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentGameId, activeGames, selectedHex, legalMoves } = useGameStore();
  
  const game = currentGameId ? activeGames.get(currentGameId) : null;
  const stones = game?.board_state?.stones || [];
  
  useEffect(() => {
    if (containerRef.current) {
      boardRenderer.initialize(containerRef.current);
    }
    
    if (canvasRef.current) {
      particleSystem.initialize(canvasRef.current);
    }
    
    return () => {
      boardRenderer.cleanup();
      particleSystem.cleanup();
    };
  }, []);
  
  useEffect(() => {
    if (game) {
      boardRenderer.renderBoard(
        stones,
        legalMoves,
        selectedHex
      );
    }
  }, [stones, legalMoves, selectedHex, game]);
  
  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
```

**components/game/GameHUD.tsx:**

```typescript
'use client';

import { useGameStore } from '@/store/game-store';
import { useUserStore } from '@/store/user-store';
import { Timer, Trophy, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function GameHUD() {
  const { currentGameId, activeGames } = useGameStore();
  const { user } = useUserStore();
  
  const game = currentGameId ? activeGames.get(currentGameId) : null;
  if (!game) return null;
  
  const isPlayerTurn = game.current_turn === (game.white_user_id === user?.user_id ? 'white' : 'red');
  
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex gap-4">
      <Card className="bg-dark-200/90 backdrop-blur-sm border-primary-600/50 p-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-mono">05:23</span>
        </div>
      </Card>
      
      <Card className="bg-dark-200/90 backdrop-blur-sm border-secondary-500/50 p-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-secondary-500" />
          <span className="text-sm">Turn {game.turn_number}</span>
        </div>
      </Card>
      
      {isPlayerTurn && (
        <Card className="bg-primary-600/20 border-primary-600 p-4 animate-pulse">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold">Your Turn</span>
          </div>
        </Card>
      )}
    </div>
  );
}
```

---

## 12. Installation and Setup Instructions

### 12.1 Project Initialization

**Windows PowerShell Commands:**

```powershell
# Create Next.js 16 project
npx create-next-app@16 zai-client --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Navigate to project
cd zai-client

# Install core dependencies (NO VERSIONS)
npm install next@latest react@latest react-dom@latest

# Install Tailwind CSS 4+
npm install tailwindcss@latest postcss@latest autoprefixer@latest

# Install shadcn/ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-tooltip

# Install state management
npm install zustand immer

# Install IndexedDB library
npm install idb

# Install Canvas rendering
npm install konva react-konva

# Install Web Audio API library
npm install howler

# Install icons
npm install lucide-react

# Install PWA support
npm install next-pwa

# Install form handling
npm install react-hook-form @hookform/resolvers zod

# Install API client utilities
npm install axios

# Initialize shadcn/ui
npx shadcn@latest init -d
```

### 12.2 Environment Configuration

**.env.local:**

```env
NEXT_PUBLIC_API_URL=https://api.zai.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.zai.com/ws
NEXT_PUBLIC_APP_NAME=Zai Legends
```

### 12.3 Development Scripts

**package.json scripts:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 13. Code Quality and Best Practices

### 13.1 TypeScript Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 13.2 ESLint Configuration

**.eslintrc.json:**

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 13.3 Error Boundaries

**components/ErrorBoundary.tsx:**

```typescript
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <AlertTriangle className="w-16 h-16 text-error mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 14. Testing Strategy

### 14.1 Unit Testing Setup

```powershell
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

---

## 15. Deployment Checklist

- [ ] All API endpoints integrated and tested
- [ ] WebSocket connections stable with reconnection logic
- [ ] IndexedDB schema initialized and migrations handled
- [ ] PWA manifest configured with all required icons
- [ ] Service worker registered and caching strategies implemented
- [ ] Offline queue sync working correctly
- [ ] Game state persistence across page reloads
- [ ] Audio assets cached in IndexedDB
- [ ] Canvas rendering optimized for 60fps
- [ ] Error boundaries implemented
- [ ] Loading states and skeletons for all async operations
- [ ] Responsive design tested on mobile and desktop
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] SEO metadata configured
- [ ] Analytics integration (if required)

---

This PRD provides a comprehensive blueprint for building a production-ready game client with Next.js 16, featuring offline-first architecture, PWA capabilities, and a stunning Asphalt Legends-inspired theme. All code follows senior-level best practices with modular architecture, robust error handling, and complete API integration.