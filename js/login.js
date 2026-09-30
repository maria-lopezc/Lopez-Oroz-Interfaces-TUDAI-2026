/* =====================================================
   SparkGames · Iniciar sesión
   Igual que el registro: el JS solo muestra los errores
   (el CSS los pinta de rojo) y, si está todo bien, entra al home.
   ===================================================== */

const formulario = document.getElementById('login');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();                          // evita que se recargue la página

  formulario.classList.add('formulario-validado');  // el CSS muestra los errores en rojo

  if (formulario.checkValidity()) {
    window.location.href = 'home.html';
  }
});
