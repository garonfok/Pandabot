import { ICommand } from "wokcommands";

export default {
  category: "Testing",
  description: "Replies with Boop!",
  slash: true,
  testOnly: true,

  callback: ({}) => {
      return 'Boop!';
  },
} as ICommand;
