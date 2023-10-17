
// Function to show the custom modal
function showsModal() {
    const customModal = document.getElementById('custom-modal');
    customModal.classList.remove('hidden');
}

// Function to hide the custom modal
function hidesModal() {
    const customModal = document.getElementById('custom-modal');
    customModal.classList.add('hidden');
}

// Attach event listeners to elements that trigger the modal
const showModalButton = document.getElementById('show-modal-button');
showModalButton.addEventListener('click', showsModal);

const closeModalButtons = document.querySelectorAll('[data-modal-hide="custom-modal"]');
closeModalButtons.forEach((button) => {
    button.addEventListener('click', hidesModal);
});



