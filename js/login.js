/* =====================================================
   SparkGames · Iniciar sesión
   Igual que el registro: el JS solo muestra los errores
   (el CSS los pinta de rojo) y, si está todo bien, entra al home.
   ===================================================== */

const formulario = document.getElementById('login');
const btn=document.getElementById('btn-login');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();                          // evita que se recargue la página

  formulario.classList.add('formulario-validado');  // el CSS muestra los errores en rojo

  if (formulario.checkValidity()) {
    btn.classList.add('valido');
    btn.textContent = '¡Ya casi! ✓';
    btn.disabled = true;
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
  }
});
