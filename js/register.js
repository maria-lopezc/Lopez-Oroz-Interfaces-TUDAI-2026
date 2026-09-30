const formulario       = document.getElementById('registro');
const btn=document.getElementById('btn-registrar')
const contrasenia      = document.getElementById('contrasenia');
const contraseniaRepetida = document.getElementById('contrasenia-repetida');

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();                          // evita que se recargue la página

  // Si las contraseñas son distintas, marcamos el campo como inválido
  const coinciden = contrasenia.value === contraseniaRepetida.value;
  contraseniaRepetida.setCustomValidity(coinciden ? '' : 'No coinciden');

  formulario.classList.add('formulario-validado');  // el CSS muestra los errores en rojo

  if (formulario.checkValidity()) {
    btn.classList.add('valido');
    btn.textContent = '✓ ¡Registrado!';
    btn.disabled = true;
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
  }
})