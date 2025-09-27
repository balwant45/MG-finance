#repository structure
my-app/
├── public/                  # Static assets (favicon, manifest, etc.)
│   └── index.html
├── src/                     # Application source code
│   ├── assets/              # Images, fonts, icons
│   ├── components/          # Reusable UI components
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── Button.module.css
│   ├── pages/               # Route-level components
│   │   └── Home/
│   │       ├── Home.tsx
│   │       └── Home.module.css
│   ├── layouts/             # Shared layout components (e.g., Navbar, Footer)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API calls and external integrations
│   ├── store/               # State management (Redux/Zustand)
│   ├── utils/               # Helper functions and utilities
│   ├── config/              # App-wide configuration (e.g., theme, env)
│   ├── types/               # TypeScript interfaces and types
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global CSS (Tailwind directives)
├── .eslintrc.cjs            # ESLint config
├── .prettierrc              # Prettier config
├── tailwind.config.js       # TailwindCSS config
├── postcss.config.js        # PostCSS config
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── package.json             # Project metadata and dependencies
└── README.md                # Project overview and setup instructions
