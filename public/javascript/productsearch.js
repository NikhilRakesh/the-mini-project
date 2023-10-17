const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('voice-search');
const searchModal = document.getElementById('searchModal');
const searchResultsContainer = document.getElementById('searchResults');
const closeModalButton = document.getElementById('closeModal');

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    try {
      const response = await fetch(`/search?q=${searchTerm}`);
      const data = await response.json();

      // Display search results in the modal
      displaySearchResults(data.products);

      // Show the modal
      searchModal.classList.remove('hidden');

      // Add a click event listener to close the modal
      closeModalButton.addEventListener('click', () => {
        searchModal.classList.add('hidden');
      });
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }
});

function displaySearchResults(products) {
  searchResultsContainer.innerHTML = '';

  if (products.length === 0) {
    searchResultsContainer.innerHTML = '<p>No matching products found.</p>';
  } else {
    products.forEach((product) => {
      // Create HTML elements to display each product
      const productElement = document.createElement('div');
      productElement.textContent = product.name; // Customize this to display product details

      // Append the product element to the results container
      searchResultsContainer.appendChild(productElement);
    });
  }
}
