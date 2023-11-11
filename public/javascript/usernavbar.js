const mobileMenuButton = document.getElementById("mobile-menu-button");
const navbarUser = document.getElementById("navbar-user");
const searchContainer = document.querySelector("form.relative");

navbarUser.classList.add("hidden");
searchContainer.classList.add("hidden");

mobileMenuButton.addEventListener("click", () => {
    navbarUser.classList.toggle("hidden");
    if (window.innerWidth < 768) {
        searchContainer.classList.toggle("hidden");
    }
});