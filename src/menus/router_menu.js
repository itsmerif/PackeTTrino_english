function router_menu() {

    const $menu = document.createElement("form");
    
    $menu.classList.add("router-form", "modal");

    $menu.innerHTML = `

        <p id="form-router-item-id"></p>

        <label for="ip-enp0s3">Interfaz enp0s3:</label>
        <input type="text" id="ip-enp0s3" name="ip-enp0s3"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s3" id="netmask-enp0s3"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="ip-enp0s8">Interfaz enp0s8:</label>
        <input type="text" id="ip-enp0s8" name="ip-enp0s8"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s8" id="netmask-enp0s8"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <label for="ip-enp0s9">Interfaz enp0s9:</label>
        <input type="text" id="ip-enp0s9" name="ip-enp0s9"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">
        <input type="text" name="netmask-enp0s9" id="netmask-enp0s9"
        pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$">

        <button class="btn-modern-yellow" type="submit">Guardar</button>

    `;

    
    $menu.addEventListener("submit", saveRouterSpecs);
    
    return $menu;

}

function showRouterSpecs(event) {

    event.stopPropagation();
    event.target.closest(".item-dropped").querySelector(".advanced-options-modal").style.display = "none";
    const networkObject = event.target.closest(".item-dropped");

    if (icmpTryoutToggle) { //comprobamos si estamos en modo icmptryout
        icmpTryoutProcess(networkObject.id);
        return;
    }

    const form = document.querySelector(".router-form");
    const ipEnp0s3 = networkObject.getAttribute("ip-enp0s3");
    const ipEnp0s8 = networkObject.getAttribute("ip-enp0s8");
    const ipEnp0s9 = networkObject.getAttribute("ip-enp0s9");
    const netmaskEnp0s3 = networkObject.getAttribute("netmask-enp0s3");
    const netmaskEnp0s8 = networkObject.getAttribute("netmask-enp0s8");
    const netmaskEnp0s9 = networkObject.getAttribute("netmask-enp0s9");
    form.querySelector("#ip-enp0s3").value = ipEnp0s3;
    form.querySelector("#ip-enp0s8").value = ipEnp0s8;
    form.querySelector("#ip-enp0s9").value = ipEnp0s9;
    form.querySelector("#netmask-enp0s3").value = netmaskEnp0s3;
    form.querySelector("#netmask-enp0s8").value = netmaskEnp0s8;
    form.querySelector("#netmask-enp0s9").value = netmaskEnp0s9;
    document.getElementById("form-router-item-id").innerHTML = networkObject.id;
    form.style.display = "flex";
}

function saveRouterSpecs(event) {

    event.preventDefault();
    const form = document.querySelector(".router-form");
    const networkObject = document.getElementById(document.getElementById("form-router-item-id").innerHTML);

    //obtenemos los valores del formulario  
    
    const newIpEnp0s3 = document.querySelector(".router-form #ip-enp0s3").value;
    const newIpEnp0s8 = document.querySelector(".router-form #ip-enp0s8").value;
    const newIpEnp0s9 = document.querySelector(".router-form #ip-enp0s9").value;
    const newNetmaskEnp0s3 = document.querySelector(".router-form #netmask-enp0s3").value;
    const newNetmaskEnp0s8 = document.querySelector(".router-form #netmask-enp0s8").value;
    const newNetmaskEnp0s9 = document.querySelector(".router-form #netmask-enp0s9").value;

    //guardamos los nuevos atributos en el router

    networkObject.setAttribute("ip-enp0s3", newIpEnp0s3);
    networkObject.setAttribute("ip-enp0s8", newIpEnp0s8);
    networkObject.setAttribute("ip-enp0s9", newIpEnp0s9);
    networkObject.setAttribute("netmask-enp0s3", newNetmaskEnp0s3);
    networkObject.setAttribute("netmask-enp0s8", newNetmaskEnp0s8);
    networkObject.setAttribute("netmask-enp0s9", newNetmaskEnp0s9);

    //generamos nuevas reglas de conexion directa en la tabla de enrutamiento

    const routingTable = networkObject.querySelector(".routing-table").querySelector("table");
    const rows = routingTable.querySelectorAll("tr");

    const interfaces = [
        { ip: newIpEnp0s3, netmask: newNetmaskEnp0s3, interface: "enp0s3" },
        { ip: newIpEnp0s8, netmask: newNetmaskEnp0s8, interface: "enp0s8" },
        { ip: newIpEnp0s9, netmask: newNetmaskEnp0s9, interface: "enp0s9" }
    ];

    interfaces.forEach((iface, index) => {
        const row = rows[index + 1];
        const cells = row.querySelectorAll("td");
        cells[0].innerHTML = (getNetwork(iface.ip, iface.netmask) === "0.0.0.0") ? "" : getNetwork(iface.ip, iface.netmask);
        cells[1].innerHTML = iface.netmask;
        cells[2].innerHTML = iface.ip;
        cells[3].innerHTML = iface.interface;
    });

    form.style.display = "none";
    
}