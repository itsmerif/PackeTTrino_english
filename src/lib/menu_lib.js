function interfaceHandler(event, selector) {
    const $menu = document.querySelector(`.${selector}`);
    const $networkObject = document.getElementById($menu.dataset.id);
    const $ifaceSelector = $menu.querySelector("#iface");
    const networkInterface = $ifaceSelector.value;
    $menu.querySelector("#ip").value = $networkObject.getAttribute(`ip-${networkInterface}`);
    $menu.querySelector("#netmask").value = $networkObject.getAttribute(`netmask-${networkInterface}`);
}

function loadInterfaces(selector) {
    const $menu = document.querySelector(`.${selector}`);
    const $networkObject = document.getElementById($menu.dataset.id);
    const availableInterfaces = getInterfaces($networkObject.id);
    const $ifaceSelector = $menu.querySelector("#iface");
    $ifaceSelector.innerHTML = "";
    availableInterfaces.forEach(iface => $ifaceSelector.innerHTML += `<option value="${iface}">${iface}</option>`);
}
