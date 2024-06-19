# VoguhBot

## What is VoguhBot
VoguhBot emerged as a "self-hosted" solution for a simple Twitch bot that responds to sub/resub
events, raids, and chat commands. I also decided to include an integrated clip command via a webhook
with Discord.


## Libraries
#### Core
- [`@twurple/api`](https://www.npmjs.com/package/@twurple/api) and [`@twurple/chat`](https://www.npmjs.com/package/@twurple/chat): I decided to use these libraries because
they already provides me with access to Twitch API endpoints and Twitch IRC chat with great typing
and ease of use;
- [`typeorm`](https://www.npmjs.com/package/typeorm): TypeORM is used to provide an interface with
database, by default VoguhBot supports PostgreSQL, MySQL, MariaDB and SQLite.

#### Logging
- [`winston`](https://www.npmjs.com/package/winston): Simple yet customizable logging library;


## Development

### File import/export

I decided not to use relative paths in the project, opting instead for the path alias approach and
absolute paths.

For better file control and scope, I chose to define that each file will mostly represent a class
with a specific purpose. However, I didn't limit myself to using just one export. Some files have
more than one export with items related to the main class.


## License

This project is under the [Apache License Version 2.0](LICENSE)