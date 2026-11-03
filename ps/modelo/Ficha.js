export class Ficha {

    // Constructor: inicializa una ficha con su posición y tipo.
    constructor(fila, col, tipo = "azul") {
        this.fila = fila;
        this.col = col;
        this.tipo = tipo;
    }

    // Actualiza la posición de la ficha dentro del tablero.
    moverA(fila, col) {
        this.fila = fila;
        this.col = col;
    }

}
