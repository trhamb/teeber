export class CommandHandler {
    constructor(gameState) {
        this.state = gameState;
    }

    handleCommand(parsedInput) {
        const { command, matches, searchTerm } = parsedInput;

        switch (command) {
            case "look":
                return this.lookCommand();
            case "inventory":
                return this.inventoryCommand();
            case "take":
                if (matches.length === 0) {
                    return "I don't see that here.";
                }
                if (matches.length > 1) {
                    return `Which one do you mean? I can see: ${matches
                        .map((item) => item.name)
                        .join(" and ")}.`;
                }
                return this.takeCommand(matches[0].id);
            case "examine":
                if (matches.length === 0) {
                    return "What would you like to examine?";
                }
                if (matches.length > 1) {
                    return `Which one do you mean? I can see: ${matches
                        .map((item) => item.name)
                        .join(" and ")}.`;
                }
                return this.examineCommand(matches[0].id);
            case "go":
                return this.moveCommand(searchTerm);
            case "open":
                if (matches.length === 0) {
                    return "What would you like to open?";
                }
                if (matches.length > 1) {
                    return `Which one do you mean? I can see: ${matches
                        .map((item) => item.name)
                        .join(" and ")}.`;
                }
                return this.openCommand(matches[0].id);
            case "use":
                return this.useCommand(matches[0]?.id, matches[1]?.id);
            case "drop":
                if (matches.length === 0) {
                    return "What would you like to drop?";
                }
                if (matches.length > 1) {
                    return `Which one do you mean? You are carrying: ${matches
                        .map((item) => item.name)
                        .join(" and ")}.`;
                }
                return this.dropCommand(matches[0].id);
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
            if (
                targetId === "floor" &&
                feature.items &&
                feature.items.length > 0
            ) {
                const itemNames = feature.items.map(
                    (itemId) => this.state.items[itemId].name
                );
                description += `\nOn the floor you can see: ${itemNames.join(
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
        if (!itemId) return "What would you like to take?";

        const currentRoom = this.state.getCurrentRoom();

        // Check if item is on the floor
        const floorItems = currentRoom.standardFeatures.floor.items;
        if (floorItems && floorItems.includes(itemId)) {
            currentRoom.standardFeatures.floor.items = floorItems.filter(
                (i) => i !== itemId
            );
            this.state.inventory.push(itemId);
            return `You pick up the ${this.state.items[itemId].name}.`;
        }

        // Check containers
        for (const interactable of currentRoom.interactables || []) {
            for (const container of interactable.containers || []) {
                if (container.items && container.items.includes(itemId)) {
                    container.items = container.items.filter(
                        (i) => i !== itemId
                    );
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
        if (!containerId) return "What would you like to open?";

        const currentRoom = this.state.getCurrentRoom();
        const container = this.findContainer(currentRoom, containerId);

        if (!container) return "You don't see that here.";

        if (container.locked) {
            return this.state.dialog.interactions.open.locked.replace(
                "{container}",
                container.name
            );
        }

        if (container.items?.length > 0) {
            const itemNames = container.items.map(
                (itemId) => this.state.items[itemId].name
            );
            return this.state.dialog.interactions.open.contains
                .replace("{container}", container.name)
                .replace("{items}", itemNames.join(", "));
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
            const itemNames = floorItems.map(
                (itemId) => this.state.items[itemId].name
            );
            description += `\nOn the floor you can see: ${itemNames.join(
                ", "
            )}`;
        }

        return description;
    }

    inventoryCommand() {
        if (this.state.inventory.length === 0) {
            return "Your inventory is empty.";
        }
        const itemNames = this.state.inventory.map(
            (itemId) => this.state.items[itemId].name
        );
        return `You are carrying: ${itemNames.join(", ")}`;
    }

    moveCommand(direction) {
        const currentRoom = this.state.getCurrentRoom();
        const exits = currentRoom.exits;

        // Check if there's a door in this direction
        const door = currentRoom.doors?.find((d) => d.direction === direction);

        if (door) {
            if (door.locked) {
                return `The ${door.name} is locked. You'll need to find a way to unlock it.`;
            }
            // Door exists and is unlocked
            this.state.currentRoom = door.leadsTo;
            const newRoom = this.state.getCurrentRoom();
            return `You go through the ${door.name}.\n\n${newRoom.name}\n${newRoom.description}`;
        }

        // No door, check normal exits
        if (!exits[direction]) {
            return `You cannot go ${direction} from here.`;
        }

        this.state.currentRoom = exits[direction];
        const newRoom = this.state.getCurrentRoom();
        return `You move ${direction}.\n\n${newRoom.name}\n${newRoom.description}`;
    }

    useCommand(itemId, targetId) {
        // Check if player has the item
        if (!this.state.inventory.includes(itemId)) {
            return "You don't have that item.";
        }

        const item = this.state.items[itemId];
        const currentRoom = this.state.getCurrentRoom();

        // Check if target exists in room
        const target = this.findInteractableInRoom(currentRoom, targetId);
        if (!target) {
            return "You don't see that here.";
        }

        // Check if item can be used on target
        if (!item.usableOn.includes(targetId)) {
            return `The ${item.name} doesn't work with that.`;
        }

        // Handle the interaction
        if (item.properties.unlocks === targetId) {
            target.locked = false;
            return `You use the ${item.name} to unlock the ${target.name}.`;
        }

        return "Nothing happens.";
    }

    findInteractableInRoom(room, targetId) {
        // Check doors
        if (room.doors) {
            const door = room.doors.find((d) => d.id === targetId);
            if (door) return door;
        }

        // Check other interactables
        if (room.interactables) {
            const interactable = room.interactables.find(
                (i) => i.id === targetId
            );
            if (interactable) return interactable;
        }

        return null;
    }
}
