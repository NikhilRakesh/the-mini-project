// Function to open the registration modal
function openRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    const backgroundOverlay = document.getElementById('background-overlay');

    modal.classList.remove('hidden');
    backgroundOverlay.classList.add('blur-background'); // Add blur class to background
    document.body.style.overflow = 'hidden';
}

// Function to close the registration modal
function closeRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    const backgroundOverlay = document.getElementById('background-overlay');

    modal.classList.add('hidden');
    backgroundOverlay.classList.remove('blur-background'); // Remove blur class from background
    document.body.style.overflow = 'auto';
}

// Event listener for opening the registration modal
const openRegistrationButton = document.querySelector('[data-modal-toggle="registration-modal"]');
openRegistrationButton.addEventListener('click', openRegistrationModal);

// Event listener for closing the registration modal
const closeRegistrationButton = document.querySelector('[data-modal-hide="registration-modal"]');
closeRegistrationButton.addEventListener('click', closeRegistrationModal);



// passing data from server to modal through toggle buttton

document.querySelectorAll('[data-modal-toggle="registration-modal"]').forEach((button) => {
    button.addEventListener('click', (event) => {
        const userId = event.currentTarget.getAttribute('data-user-id');
        
        // Make a fetch request to get user data based on the userId
        fetch(`/api/user/${userId}`)
            .then((response) => response.json())
            .then((userData) => {
                // Get a reference to the user data container in your modal
                const userDataContainer = document.getElementById('user-data-container');

                // Clear any previous content
                userDataContainer.innerHTML = '';

                // Create elements to display user data (e.g., username and email)
                const usernameElement = document.createElement('p');
                usernameElement.textContent = `Username: ${userData.username}`;

                const emailElement = document.createElement('p');
                emailElement.textContent = `Email: ${userData.email}`;

                // Append the elements to the container
                userDataContainer.appendChild(usernameElement);
                userDataContainer.appendChild(emailElement);

                // Now, your modal is populated with user data
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    });
});
