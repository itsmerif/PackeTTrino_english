var htmlComponent = new componentToken("html");
var bodyComponent = new componentToken("body");
var rootComponent = new componentToken("#root");
var boardComponent = new componentToken(".board");

rootComponent.render(itemBoard());
rootComponent.render(itemPanel());
bodyComponent.render(pc_menu());
bodyComponent.render(dns_server_menu());
bodyComponent.render(dhcp_server_menu());
bodyComponent.render(dhcp_agent_menu());
bodyComponent.render(router_menu());
bodyComponent.render(terminal());
bodyComponent.render(browser());
bodyComponent.render(packetTracer());
bodyComponent.render(GeneralOptions());
htmlComponent.event("keydown", documentKeyboardHandler);

setTimeout(hideLoadingScreen, 1000);