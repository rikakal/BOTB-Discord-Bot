# BOTB-bot
Beedo. 🤖

## Summary
This is a Discord bot specifically designed for Battle of the Brook (BOTB), which is a tournament that runs every semester with 60-80 players, to automate the process of manually creating each individual team role, text channel, and voice channel, and setting the permissions for those channels. All the commands process the data in bulk, i.e.: there are no commands for handling smaller chunks of data or individual teams. 

**NOTE:** the mock data this bot was built off was a smaller scale with 2 players for each team. Additionally, the bot expects the Excel sheet to have each player's details in a specific format per column: Player 1 First Name, Player 1 Last Name, Player 1 Email, Player 1 Discord. 

*Please update any variables with "MAGIC" to fit your needs. The data parsing can be updated as well to fit the format of your Excel sheet.*

### Setup
1) Create your Discord bot from the Discord Developer Portal.
2) *Optional, but recommended: create your own MongoDB database on MongoDB Atlas*
3) Download the Excel sheet of team and player details. Each row indicates a unique team.
4) Set up your .env file with the following: **TOKEN** (OAuth Token), **DB** (MongoDB connection string), **CLIENTID** (Bot Account), **GUILDID** (Discord server)
5) Clone this repository.
6) Use ``npm install`` to install all the necessary packages.

### How to Use
Start up bot? ``npm start``

Run tests? ``npm test``

### Commands
``/generate-database`` : parses data from the inputted file, formats data into defined schema models, creates and saves into the database

``/create-roles`` : creates team roles in the Discord server (guild)

``/create-channels`` : creates team text channel and voice channel in the Discord server (guild)

``/assign-roles`` : assigns team roles to Discord accounts based on username

``/assign-channels`` : assigns team channels to the created team roles (**NOTE:** *only the bot and roles with Administrator or the team role can view these channels. @everyone role cannot.*)

``/generate-report`` : returns a report of all team details for creation, assignment, and Discord users not in the Discord server (guild)

``/delete-channels-roles`` : deletes (only) all the team channels and team roles created by the bot

``/delete-database`` : deletes everything in the database (**NOTE: THIS WILL <ins>NOT</ins> DELETE THE GENERATED CHANNELS OR ROLES** )

## Structure
### /src
``/commands`` - All the commands programmed for the code, with ``execute()`` that calls a REST API

``/routes`` - Routes the endpoint called from ``/commands`` to the controller

``/controllers`` - Routes the endpoint received to the service

``/services`` - Business logic

``/models`` - Defined schemas for MongoDB

``/tests`` - Integration tests 

``app.js`` - Entry point of application

``bot.js`` - Configuration for the Discord bot

``database.js`` - Connection to MongoDB database

``deploy-commands.js`` - Registers commands to the Discord bot (per server, i.e.: guild) **NOTE: you must run this the first time before your bot can recognize the commands in ``/commands`` in Discord via ``node src/deploy-commands``**
