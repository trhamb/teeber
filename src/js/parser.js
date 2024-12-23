export class Parser {
  parse(input) {
    const words = input.toLowerCase().trim().split(" ");
    const command = words[0];
    const args = words.slice(1);

    // For commands like "examine writing desk", combine words after the command
    const target = args.join("_");

    return {
      command,
      args: [target],
      fullInput: input.toLowerCase().trim(),
    };
  }
}
