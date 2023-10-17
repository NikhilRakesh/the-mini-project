


// Function to show the custom modal
function confirmModal(name,action,userId) {
    const customModal = document.getElementById('confirm-modal');
    const modalUserId = document.getElementById('modal-username-id');
    const status = document.getElementById('modal-user-status');
    console.log('button', action);

    modalUserId.textContent = name; // Set the user ID in the modal
    status.textContent = action;

    const okButton = document.getElementById('ok-button');

    okButton.addEventListener('click', function () {
        if (action === 'block') {
            // Redirect to the /userblock route with the user's ID
            window.location.href = `/userblock/${userId}`;
        } else if (action === 'unblock') {
            // Redirect to the /userunblock route with the user's ID
            window.location.href = `/userunblock/${userId}`;
        }
    });


    customModal.classList.remove('hidden');
}

// Function to hide the custom modal
function hidesModal() {
    const customModal = document.getElementById('confirm-modal');
    customModal.classList.add('hidden');
}

// Attach event listeners to elements that trigger the modal
const showModalButton = document.getElementById('show-modal-button');
showModalButton.addEventListener('click', confirmModal);



const closeModalButtons = document.querySelectorAll('[data-modal-hide="confirm-modal"]');
closeModalButtons.forEach((button) => {
    button.addEventListener('click', hidesModal);
});





