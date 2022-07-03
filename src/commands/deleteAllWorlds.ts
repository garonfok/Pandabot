import { Interaction } from "discord.js";
import { ICommand } from "wokcommands";
import { MessageActionRow, MessageButton } from "discord.js";
import mongoose from "mongoose";

interface WorldsDocument extends mongoose.Document {
  // Database schema for the world
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
  description: "Delete all Minecraft worlds from the database",
  permissions: ["ADMINISTRATOR"],
  slash: true,
  guildOnly: true,

  callback: async ({ interaction: interaction, channel }) => {
    // Quit if Discord server has no worlds
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

    // Create confirmation prompt
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("delete_all_yes")
          .setLabel("Confirm")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("delete_all_no")
          .setLabel("Cancel")
          .setStyle("DANGER")
      );

    await interaction.reply({
      content: `You are about to delete all worlds stored on this server. Are you sure you want to continue? This cannot be undone!`,
      components: [row],
      ephemeral: true,
    });

    const filter = (btnInt: Interaction) => {
      // Returns true only if the same person that clicked the button is the same one that ran the command
      return interaction.user.id === btnInt.user.id;
    };

    // collector will wait 15 seconds for confirm button to be pressed once
    const collector = channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15,
    });

    collector.on("end", async (collection) => {
      // Print who clicked which button
      collection.forEach((click) => {
        console.log(click.user.id, click.customId);
      });

      let content;
      if (collection.first()!.customId === "delete_all_yes") {
        content =
          "All Minecraft worlds and corresponding Discord roles have been deleted.";

        // Get query of world documents to be deleted
        const worlds = await mongoose
          .model<WorldsDocument>("worlds")
          .find({ guildId: interaction.guild!.id });

        // Delete every corresponding Discord role
        worlds.forEach((world) => {
          interaction
            .guild!.roles.delete(world.roleId)
            .then(() => console.log(`Deleted role ${world.worldName}`));
        });

        // Delete every world from worlds model
        await mongoose
          .model<WorldsDocument>("worlds")
          .find({ guildId: interaction.guild!.id })
          .deleteMany();

        // Delete every linked waypoint from waypoints model
        await mongoose
          .model<WaypointsDocument>("waypoints")
          .find({ guildId: interaction.guild!.id })
          .deleteMany();

        // Delete every linked player from players model
        await mongoose
          .model<PlayersDocument>("players")
          .find({ guildId: interaction.guild!.id })
          .deleteMany();
      } else if (collection.first()!.customId === "delete_all_no") {
        content = "This action has been cancelled.";
      }

      await interaction
        .editReply({
          content,
          components: [],
        })
        .then(() =>
          console.log(`Command "${interaction.commandName}" finished running.`)
        )
        .catch(console.error);
    });
  },
} as ICommand;
