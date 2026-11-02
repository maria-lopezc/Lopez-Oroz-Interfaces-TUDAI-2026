import { Tablero } from "../modelo/Tablero.js";
import { TableroVista } from "../vista/TableroVista.js";

export class Controlador {

    // Constructor: inicializa el modelo, la vista y los eventos del mouse.
    constructor(canvas, imagenes = null) {

        this.tablero = new Tablero();
        this.vista = new TableroVista(canvas, this.tablero, imagenes);

        this.arrastre = null;
        this.mensaje = null;
        // Información necesaria para la animación de los hints.
        this.inicio = null;
        this.raf = null;
        // Estado y tiempo de la partida.
        this.tiempoInicio = null;
        this.tiempoTranscurrido = 0;
        this.temporizador = null;
        this.juegoTerminado = false;
        this.cantidadMovimientos = 0;

        // Funciones que responden a los eventos del mouse.
        this.alBajar = e => this.onMouseDown(e);
        this.alMover = e => this.onMouseMove(e);
        this.alSoltar = e => this.onMouseUp(e);

        // Registramos los eventos del mouse.
        canvas.addEventListener("mousedown", this.alBajar);
        window.addEventListener("mousemove", this.alMover);
        window.addEventListener("mouseup", this.alSoltar);

        this.redibujar();
    }


    // Detecta la ficha seleccionada y calcula sus destinos posibles.
    onMouseDown(e) {

        const p = this.vista.posicionMouse(e);

        const { fila, col } = this.vista.aCelda(p.x, p.y);

        const ficha = this.tablero.obtenerFicha(fila, col);

        if (!ficha) return;

        const centro = this.vista.aPixeles(ficha.fila, ficha.col);

        this.arrastre = {
            ficha,
            x: p.x,
            y: p.y,
            offsetX: p.x - centro.x,
            offsetY: p.y - centro.y,

            // Obtenemos los destinos válidos de la ficha seleccionada.
            destinos: this.tablero.obtenerMovimientosPosibles(ficha)
        };

        // Guardamos el instante inicial de la animación.
        this.inicio = performance.now();

        this.redibujar();

        // Iniciamos la animación de los hints.
        this.loop(this.inicio);
    }


    // Actualiza la posición de la ficha mientras se arrastra.
    onMouseMove(e) {

        if (!this.arrastre) return;

        const p = this.vista.posicionMouse(e);

        this.arrastre.x = p.x;
        this.arrastre.y = p.y;
    }


    // Finaliza el arrastre e intenta realizar el movimiento.
    onMouseUp() {

        if (!this.arrastre) return;

        const { ficha, x, y, offsetX, offsetY } = this.arrastre;

        const { fila, col } = this.vista.aCelda(
            x - offsetX,
            y - offsetY
        );

        // Intentamos realizar el movimiento.
        const movimientoRealizado = this.tablero.realizarMovimiento(
            ficha,
            fila,
            col
        );

        // Si el movimiento fue válido, actualizamos la partida.
        if (movimientoRealizado) {

            this.cantidadMovimientos++;

            // El reloj comienza con el primer movimiento válido.
            this.iniciarReloj();
        }

        this.arrastre = null;

        if (this.raf !== null) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }

        this.verificarFin();
        this.redibujar();
    }




    // Comprueba si el jugador ganó o si no quedan movimientos posibles.
    verificarFin() {

        if (this.tablero.gano()) {

            this.mensaje = "¡Ganaste!";
            this.juegoTerminado = true;

        } else if (!this.tablero.hayMovimientosPosibles()) {

            this.mensaje = "No hay más movimientos";
            this.juegoTerminado = true;

        } else {

            this.mensaje = null;
        }

        // Si terminó la partida, detenemos el reloj.
        if (this.juegoTerminado) {
            this.detenerReloj();
        }

        return this.mensaje;
    }


    // Inicia el reloj cuando se realiza el primer movimiento válido.
    iniciarReloj() {

        if (this.temporizador !== null) return;

        this.tiempoInicio = Date.now();

        this.temporizador = setInterval(() => {

            this.tiempoTranscurrido = Math.floor(
                (Date.now() - this.tiempoInicio) / 1000
            );

            this.redibujar();

        }, 1000);
    }

    // Devuelve el tiempo transcurrido en segundos.
    obtenerTiempo() {

        if (this.tiempoInicio === null) {
            return this.tiempoTranscurrido;
        }

        return Math.floor(
            (Date.now() - this.tiempoInicio) / 1000
        );
    }

    // Convierte los segundos a formato minutos:segundos.
    formatearTiempo() {

        const tiempo = this.obtenerTiempo();

        const minutos = Math.floor(tiempo / 60);
        const segundos = tiempo % 60;

        return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    }

    // Detiene el reloj cuando finaliza la partida.
    detenerReloj() {

        if (this.temporizador !== null) {
            clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }


    
    // Actualiza continuamente la animación mientras se arrastra una ficha.
    loop(ahora) {

        if (!this.arrastre) {
            this.raf = null;
            return;
        }

        const tiempo = (ahora - this.inicio) / 1000;

        this.vista.dibujar({
            arrastre: this.arrastre,
            mensaje: this.mensaje,
            tiempo: tiempo,
            reloj: this.formatearTiempo(),
            movimientos: this.cantidadMovimientos
        });

        // Solicitamos el siguiente cuadro de animación.
        this.raf = requestAnimationFrame(
            ahora => this.loop(ahora)
        );
    }


    // Reinicia la partida y vuelve a la configuración inicial.
    reiniciar() {

        // Detenemos el reloj.
        this.detenerReloj();

        // Cancelamos cualquier animación pendiente.
        if (this.raf !== null) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }

        // Reiniciamos el modelo.
        this.tablero.reiniciar();

        // Restablecemos el estado del controlador.
        this.arrastre = null;
        this.mensaje = null;
        this.inicio = null;
        this.tiempoInicio = null;
        this.tiempoTranscurrido = 0;
        this.cantidadMovimientos = 0;
        this.juegoTerminado = false;

        this.redibujar();
    }

    // Solicita a la vista que dibuje el estado actual del juego.
    redibujar() {

        this.vista.dibujar({
            arrastre: this.arrastre,
            mensaje: this.mensaje,
            tiempo: this.obtenerTiempo(),
            reloj: this.formatearTiempo(),
            movimientos: this.cantidadMovimientos
        });
    }

}
