# Vejice - Slovenian Commas Checker for Microsoft Word

A Word add-in that checks Slovenian text for missing or incorrect comma placement in real-time.

Supported on:
- Word Desktop (Windows and Mac)
- Word Online (Office 365)

## Overview

Vejice analyzes Slovenian text and suggests corrections for:
- Missing commas
- Incorrect comma placement
- Redundant commas

## Getting Started

Prerequisites:
- Node.js 16+
- npm 8+
- Microsoft Word
- Git

Installation:

```bash
git clone <repository-url>
cd vejice_2
npm install
cp .env.example .env
npx office-addin-dev-certs install
```

Configure `.env` with your API key:

```env
VEJICE_API_KEY=your-api-key
VEJICE_API_URL=https://127.0.0.1:4001/api/postavi_vejice
```

## Development

Running on Desktop Word:

```bash
npm run build:dev
npm start -- desktop --app word
```

Running on Word Online:

```bash
npm run start:web
```

Then upload the manifest at: https://localhost:4001/manifest.web.xml

Stop debugging:

```bash
npm run stop
```

## Building for Production

```bash
npm run build
```

Update the manifest files (`src/manifests/manifest.prod.xml` and `src/manifests/manifest.web.prod.xml`) with your domain, then deploy the contents of the `docs` folder to your web server.

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run build:dev` | Development build with sourcemaps |
| `npm run build` | Production build (minified) |
| `npm run watch` | Watch for file changes and rebuild |
| `npm run dev-server` | Start webpack dev server only |
| `npm start -- desktop --app word` | Run on Word Desktop |
| `npm run start:web` | Run on Word Online |
| `npm run stop` | Stop Word Desktop debugging |
| `npm run stop:web` | Stop Word Online debugging |
| `npm run lint:fix` | Fix code style issues |
| `npm run validate` | Validate manifest file |

## Troubleshooting

Certificate issues:

```bash
npx office-addin-dev-certs uninstall
npx office-addin-dev-certs install
```

Cannot connect to localhost:4001:

```bash
npm run dev-server
```

Add-in not loading:

```bash
npm run validate
```

Check the browser console (F12) for JavaScript errors.

API errors (403, timeout):
- Verify the API key in `.env` is correct
- Check your internet connection


## License

