const menuButton = document.querySelector('.menu-button');
const header = document.querySelector('header');
const overlay = document.querySelector('.bg');

menuButton.addEventListener('click', toggleNavigation);
overlay.addEventListener('click', toggleNavigation);

function toggleNavigation() {
  menuButton.classList.toggle('nav-open');
  header.classList.toggle('nav-open');
}