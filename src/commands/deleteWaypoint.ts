import { ICommand } from "wokcommands";
import { Client, MessageActionRow, MessageSelectMenu } from "discord.js";
import mongoose from "mongoose";

interface PlayersDocument extends mongoose.Document {
  guildId: string;
  roleId: string;
  playerId: string;
}

interface WaypointsDocument extends mongoose.Document {
  guildId: string;
  roleId: string;
  waypointName: string;
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
}

export default {
  category: "Minecraft",
  description: "Deletes a Minecraft waypoint",
  slash: true,
  guildOnly: true,

  init: (client: Client) => {
    client.on("interactionCreate", async (interaction) => {
      // Quit if interaction is not delete menu
      if (
        !interaction.isSelectMenu() ||
        interaction.customId !== "waypoint-delete-menu"
      ) {
        return;
      }

      // Get role selected from menu
      const waypointId = interaction.values[0];

      // Delete linked waypoint from waypoints model and store it
      const deleteWaypoint = (await mongoose
        .model<WaypointsDocument>("waypoints")
        .findOneAndDelete({
          _id: waypointId,
        })) as WaypointsDocument;

      interaction.update({
        content: `Deleted waypoint: ${deleteWaypoint.waypointName}`,
        components: [],
      });
    });
  },

  callback: async ({ interaction }) => {
    const player = mongoose.model<PlayersDocument>("players");

    // Quit if player does not have a role
    if (!(await player.exists({ playerId: interaction.user!.id }))) {
      await interaction.reply({
        content: "Error: You must have a Minecraft role selected!",
        ephemeral: true,
      });
      return;
    }

    // Get the player document for roleId later
    const playerDocument = (await player.findOne({
      playerId: interaction.user!.id,
    })) as PlayersDocument;

    // Menu to select all available waypoints
    const menu = new MessageSelectMenu()
      .setCustomId("waypoint-delete-menu")
      .setPlaceholder("Nothing selected");

    // Add all waypoints in current world to menu
    const waypoints = await mongoose
      .model<WaypointsDocument>("waypoints")
      .find({ guildId: interaction.guild!.id, roleId: playerDocument.roleId });
    for (const waypoint of waypoints) {
      menu.addOptions([
        {
          label: waypoint.waypointName,
          description: `X: ${waypoint.coordinateX}, Y: ${waypoint.coordinateY}, Z: ${waypoint.coordinateZ}`,
          value: String(waypoint._id),
        },
      ]);
    }

    const row = new MessageActionRow().addComponents(menu);

    const content = "Delete a waypoint.";

    await interaction.reply({ content: content, components: [row] });

    console.log("Waiting for user input...");
  },
} as ICommand;
