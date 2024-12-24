import { Game } from "./game.js";
import { Parser } from "./parser.js";

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    const parser = new Parser();
    game.initialize();

    document.querySelector("#game-container").__game = game;

    const input = document.getElementById("game-input");
    const submitButton = document.getElementById("submit-command");

    const handleInput = () => {
        const command = input.value;
        if (command) {
            game.displayMessage(command, true); // Display user input in blue
            const parsedCommand = parser.parse(command, game.state);
            const response = game.commandHandler.handleCommand(parsedCommand);
            game.displayMessage(response); // Display game response in green
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
