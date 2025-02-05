# BOTB-bot
Beedo. 🤖

## SUMMARY
This is a Discord bot specifically designed for Battle of the Brook (BOTB), which is a tournament that runs every semester with 60-80 players, to automate the process of manually creating each individual team role, text channel, and voice channel, and setting the permissions for those channels. All the commands process the data in bulk, i.e.: there are no commands for handling smaller chunks of data or individual teams. 

# Demo
![](https://github.com/rikakal/BOTB-Discord-Bot/blob/main/demo.gif)

## LIMITATIONS
*Disclaimer: these instructions are for Discord's website current format as of February 5, 2025 -- Discord may change this format in the future. This is also using Discord.js version 14.16.3*

The bot is currently configured to only allow commands from users who have a role that has the "Create Events" permission enabled. Users who are Administrators are able to use the bot commands.

**NOTE:** the mock data this bot was built off was a smaller scale with 2 players for each team. Additionally, the bot expects the Excel sheet to have each player's details in a specific format per column: *Player 1 First Name, Player 1 Last Name, Player 1 Email, Player 1 Discord...*

*Please update any variables with "MAGIC" to fit your needs in:*
- *``databaseService.js`` line 8*
- *``channelService.js`` line 4*
- *``playerService.js`` line 2*

*The data parsing can be updated as well to fit the format of your Excel sheet in ``databaseService.js`` line 99.*

## SETUP
Required:
- Discord account
- Discord bot
- MongoDB Atlas (free tier)
- Node.js

### Repository
1) Clone this repository
2) Use ``npm install`` to install all the necessary packages
3) Create a **.env file**

### .env file contents
TOKEN=""

DB=""

CLIENTID=""

GUILDID=""

### Discord 
1) Create your Discord bot from the Discord Developer Portal.
2) Installation > Installation Contexts > Have only Guild Install checked 
3) Installation > Installation Contexts > Install Link > None
4) Bot > Reset Token > Copy this token and **paste it in the .env file for TOKEN**
5) Bot > Disable Public Bot
6) Bot > Enable Server Members Intent
7) Bot > Enable Message Content Intent
8) OAuth2 > Copy Client ID and **paste it in the .env file for CLIENTID**
9) OAuth2 > OAuh2 URL Generator > Click on **applications.commands** and **bot**
10) Now another section should pop up. Click on Administrator
11) Scroll down to get the "Generated URL" and copy it
12) Paste the URL in a web browser
13) Add the bot to one of your servers *(you need to enable Developer Mode on your account Settings to right-click on the server and copy the server ID, which you **paste it in the .env file for GUILDID**)*

### Database
1) Create an account on MongoDB Atlas
2) Create a database
3) On the pop-up for connecting to your database, click on "Drivers"
4) Copy the Uri string (it should start with "mongodb+srv:") and **paste it in the .env file for DB**



## HOW TO USE
**REQUIRED, MUST RUN THIS THE FIRST TIME TO LOAD COMMANDS TO THE BOT** *and everytime there are any updates to commands*: ``npm src/deploy-commands``

Start up bot? ``npm start``

Run tests? ``npm test``

## COMMANDS
``/generate-database`` : parses data from the inputted file, formats data into defined schema models, creates and saves into the database

``/create-roles`` : creates team roles in the Discord server (guild)

``/create-channels`` : creates team text channel and voice channel in the Discord server (guild)

``/assign-roles`` : assigns team roles to Discord accounts based on username

``/assign-channels`` : assigns team channels to the created team roles (**NOTE:** *only the bot and roles with Administrator or the team role can view these channels. @everyone role cannot.*)

``/generate-report`` : returns a report of all team details for creation, assignment, and Discord users not in the Discord server (guild)

``/delete-channels-roles`` : deletes (only) all the team channels and team roles created by the bot

``/delete-database`` : deletes everything in the database (**NOTE: THIS WILL <ins>NOT</ins> DELETE THE GENERATED CHANNELS OR ROLES** )

## STRUCTURE
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
