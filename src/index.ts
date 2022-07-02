import { Client, Intents } from "discord.js";
import WOKCommands from "wokcommands";
import path from "path";
import "dotenv/config";

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const channelId = process.env.DISCORD_CHANNEL_ID;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

console.log("Bot is starting...");

client.on("ready", () => {
  new WOKCommands(client, {
    testServers: [guildId!],
    commandsDir: path.join(__dirname, "commands"),
    typeScript: true,
    mongoUri: process.env.MONGO_URI!,
    disabledDefaultCommands: [
      "language"
    ]
  })
    .setColor("#1d252c")
    .setDefaultPrefix("!")
    .setDisplayName("Pandabot");
});

client.login(token);

// client.once("ready", () => {
//   client.channels.fetch(channelID!).then(channel =>
//     console.log("Hello world!")
//   )
// })
