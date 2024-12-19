export class Parser {
    parse(input) {
        const words = input.toLowerCase().trim().split(" ");
        const command = words[0];
        const args = words.slice(1);

        return {
            command,
            args,
            fullInput: input.toLowerCase().trim(),
        };
    }
}
