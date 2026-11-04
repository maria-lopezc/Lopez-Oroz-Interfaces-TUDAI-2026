
import { Ficha } from "./Ficha.js";

export class Tablero {

    // Constructor: inicializa el tablero y sus fichas.
    constructor() {
        this.fichas = [];
        this.inicializar();
    }

    // Inicializa las 33 posiciones válidas del tablero,
    // dejando vacía la posición central.
    inicializar(posiciones = null) {
        //Si hay posiciones (modo demo)
        if(posiciones) {
            this.fichas = posiciones.map(pos => new Ficha(pos.fila, pos.col));
            return;
        }

        this.fichas = [];

        for (let fila = 0; fila < 7; fila++) {
            for (let col = 0; col < 7; col++) {

                if (!this.esCeldaValida(fila, col)) {
                    continue;
                }

                if (fila === 3 && col === 3) {
                    continue;
                }

                this.fichas.push(new Ficha(fila, col));
            }
        }
    }

    // Comprueba si una posición pertenece al tablero.
    esCeldaValida(fila, col) {

        if (fila < 0 || fila >= 7 || col < 0 || col >= 7) {
            return false;
        }

        return (
            (fila >= 2 && fila <= 4) ||
            (col >= 2 && col <= 4)
        );
    }

    // Busca y devuelve la ficha ubicada en una posición.
    // Si no existe una ficha, devuelve undefined.
    obtenerFicha(fila, col) {

        return this.fichas.find(
            ficha => ficha.fila === fila && ficha.col === col
        );
    }

    // Elimina una ficha del arreglo del tablero.
    eliminarFicha(ficha) {

        const indice = this.fichas.indexOf(ficha);

        if (indice !== -1) {
            this.fichas.splice(indice, 1);
        }
    }

    // Obtiene todos los destinos posibles para una ficha.
    obtenerMovimientosPosibles(ficha) {

        const direcciones = [
            { df: -2, dc: 0 },
            { df: 2, dc: 0 },
            { df: 0, dc: -2 },
            { df: 0, dc: 2 }
        ];

        const movimientos = [];

        for (const dir of direcciones) {

            const fila = ficha.fila + dir.df;
            const col = ficha.col + dir.dc;

            if (this.esMovimientoValido(ficha, fila, col)) {
                movimientos.push({ fila, col });
            }
        }

        return movimientos;
    }

    // Comprueba si una ficha puede saltar hacia una posición destino.
    esMovimientoValido(ficha, filaDestino, colDestino) {

        if (!this.esCeldaValida(filaDestino, colDestino)) {
            return false;
        }

        if (this.obtenerFicha(filaDestino, colDestino)) {
            return false;
        }

        const deltaF = filaDestino - ficha.fila;
        const deltaC = colDestino - ficha.col;

        const esSaltoRecto =
            (Math.abs(deltaF) === 2 && deltaC === 0) ||
            (Math.abs(deltaC) === 2 && deltaF === 0);

        if (!esSaltoRecto) {
            return false;
        }

        const enElMedio = this.obtenerFicha(
            ficha.fila + deltaF / 2,
            ficha.col + deltaC / 2
        );

        return enElMedio !== undefined;
    }

    // Realiza un movimiento válido y elimina la ficha saltada.
    realizarMovimiento(ficha, filaDestino, colDestino) {

        if (!this.esMovimientoValido(ficha, filaDestino, colDestino)) {
            return false;
        }

        const saltada = this.obtenerFicha(
            (ficha.fila + filaDestino) / 2,
            (ficha.col + colDestino) / 2
        );

        this.eliminarFicha(saltada);
        ficha.moverA(filaDestino, colDestino);

        return true;
    }

    // Comprueba si existe al menos un movimiento posible.
    hayMovimientosPosibles() {

        return this.fichas.some(
            ficha => this.obtenerMovimientosPosibles(ficha).length > 0
        );
    }

    // Comprueba si hay juego perfecto
    ganoEnElCentro() {
        return this.gano() && this.fichas[0].fila === 3 && this.fichas[0].col === 3;
    }

    // Comprueba si el jugador ganó dejando una sola ficha.
    gano() {
        return this.fichas.length === 1;
    }

    // Reinicia el tablero a su configuración inicial.
    reiniciar(posiciones = null) {
        this.inicializar(posiciones);
    }

}
