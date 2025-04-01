const ubicacionBtn = document.getElementById("ubicacion-btn");
    const horariosBtn = document.getElementById("horarios-btn");
    const necesitasBtn = document.getElementById("necesitas-btn");

    const ubicacionModal = document.getElementById("ubicacion-modal");
    const horariosModal = document.getElementById("horarios-modal");
    const necesitasModal = document.getElementById("necesitas-modal");

    const closeButtons = document.querySelectorAll(".close");

    ubicacionBtn.addEventListener("click", () => ubicacionModal.style.display = "block");
    horariosBtn.addEventListener("click", () => horariosModal.style.display = "block");
    necesitasBtn.addEventListener("click", () => necesitasModal.style.display = "block");

    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            ubicacionModal.style.display = "none";
            horariosModal.style.display = "none";
            necesitasModal.style.display = "none";
        });
    });

    window.addEventListener("click", (event) => {
        if (event.target === ubicacionModal) ubicacionModal.style.display = "none";
        if (event.target === horariosModal) horariosModal.style.display = "none";
        if (event.target === necesitasModal) necesitasModal.style.display = "none";
    });
