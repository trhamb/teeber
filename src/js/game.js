import { GameState } from "./state.js";
import { CommandHandler } from "./commands.js";

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

    displayMessage(message) {
        const output = document.getElementById("game-output");
        output.innerHTML += `${message}\n`;
        output.scrollTop = output.scrollHeight;
    }

    displayRoom() {
        const room = this.state.getCurrentRoom();
        this.displayMessage(`\n${room.name}\n${room.description}`);
    }
}
