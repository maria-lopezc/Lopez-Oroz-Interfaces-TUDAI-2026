// Se usa en las páginas que muestran la barra (home, ejecutar, ...).
// Cuando navbar.html avisa que el menú se abrió, el iframe se agranda
// hasta el alto de la pantalla; cuando se cierra, vuelve al alto de la barra.

const navbarIframe = document.querySelector('.navbar-iframe');

window.addEventListener('message', (evento) => {
  if (evento.data === 'menu-abierto') {
    navbarIframe.classList.add('navbar-iframe--abierto');
  }
  if (evento.data === 'menu-cerrado') {
    navbarIframe.classList.remove('navbar-iframe--abierto');
  }
});
