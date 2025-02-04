function dragStart(event) {
    const networkObjectId = event.target.closest("img").alt;
    const itemType = "item";
    event.dataTransfer.setData("json", JSON.stringify({
        itemType: itemType,
        itemId: networkObjectId
    }));
}