function showIncorrectPasswordModal() {
    const modal = document.getElementById('incorrect-password-modal');
    modal.classList.remove('hidden');
}

function hideIncorrectPasswordModal() {
    const modal = document.getElementById('incorrect-password-modal');
    modal.classList.add('hidden');
}

const closeIncorrectPasswordModalBtn = document.getElementById(
    'close-incorrect-password-modal'
);

closeIncorrectPasswordModalBtn.addEventListener('click', hideIncorrectPasswordModal);