import { GameState } from "./state.js";
import { CommandHandler } from "./commands.js";
import { Parser } from "./parser.js";

export class Game {
    constructor() {
        this.state = new GameState();
        this.commandHandler = new CommandHandler(this.state);
    }

    async initialize() {
        await this.state.loadGameData();
        this.displayMessage(this.state.dialog.welcome);
        this.displayRoom();
    }

    testCommands() {
        this.state.currentRoom = "room2"; // Start in library
        this.processCommand("look"); // See room and floor items
        this.processCommand("examine floor"); // Check floor description
        this.processCommand("examine writing_desk");
        this.processCommand("open desk_drawer");
        this.processCommand("take brass_key"); // Take key from drawer
        this.processCommand("inventory"); // Verify key is in inventory
        this.processCommand("drop brass_key"); // Drop it on floor
        this.processCommand("examine floor"); // Should see key on floor
        this.processCommand("take brass_key"); // Pick it up from floor
        this.processCommand("inventory"); // Verify it's back in inventory
    }

    processCommand(commandString) {
        const parsedCommand = new Parser().parse(commandString);
        const response = this.commandHandler.handleCommand(parsedCommand);
        this.displayMessage(`> ${commandString}`);
        this.displayMessage(response);
    }

    displayMessage(message, isUserInput = false) {
        const output = document.getElementById("game-output");
        const messageElement = document.createElement("div");
        messageElement.className = isUserInput ? "user-input" : "game-output";

        // Add '>' prefix for user inputs
        messageElement.textContent = isUserInput ? `> ${message}` : message;

        output.appendChild(messageElement);
        output.scrollTop = output.scrollHeight;
    }

    displayRoom() {
        const room = this.state.getCurrentRoom();
        this.displayMessage(`\n${room.name}\n${room.description}`);
    }
}
