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

      displaySearchResults(data.products);

      searchModal.classList.remove('hidden');

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
      const productElement = document.createElement('div');
      productElement.textContent = product.name; 
      searchResultsContainer.appendChild(productElement);
    });
  }
}
