function dragBroswer(event) {

    event.preventDefault();
    const browser = event.target.closest(".pc-browser");
    let rect = browser.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;

    browser.style.left = `${rect.left}px`;
    browser.style.top = `${rect.top}px`;
    browser.style.transform = 'none';
    browser.style.position = 'fixed';

    function moveBrowser(moveEvent) {
        let x = moveEvent.clientX - offsetX;
        let y = moveEvent.clientY - offsetY;
        let maxX = window.innerWidth - browser.offsetWidth;
        let maxY = window.innerHeight - browser.offsetHeight;
        browser.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
        browser.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    }

    function stopDraggingBrowser() {
        document.removeEventListener('mousemove', moveBrowser);
        document.removeEventListener('mouseup', stopDraggingBrowser);
        const input = browser.querySelector('input');
        if (input) input.focus();
    }

    document.addEventListener('mousemove', moveBrowser);
    document.addEventListener('mouseup', stopDraggingBrowser);

}