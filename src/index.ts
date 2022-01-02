require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
const prefix = require("discord-prefix");
const { greetings } = require("../config.json");

// if server has no given prefix, use default
let defaultPrefix = "!";

var punctuation =
  /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg: any) => {
  // Stop code execution if message is DM
  if (!msg.guild) return;

  // GREETINGS

  // Greets the user if they greet the bot
  const msgArray = msg.content
    .toLowerCase()
    .replace(punctuation, "")
    .split(" ");
  if (
    (greetings.includes(msgArray[0]) && msgArray[1] === "panda") ||
    msgArray[1] === "pandabot"
  ) {
    msg.channel.send(`Hi ${msg.author}!`);
  }

  // HEY PANDA
  if (
    msg.content.toLowerCase() === "hey panda" ||
    msg.content.toLowerCase() === "hey pandabot"
  ) {
    if (msg.content.toUpperCase() === msg.content) {
      msg.channel.send("HEY WHAT?");
    } else {
      msg.channel.send("Hey what?");
    }
  }

  // Get prefix for Discord server
  let guildPrefix = prefix.getPrefix(msg.guild.id);

  // Set default prefix if none is set
  if (!guildPrefix) {
    guildPrefix = defaultPrefix;
  }
});

client.login(process.env.DISCORD_TOKEN);
