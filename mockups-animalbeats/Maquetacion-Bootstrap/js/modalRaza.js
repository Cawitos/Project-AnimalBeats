const modal = document.getElementById("razaModal");
const closeModal = document.getElementsByClassName("close")[0];
const addRazaBtn = document.getElementById("añadirRaza");
const elimRazaBtn = document.getElementById("elimRaza");
const modRazaBtn = document.getElementById("modRaza");
const form = document.getElementById("razaForm");
const razaNombreInput = document.getElementById("razaNombre");
const razaInfoInput = document.getElementById("razaInfo");
const submitBtn = document.getElementById("submitBtn");
const modalTitle = document.getElementById("modalTitle");

let currentMode = "add";

function openModal(mode) {
    modal.style.display = "block";
    if (mode === "add") {
        modalTitle.textContent = "Añadir Raza";
        submitBtn.textContent = "Añadir Raza";
        razaNombreInput.disabled = false;
        razaInfoInput.disabled = false;
        razaNombreInput.value = "";
        razaInfoInput.value = "";
    } else if (mode === "edit") {
        modalTitle.textContent = "Modificar Raza";
        submitBtn.textContent = "Modificar Raza";
        razaNombreInput.disabled = false;
        razaInfoInput.disabled = false;
    } else if (mode === "delete") {
        modalTitle.textContent = "Eliminar Raza";
        submitBtn.textContent = "Eliminar Raza";
        razaNombreInput.disabled = true;
        razaInfoInput.disabled = true;
        razaNombreInput.value = "";
        razaInfoInput.value = "";
    }
}

function closeModalWindow() {
    modal.style.display = "none";
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    const razaNombre = razaNombreInput.value;
    const razaInfo = razaInfoInput.value;

    if (currentMode === "add") {
        alert(`Raza añadida: ${razaNombre}`);
    } else if (currentMode === "edit") {
        alert(`Raza modificada: ${razaNombre}`);
    } else if (currentMode === "delete") {
        alert(`Raza eliminada: ${razaNombre}`);
    }
    
    closeModalWindow();
});

addRazaBtn.addEventListener("click", () => openModal("add"));
modRazaBtn.addEventListener("click", () => openModal("edit"));
elimRazaBtn.addEventListener("click", () => openModal("delete"));

closeModal.addEventListener("click", closeModalWindow);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModalWindow();
    }
});
