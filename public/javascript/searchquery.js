// javascript.js

function searchWithQuery() {
    const searchQuery = document.getElementById('voice-search').value;
    
    // Access the user._id value from the global user variable
    const userId = user._id;

    // Construct the URL with both parameters
    const url = `/search?userId=${userId}&searchQuery=${encodeURIComponent(searchQuery)}`;

    // Redirect to the constructed URL
    window.location.href = url;
}


