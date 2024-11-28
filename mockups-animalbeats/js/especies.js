const modal = document.getElementById("speciesModal");
const closeModal = document.getElementsByClassName("close")[0];
const addSpeciesBtn = document.getElementById("addSpeciesBtn");
const editSpeciesBtn = document.getElementById("editSpeciesBtn");
const deleteSpeciesBtn = document.getElementById("deleteSpeciesBtn");
const form = document.getElementById("speciesForm");
const speciesNameInput = document.getElementById("speciesName");
const speciesInfoInput = document.getElementById("speciesInfo");
const submitBtn = document.getElementById("submitBtn");
const modalTitle = document.getElementById("modalTitle");

let currentMode = "add";

function openModal(mode) {
    currentMode = mode;
    modal.style.display = "block";
    if (mode === "add") {
        modalTitle.textContent = "Añadir Especie";
        submitBtn.textContent = "Añadir Especie";
        speciesNameInput.value = "";
        speciesInfoInput.value = "";
    } else if (mode === "edit") {
        modalTitle.textContent = "Modificar Especie";
        submitBtn.textContent = "Modificar Especie";
    } else if (mode === "delete") {
        modalTitle.textContent = "Eliminar Especie";
        submitBtn.textContent = "Eliminar Especie";
        speciesNameInput.value = "";
        speciesInfoInput.value = "";
        speciesNameInput.disabled = true;
        speciesInfoInput.disabled = true;
    }
}

function closeModalWindow() {
    modal.style.display = "none";
}

form.addEventListener("submit", function(event) {
    event.preventDefault();
    if (currentMode === "add") {
        alert(`Especie añadida: ${speciesNameInput.value}`);
    } else if (currentMode === "edit") {
        alert(`Especie modificada: ${speciesNameInput.value}`);
    } else if (currentMode === "delete") {
        alert(`Especie eliminada: ${speciesNameInput.value}`);
    }
    closeModalWindow();
});

addSpeciesBtn.addEventListener("click", () => openModal("add"));
editSpeciesBtn.addEventListener("click", () => openModal("edit"));
deleteSpeciesBtn.addEventListener("click", () => openModal("delete"));

closeModal.addEventListener("click", closeModalWindow);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModalWindow();
    }
});
