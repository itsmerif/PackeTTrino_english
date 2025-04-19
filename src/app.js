var htmlComponent = new componentToken("html");
var bodyComponent = new componentToken("body");
var rootComponent = new componentToken("#root");
var boardComponent = new componentToken(".board");

rootComponent.render(
    itemBoard(),
    itemPanel()
);

bodyComponent.render(
    pc_menu(),
    dns_server_menu(),
    dhcp_server_menu(),
    dhcp_agent_menu(),
    router_menu(),
    terminal(),
    browser(),
    packetTracer(),
    GeneralOptions(),
);

//htmlComponent.event("keydown", documentKeyboardHandler);

setTimeout(hideLoadingScreen, 0);