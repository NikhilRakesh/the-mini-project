document.getElementById('search').addEventListener('input', function () {
    const searchText = this.value.toLowerCase();
    const tableRows = document.querySelectorAll('tbody tr');

    tableRows.forEach(function (row) {
        const productName = row.querySelector('th').textContent.toLowerCase();
        if (productName.includes(searchText)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});
