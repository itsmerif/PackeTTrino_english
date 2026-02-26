function IconObject(image) {
    const $icon = document.createElement("img");
    $icon.src = "./assets/board/" + image;
    $icon.alt = "icon";
    $icon.draggable = true;
    return $icon;
}
