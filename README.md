# Works-magnet

[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/TudsqDqTqb)
![license](https://img.shields.io/github/license/dataesr/works-magnet)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/dataesr/works-magnet)
[![deployment](https://github.com/dataesr/works-magnet/actions/workflows/production.yml/badge.svg)](https://github.com/dataesr/works-magnet/actions/workflows/production.yml)
![website](https://img.shields.io/website?url=https%3A%2F%2Fworks-magnet.esr.gouv.fr)
[![SWH](https://archive.softwareheritage.org/badge/origin/https://github.com/dataesr/works-magnet)](https://archive.softwareheritage.org/browse/origin/?origin_url=https://github.com/dataesr/works-magnet)

Retrieve and promote the scholarly works of your institution.

## Build for production

The react client app is served by the node server in production.

## Requirements

node >= 20

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
npm run deploy -- [patch|minor|major]
```

:warning: Obviously, only members of the [dataesr organization](https://github.com/dataesr/) have rights to push on the repo.