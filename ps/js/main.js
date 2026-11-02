import { Controlador } from "./controlador/Controlador.js";

// Obtenemos el canvas del HTML.
const canvas = document.querySelector("#canvas");

// Creamos el controlador e inicializamos el juego.
const controlador = new Controlador(canvas);

// Mostramos el tablero en la consola para verificar su estado.
console.log("Juego inicializado correctamente");
console.log("Cantidad de fichas:", controlador.tablero.fichas.length);
console.log("Movimientos disponibles:", controlador.tablero.hayMovimientosPosibles());
