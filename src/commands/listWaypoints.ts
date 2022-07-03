import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import schemaWaypoints from "../database-schema/minecraft/waypoints";
import schemaPlayers from "../database-schema/minecraft/players";
import mongoose from "mongoose";

interface WaypointsDocument extends mongoose.Document {
  // Database schema for waypoints
  guildId: string;
  roleId: string;
  waypointName: string;
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
}
interface PlayersDocument extends mongoose.Document {
  guildId: string;
  roleId: string;
  playerId: string;
}

export default {
  category: "Minecraft",
  description: "Shows all waypoints in the currently selected world",
  slash: true,
  guildOnly: true,

  callback: async ({ interaction }) => {
    // Delete dummy waypoint if it exists
    await mongoose
      .model<WaypointsDocument>("waypoints")
      .findOneAndDelete({ roleId: "dummy" });

    // Grab roleId on player
    const playerModel = (await mongoose
      .model<PlayersDocument>("players")
      .findOne({ playerId: interaction.user?.id })) as PlayersDocument;

    // Quit if player does not have a role
    if (!playerModel) {
      interaction.reply({
        content: "Error: You must have a Minecraft role selected!",
        ephemeral: true,
      });
      return;
    }

    const waypoints = await schemaWaypoints.find({
      guildId: interaction.guild!.id,
      roleId: playerModel.roleId,
    });

    const embed = new MessageEmbed()
      .setTitle("World Waypoints")
      .setDescription("Currently registered waypoints:");

    for (const w of waypoints) {
      embed.addField(
        w.waypointName,
        `X: ${w.coordinateX}\nY: ${w.coordinateY}\nZ: ${w.coordinateZ}\n`
      );
    }

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
