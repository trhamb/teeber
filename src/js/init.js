import { Game } from "./game.js";
import { Parser } from "./parser.js";

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    const parser = new Parser();
    game.initialize();

    const input = document.getElementById("game-input");
    const submitButton = document.getElementById("submit-command");

    const handleInput = () => {
        const command = input.value;
        if (command) {
            const parsedCommand = parser.parse(command);
            const response = game.commandHandler.handleCommand(parsedCommand);
            game.displayMessage(response);
            input.value = "";
        }
    };

    submitButton.addEventListener("click", handleInput);
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleInput();
        }
    });
});
