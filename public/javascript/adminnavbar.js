function toggleMobileMenu() {
    const menuToggle = document.querySelector("#mobile-menu-button");
    const navbarUser = document.querySelector("#navbar-user");

    if (menuToggle && navbarUser) {
        menuToggle.addEventListener("click", () => {
            const expanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", !expanded);
            navbarUser.classList.toggle("hidden");
        });
    }
}

// Call the toggleMobileMenu function when the document is ready
document.addEventListener("DOMContentLoaded", () => {
    toggleMobileMenu();
});