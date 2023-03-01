const menuButton = document.querySelector('.menu-button');
const navContainer = document.getElementById('nav-container');
const overlay = document.querySelector('.bg');

menuButton.addEventListener('click', toggleNavigation);
overlay.addEventListener('click', toggleNavigation);

function toggleNavigation() {
  menuButton.classList.toggle('nav-open');
  navContainer.classList.toggle('nav-open');
}