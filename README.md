# Fairy Lights Controller

A React application for controlling fairy lights, modernized with Vite and PWA capabilities.

## Features

- **Modern Stack**: Built with React 18 and Vite.
- **PWA Ready**: Installable on Android/iOS as a standalone app.
- **Responsive**: Mobile-friendly UI with Ant Design.
- **Efficient**: Fast build times and optimized assets.

## Getting Started

### Prerequisites

- Node.js 24 (required by `.nvmrc` and `package.json`)
- npm

> **Tip:** If you use `nvm`, you can run `nvm use` to automatically switch to the correct Node version.

### Installation

```bash
npm install
```

### Development

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

```bash
npm start
```

The app uses the same-origin `/api` path. During development, Vite proxies that
path to the stateful backend simulator at `http://127.0.0.1:8081`. Start
`react_api_simulator.py` from the sibling backend repository before running:

```bash
npm start
```

Set `VITE_API_BASE_URL` only when deliberately targeting a different API origin.
Production deployment requires Apache to proxy `/api/` to
`http://127.0.0.1:8080/`; deploy this build together with that Apache change.

The client bounds each request to four seconds, avoids overlapping status polls,
and shows connection or command failures in the page instead of silently keeping
stale state.

### Tests

Run the timer, API-client, and component tests with:

```bash
npm test
```

### Build

Builds the app for production to the `build` folder.

```bash
npm run build
```

The client uses the coordinated API contract implemented by the production
Python 2-compatible backend: mode changes and timer creation use `POST`, timer
cancellation uses `DELETE`, and status responses include the pending timer's
target and due time.

## Deployment

Do not copy `build/` into `/var/www/html` manually. Production releases pair
the frontend and backend commit hashes, switch versioned symlinks atomically,
run health checks, and retain a paired rollback target.

From the sibling `RPIFairyLights` repository, run:

```bash
nvm use
./deployment/deploy.sh
```

The script builds this project locally with Node 24 and deploys both projects.
See `RPIFairyLights/deployment/README.md` for release paths, verification, and
rollback instructions.

Production is intentionally LAN-only. Apache serves the UI over HTTP and HTTPS
and proxies `/api/` to the loopback-only backend. Do not expose it through
ngrok, another public tunnel, or a router port-forward: the controller has no
authentication and changes physical hardware state.

The Pi already has Apache HTTPS configured with a self-signed certificate.
Regenerating or replacing that certificate is a separate administrative task,
not part of an ordinary application deployment.

### iOS Support

Project supports "Add to Home Screen" on iOS (iPhone/iPad) as well.
1.  Open the site in **Safari**.
2.  Tap the **Share** button (box with an arrow pointing up).
3.  Scroll down and tap **"Add to Home Screen"**.
4.  Confirm the name and tap "Add".

PWA installation requires a trusted HTTPS context. Because the Pi uses a
self-signed certificate, the device may need to trust or explicitly accept it
before installation is offered.
