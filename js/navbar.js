// Se usa DENTRO de pages/navbar.html (el iframe).
// Avisa a la página de afuera cuando el menú se abre o se cierra,
// para que agrande el iframe y el menú no quede cortado.

const menuCheck = document.getElementById('menu-check');

function avisarEstadoMenu() {
  window.parent.postMessage(menuCheck.checked ? 'menu-abierto' : 'menu-cerrado', '*');
}

menuCheck.addEventListener('change', avisarEstadoMenu);

// Si se hace clic fuera de la barra y del menú, el menú se cierra
document.addEventListener('click', (evento) => {
  if (!evento.target.closest('.navbar')) {
    menuCheck.checked = false;
    avisarEstadoMenu();
  }
});
