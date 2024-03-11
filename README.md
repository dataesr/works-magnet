# Works magnet

[![Discord Follow](https://dcbadge.vercel.app/api/server/RaXZtDua?style=flat)](https://discord.gg/RaXZtDua)
[![Staging deployment](https://github.com/dataesr/works-magnet/actions/workflows/staging.yml/badge.svg)](https://github.com/dataesr/works-magnet/actions/workflows/staging.yml)


Retrieve the scholarly works of your institution - Based on French OSM and OpenAlex

## Build for production

The react client app is served by the node server in production.

## Install and run app

Run

```sh
npm i && npm start
```

Web App available at http://localhost:5173/ and API at http://localhost:3000/.

## Build app

```sh
npm run build
```

Vite build creates a build in `/dist` folder. This folder has to be moved to the `/server` folder.