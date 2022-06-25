import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import schema from "../database-schema/minecraft/waypoints";
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

    const waypoints = await schema.find({ guildId: interaction.guild!.id });

    const embed = new MessageEmbed()
      .setTitle("World Waypoints")
      .setDescription("Currently registered waypoints:");

    for (const w of waypoints) {
      embed.addField(
        w.waypointName,
        `X: ${w.coordinateX}\nY: ${w.coordinateY}\nZ: ${w.coordinateZ}\n`,
        false
      );
    }

    return embed;
  },
} as ICommand;
