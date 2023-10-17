document.addEventListener("DOMContentLoaded", function () {
    const modalToggleButtons = document.querySelectorAll('[data-modal-toggle]');
    const modalCloseButtons = document.querySelectorAll('[data-modal-hide]');
    const modalOverlay = document.getElementById('modal-overlay');
  
    // Function to show a modal by its target ID
    function showModal(targetId) {
      const modal = document.getElementById(targetId);
      modal.classList.remove('hidden');
      modalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
  
    // Function to hide a modal by its target ID
    function hideModal(targetId) {
      const modal = document.getElementById(targetId);
      modal.classList.add('hidden');
      modalOverlay.classList.add('hidden');
      document.body.style.overflow = ''; // Re-enable scrolling
    }
  
    // Attach click event listeners to modal toggle buttons
    modalToggleButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-modal-target');
        showModal(targetId);
      });
    });
  
    // Attach click event listeners to modal close buttons
    modalCloseButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-modal-hide');
        hideModal(targetId);
      });
    });
  });
  