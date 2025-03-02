let nodes = {};
let nodesIp = {};

function getNodes() {

    nodes = {};
    nodesIp = {};

    const $routerElements = document.querySelectorAll('.router');

    for (let i = 0; i < $routerElements.length - 1; i++) {
        const $router = $routerElements[i];
        const routingTable = $router.querySelector('.routing-table').querySelector('table');
        const routingRules = routingTable.querySelectorAll('tr');
        for (let j = 1; j < 4; j++) {
            const cells = routingRules[j].querySelectorAll('td');
            if (!nodes[$router.id]) nodes[$router.id] = [];
            if (!nodesIp[$router.id]) nodesIp[$router.id] = [];
            if (cells[0].innerText !== '') {
                nodes[$router.id].push(cells[0].innerText);
                nodesIp[$router.id].push(cells[2].innerText);
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
    
    for (const node in graph) { //inicio todas las distancias como infinito
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.add(node);
    }
    
    distances[startNetwork] = 0; //la distancia desde el nodo inicial a sí mismo es 0
    
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
    
    return  pathIPs;
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

    for (const router in networkTopology) {  //Inicializar el grafo con todas las redes
        for (const ip of networkTopology[router]) {
            if (!graph[ip]) {
                graph[ip] = [];
            }
        }
    }

    for (const router in networkTopology) {  //Conectar redes que están en el mismo router
        const networks = networkTopology[router];

        for (let i = 0; i < networks.length; i++) {
            for (let j = 0; j < networks.length; j++) {
                if (i !== j) {
                    graph[networks[i]].push(networks[j]);
                }
            }
        }
    }

    return graph;
}

function getNextHop(startNetwork) {

    const networks = getAllNetworks();
    let nextHop;

    for (let i = 0; i < networks.length; i++) {
        nextHop = null;
        const path = findShortestPath(startNetwork, networks[i]);
        if (path.length > 0 && path[1]) {
            console.log(networks[i] + " : " + path[1]);
        }
    }
}
