import { ICommand } from 'wokcommands'

export default {
  slash: true,
  permissions: ["ADMINISTRATOR"],
  category: "Utility",
  description: "Shows help for a command",
  callback: ({ instance, interaction }) => {
    instance.commandHandler.commands.forEach((command: any) => {
      console.log(command)
    })

    interaction.reply({
      ephemeral: true,
      content: "Check the console log for all of the commands."
    })
  },
} as ICommand
