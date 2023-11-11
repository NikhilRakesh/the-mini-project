// navbar and search button hiden in phones
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

//  silder js
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const sliderWrapper = document.querySelector('.slider-wrapper');

function showSlide(slideIndex) {
        sliderWrapper.style.transform = `translateX(-${slideIndex * 100}%)`;
}

function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
}

function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
}

setInterval(nextSlide, 4000); 


// cards 1
document.querySelectorAll('.product').forEach((product) => {
        const detailsButton = product.querySelector('.details-button');
        const detailsDiv = product.querySelector('.details');
    
        detailsButton.addEventListener('click', () => {
            detailsDiv.classList.toggle('hidden');
        });
    });



    
    