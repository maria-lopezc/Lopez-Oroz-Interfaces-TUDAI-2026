// ===== CARRUSEL PRINCIPAL =====
// Muestra un juego a la vez. Las flechas y los puntos cambian de juego.

const pista = document.querySelector('.carrusel-principal__pista');
const totalJuegos = pista.children.length;
const indicadores = document.querySelectorAll('.indicador');
let juegoActual = 0;

function mostrarJuego(numero) {
  // Si se pasa del último vuelve al primero (y al revés)
  juegoActual = (numero + totalJuegos) % totalJuegos;
  pista.style.transform = `translateX(-${juegoActual * 100}%)`;

  indicadores.forEach((indicador, i) => {
    indicador.classList.toggle('indicador--activo', i === juegoActual);
  });
}

document.getElementById('principalAnterior').addEventListener('click', () => mostrarJuego(juegoActual - 1));
document.getElementById('principalSiguiente').addEventListener('click', () => mostrarJuego(juegoActual + 1));

indicadores.forEach((indicador, i) => {
  indicador.addEventListener('click', () => mostrarJuego(i));
});


// ===== CARRUSELES CHICOS =====
// Cada flecha mueve el carrusel una "pantalla" de cards.
// La flecha izquierda se oculta al inicio y la derecha al final, como en el Figma.

document.querySelectorAll('.fila').forEach((fila) => {
  const carrusel = fila.querySelector('.carrusel');
  const flechaIzq = fila.querySelector('.fila__flecha--izq');
  const flechaDer = fila.querySelector('.fila__flecha--der');

  function actualizarFlechas() {
    const alInicio = carrusel.scrollLeft <= 0;
    const alFinal = carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth - 1;
    flechaIzq.classList.toggle('flecha--oculta', alInicio);
    flechaDer.classList.toggle('flecha--oculta', alFinal);
  }

  flechaIzq.addEventListener('click', () => carrusel.scrollBy({ left: -carrusel.clientWidth }));
  flechaDer.addEventListener('click', () => carrusel.scrollBy({ left: carrusel.clientWidth }));

  carrusel.addEventListener('scroll', actualizarFlechas);
  window.addEventListener('resize', actualizarFlechas);
  actualizarFlechas();
});
