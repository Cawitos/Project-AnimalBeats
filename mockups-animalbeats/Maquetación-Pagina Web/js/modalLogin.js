const modal = document.getElementById('login-modal'); 
const buttons = document.querySelectorAll("button[onClick*='login']"); 
const closeModal = document.querySelector('#login-modal .close'); 

buttons.forEach((button) => {
    button.addEventListener('click', () => {
        modal.style.display = 'flex'; 
    });
});

closeModal.addEventListener('click', () => {
    console.log('Cerrando modal');
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) { 
        modal.style.display = 'none'; 
    }
});
