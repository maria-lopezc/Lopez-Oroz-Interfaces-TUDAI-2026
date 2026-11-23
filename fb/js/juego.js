const ANCHO_JUEGO = 900;
const ALTO_JUEGO = 600;

const GRAVEDAD = 1600; // píxeles por segundo al cuadrado
const IMPULSO = 520;   // píxeles por segundo
const VELOCIDAD_MUNDO = 240; // píxeles por segundo

const ANCHO_TUBO = 80;
const HUECO_INICIAL = 260;
const HUECO_MINIMO = 165;
const MARGEN_VERTICAL = 70;
const VARIACION_MAXIMA_HUECO = 140;
const VELOCIDAD_VERTICAL_COMODA = 190;

const SEPARACION_INICIAL = { minima: 380, maxima: 520 };
const SEPARACION_FINAL = { minima: 320, maxima: 410 };

const PUNTOS_POR_TUBO = 100;
const PUNTAJE_OBJETIVO = 2000;
const VIDAS_INICIALES = 10;
const VIDAS_MAXIMAS = 15;
const DANIO = 1;
const CURACION_MONEDA = 1;
const TIEMPO_INVULNERABLE = 1.2; // segundos
const DEMORA_PANTALLA_FINAL = 1700;

const TAMANOS_OBJETO = { moneda: 40, pulpo: 52 };
const AMPLITUD_FLOTE_PULPO = 14; // píxeles
const PERIODO_FLOTE_PULPO = 2.6; // segundos

const ANCHO_FONDO = 1066.67;
const CAPAS_PARALLAX = [
    { elemento: document.querySelector(".capa--1"), factor: 0.12 },
    { elemento: document.querySelector(".capa--2"), factor: 0.35 },
    { elemento: document.querySelector(".capa--3"), factor: 1 },
    { elemento: document.querySelector(".capa--4"), factor: 1.35 },
];

let distanciaProximoTubo = 0;
let proximoIdTubo = 1;
let proximoIdObjeto = 1;
let tipoProximoObjeto = "moneda";
let centroHuecoAnterior = ALTO_JUEGO / 2;
let separacionAnterior = SEPARACION_INICIAL.maxima;
let temporizadorFinal = null;

const juego = {
    estado: "listo",
    resultado: null,
    tiempo: 0,
    distancia: 0,
    puntaje: 0,
    vidas: VIDAS_INICIALES,
    tubosCreados: 0,
    invulnerableHasta: 0,

    tortuga: {
        x: 180,
        y: 260,
        ancho: 62,
        alto: 30,
        velocidadY: 0,
    },

    tubos: [],
    objetos: [],
};

const contenedorJuego = document.querySelector("#juego");
const elementoTortuga = document.querySelector("#tortuga");
const elementoSprite = document.querySelector("#tortuga-sprite");
const elementoVidas = document.querySelector("#vidas");
const elementoPuntaje = document.querySelector("#puntaje");
const elementoPantalla = document.querySelector("#pantalla");
const elementoTitulo = document.querySelector("#pantalla-titulo");
const elementoMensajeFinal = document.querySelector("#mensaje-final");
const botonJugar = document.querySelector("#boton-jugar");
const elementosTubos = new Map();
const elementosObjetos = new Map();

const CLASES_ANIMACION_TORTUGA = [
    "tortuga--nadando",
    "tortuga--golpe",
    "tortuga--choque",
];

// ========== PARTIDA ==========

function reiniciarPartida() {
    clearTimeout(temporizadorFinal);

    juego.estado = "listo";
    juego.resultado = null;
    juego.tiempo = 0;
    juego.distancia = 0;
    juego.puntaje = 0;
    juego.vidas = VIDAS_INICIALES;
    juego.tubosCreados = 0;
    juego.invulnerableHasta = 0;
    juego.tortuga.y = 260;
    juego.tortuga.velocidadY = 0;
    juego.tubos = [];
    juego.objetos = [];

    distanciaProximoTubo = 0;
    tipoProximoObjeto = "moneda";
    centroHuecoAnterior = ALTO_JUEGO / 2;
    separacionAnterior = SEPARACION_INICIAL.maxima;

    elementoSprite.classList.remove(...CLASES_ANIMACION_TORTUGA);
    contenedorJuego.classList.remove("juego--terminado");
    contenedorJuego.querySelectorAll(".aviso").forEach((aviso) => aviso.remove());
}

function comenzarPartida() {
    reiniciarPartida();
    elementoPantalla.hidden = true;
    botonJugar.blur();
    iniciarJuego();
    aplicarImpulso();
}

function iniciarJuego() {
    juego.estado = "jugando";
    cuadroAnterior = 0;

    if (!animacionActiva) {
        animacionActiva = true;
        requestAnimationFrame(cicloJuego);
    }
}

function terminarJuego(resultado) {
    if (juego.estado === "terminado") return;

    juego.estado = "terminado";
    juego.resultado = resultado;
    contenedorJuego.classList.add("juego--terminado");

    if (resultado === "derrota") {
        const caida = Math.max(0, ALTO_JUEGO - juego.tortuga.y - 36);

        juego.tortuga.velocidadY = 0;
        elementoSprite.style.setProperty("--caida", `${caida}px`);
        animarTortuga("tortuga--choque");
    }

    temporizadorFinal = setTimeout(mostrarPantallaFinal, DEMORA_PANTALLA_FINAL);
}

function mostrarPantallaFinal() {
    const gano = juego.resultado === "victoria";

    elementoTitulo.textContent = gano ? "¡Ganaste!" : "Fin del juego";
    elementoMensajeFinal.textContent =
        `Puntaje: ${juego.puntaje} de ${PUNTAJE_OBJETIVO} · Vidas: ${juego.vidas}`;
    botonJugar.textContent = "Jugar de nuevo";
    elementoPantalla.hidden = false;
}

function aplicarImpulso() {
    if (juego.estado !== "jugando") return;

    juego.tortuga.velocidadY = -IMPULSO;

    if (!elementoSprite.classList.contains("tortuga--golpe")) {
        animarTortuga("tortuga--nadando");
    }
}

function restarVidas(cantidad) {
    if (juego.tiempo < juego.invulnerableHasta) return false;

    juego.vidas = Math.max(0, juego.vidas - cantidad);
    juego.invulnerableHasta = juego.tiempo + TIEMPO_INVULNERABLE;
    mostrarAviso(`-${cantidad}`, "resta");

    if (juego.vidas === 0) {
        terminarJuego("derrota");
    } else {
        animarTortuga("tortuga--golpe");
    }

    return true;
}

// ========== ACTUALIZACIÓN ==========

function actualizarTortuga(dt) {
    if (juego.estado !== "jugando") return;

    const tortuga = juego.tortuga;

    juego.tiempo += dt;
    juego.distancia += VELOCIDAD_MUNDO * dt;
    tortuga.velocidadY += GRAVEDAD * dt;
    tortuga.y += tortuga.velocidadY * dt;

    if (tortuga.y < 0) {
        tortuga.y = 0;
        tortuga.velocidadY = 0;
    }

    if (tortuga.y + tortuga.alto > ALTO_JUEGO) {
        tortuga.y = ALTO_JUEGO - tortuga.alto;
        tortuga.velocidadY = -IMPULSO;
        restarVidas(DANIO);
    }
}

function obtenerProgreso() {
    const tubosParaGanar = PUNTAJE_OBJETIVO / PUNTOS_POR_TUBO;

    return Math.min(1, juego.tubosCreados / (tubosParaGanar - 1));
}

function interpolar(inicio, fin, progreso) {
    return inicio + (fin - inicio) * progreso;
}

function calcularSeparacion() {
    const progreso = obtenerProgreso();
    const minima = interpolar(
        SEPARACION_INICIAL.minima,
        SEPARACION_FINAL.minima,
        progreso
    );
    const maxima = interpolar(
        SEPARACION_INICIAL.maxima,
        SEPARACION_FINAL.maxima,
        progreso
    );

    return minima + Math.random() * (maxima - minima);
}

function calcularVariacionMaxima() {
    const tiempoLibre =
        (separacionAnterior - ANCHO_TUBO - juego.tortuga.ancho) /
        VELOCIDAD_MUNDO;

    return Math.min(
        VARIACION_MAXIMA_HUECO,
        VELOCIDAD_VERTICAL_COMODA * tiempoLibre
    );
}

function crearTubo(separacion) {
    const altoHueco = interpolar(
        HUECO_INICIAL,
        HUECO_MINIMO,
        obtenerProgreso()
    );
    const variacionMaxima = calcularVariacionMaxima();

    const centroMinimo = Math.max(
        MARGEN_VERTICAL + altoHueco / 2,
        centroHuecoAnterior - variacionMaxima
    );
    const centroMaximo = Math.min(
        ALTO_JUEGO - MARGEN_VERTICAL - altoHueco / 2,
        centroHuecoAnterior + variacionMaxima
    );
    const centroY =
        centroMinimo + Math.random() * (centroMaximo - centroMinimo);

    juego.tubos.push({
        id: proximoIdTubo++,
        x: ANCHO_JUEGO,
        ancho: ANCHO_TUBO,
        centroY,
        altoHueco,
        puntuado: false,
        golpeado: false,
    });

    juego.tubosCreados += 1;
    centroHuecoAnterior = centroY;
    separacionAnterior = separacion;

    const tamano = TAMANOS_OBJETO[tipoProximoObjeto];
    const xObjeto =
        ANCHO_JUEGO + ANCHO_TUBO + (separacion - ANCHO_TUBO - tamano) / 2;
    const desvioY = (Math.random() - 0.5) * 170;
    const yObjeto = Math.min(
        ALTO_JUEGO - MARGEN_VERTICAL - tamano,
        Math.max(MARGEN_VERTICAL, centroY + desvioY - tamano / 2)
    );

    crearObjeto(tipoProximoObjeto, xObjeto, yObjeto);

    tipoProximoObjeto =
        tipoProximoObjeto === "moneda" ? "pulpo" : "moneda";
}

function crearObjeto(tipo, x, y) {
    const tamano = TAMANOS_OBJETO[tipo];

    juego.objetos.push({
        id: proximoIdObjeto++,
        tipo,
        x,
        y,
        yBase: y,
        ancho: tamano,
        alto: tamano,
        tomado: false,
    });
}

function actualizarTubos(dt) {
    if (juego.estado !== "jugando") return;

    const avance = VELOCIDAD_MUNDO * dt;
    distanciaProximoTubo -= avance;

    if (distanciaProximoTubo <= 0) {
        const separacion = calcularSeparacion();

        crearTubo(separacion);
        distanciaProximoTubo += separacion;
    }

    for (const tubo of juego.tubos) {
        tubo.x -= avance;
    }

    juego.tubos = juego.tubos.filter(
        (tubo) => tubo.x + tubo.ancho > 0
    );
}

function actualizarObjetos(dt) {
    if (juego.estado !== "jugando") return;

    for (const objeto of juego.objetos) {
        objeto.x -= VELOCIDAD_MUNDO * dt;

        if (objeto.tipo === "pulpo") {
            const fase = (juego.tiempo / PERIODO_FLOTE_PULPO) * Math.PI * 2;
            objeto.y = objeto.yBase + Math.sin(fase) * AMPLITUD_FLOTE_PULPO;
        }
    }

    juego.objetos = juego.objetos.filter(
        (objeto) => objeto.x + objeto.ancho > 0
    );
}

function actualizarObjetosTomados() {
    if (juego.estado !== "jugando") return;

    const hitboxTortuga = obtenerHitboxTortuga();

    for (const objeto of juego.objetos) {
        if (!seSuperponen(hitboxTortuga, objeto)) continue;

        if (objeto.tipo === "moneda") {
            objeto.tomado = true;
            juego.vidas = Math.min(VIDAS_MAXIMAS, juego.vidas + CURACION_MONEDA);
            mostrarAviso(`+${CURACION_MONEDA}`, "suma");
        }

        if (objeto.tipo === "pulpo" && juego.vidas > 1 && restarVidas(DANIO)) {
            objeto.tomado = true;
        }
    }

    juego.objetos = juego.objetos.filter((objeto) => !objeto.tomado);
}

function obtenerHitboxTortuga() {
    const margenX = juego.tortuga.ancho * 0.15;
    const margenY = juego.tortuga.alto * 0.15;

    return {
        x: juego.tortuga.x + margenX,
        y: juego.tortuga.y + margenY,
        ancho: juego.tortuga.ancho - margenX * 2,
        alto: juego.tortuga.alto - margenY * 2,
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

    const tortuga = obtenerHitboxTortuga();

    for (const tubo of juego.tubos) {
        if (tubo.golpeado) continue;

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
            seSuperponen(tortuga, parteSuperior) ||
            seSuperponen(tortuga, parteInferior)
        ) {
            tubo.golpeado = true;
            restarVidas(DANIO);
            return;
        }
    }
}

function actualizarPuntaje() {
    if (juego.estado !== "jugando") return;

    for (const tubo of juego.tubos) {
        const tuboYaPasoLaTortuga =
            tubo.x + tubo.ancho < juego.tortuga.x;

        if (!tubo.puntuado && tuboYaPasoLaTortuga) {
            tubo.puntuado = true;

            if (tubo.golpeado) continue;

            juego.puntaje += PUNTOS_POR_TUBO;

            if (juego.puntaje >= PUNTAJE_OBJETIVO) {
                terminarJuego("victoria");
                return;
            }
        }
    }
}

// ========== DIBUJO ==========

function animarTortuga(clase) {
    elementoSprite.classList.remove(...CLASES_ANIMACION_TORTUGA);
    void elementoSprite.offsetWidth;
    elementoSprite.classList.add(clase);
}

function mostrarAviso(texto, tipo) {
    const aviso = document.createElement("span");
    aviso.className = `aviso aviso--${tipo}`;
    aviso.textContent = texto;
    aviso.style.left = `${juego.tortuga.x + 18}px`;
    aviso.style.top = `${Math.max(48, juego.tortuga.y - 26)}px`;
    aviso.addEventListener("animationend", () => aviso.remove());
    contenedorJuego.append(aviso);
}

function dibujarParallax() {
    for (const capa of CAPAS_PARALLAX) {
        const desplazamiento = (juego.distancia * capa.factor) % ANCHO_FONDO;
        capa.elemento.style.transform =
            `translate3d(${-desplazamiento}px, 0, 0)`;
    }
}

function dibujarTubos() {
    const idsActivos = new Set(juego.tubos.map((tubo) => tubo.id));

    for (const [id, elementos] of elementosTubos) {
        if (!idsActivos.has(id)) {
            elementos.superior.remove();
            elementos.inferior.remove();
            elementosTubos.delete(id);
        }
    }

    for (const tubo of juego.tubos) {
        let elementos = elementosTubos.get(tubo.id);

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

        elementos.superior.classList.toggle("tubo--golpeado", tubo.golpeado);
        elementos.inferior.classList.toggle("tubo--golpeado", tubo.golpeado);
    }
}

function dibujarObjetos() {
    const idsActivos = new Set(juego.objetos.map((objeto) => objeto.id));

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

            const sprite = document.createElement("div");
            sprite.className = "objeto__sprite";
            elemento.append(sprite);

            contenedorJuego.append(elemento);
            elementosObjetos.set(objeto.id, elemento);
        }

        elemento.style.width = `${objeto.ancho}px`;
        elemento.style.height = `${objeto.alto}px`;
        elemento.style.transform =
            `translate3d(${objeto.x}px, ${objeto.y}px, 0)`;
    }
}

function dibujarJuego() {
    const inclinacion = Math.max(
        -22,
        Math.min(35, juego.tortuga.velocidadY * 0.06)
    );

    elementoTortuga.style.transform =
        `translate3d(${juego.tortuga.x}px, ${juego.tortuga.y}px, 0) rotate(${inclinacion}deg)`;
    elementoTortuga.classList.toggle(
        "tortuga--invulnerable",
        juego.estado === "jugando" && juego.tiempo < juego.invulnerableHasta
    );

    elementoVidas.textContent = `♥ Vidas: ${juego.vidas}`;
    elementoPuntaje.textContent = `Puntaje: ${juego.puntaje} / ${PUNTAJE_OBJETIVO}`;

    dibujarParallax();
    dibujarTubos();
    dibujarObjetos();
}

// ========== CICLO Y CONTROLES ==========

let cuadroAnterior = 0;
let animacionActiva = false;

function cicloJuego(tiempoActual) {
    if (juego.estado !== "jugando") {
        animacionActiva = false;
        return;
    }

    if (!cuadroAnterior) cuadroAnterior = tiempoActual;

    const dt = Math.min((tiempoActual - cuadroAnterior) / 1000, 0.05);
    cuadroAnterior = tiempoActual;

    actualizarTortuga(dt);
    actualizarTubos(dt);
    actualizarObjetos(dt);
    verificarColisiones();
    actualizarObjetosTomados();
    actualizarPuntaje();
    dibujarJuego();

    requestAnimationFrame(cicloJuego);
}

function manejarTeclado(evento) {
    if (evento.code !== "Space") return;

    evento.preventDefault();
    if (evento.repeat) return;

    if (juego.estado === "jugando") {
        aplicarImpulso();
    } else if (!elementoPantalla.hidden) {
        comenzarPartida();
    }
}

function configurarControles() {
    contenedorJuego.addEventListener("pointerdown", aplicarImpulso);
    botonJugar.addEventListener("click", comenzarPartida);
    window.addEventListener("keydown", manejarTeclado);

    elementoSprite.addEventListener("animationend", () => {
        if (!elementoSprite.classList.contains("tortuga--choque")) {
            elementoSprite.classList.remove(...CLASES_ANIMACION_TORTUGA);
        }
    });
}

function ajustarEscala() {
    const escala = Math.min(
        window.innerWidth / ANCHO_JUEGO,
        window.innerHeight / ALTO_JUEGO
    );

    contenedorJuego.style.transform = `scale(${escala})`;
}

window.addEventListener("resize", ajustarEscala);
ajustarEscala();

dibujarJuego();

configurarControles();
