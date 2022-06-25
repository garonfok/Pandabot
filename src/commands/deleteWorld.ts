import { ICommand } from "wokcommands";
import {
  Client,
  MessageActionRow,
  MessageSelectMenu,
  Role,
} from "discord.js";
import mongoose from "mongoose";

// Database schema for the world
interface WorldsDocument extends mongoose.Document {
  guildId: string;
  roleId: string;
  worldName: string;
  seed: string;
}

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
  description: "Deletes a Minecraft world",
  permissions: ["ADMINISTRATOR"],
  slash: true,
  guildOnly: true,

  init: (client: Client) => {
    client.on("interactionCreate", async (interaction) => {
      // Quit if interaction is not delete menu
      if (
        !interaction.isSelectMenu() ||
        interaction.customId !== "world-delete-menu"
      ) {
        return;
      }

      // Get role selected from menu
      const deleteWorld = (await interaction.guild!.roles.fetch(
        interaction.values[0]
      )) as Role;

      // Delete world from worlds model
      await mongoose
        .model<WorldsDocument>("worlds")
        .findOneAndDelete({
          roleId: deleteWorld.id,
          guildId: interaction.guild!.id,
        });

      // Delete linked waypoints from waypoints model
      await mongoose
        .model<WaypointsDocument>("waypoints")
        .deleteMany({
          roleId: deleteWorld.id,
          guildId: interaction.guild!.id,
        })

      // Delete linked players from players model
      await mongoose
        .model<PlayersDocument>("players")
        .deleteMany({ roleId: deleteWorld.id, guildId: interaction.guild!.id });

      // Remove role from Discord server
      interaction.guild?.roles.delete(
        deleteWorld.id,
        `Removed "${deleteWorld.name}"`
      );

      interaction.update({
        content: `Deleted world: ${deleteWorld.name}`,
        components: [],
      });
    });
  },

  callback: async ({ interaction }) => {
    if (
      !(await mongoose
        .model<WorldsDocument>("worlds")
        .exists({ guildId: interaction.guild!.id }))
    ) {
      await interaction.reply({
        content: "Error: There are no worlds on the server!",
        ephemeral: true,
      });
      return;
    }

    // Menu to select all available world roles
    const menu = new MessageSelectMenu()
      .setCustomId("world-delete-menu")
      .setPlaceholder("Nothing selected");

    // Add all world roles in server to menu
    const worlds = await mongoose
      .model<WorldsDocument>("worlds")
      .find({ guildId: interaction.guild!.id });
    for (const world of worlds) {
      menu.addOptions([
        {
          label: world.worldName,
          description: `Seed: ${world.seed}`,
          value: world.roleId,
        },
      ]);
    }

    const row = new MessageActionRow().addComponents(menu);

    const content =
      "Select a world. This will delete that world, and delete all waypoints in that world.\n This cannot be undone!";

    await interaction.reply({ content: content, components: [row] });

    console.log("Waiting for user input...");
  },
} as ICommand;
