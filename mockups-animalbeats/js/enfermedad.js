const modal = document.getElementById("enfermedadModal");
const closeModal = document.getElementsByClassName("close")[0];
const addSpeciesBtn = document.getElementById("añadirEnfermedadBtn");
const editSpeciesBtn = document.getElementById("editEnfermedadBtn");
const deleteSpeciesBtn = document.getElementById("elimEnfermedadBtn");
const form = document.getElementById("enfermedadForm");
const speciesNameInput = document.getElementById("nombreEnfermedad");
const speciesInfoInput = document.getElementById("infoEnfermedad");
const submitBtn = document.getElementById("submitBtn");
const modalTitle = document.getElementById("modalTitle");

let currentMode = "add";

function openModal(mode) {
    currentMode = mode;
    modal.style.display = "block";
    if (mode === "add") {
        modalTitle.textContent = "Añadir Enfermedad";
        submitBtn.textContent = "Añadir Enfermedad";
        speciesNameInput.value = "";
        speciesInfoInput.value = "";
    } else if (mode === "edit") {
        modalTitle.textContent = "Modificar Enfermedad";
        submitBtn.textContent = "Modificar Enfermedad";
    } else if (mode === "delete") {
        modalTitle.textContent = "Eliminar Enfermedad";
        submitBtn.textContent = "Eliminar Enfermedad";
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
        Swal.fire({
            icon: 'success',
            title: 'Enfermedad añadida',
            text: `La enfermedad ${speciesNameInput.value} ha sido añadida exitosamente.`,
            confirmButtonText: 'Aceptar',
        });
    } else if (currentMode === "edit") {
        Swal.fire({
            icon: 'success',
            title: 'Enfermedad modificada',
            text: `La enfermedad ${speciesNameInput.value} ha sido modificada exitosamente.`,
            confirmButtonText: 'Aceptar',
        });
    } else if (currentMode === "delete") {
        Swal.fire({
            icon: 'success',
            title: 'Enfermedad eliminada',
            text: `La enfermedad ${speciesNameInput.value} ha sido eliminada exitosamente.`,
            confirmButtonText: 'Aceptar',
        });
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
