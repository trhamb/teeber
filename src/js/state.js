export class GameState {
    constructor() {
        this.currentRoom = "room1";
        this.inventory = [];
        this.rooms = null;
        this.dialog = null;
    }

    async loadGameData() {
        const [roomsResponse, dialogResponse] = await Promise.all([
            fetch("assets/rooms.json"),
            fetch("assets/dialog.json"),
        ]);

        this.rooms = await roomsResponse.json();
        this.dialog = await dialogResponse.json();
    }

    getCurrentRoom() {
        return this.rooms.find((r) => r.id === this.currentRoom);
    }
}
