import { ICommand } from "wokcommands";
import {
  MessageActionRow,
  MessageSelectMenu,
  Client,
  GuildMember,
  Role,
} from "discord.js";
import schemaPlayers from "../database-schema/minecraft/players";
import mongoose from "mongoose";

interface WorldsDocument extends mongoose.Document {
  // Database schema for the world
  guildId: string;
  roleId: string;
  worldName: string;
  seed: string;
}

interface PlayersDocument extends mongoose.Document {
  // Database schema for world role assigned to player
  guildId: string;
  roleId: string;
  playerId: string;
}

export default {
  category: "Minecraft",
  description: "Selects a Minecraft world",
  slash: true,
  guildOnly: true,

  init: (client: Client) => {
    client.on("interactionCreate", async (interaction) => {
      // Quit if interaction is not select menu
      if (
        !interaction.isSelectMenu() ||
        interaction.customId !== "world-select-menu"
      ) {
        return;
      }

      // Get role selected from menu
      const selectedWorld = (await interaction.guild!.roles.fetch(
        interaction.values[0]
      )) as Role;

      // Get value from menu selection
      const menuSelection = interaction.values[0];

      // Get member prop from who fired the command
      const { member } = interaction;
      const memberRoleManager = member! as GuildMember;

      // Return an array of all worlds in the MongoDB
      const worlds = await mongoose
        .model<WorldsDocument>("worlds")
        .find({ guildId: interaction.guild!.id });

      // Remove all Minecraft world roles from user then add new one
      // TODO: Inefficient to call all roles, perhaps find a way to get specific role tied to user?
      worlds.forEach((world) => {
        memberRoleManager.roles.remove(world.roleId);
      });

      let content;

      const playersModel = mongoose.model<PlayersDocument>("players");

      if (menuSelection != "-1") {
        memberRoleManager.roles.add(selectedWorld);

        // Check if player already is in MongoDB
        if (await playersModel.exists({ playerId: interaction.user!.id })) {
          // If registered, update their world role
          await playersModel
            .find({ playerId: interaction.user!.id })
            .updateOne({ roleId: menuSelection });
        } else {
          // Otherwise, a new document will need to be created
          new schemaPlayers({
            guildId: interaction.guild!.id,
            roleId: menuSelection,
            playerId: interaction.user!.id,
          }).save();
        }

        content = `Selected world: ${selectedWorld.name}`;
      } else {
        await playersModel.findOneAndDelete({ playerId: interaction.user!.id });
        content = "Unselected Minecraft world.";
      }

      interaction.update({
        content: content,
        components: [],
      });
    });
  },

  callback: async ({ interaction }) => {
    // Check if any worlds have been added to the Discord server
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
      .setCustomId("world-select-menu")
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

    // Add none as an option to menu
    menu.addOptions([
      {
        label: "None",
        description: "Select this to remove your Minecraft world.",
        value: "-1",
      },
    ]);

    const row = new MessageActionRow().addComponents(menu);

    const content =
      "Select a world. This will add that world to your profile as a role.";

    await interaction.reply({
      content: content,
      components: [row],
      ephemeral: true,
    });
  },
} as ICommand;
