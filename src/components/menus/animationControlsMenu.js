function AnimationControls() {
    const $animationControls = document.createElement("div");
    $animationControls.classList.add("video-controls", "hidden");
    $animationControls.innerHTML = `

        <div class="control-buttons">
                 
            <button class="control-btn play-pause">
                <svg class="play-icon" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M8 5v14l11-7z"></path>
                </svg>
                <svg class="pause-icon hidden" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                </svg>
            </button>

            <div class="slider-container">
                <label for="visual-speed"> Velocidad de Animación </label>
                <input type="range" id="visual-speed" name="visual-speed" min="100" max="1000">
                <p id="visual-speed-value">300</p><span>ms</span>
            </div>

        </div>
    `;

    $animationControls.querySelector(".play-icon").addEventListener("click", function () { 
        event.preventDefault(); 
        pauseSimulation();
        $animationControls.querySelector(".play-icon").classList.add("hidden");
        $animationControls.querySelector(".pause-icon").classList.remove("hidden");
    });
    
    $animationControls.querySelector(".pause-icon").addEventListener("click", function () { 
        event.preventDefault();
        resumeSimulation();
        $animationControls.querySelector(".pause-icon").classList.add("hidden");
        $animationControls.querySelector(".play-icon").classList.remove("hidden");
    });

    $animationControls.querySelector("#visual-speed").addEventListener("input", function () { 
        visualSpeed = this.value; 
        $animationControls.querySelector("#visual-speed-value").innerHTML = this.value;
    });

    return $animationControls;

}