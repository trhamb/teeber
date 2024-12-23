export class GameState {
  constructor() {
    this.currentRoom = "room1";
    this.inventory = [];
    this.rooms = null;
    this.dialog = null;
    this.items = null;
  }

  async loadGameData() {
    const [roomsResponse, dialogResponse, itemsResponse] = await Promise.all([
      fetch("assets/rooms.json"),
      fetch("assets/dialog.json"),
      fetch("assets/items.json"),
    ]);

    this.rooms = await roomsResponse.json();
    this.dialog = await dialogResponse.json();
    this.items = await itemsResponse.json();
  }

  getCurrentRoom() {
    return this.rooms.find((r) => r.id === this.currentRoom);
  }

  getItem(itemId) {
    return this.items[itemId];
  }

  hasItem(itemId) {
    return this.inventory.includes(itemId);
  }
}
