/* =====================================================
   SparkGames · Registro
   Este JS NO anima nada (eso es CSS). Solo:
   1) revisa que las contraseñas coincidan
  2) muestra los errores
   ===================================================== */

const formulario       = document.getElementById('registro');
const contrasenia      = document.getElementById('contrasenia');
const contraseniaRepetida = document.getElementById('contrasenia-repetida');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();                          // evita que se recargue la página

  // Si las contraseñas son distintas, marcamos el campo como inválido
  const coinciden = contrasenia.value === contraseniaRepetida.value;
  contraseniaRepetida.setCustomValidity(coinciden ? '' : 'No coinciden');

  formulario.classList.add('formulario-validado');  // el CSS muestra los errores en rojo

  if (formulario.checkValidity()) {
    window.location.href = '../home.html';
  }
});