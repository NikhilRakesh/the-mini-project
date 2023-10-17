// Function to show the modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }
}

// Function to hide the modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }
}

// Add event listeners to toggle button and close button
document.querySelectorAll('[data-modal-toggle]').forEach((button) => {
    button.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-modal-target');
        showModal(target);
    });
});

document.querySelectorAll('[data-modal-hide]').forEach((button) => {
    button.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-modal-hide');
        hideModal(target);
    });
});
