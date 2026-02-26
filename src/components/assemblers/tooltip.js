function tooltip(text) {
    const $tooltip = document.createElement("div");
    $tooltip.classList.add("tooltip");
    $tooltip.innerHTML = text;  
    return $tooltip;
}

