import { ICommand } from "wokcommands";
import { GuildMember, Role } from "discord.js";
import schemaWaypoints from "../database-schema/minecraft/waypoints";
import mongoose from "mongoose";

interface PlayersDocument extends mongoose.Document {
  guildId: string;
  roleId: string;
  playerId: string;
}

export default {
  category: "Minecraft",
  description: "Add a waypoint to the currently selected world",
  slash: true,
  guildOnly: true,

  minArgs: 4,
  maxArgs: 4,
  expectedArgs: "<waypointname> <x> <y> <z>",
  expectedArgsTypes: ["STRING", "NUMBER", "NUMBER", "NUMBER"],
  expectedArgsDescriptions: [
    "The name of the waypoint",
    "The x coordinate of the waypoint",
    "The y coordinate of the waypoint",
    "The z coordinate of the waypoint",
  ],

  callback: async ({ interaction, args }) => {
    try {
      const player = mongoose.model<PlayersDocument>("players");

      // Quit if player does not have a role
      if (!(await player.exists({ playerId: interaction.user!.id }))) {
        await interaction.reply({
          content: "Error: You must have a Minecraft role selected!",
          ephemeral: true,
        });
        return;
      }

      const coordName = args[0];
      const coordX = args[1];
      const coordY = args[2];
      const coordZ = args[3];

      const content = `Waypoint '${coordName}' at ${coordX}, ${coordY}, ${coordZ} added!`;

      // const { member } = interaction;
      // const memberRoleManager = member! as GuildMember;
      // memberRoleManager.roles;

      const world = (await mongoose
        .model<PlayersDocument>("players")
        .findOne({ playerId: interaction.user.id })) as PlayersDocument;

      new schemaWaypoints({
        guildId: interaction.guild!.id,
        roleId: world.roleId,
        waypointName: coordName,
        coordinateX: coordX,
        coordinateY: coordY,
        coordinateZ: coordZ,
      }).save();

      await interaction
        .reply({
          ephemeral: true,
          content,
        })
        .then(() =>
          console.log(`Command "${interaction.commandName}" finished running.`)
        )
        .catch(console.error);
    } catch (e) {
      console.error(e);
      interaction.reply({
        ephemeral: true,
        content: "An error occurred!",
      });
    }
  },
} as ICommand;
