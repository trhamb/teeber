export class CommandHandler {
    constructor(gameState) {
        this.state = gameState;
    }

    handleCommand(parsedInput) {
        const { command, args } = parsedInput;

        switch (command) {
            case "look":
                return this.lookCommand();
            case "inventory":
                return this.inventoryCommand();
            case "go":
                return this.moveCommand(args[0]);
            case "north":
            case "south":
            case "east":
            case "west":
                return this.moveCommand(command);
            default:
                return this.state.dialog.invalidCommand;
        }
    }

    lookCommand() {
        const room = this.state.getCurrentRoom();
        let description = `${room.name}\n${room.description}`;

        if (room.items && room.items.length > 0) {
            description += `\nYou can see: ${room.items.join(", ")}`;
        }

        return description;
    }

    inventoryCommand() {
        if (this.state.inventory.length === 0) {
            return "Your inventory is empty.";
        }
        return `You are carrying: ${this.state.inventory.join(", ")}`;
    }

    moveCommand(direction) {
        const currentRoom = this.state.getCurrentRoom();
        const exits = currentRoom.exits;

        if (!exits[direction]) {
            return `You cannot go ${direction} from here.`;
        }

        this.state.currentRoom = exits[direction];
        const newRoom = this.state.getCurrentRoom();
        return `You move ${direction}.\n\n${newRoom.name}\n${newRoom.description}`;
    }
}
