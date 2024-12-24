export class Parser {
    parse(input, gameState) {
        const words = input.toLowerCase().trim().split(" ");
        const command = words[0];
        const args = words.slice(1);

        // Get all items in current room and inventory for matching
        const currentRoom = gameState.getCurrentRoom();
        const floorItems = currentRoom.standardFeatures.floor.items || [];
        const inventoryItems = gameState.inventory;

        // Combine search terms after command
        const searchTerm = args.join(" ");

        // Find matching items based on partial name matches
        const matches = this.findMatchingItems(
            searchTerm,
            [...floorItems, ...inventoryItems],
            gameState.items
        );

        return {
            command,
            matches,
            fullInput: input.toLowerCase().trim(),
            searchTerm,
        };
    }

    findMatchingItems(searchTerm, itemIds, itemsData) {
        const matches = [];

        for (const itemId of itemIds) {
            const item = itemsData[itemId];
            if (this.isMatch(searchTerm, item)) {
                matches.push(item);
            }
        }

        return matches;
    }

    isMatch(searchTerm, item) {
        const searchWords = searchTerm.toLowerCase().split(" ");
        const itemName = item.name.toLowerCase();
        const itemId = item.id.toLowerCase();

        // Match against full name
        if (itemName.includes(searchTerm)) return true;

        // Match against ID
        if (itemId.includes(searchTerm)) return true;

        // Match against partial words
        return searchWords.every(
            (word) => itemName.includes(word) || itemId.includes(word)
        );
    }
}
