(() => {
  "use strict";

  const CONFIG = {
    ancho: 900,
    alto: 600,
    pajaro: { x: 180, y: 260, ancho: 48, alto: 40 },
    gravedad: 1600,
    impulso: 520,
    maxDt: 0.05,
    velocidadTubos: 240,
    anchoTubo: 80,
    distanciaPrimerTubo: 280,
    distanciaTuboMin: 220,
    distanciaTuboMax: 360,
    huecoInicial: 230,
    huecoMinimo: 130,
    reduccionHuecoPorSegundo: 2,
    margenVertical: 70,
    puntajeParaGanar: 10,
    tamanoObjeto: 32,
    duracionTurbo: 3,
    multiplicadorTurbo: 1.5,
    margenHitbox: 0.15,
  };

  const CLASES_ANIMACION = [
    "pajaro--aleteo",
    "pajaro--turbo",
    "pajaro--choque",
  ];

  function crearEstadoInicial() {
    return {
      estado: "listo",
      resultado: null,
      tiempo: 0,
      distanciaMundo: 0,
      puntaje: 0,
      pajaro: { ...CONFIG.pajaro, velocidadY: 0 },
      tubos: [],
      objetos: [],
      efectos: { turboHasta: 0 },
    };
  }

  function iniciar() {
    const area = document.querySelector("#juego");
    if (!area) {
      console.error("Falta el contenedor #juego en el HTML.");
      return;
    }

    const elementoPajaro = area.querySelector("#pajaro");
    const elementoPuntaje = document.querySelector("#puntaje");
    const elementoMensaje = document.querySelector("#mensaje-final");
    const botonReiniciar = document.querySelector("#reiniciar");
    const botonIniciar = document.querySelector("#iniciar");
    const capasParallax = Array.from(area.querySelectorAll("[data-parallax]"));
    const elementosTubos = new Map();
    const elementosObjetos = new Map();

    if (!elementoPajaro) {
      console.warn("Falta el elemento #pajaro dentro de #juego.");
    }
    if (capasParallax.length < 4) {
      console.warn("El frontend debe incluir al menos cuatro capas [data-parallax].");
    }

    let juego = crearEstadoInicial();
    let idSiguienteTubo = 1;
    let idSiguienteObjeto = 1;
    let tipoSiguienteObjeto = "moneda";
    let distanciaAlProximoTubo = CONFIG.distanciaPrimerTubo;
    let idFrame = null;
    let tiempoAnterior = null;

    function animarPajaro(clase) {
      if (!elementoPajaro) return;
      elementoPajaro.classList.remove(...CLASES_ANIMACION);
      void elementoPajaro.offsetWidth;
      elementoPajaro.classList.add(clase);
    }

    if (elementoPajaro) {
      elementoPajaro.addEventListener("animationend", () => {
        elementoPajaro.classList.remove(...CLASES_ANIMACION);
      });
    }

    function dibujarParallax() {
      for (const capa of capasParallax) {
        const factor = Number(capa.dataset.parallax) || 0;
        const anchoFondo = capa.scrollWidth || CONFIG.ancho;
        const desplazamiento = -((juego.distanciaMundo * factor) % anchoFondo);
        capa.style.backgroundPositionX = String(desplazamiento) + "px";
      }
    }

    function dibujarTubos() {
      const activos = new Set(juego.tubos.map((tubo) => tubo.id));

      for (const [id, elementos] of elementosTubos) {
        if (!activos.has(id)) {
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

          area.append(superior, inferior);
          elementos = { superior, inferior };
          elementosTubos.set(tubo.id, elementos);
        }

        const altoSuperior = tubo.centroHueco - tubo.altoHueco / 2;
        const yInferior = tubo.centroHueco + tubo.altoHueco / 2;
        const altoInferior = CONFIG.alto - yInferior;

        elementos.superior.style.width = String(tubo.ancho) + "px";
        elementos.superior.style.height = String(altoSuperior) + "px";
        elementos.superior.style.transform =
          "translate3d(" + tubo.x + "px, 0, 0)";

        elementos.inferior.style.width = String(tubo.ancho) + "px";
        elementos.inferior.style.height = String(altoInferior) + "px";
        elementos.inferior.style.transform =
          "translate3d(" + tubo.x + "px, " + yInferior + "px, 0)";
      }
    }

    function dibujarObjetos() {
      const activos = new Set(juego.objetos.map((objeto) => objeto.id));

      for (const [id, elemento] of elementosObjetos) {
        if (!activos.has(id)) {
          elemento.remove();
          elementosObjetos.delete(id);
        }
      }

      for (const objeto of juego.objetos) {
        let elemento = elementosObjetos.get(objeto.id);

        if (!elemento) {
          elemento = document.createElement("div");
          elemento.className = "objeto objeto--" + objeto.tipo;
          area.append(elemento);
          elementosObjetos.set(objeto.id, elemento);
        }

        elemento.style.width = String(objeto.ancho) + "px";
        elemento.style.height = String(objeto.alto) + "px";
        elemento.style.transform =
          "translate3d(" + objeto.x + "px, " + objeto.y + "px, 0)";
      }
    }

    function dibujar() {
      if (elementoPajaro) {
        elementoPajaro.style.transform =
          "translate3d(" + juego.pajaro.x + "px, " + juego.pajaro.y + "px, 0)";
      }

      if (elementoPuntaje) {
        elementoPuntaje.textContent = "Puntaje: " + juego.puntaje;
      }

      if (elementoMensaje) {
        if (juego.estado === "terminado") {
          elementoMensaje.textContent =
            juego.resultado === "victoria" ? "¡Ganaste!" : "Fin del juego";
        } else if (juego.estado === "listo") {
          elementoMensaje.textContent = "Espacio o clic para empezar";
        } else {
          elementoMensaje.textContent = "";
        }
      }

      dibujarParallax();
      dibujarTubos();
      dibujarObjetos();
    }

    function emitirFinal(resultado, motivo) {
      if (juego.estado !== "jugando") return;
      juego.estado = "terminado";
      juego.resultado = resultado;

      if (resultado === "derrota") {
        animarPajaro("pajaro--choque");
      }

      if (typeof area.dispatchEvent === "function") {
        area.dispatchEvent(new CustomEvent("juego:" + resultado, {
          detail: { motivo: motivo, puntaje: juego.puntaje },
        }));
      }
    }

    function aplicarImpulso() {
      if (juego.estado === "terminado") return;
      if (juego.estado === "listo") iniciarJuego();

      juego.pajaro.velocidadY = -CONFIG.impulso;
      animarPajaro("pajaro--aleteo");
      dibujar();
    }

    function iniciarJuego() {
      if (juego.estado !== "listo") return;
      juego.estado = "jugando";
      tiempoAnterior = null;
      idFrame = requestAnimationFrame(ciclo);
      dibujar();
    }

    function crearObjeto(tipo, x, y) {
      juego.objetos.push({
        id: idSiguienteObjeto++,
        tipo: tipo,
        x: x,
        y: y,
        ancho: CONFIG.tamanoObjeto,
        alto: CONFIG.tamanoObjeto,
      });
    }

    function crearTubo() {
      const altoHueco = Math.max(
        CONFIG.huecoMinimo,
        CONFIG.huecoInicial - juego.tiempo * CONFIG.reduccionHuecoPorSegundo
      );
      const centroMinimo = CONFIG.margenVertical + altoHueco / 2;
      const centroMaximo = CONFIG.alto - CONFIG.margenVertical - altoHueco / 2;
      const centroHueco =
        centroMinimo + Math.random() * (centroMaximo - centroMinimo);

      const tubo = {
        id: idSiguienteTubo++,
        x: CONFIG.ancho,
        ancho: CONFIG.anchoTubo,
        centroHueco: centroHueco,
        altoHueco: altoHueco,
        puntuado: false,
      };
      juego.tubos.push(tubo);

      crearObjeto(
        tipoSiguienteObjeto,
        tubo.x + tubo.ancho / 2 - CONFIG.tamanoObjeto / 2,
        centroHueco - CONFIG.tamanoObjeto / 2
      );
      tipoSiguienteObjeto =
        tipoSiguienteObjeto === "moneda" ? "murcielago" : "moneda";
    }

    function velocidadActual() {
      const turboActivo = juego.tiempo < juego.efectos.turboHasta;
      return CONFIG.velocidadTubos *
        (turboActivo ? CONFIG.multiplicadorTurbo : 1);
    }

    function actualizarTubos(dt, velocidad) {
      distanciaAlProximoTubo -= velocidad * dt;

      if (distanciaAlProximoTubo <= 0) {
        crearTubo();
        distanciaAlProximoTubo =
          CONFIG.distanciaTuboMin +
          Math.random() * (CONFIG.distanciaTuboMax - CONFIG.distanciaTuboMin);
      }

      for (const tubo of juego.tubos) {
        tubo.x -= velocidad * dt;
      }
      juego.tubos = juego.tubos.filter(
        (tubo) => tubo.x + tubo.ancho > 0
      );
    }

    function actualizarObjetos(dt, velocidad) {
      for (const objeto of juego.objetos) {
        objeto.x -= velocidad * dt;
      }
      juego.objetos = juego.objetos.filter(
        (objeto) => objeto.x + objeto.ancho > 0
      );
    }

    function hitboxPajaro() {
      const margenX = juego.pajaro.ancho * CONFIG.margenHitbox;
      const margenY = juego.pajaro.alto * CONFIG.margenHitbox;
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

    function hitboxesTubo(tubo) {
      const altoSuperior = tubo.centroHueco - tubo.altoHueco / 2;
      const yInferior = tubo.centroHueco + tubo.altoHueco / 2;
      return [
        { x: tubo.x, y: 0, ancho: tubo.ancho, alto: altoSuperior },
        {
          x: tubo.x,
          y: yInferior,
          ancho: tubo.ancho,
          alto: CONFIG.alto - yInferior,
        },
      ];
    }

    function verificarColisiones() {
      const pajaro = hitboxPajaro();
      for (const tubo of juego.tubos) {
        const partes = hitboxesTubo(tubo);
        if (partes.some((parte) => seSuperponen(pajaro, parte))) {
          emitirFinal("derrota", "tubo");
          return;
        }
      }
    }

    function recogerObjetos() {
      const pajaro = hitboxPajaro();
      const restantes = [];

      for (const objeto of juego.objetos) {
        if (!seSuperponen(pajaro, objeto)) {
          restantes.push(objeto);
          continue;
        }

        if (objeto.tipo === "moneda") {
          juego.puntaje += 5;
          if (typeof area.dispatchEvent === "function") {
            area.dispatchEvent(new CustomEvent("juego:moneda", {
              detail: { puntaje: juego.puntaje },
            }));
          }
        } else if (objeto.tipo === "murcielago") {
          juego.efectos.turboHasta = juego.tiempo + CONFIG.duracionTurbo;
          animarPajaro("pajaro--turbo");
          if (typeof area.dispatchEvent === "function") {
            area.dispatchEvent(new CustomEvent("juego:turbo", {
              detail: { duracion: CONFIG.duracionTurbo },
            }));
          }
        }
      }

      juego.objetos = restantes;
    }

    function actualizarPuntaje() {
      for (const tubo of juego.tubos) {
        const pasoAlPajaro = tubo.x + tubo.ancho < juego.pajaro.x;
        if (tubo.puntuado || !pasoAlPajaro) continue;

        tubo.puntuado = true;
        juego.puntaje += 1;

        if (juego.puntaje >= CONFIG.puntajeParaGanar) {
          emitirFinal("victoria", "puntaje");
          return;
        }
      }
    }

    function actualizar(dt) {
      juego.tiempo += dt;
      const velocidad = velocidadActual();
      juego.distanciaMundo += velocidad * dt;

      juego.pajaro.velocidadY += CONFIG.gravedad * dt;
      juego.pajaro.y += juego.pajaro.velocidadY * dt;

      if (
        juego.pajaro.y < 0 ||
        juego.pajaro.y + juego.pajaro.alto > CONFIG.alto
      ) {
        emitirFinal("derrota", "borde");
        return;
      }

      actualizarTubos(dt, velocidad);
      actualizarObjetos(dt, velocidad);
      verificarColisiones();
      if (juego.estado !== "jugando") return;

      recogerObjetos();
      actualizarPuntaje();
    }

    function ciclo(tiempoActual) {
      idFrame = null;
      if (juego.estado !== "jugando") return;

      const dtCrudo = tiempoAnterior === null
        ? 0
        : (tiempoActual - tiempoAnterior) / 1000;
      const dt = Math.min(dtCrudo, CONFIG.maxDt);
      tiempoAnterior = tiempoActual;

      actualizar(dt);
      dibujar();

      if (juego.estado === "jugando") {
        idFrame = requestAnimationFrame(ciclo);
      }
    }

    function reiniciarJuego() {
      if (idFrame !== null) cancelAnimationFrame(idFrame);
      idFrame = null;
      tiempoAnterior = null;
      juego = crearEstadoInicial();
      idSiguienteTubo = 1;
      idSiguienteObjeto = 1;
      tipoSiguienteObjeto = "moneda";
      distanciaAlProximoTubo = CONFIG.distanciaPrimerTubo;
      dibujar();
    }

    function manejarTeclado(evento) {
      if (evento.code !== "Space" || evento.repeat) return;
      evento.preventDefault();
      aplicarImpulso();
    }

    area.addEventListener("pointerdown", aplicarImpulso);
    window.addEventListener("keydown", manejarTeclado);
    if (botonReiniciar) botonReiniciar.addEventListener("click", reiniciarJuego);
    if (botonIniciar) botonIniciar.addEventListener("click", aplicarImpulso);

    dibujar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();
