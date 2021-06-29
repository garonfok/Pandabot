const Discord = require('discord.js');
const client = new Discord.Client()
const prefix = require('discord-prefix');
const {token, greetings} = require('./config.json');

// if server has no set prefix
let defaultPrefix = '!';

var punctuation = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
    // Stop code execution if message received in DM
    if (!msg.guild) return;

    // GREETINGS

    // Greets the user if they greet the bot
    if (msg.channel.type === 'dm') return;
    const msgArray = msg.content.toLowerCase().replace(punctuation, '').split(' ');
    if (greetings.includes(msgArray[0]) && (msgArray[1] === 'panda' || msgArray[1] === 'pandabot')){
        msg.channel.send(`Hi ${msg.author}!`);
    }

    // HEY PANDA
    if (msg.content.toLowerCase() === 'hey panda' || msg.content.toLowerCase() === 'hey pandabot'){
        if (msg.content=== msg.content.toUpperCase() ) {
            msg.channel.send('HEY WHAT?');
        } else{
            msg.channel.send('Hey what?');
        }
    }

    // Get prefix for Discord server
    let guildPrefix = prefix.getPrefix(msg.guild.id);

    // Set prefix to default if none
    if (!guildPrefix) guildPrefix = defaultPrefix;
})

client.login(token)
