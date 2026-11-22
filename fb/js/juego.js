const ANCHO_JUEGO = 900;
const ALTO_JUEGO = 600;

const GRAVEDAD = 1600; // píxeles por segundo al cuadrado
const IMPULSO = 520;   // píxeles por segundo
const VELOCIDAD_TUBOS = 240; // píxeles por segundo
const ANCHO_TUBO = 80;
const HUECO_INICIAL = 230;
const HUECO_MINIMO = 130;
const MARGEN_VERTICAL = 70;
const PUNTAJE_OBJETIVO = 10;

let distanciaProximoTubo = 280;
let proximoIdTubo = 1;
let proximoIdObjeto = 1;
let tipoProximoObjeto = "moneda";
const TAMANO_OBJETO = 32;


const juego = {
    estado: "listo",
    resultado: null, // "listo", "jugando" o "terminado"
    tiempo: 0,
    puntaje: 0,
    vidas: 3,


    pajaro: {
        x: 180,
        y: 260,
        ancho: 48,
        alto: 40,
        velocidadY: 0,
    },

    efectos: {
        turboHasta: 0,
    },

    tubos: [],
    objetos: [],
};

// Aplica un impulso hacia arriba al pájaro.
function aplicarImpulso() {
  if (juego.estado === "terminado") return;

  juego.pajaro.velocidadY = -IMPULSO;
  animarPajaro("pajaro--aleteo");

  if (juego.estado === "listo") {
    iniciarJuego();
  }
}

// Actualiza la velocidad y la posición vertical.
function actualizarPajaro(dt) {

    if (juego.estado !== "jugando") return;

    juego.pajaro.velocidadY += GRAVEDAD * dt;
    juego.pajaro.y += juego.pajaro.velocidadY * dt;

    const pajaroSalePorArriba = juego.pajaro.y < 0;
    const pajaroSalePorAbajo =
        juego.pajaro.y + juego.pajaro.alto > ALTO_JUEGO;

    if (pajaroSalePorArriba || pajaroSalePorAbajo) {
        juego.estado = "terminado";
    }

    juego.tiempo += dt;

    if (!tubo.puntuado && tuboYaPasoAlPajaro) {
        tubo.puntuado = true;
        juego.puntaje += 1;

        if (juego.puntaje >= PUNTAJE_OBJETIVO) {
            juego.estado = "terminado";
            juego.resultado = "victoria";
            return;
        }
    }
}

function crearTubo() {
    const altoHueco = Math.max(
        HUECO_MINIMO,
        HUECO_INICIAL - juego.tiempo * 2
    );

    const centroMinimo = MARGEN_VERTICAL + altoHueco / 2;
    const centroMaximo = ALTO_JUEGO - MARGEN_VERTICAL - altoHueco / 2;
    const centroY =
        centroMinimo + Math.random() * (centroMaximo - centroMinimo);

    juego.tubos.push({
        id: proximoIdTubo++,
        x: ANCHO_JUEGO,
        ancho: ANCHO_TUBO,
        centroY,
        altoHueco,
        puntuado: false,
    });

    crearObjeto(
    tipoProximoObjeto,
    ANCHO_JUEGO + ANCHO_TUBO / 2 - TAMANO_OBJETO / 2,
    centroY - TAMANO_OBJETO / 2
    );

    tipoProximoObjeto =
    tipoProximoObjeto === "moneda" ? "murcielago" : "moneda";
}

function crearObjeto(tipo, x, y) {
  juego.objetos.push({
    id: proximoIdObjeto++,
    tipo,
    x,
    y,
    ancho: TAMANO_OBJETO,
    alto: TAMANO_OBJETO,
    tomado: false,
  });
}

const velocidad = obtenerVelocidadMundo();
function actualizarTubos(dt) {

    if (distanciaProximoTubo <= 0) {
        crearTubo();
        distanciaProximoTubo = 220 + Math.random() * 140;
    }

    for (const tubo of juego.tubos) {
        tubo.x -= velocidad * dt;
    }

    juego.tubos = juego.tubos.filter(
        (tubo) => tubo.x + tubo.ancho > 0
    );
}

function actualizarObjetos(dt) {

  for (const objeto of juego.objetos) {
    objeto.x -= velocidad * dt;
  }

  juego.objetos = juego.objetos.filter(
    (objeto) => objeto.x + objeto.ancho > 0
  );
}

function actualizarObjetosTomados() {
  if (juego.estado !== "jugando") return;

  const hitboxPajaro = obtenerHitboxPajaro();

  for (const objeto of juego.objetos) {
    if (!seSuperponen(hitboxPajaro, objeto)) continue;

    objeto.tomado = true;

    if (objeto.tipo === "moneda") {
      juego.puntaje += 5;
    }

    if (objeto.tipo === "murcielago") {
      juego.efectos.turboHasta = juego.tiempo + 3;
    }
  }

  juego.objetos = juego.objetos.filter((objeto) => !objeto.tomado);
}

function obtenerVelocidadMundo() {
  const turboActivo = juego.tiempo < juego.efectos.turboHasta;

  return turboActivo
    ? VELOCIDAD_TUBOS * 1.5
    : VELOCIDAD_TUBOS;
}

function dibujarTubos() {
  if (!contenedorJuego) return;

  const idsActivos = new Set(juego.tubos.map((tubo) => tubo.id));

  // Quita del DOM los tubos que ya salieron del área de juego.
  for (const [id, elementos] of elementosTubos) {
    if (!idsActivos.has(id)) {
      elementos.superior.remove();
      elementos.inferior.remove();
      elementosTubos.delete(id);
    }
  }

  for (const tubo of juego.tubos) {
    let elementos = elementosTubos.get(tubo.id);

    // Crea los elementos una sola vez por par de tubos.
    if (!elementos) {
      const superior = document.createElement("div");
      superior.className = "tubo tubo--superior";

      const inferior = document.createElement("div");
      inferior.className = "tubo tubo--inferior";

      contenedorJuego.append(superior, inferior);

      elementos = { superior, inferior };
      elementosTubos.set(tubo.id, elementos);
    }

    const altoSuperior = tubo.centroY - tubo.altoHueco / 2;
    const yInferior = tubo.centroY + tubo.altoHueco / 2;
    const altoInferior = ALTO_JUEGO - yInferior;

    elementos.superior.style.width = `${tubo.ancho}px`;
    elementos.superior.style.height = `${altoSuperior}px`;
    elementos.superior.style.transform =
      `translate3d(${tubo.x}px, 0, 0)`;

    elementos.inferior.style.width = `${tubo.ancho}px`;
    elementos.inferior.style.height = `${altoInferior}px`;
    elementos.inferior.style.transform =
      `translate3d(${tubo.x}px, ${yInferior}px, 0)`;
  }
}

function dibujarObjetos() {
  if (!contenedorJuego) return;

  const idsActivos = new Set(juego.objetos.map((objeto) => objeto.id));

  // Elimina los objetos que ya salieron de pantalla o fueron recogidos.
  for (const [id, elemento] of elementosObjetos) {
    if (!idsActivos.has(id)) {
      elemento.remove();
      elementosObjetos.delete(id);
    }
  }

  for (const objeto of juego.objetos) {
    let elemento = elementosObjetos.get(objeto.id);

    if (!elemento) {
      elemento = document.createElement("div");
      elemento.className = `objeto objeto--${objeto.tipo}`;
      contenedorJuego.append(elemento);
      elementosObjetos.set(objeto.id, elemento);
    }

    elemento.style.width = `${objeto.ancho}px`;
    elemento.style.height = `${objeto.alto}px`;
    elemento.style.transform =
      `translate3d(${objeto.x}px, ${objeto.y}px, 0)`;
  }
}

let cuadroAnterior = 0;
let animacionActiva = false;

// Se ejecuta una vez por cuadro mientras la partida está activa.
function cicloJuego(tiempoActual) {
    if (juego.estado !== "jugando") {
        animacionActiva = false;
        return;
    }

    let dt = (tiempoActual - cuadroAnterior) / 1000;
    cuadroAnterior = tiempoActual;

    // Limita el salto temporal al volver a una pestaña pausada.
    dt = Math.min(dt, 0.05);

    actualizarPajaro(dt);
    actualizarTubos(dt);
    actualizarObjetos(dt);
    verificarColisiones();
    actualizarObjetosTomados();
    actualizarPuntaje();
    dibujarJuego();

    requestAnimationFrame(cicloJuego);
}

function iniciarJuego() {
    if (animacionActiva) return;

    juego.estado = "jugando";
    cuadroAnterior = 0;
    animacionActiva = true;

    if (juego.estado === "jugando") {
        requestAnimationFrame(cicloJuego);
    } else {
        animacionActiva = false;
        dibujarJuego();
    }

}

function manejarTeclado(evento) {
    if (evento.code !== "Space" || evento.repeat) return;

    evento.preventDefault();
    aplicarImpulso();
}

function configurarControles() {
    const areaJuego = document.querySelector("#juego");

    if (areaJuego) {
        areaJuego.addEventListener("pointerdown", aplicarImpulso);
    }

    window.addEventListener("keydown", manejarTeclado);
}

const elementoPajaro = document.querySelector("#pajaro");
const CLASES_ANIMACION_PAJARO = [
  "pajaro--aleteo",
  "pajaro--turbo",
  "pajaro--choque",
];

function animarPajaro(clase) {
  if (!elementoPajaro) return;

  // Quita animaciones anteriores para poder disparar la nueva.
  elementoPajaro.classList.remove(...CLASES_ANIMACION_PAJARO);
  void elementoPajaro.offsetWidth;
  elementoPajaro.classList.add(clase);
}

if (elementoPajaro) {
  elementoPajaro.addEventListener("animationend", () => {
    elementoPajaro.classList.remove(...CLASES_ANIMACION_PAJARO);
  });
}
const elementoPuntaje = document.querySelector("#puntaje");
const elementoMensajeFinal = document.querySelector("#mensaje-final");
const contenedorJuego = document.querySelector("#juego");
const elementosTubos = new Map();
const elementosObjetos = new Map();

function dibujarJuego() {
    if (elementoPajaro) {
        elementoPajaro.style.transform =
            `translate3d(${juego.pajaro.x}px, ${juego.pajaro.y}px, 0)`;
    }

    if (elementoPuntaje) {
        elementoPuntaje.textContent = `Puntaje: ${juego.puntaje}`;
    }

    if (elementoMensajeFinal) {
        if (juego.estado === "terminado") {
            elementoMensajeFinal.textContent =
                juego.resultado === "victoria" ? "¡Ganaste!" : "Fin del juego";
        } else {
            elementoMensajeFinal.textContent = "";
        }
    }

    dibujarTubos();
    dibujarObjetos();
}

function obtenerHitboxPajaro() {
    const margenX = juego.pajaro.ancho * 0.15;
    const margenY = juego.pajaro.alto * 0.15;

    return {
        x: juego.pajaro.x + margenX,
        y: juego.pajaro.y + margenY,
        ancho: juego.pajaro.ancho - margenX * 2,
        alto: juego.pajaro.alto - margenY * 2,
    };
}

function seSuperponen(a, b) {
    return (
        a.x < b.x + b.ancho &&
        a.x + a.ancho > b.x &&
        a.y < b.y + b.alto &&
        a.y + a.alto > b.y
    );
}

function verificarColisiones() {
    if (juego.estado !== "jugando") return;

    const pajaro = obtenerHitboxPajaro();

    for (const tubo of juego.tubos) {
        const altoSuperior = tubo.centroY - tubo.altoHueco / 2;
        const yInferior = tubo.centroY + tubo.altoHueco / 2;

        const parteSuperior = {
            x: tubo.x,
            y: 0,
            ancho: tubo.ancho,
            alto: altoSuperior,
        };

        const parteInferior = {
            x: tubo.x,
            y: yInferior,
            ancho: tubo.ancho,
            alto: ALTO_JUEGO - yInferior,
        };

        if (
            seSuperponen(pajaro, parteSuperior) ||
            seSuperponen(pajaro, parteInferior)
        ) {
            juego.resultado = "derrota";
            juego.estado = "terminado";
            return;
        }
    }
}

function actualizarPuntaje() {
    if (juego.estado !== "jugando") return;

    for (const tubo of juego.tubos) {
        const tuboYaPasoAlPajaro =
            tubo.x + tubo.ancho < juego.pajaro.x;

        if (!tubo.puntuado && tuboYaPasoAlPajaro) {
            tubo.puntuado = true;
            juego.puntaje += 1;
        }
    }
}

dibujarJuego();

configurarControles();