# Works magnet

[![Discord Follow](https://dcbadge.vercel.app/api/server/TudsqDqTqb?style=flat)](https://discord.gg/TudsqDqTqb)
![license](https://img.shields.io/github/license/dataesr/works-magnet)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/dataesr/works-magnet)
[![Production deployment](https://github.com/dataesr/works-magnet/actions/workflows/production.yml/badge.svg)](https://github.com/dataesr/works-magnet/actions/workflows/production.yml)

Retrieve the scholarly works of your institution.

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

## Deployment

The version number follows [semver](https://semver.org/).

To deploy in production, simply run this command from your staging branch :

```sh
npm run deploy --level=[patch|minor|major]
```

:warning: Obviously, only members of the [dataesr organization](https://github.com/dataesr/) have rights to push on the repo.