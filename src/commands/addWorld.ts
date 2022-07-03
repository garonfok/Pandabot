import { ICommand } from "wokcommands";
import { GuildMember } from "discord.js";
import schemaWorlds from "../database-schema/minecraft/worlds";
import schemaPlayers from "../database-schema/minecraft/players";
import schemaWaypoints from "../database-schema/minecraft/waypoints";
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
  description:
    "Adds a world to the database. This will also create a Discord role for the world and add you to it.",
  slash: true,
  permissions: ["ADMINISTRATOR"],
  guildOnly: true,
  minArgs: 1,
  maxArgs: 2,
  expectedArgs: "<worldname> [seed]",
  expectedArgsTypes: ["STRING", "STRING"],
  expectedArgsDescriptions: ["The name of the world", "The seed of the world"],

  callback: async ({ interaction, args }) => {
    try {
      let content: string;

      // Get and store worldName
      const worldName = args[0];

      // If worldName already exists in MongoDB collection
      if (await schemaWorlds.findOne({ worldName: worldName })) {
        content = `Error: World '${worldName}' already exists!`;
        return;
      }

      // Get and store world seed if it exists
      let worldSeed;
      if (args[1]) worldSeed = args[1];

      content = `World '${worldName}'`;

      if (worldSeed) {
        content += ` with seed: ${worldSeed}`;
      }
      content +=
        " added! \n\nDo not manually delete or change this role, as it may break the bot!";

      // Create Discord role for new world
      const role = await interaction.guild!.roles.create({
        name: worldName,
        color: "#70b237",
        mentionable: false,
      });

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
      memberRoleManager.roles.add(role);

      // Create new world role document in players collection
      const newWorld = new schemaWorlds({
        guildId: interaction.guild!.id,
        roleId: role.id,
        worldName: worldName,
        seed: worldSeed,
      });
      newWorld.save();

      console.log(`Added '${worldName}' to MongoDB`);

      // Check if player already is in MongoDB
      const playersModel = mongoose.model<PlayersDocument>("players");
      if (await playersModel.exists({ playerId: interaction.user!.id })) {
        // If registered, update their world role
        await playersModel
          .find({ playerId: interaction.user!.id })
          .updateOne({ roleId: role.id });
      } else {
        // Otherwise, a new document will need to be created
        new schemaPlayers({
          guildId: interaction.guild!.id,
          roleId: role.id,
          playerId: interaction.user!.id,
        }).save();
      }

      // Create and delete schema, necessary for deleting worlds
      // TODO: Fix this, janky workaround to consistent schema implementation
      new schemaWaypoints({
        guildId: interaction.guild!.id,
        roleId: "dummy",
        waypointName: "dummy",
        coordinateX: 0,
        coordinateY: 0,
        coordinateZ: 0,
      }).save();

      console.log(`Added '${interaction.user!.id}' to MongoDB`);

      interaction.reply({
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
