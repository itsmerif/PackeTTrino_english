function DynamicRoutingMenu() {

    const $menu = document.createElement("div");
    $menu.classList.add("dynamic-routing-modal-container", "modal");
    

    $menu.innerHTML = `

        <div class="dynamic-routing-modal">

            <h1> Herramienta de Enrutamiento Automático </h1>

            <div class="default-network-routing-container">
                <p>Enrutar por defecto a una red (Opcional):</p>
                <input class="default-network-routing" type="text" placeholder="Por ejemplo, 8.0.0.0/8">
            </div>

            <p>⚠︎ ¿Estás seguro de que quieres activar la funcionalidad de Enrutamiento Automático?</p>

            <button class="btn-accept btn-modern-blue dark no-animation">Sí, quiero enrutar de forma automática</button>

            <button class="btn-reject btn-modern-red no-animation" id="close-btn">No, volver al panel</button>

        </div>
    `;

    $menu.querySelector(".btn-accept").addEventListener("click", dynamicRoutingHandler);
    $menu.querySelector(".btn-reject").addEventListener("click", closeDynamicRoutingModal);
    document.querySelector(".modal-overlay").style.display = "block";

    return $menu;

}

function closeDynamicRoutingModal() {
    const $menu = document.querySelector(".dynamic-routing-modal-container");
    document.querySelector(".modal-overlay").style.display = "none";
    $menu.querySelector(".btn-accept").removeEventListener("click", dynamicRoutingHandler);
    $menu.querySelector(".btn-reject").removeEventListener("click", closeDynamicRoutingModal);
    $menu.remove();
}

async function dynamicRoutingHandler() {

    const $modalComponent = document.querySelector(".dynamic-routing-modal-container");
    const $inputComponentValue = $modalComponent.querySelector("input").value;

    if ( $inputComponentValue !== "") {

        if (!isValidCidrIp($inputComponentValue)) {
            bodyComponent.render(popupMessage(`<span>Error: </span> Formato de red no válido.`));
            return;
        }
    
        let [networkIp, networkNetmask] = parseCidr($inputComponentValue);
        
        if (getNetwork(networkIp, networkNetmask) !== networkIp) {
            bodyComponent.render(popupMessage(`<span> Error: </span> No corresponde con una red válida.`));
            return;
        }

        defaultNetwork = networkIp;

    }

    $modalComponent.querySelector(".dynamic-routing-modal").remove();

    $modalComponent.innerHTML += `<div class="loader"></div>`;

    try {
        dynamicRouting();
    }catch(error) {
        console.log(error);
        bodyComponent.render(popupMessage(`<span>Error: </span>Ha ocurrido un error al activar la funcionalidad de Enrutamiento Automático.`));
    }
    
    return new Promise(resolve => {
        setTimeout(() => {
            document.querySelector(".modal-overlay").style.display = "none";
            $modalComponent.remove();
            resolve();
        }, 1500);
    });

}