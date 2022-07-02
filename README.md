# Pandabot

Pandabot is a Discord bot that can keep track of Minecraft waypoints and worlds.

## [Add Pandabot To Your Server](https://discord.com/api/oauth2/authorize?client_id=202325005621657600&permissions=2415921152&scope=bot%20applications.commands)

## Summary

- [Pandabot](#pandabot)
  - [Add Pandabot To Your Server](#add-pandabot-to-your-server)
  - [Summary](#summary)
  - [Repository](#repository)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [MongoDB](#mongodb)
    - [Discord](#discord)
  - [Changelog](#changelog)
  - [Built With](#built-with)
  - [License](#license)

## Repository

Pandabot is available on [Github](https://github.com/garonfok/pandabot) under the MIT license

## Features

- Store and manage Minecraft worlds as Discord roles
- Store and manage waypoints in each Minecraft world

## Getting Started

### MongoDB

Get the connection string from your MongoDB cluster and add it to MONGO_URI in [.env](.env.example).

### Discord

- Add your bot token and test server's guild id to [.env](.env.example).

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## Built With

- [Contributor Covenant](https://www.contributor-covenant.org/) - Used for the Code of Conduct
- [MIT](https://opensource.org/licenses/MIT) - Used to choose the license

## License

This project is licensed under the [MIT](LICENSE)
License.
