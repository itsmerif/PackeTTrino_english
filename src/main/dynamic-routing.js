let nodes = {};
let nodesNetmask = {};
let nodesIp = {};

function getNodes() {

    nodes = {};
    nodesIp = {};
    nodesNetmask = {};

    const $routerElements = document.querySelectorAll('.router');

    for (let i = 0; i < $routerElements.length - 1; i++) {
        const $router = $routerElements[i];
        const routingTable = $router.querySelector('.routing-table').querySelector('table');
        const routingRules = routingTable.querySelectorAll('tr');
        for (let j = 1; j < 4; j++) {
            const cells = routingRules[j].querySelectorAll('td');
            if (!nodes[$router.id]) nodes[$router.id] = [];
            if (!nodesIp[$router.id]) nodesIp[$router.id] = [];
            if (!nodesNetmask[$router.id]) nodesNetmask[$router.id] = [];
            if (cells[0].innerText !== '') {
                nodes[$router.id].push(cells[0].innerText); //guardamos los nodos
                nodesNetmask[$router.id].push(cells[1].innerText); //guardamos las netmasks
                nodesIp[$router.id].push(cells[2].innerText); //guardamos las IPs
            }
        }
    }

}

function getAllNetworks() {
    let networks = [];
    getNodes();
    for (const routerId in nodes) {
        networks = networks.concat(nodes[routerId]);
    }
    //eliminar duplicados
    networks = networks.filter((item, index) => networks.indexOf(item) === index);
    return networks;
}

function findShortestPath(startNetwork, endNetwork) {
    getNodes();

    const networkTopology = nodes;
    const graph = buildGraphFromNetwork(networkTopology);
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Normalizar entrada: si startNetwork o endNetwork son interfaces
    // de un mismo router, elegir una interfaz consistente
    const startRouters = getRoutersForNetwork(startNetwork);
    const endRouters = getRoutersForNetwork(endNetwork);

    // Inicialización de Dijkstra
    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.add(node);
    }

    distances[startNetwork] = 0;

    while (unvisited.size > 0) {

        // Encontrar el nodo no visitado con la menor distancia
        let current = null;
        let minDistance = Infinity;

        for (const node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        }

        // Si no hay camino posible o hemos llegado al destino
        if (current === null || current === endNetwork) {
            break;
        }

        // Marcar como visitado
        unvisited.delete(current);

        // Actualizar distancias de los vecinos
        for (const neighbor of graph[current]) {
            const distance = distances[current] + 1; // Cada salto tiene un peso de 1

            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
            }
        }
    }

    // Reconstruir el camino con los identificadores
    const pathNodes = [];
    let current = endNetwork;

    while (current !== null) {
        pathNodes.unshift(current);
        current = previous[current];
    }

    // Convertir el camino de nodos a IPs
    const pathIPs = mapPathToIPs(pathNodes);

    return pathIPs;
}

function getRoutersForNetwork(network) {
    const routers = [];
    for (const routerId in nodes) {
        if (nodes[routerId].includes(network)) {
            routers.push(routerId);
        }
    }
    return routers;
}

function mapPathToIPs(pathNodes) {
    const pathIPs = [];

    for (let i = 0; i < pathNodes.length - 1; i++) {
        const currentNode = pathNodes[i];
        const nextNode = pathNodes[i + 1];

        let chosenIp = null;

        for (const routerId in nodes) {
            const index = nodes[routerId].indexOf(currentNode);
            if (index !== -1 && nodes[routerId].includes(nextNode)) {
                chosenIp = nodesIp[routerId][index];
                break; // Tomamos la IP que realmente conecta con el siguiente nodo del camino
            }
        }

        if (chosenIp) {
            pathIPs.push(chosenIp);
        } else {
            console.warn(`No se encontró IP para la conexión ${currentNode} -> ${nextNode}`);
        }
    }

    return pathIPs;
}

function buildGraphFromNetwork(networkTopology) {
    const graph = {};
    const routerMap = {}; // Para mapear redes a sus routers

    // Inicializar el grafo con todas las redes
    for (const router in networkTopology) {
        for (const network of networkTopology[router]) {
            if (!graph[network]) {
                graph[network] = [];
            }

            // Registrar qué router maneja esta red
            if (!routerMap[network]) {
                routerMap[network] = [];
            }
            routerMap[network].push(router);
        }
    }

    // Conectar redes entre diferentes routers
    for (const network in routerMap) {
        const routers = routerMap[network];

        for (const router of routers) {
            // Obtener todas las otras redes accesibles desde este router
            const routerNetworks = networkTopology[router];

            for (const connectedNetwork of routerNetworks) {
                if (connectedNetwork !== network) {
                    graph[network].push(connectedNetwork);
                }
            }
        }
    }

    return graph;
}

function getNextHop(startNetwork) {

    const networks = getAllNetworks();
    const nextHop = [];

    for (let i = 0; i < networks.length; i++) {
        const targetNetwork = networks[i];
        const path = findShortestPath(startNetwork, targetNetwork);

        if (path.length > 0) {
            let netmask = null;
            for (const routerId in nodes) {
                const networkIndex = nodes[routerId].indexOf(targetNetwork);
                if (networkIndex !== -1) {
                    netmask = nodesNetmask[routerId][networkIndex];
                    break;
                }
            }

            if (path[1]) {
                nextHop.push([targetNetwork, netmask, path[1]]);
            }
        }
    }

    return nextHop;
}

function getRoutes(routerId) {
    const $router = document.getElementById(routerId); //obtengo el router
    const validNetworks = [];
    const routingTable = $router.querySelector('.routing-table').querySelector('table');
    const routingRules = routingTable.querySelectorAll('tr');
    let matrix = [];

    for (let i = 1; i < 4; i++) {

        const cells = routingRules[i].querySelectorAll('td');

        const destination = cells[0].innerText;

        if (destination !== '') {
            let netmask = cells[1].innerText;
            let interface = cells[3].innerText;
            let gateway = cells[2].innerText;
            validNetworks.push([destination, netmask, gateway, interface]); //guardamos las redes a las que el router está conectado de forma directa
            matrix.push(getNextHop(destination));
        }

    }

    matrix = matrix.reduce((a, b) => a.concat(b), []); //juntamos las matrices de todas las redes
    

    //compruebo que los siguientes saltos formen parte de alguna de las redes

    let flag = false;

    for (let i = 0; i < matrix.length; i++) {

        let nextHop = matrix[i][2];
        flag = false;

        for (let j = 0; j < validNetworks.length; j++) {
            let network = validNetworks[j][0];
            let netmask = validNetworks[j][1];
            if (getNetwork(nextHop, netmask) === network) { //el siguiente salto es parte de la red, lo damos por bueno, y añadimos la interfaz y gateway a esa fila
                flag = true;
                matrix[i].push(validNetworks[j][2]);
                matrix[i].push(validNetworks[j][3]);
                break;
            }
        }

        if (!flag) { //elimino esa entrada de la matriz
            matrix.splice(i, 1);
            i--;
        }

    }

    ////console.log(matrix);
    return groupByDefaultRules(removeDuplicateRows(matrix));
}

function removeDuplicateRows(matrix) {

    if (!matrix.length) return [];
    
    const uniqueMatrix = [];
    const seen = new Set();
    
    for (let i = 0; i < matrix.length; i++) {
        const rowStr = JSON.stringify(matrix[i]);
        
        if (!seen.has(rowStr)) {
            seen.add(rowStr);
            uniqueMatrix.push(matrix[i]);
        }
    }
    
    ////console.log(uniqueMatrix);
    return uniqueMatrix;
}

function autoInputRules($routerObjectId) {

    const matrix = getRoutes($routerObjectId);

    for (let i = 0; i < matrix.length; i++) {
        let destination = matrix[i][0];
        let netmask = matrix[i][1];
        let nexthop = matrix[i][2];
        let interface = matrix[i][4];
        addRoutingEntry($routerObjectId, destination, netmask, interface, nexthop);
    }
    
}

function groupByDefaultRules(matrix) {

    const hopCounter = {};
    let newMatrix = [];

    for (let i = 0; i < matrix.length; i++) {
        let nextHop = matrix[i][2];     
        hopCounter[nextHop] =  { 
            count: hopCounter[nextHop] ? hopCounter[nextHop].count + 1 : 1,
            gateway: matrix[i][3],
            interface: matrix[i][4] 
        };
    }

    let maxCount = Math.max(...Object.values(hopCounter).map(hop => hop.count));
    let maxInst = Object.keys(hopCounter).filter(key => hopCounter[key].count === maxCount);

    if (maxCount > 1) { //hemos encontrado un canditato a regla por defecto

        let maxInstGateway = hopCounter[maxInst[0]].gateway;
        let maxInstInterface = hopCounter[maxInst[0]].interface;
        let j = 0;

        for (let i = 0; i < matrix.length; i++) {
            let nextHop = matrix[i][2];
            if (nextHop !== maxInst[0]) {
                //console.log(nextHop);
                newMatrix[j] = matrix[i];
                j++;
            }
            ////console.log(newMatrix);
        }

        newMatrix[newMatrix.length] = ["0.0.0.0", "0.0.0.0", maxInst[0], maxInstGateway, maxInstInterface];
        return newMatrix;
    }

    ////console.log(matrix);
    return matrix;
}

function dynamicRouting() {

    const $routers = document.querySelectorAll(".router");

    for (let i = 0; i < $routers.length -1; i++) {
        autoInputRules($routers[i].id);
    }

}

//funciones de modal

function showDynamicRoutingModal() {
    const modalComponent = document.createElement("div");
    modalComponent.classList.add("dynamic-routing-modal-container");
    modalComponent.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="dynamic-routing-modal">
      <p>⚠︎ ¿Estás seguro de que quieres activar la funcionalidad de Enrutamiento Automático?</p>
      <button class="btn-accept">Sí, quiero enrrutar de forma automática</button>
      <button class="btn-reject">No, volver al panel</button>
    </div>`
    modalComponent.querySelector(".btn-accept").addEventListener("click", dynamicRoutingHandler);
    modalComponent.querySelector(".btn-reject").addEventListener("click", closeDynamicRoutingModal);
    document.body.appendChild(modalComponent);
}

function closeDynamicRoutingModal() {
    const modalComponent = document.querySelector(".dynamic-routing-modal-container");
    modalComponent.remove();
}

async function dynamicRoutingHandler() {
    const modalComponent = document.querySelector(".dynamic-routing-modal-container");
    modalComponent.querySelector(".dynamic-routing-modal").remove();
    modalComponent.innerHTML += `<div class="loader"></div>`;
    dynamicRouting();
    return new Promise(resolve => {
        setTimeout(() => {
            modalComponent.remove();
            resolve();
        }, 1500);
    });
}