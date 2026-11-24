# Telebot
Telegram economy and pet bot.

## Setup
1. Set hosting environment variables: `BOT_TOKEN`, `MONGO_URI`, `MONGO_DB`, `PANEL_PASSWORD`.
2. In `setting.json`, keep your admin IDs/usernames and database name; do not put secrets in the repository.
3. Install: `npm install`.
4. Run: `npm start`.

## Admin web panel
Open the app's root URL. Sign in using `PANEL_PASSWORD` configured in your hosting environment. Panel sessions expire after 8 hours.

Features: overview stats, user search/profile view, balance management, ban/unban with reason, admin add/remove, and session activity log.

## Commands
/help, /profile (/bal), /daily (/spin), /setname, /slots bet (5-slot), /same symbol bet (3× matching), /pet.
Works in private chats and groups; commands may be sent as `/command@BotUsername`. Reply-target features are supported where applicable.
