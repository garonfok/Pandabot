import { ICommand } from "wokcommands";

import { MessageEmbed } from "discord.js";

export default {
  slash: true,
  category: "Utility",
  description: "Shows help for a command",
  callback: ({ instance, interaction }) => {
    let embed = new MessageEmbed()
      .setColor("#70b237")
      .setTitle("Help Menu")
      .setDescription("Shows available commands for Pandabot.");

    instance.commandHandler.commands.forEach((command: any) => {
      if (!command.testOnly && command.category != 'Configuration') {
        embed.addField(command.names.toString(), command.description);
        console.log(command);
      }
    });

    embed.setFooter({
      text: "Do not rename, change, delete, or otherwise modify any of the roles created by Pandabot. This WILL break the bot!",
    });

    interaction
      .reply({
        embeds: [embed],
      })
      .then(() =>
        console.log(`Command "${interaction.commandName}" finished running.`)
      )
      .catch(console.error);
  },
} as ICommand;
