# Agents Instructions

## Product Overview
- AstroBookings is a fictional backend API for rocket launch bookings.
- The current API provides health checks and in-memory rocket management.
- It is a training project, not a production service.

## Technical Implementation

### Tech Stack
- Language: **TypeScript 5.7**
- Framework: **Express 5**
- Database: **In-memory Map; data resets when the server restarts**
- Security: **No authentication; validate inputs; not production-ready**
- Testing: **Node.js test runner via tsx**
- Logging: **console**

### Development workflow
```bash
# Set up the project
npm install
# Build/Compile the project
npm run build
# Run the project
npm run dev
# Test the project
npm test
npm run typecheck
# Deploy the project
# No deployment workflow is configured.
```

### Folder structure
```text
.                         # Project root
├── AGENTS.md             # Instructions for AI agents
├── README.md             # Project overview and API usage
├── CHANGELOG.md          # Release history
├── package.json          # Scripts and dependencies
├── tsconfig.json         # TypeScript configuration
├── specs/                # Feature specifications
├── src/                  # Express app and API routes
└── tests/                # End-to-end API tests
```

## Environment
- Code and documentation must be in English.
- Chat responses must be in the language of the user prompt.
- Sacrifice grammar for conciseness in responses.
- This is a windows environment using git bash terminal.
- My default branch is `main`.
