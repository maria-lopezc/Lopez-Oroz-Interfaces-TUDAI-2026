// Actualiza los elementos HTML con el estado de la partida.
export class PanelVista {

    // Busca los elementos del panel en el HTML.
    constructor() {
        this.tiempo = document.querySelector("#tiempo");
        this.movimientos = document.querySelector("#movimientos");
        this.mensaje = document.querySelector("#mensaje");
    }

    // Escribe el tiempo, los movimientos y el mensaje en el panel.
    actualizar({ reloj, movimientos, mensaje, tipo }) {
        this.tiempo.innerHTML = reloj;
        this.movimientos.innerHTML = movimientos;
        if (mensaje) {
            if (tipo) this.mensaje.dataset.tipo = tipo;
            this.mensaje.innerHTML = mensaje;
            this.mensaje.classList.remove("hidden");
        } else {
            this.mensaje.classList.add("hidden");
        }
    }
}