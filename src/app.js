var html = new componentToken("html");
var body = new componentToken("body");
var root = new componentToken("#root");

root.render(itemBoard());
root.render(itemPanel());
body.render(pc_menu());
body.render(dns_server_menu());
body.render(dhcp_server_menu());
body.render(dhcp_agent_menu());
body.render(router_menu());
body.render(terminal());
body.render(browser());
body.render(packetTracer());
body.render(GeneralOptions());
html.event("keydown", documentKeyboardHandler);

setTimeout(hideLoadingScreen, 1000);