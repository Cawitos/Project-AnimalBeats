const contactModal = document.getElementById('contact-modal'); 
const contactBtn = document.getElementById('contact-btn'); 
const closeContactModal = document.querySelector('#contact-modal .close'); 

contactBtn.addEventListener('click', () => {
    contactModal.style.display = 'flex'; 
});

closeContactModal.addEventListener('click', () => {
    contactModal.style.display = 'none'; 
});

window.addEventListener('click', (event) => {
    if (event.target === contactModal) { 
        contactModal.style.display = 'none'; 
    }
});
