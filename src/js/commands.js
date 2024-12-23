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
      case "examine":
        return this.examineCommand(args[0]);
      case "take":
        return this.takeCommand(args[0]);
      case "open":
        return this.openCommand(args[0]);
      case "use":
        return this.useCommand(args[0], args[2]); // "use key on door" format
      case "drop":
        return this.dropCommand(args[0]);
      case "north":
      case "south":
      case "east":
      case "west":
        return this.moveCommand(command);
      default:
        return this.state.dialog.invalidCommand;
    }
  }

  examineCommand(targetId) {
    if (!targetId) return "What would you like to examine?";

    const currentRoom = this.state.getCurrentRoom();

    // Check standard features
    const feature = currentRoom.standardFeatures[targetId];
    if (feature) {
      let description = feature.description;

      // Add items list if examining floor
      if (targetId === "floor" && feature.items && feature.items.length > 0) {
        description += `\nOn the floor you can see: ${feature.items.join(
          ", "
        )}`;
      }

      return description;
    }

    // Check interactables
    const interactable = currentRoom.interactables?.find(
      (i) => i.id === targetId
    );
    if (interactable) {
      return interactable.description;
    }

    // Check inventory items
    const inventoryItem = this.state.items[targetId];
    if (this.state.inventory.includes(targetId) && inventoryItem) {
      return inventoryItem.description;
    }

    return "You don't see that here.";
  }

  takeCommand(itemId) {
    console.log("Taking:", itemId);

    if (!itemId) return "What would you like to take?";

    const currentRoom = this.state.getCurrentRoom();

    // Check if item is on the floor
    const floorItems = currentRoom.standardFeatures.floor.items;
    if (floorItems && floorItems.includes(itemId)) {
      currentRoom.standardFeatures.floor.items = floorItems.filter(
        (i) => i !== itemId
      );
      this.state.inventory.push(itemId);
      return `You pick up the ${this.state.items[itemId].name} from the floor.`;
    }

    // Check containers
    for (const interactable of currentRoom.interactables || []) {
      for (const container of interactable.containers || []) {
        if (container.items && container.items.includes(itemId)) {
          container.items = container.items.filter((i) => i !== itemId);
          this.state.inventory.push(itemId);
          return `You take the ${this.state.items[itemId].name} from the ${container.name}.`;
        }
      }
    }

    return "You can't take that.";
  }

  dropCommand(itemId) {
    if (!itemId) return "What would you like to drop?";

    if (!this.state.inventory.includes(itemId)) {
      return "You don't have that.";
    }

    const currentRoom = this.state.getCurrentRoom();

    // Remove from inventory
    this.state.inventory = this.state.inventory.filter((i) => i !== itemId);

    // Add to floor
    if (!currentRoom.standardFeatures.floor.items) {
      currentRoom.standardFeatures.floor.items = [];
    }
    currentRoom.standardFeatures.floor.items.push(itemId);

    return `You drop the ${this.state.items[itemId].name} on the floor.`;
  }

  openCommand(containerId) {
    console.log("Opening:", containerId);
    console.log(
      "Looking for container in:",
      this.state.getCurrentRoom().interactables
    );

    if (!containerId) return "What would you like to open?";

    const currentRoom = this.state.getCurrentRoom();
    const container = this.findContainer(currentRoom, containerId);

    console.log("Found container:", container);

    if (!container) return "You don't see that here.";

    if (container.locked) {
      return this.state.dialog.interactions.open.locked.replace(
        "{container}",
        container.name
      );
    }

    if (container.items?.length > 0) {
      return this.state.dialog.interactions.open.contains
        .replace("{container}", container.name)
        .replace("{items}", container.items.join(", "));
    }

    return this.state.dialog.interactions.open.empty.replace(
      "{container}",
      container.name
    );
  }

  findContainer(room, containerId) {
    for (const interactable of room.interactables || []) {
      const container = interactable.containers?.find(
        (c) => c.id === containerId
      );
      if (container) return container;
    }
    return null;
  }

  lookCommand() {
    const room = this.state.getCurrentRoom();
    let description = `${room.name}\n${room.description}`;

    // Check floor items
    const floorItems = room.standardFeatures.floor.items;
    if (floorItems && floorItems.length > 0) {
      description += `\nOn the floor you can see: ${floorItems.join(", ")}`;
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
