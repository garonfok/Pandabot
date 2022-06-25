import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import schema from "../database-schema/minecraft/worlds";

export default {
  category: "Minecraft",
  description: "Shows all worlds in the database",
  slash: true,
  guildOnly: true,

  callback: async ({ interaction }) => {
    const worlds = await schema.find({ guildId: interaction.guild!.id });

    const embed = new MessageEmbed()
      .setTitle("Minecraft Worlds")
      .setDescription("Currently registered worlds:");

    for (const world of worlds) {
      embed.addField(world.worldName, `Seed: ${world.seed}`, false);
    }

    return embed;
  },
} as ICommand;
