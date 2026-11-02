export class TableroVista {

    // Constructor: recibe el canvas y el tablero que debe representar.
    constructor(canvas, tablero, imagenes = null) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.tablero = tablero;
        this.imagenes = imagenes;

        // Configuración de las dimensiones del tablero.
        this.tamCelda = 65;
        this.offsetX = 80;
        this.offsetY = 80;

        // Radio de las fichas.
        this.radioFicha = 22;
    }

    // Traduce la posición del mouse a coordenadas internas del canvas.
    posicionMouse(e) {

        const rect = this.canvas.getBoundingClientRect();

        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    // Traduce coordenadas del canvas a fila y columna del tablero.
    aCelda(x, y) {

        return {
            fila: Math.floor((y - this.offsetY) / this.tamCelda),
            col: Math.floor((x - this.offsetX) / this.tamCelda)
        };
    }

    // Traduce fila y columna a coordenadas de píxeles.
    aPixeles(fila, col) {

        return {
            x: this.offsetX + col * this.tamCelda + this.tamCelda / 2,
            y: this.offsetY + fila * this.tamCelda + this.tamCelda / 2
        };
    }

    // Dibuja el tablero, sus posiciones y las fichas.
    dibujar(estado = {}) {

        const ctx = this.ctx;
        const {
            arrastre,
            mensaje,
            tiempo = 0,
            reloj = "00:00",
            movimientos = 0
        } = estado;

        // Limpiamos el canvas.
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujamos el fondo.
        ctx.fillStyle = "#202735";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujamos las posiciones válidas del tablero.
        for (let fila = 0; fila < 7; fila++) {
            for (let col = 0; col < 7; col++) {

                if (!this.tablero.esCeldaValida(fila, col)) {
                    continue;
                }

                const { x, y } = this.aPixeles(fila, col);

                ctx.beginPath();
                ctx.arc(x, y, this.radioFicha + 5, 0, Math.PI * 2);
                ctx.fillStyle = "#48566D";
                ctx.fill();
            }
        }

        // Dibujamos los destinos posibles de la ficha seleccionada.
        if (arrastre && arrastre.destinos) {
            this.dibujarHints(arrastre.destinos, tiempo);
        }

        // Dibujamos las fichas que están en el tablero.
        for (const ficha of this.tablero.fichas) {

            // No dibujamos la ficha en su posición original si está siendo arrastrada.
            if (arrastre && arrastre.ficha === ficha) {
                continue;
            }

            const { x, y } = this.aPixeles(ficha.fila, ficha.col);

            this.dibujarFicha(x, y, ficha.tipo);
        }

        // Dibujamos la ficha que se está arrastrando.
        if (arrastre) {

            this.dibujarFicha(
                arrastre.x - arrastre.offsetX,
                arrastre.y - arrastre.offsetY,
                arrastre.ficha.tipo
            );
        }

        // Mostramos el mensaje del juego.
        if (mensaje) {

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(mensaje, this.canvas.width / 2, 40);
        }
        // Dibujamos el reloj y la cantidad de movimientos.
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "left";

        ctx.fillText("Tiempo: " + reloj, 20, 35);
        ctx.fillText("Movimientos: " + movimientos, 20, 65);
    }

    // Dibuja una ficha circular en el canvas.
    dibujarFicha(x, y, tipo) {

        const ctx = this.ctx;

        ctx.beginPath();
        ctx.arc(x, y, this.radioFicha, 0, Math.PI * 2);

        ctx.fillStyle = tipo === "roja" ? "#E45B5B" : "#3978D6";
        ctx.fill();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
    }


    // Dibuja los destinos posibles con una animación de pulsación.
    dibujarHints(destinos, tiempo) {

        const ctx = this.ctx;

        // Generamos una pulsación utilizando Math.sin().
        const pulso = (Math.sin(tiempo * 5) + 1) / 2;

        for (const destino of destinos) {

            const { x, y } = this.aPixeles(
                destino.fila,
                destino.col
            );

            // Dibujamos un círculo que cambia de tamaño y transparencia.
            ctx.beginPath();

            ctx.strokeStyle = `rgba(255, 210, 63, ${0.5 + pulso * 0.5})`;
            ctx.lineWidth = 3 + pulso * 2;

            ctx.arc(
                x,
                y,
                this.radioFicha + 7 + pulso * 5,
                0,
                Math.PI * 2
            );

            ctx.stroke();

            // Dibujamos un pequeño círculo en el destino.
            ctx.beginPath();

            ctx.fillStyle = `rgba(255, 210, 63, ${0.15 + pulso * 0.2})`;

            ctx.arc(
                x,
                y,
                this.radioFicha - 3,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    }


}
