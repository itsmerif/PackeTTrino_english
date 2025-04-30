function createRandomNetwork() {
    // Definir límites del tablero
    const minX = 0;
    const maxX = 1800;
    const minY = 0;
    const maxY = 900;
    
    // Número de nodos
    const numNodes = 4 + Math.floor(Math.random() * 3); // 4-6 nodos
    
    // Array para almacenar nodos
    const nodes = [];
    
    // Crear nodos con posiciones aleatorias pero distribuidas
    for (let i = 0; i < numNodes; i++) {
        // Dividir el espacio en secciones para mejor distribución
        const sectionWidth = (maxX - minX) / Math.ceil(Math.sqrt(numNodes));
        const sectionHeight = (maxY - minY) / Math.ceil(Math.sqrt(numNodes));
        
        // Calcular sección para este nodo
        const sectionX = i % Math.ceil(Math.sqrt(numNodes));
        const sectionY = Math.floor(i / Math.ceil(Math.sqrt(numNodes)));
        
        // Calcular posición dentro de la sección con algo de variación
        const x = minX + sectionX * sectionWidth + Math.random() * (sectionWidth * 0.8);
        const y = minY + sectionY * sectionHeight + Math.random() * (sectionHeight * 0.8);
        
        nodes.push(SwitchObject(x, y));
    }
    
    // Renderizar todos los nodos
    boardComponent.render(...nodes);

}

function createBasicNetwork() {
    const $router1 = RouterObject(500, 400);
    const $router2 = RouterObject(600, 400);
    const $router3 = RouterObject(700, 400);
    const $router4 = RouterObject(800, 400);
    const $switch1 = SwitchObject(300, 550);
    const $switch2 = SwitchObject(300, 650);
    const $switch3 = SwitchObject(300, 750);
    const $switch4 = SwitchObject(800, 400);
    boardComponent.render($router1, $switch4);
    createConn($router1, $switch4);
}