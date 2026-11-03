import { Controlador } from "./controlador/Controlador.js";
import { PanelVista } from "./vista/PanelVista.js";

// Obtenemos el canvas del HTML.
const canvas = document.querySelector("#canvas");

// Lista de imágenes a cargar: nombre -> ruta (relativa al index.html).
const RUTAS = {
    tablero: "img/tablero.png",
    homero: "img/homero.svg",
    marge: "img/marge.svg",
    lisa: "img/lisa.svg",
    bart: "img/bart.svg"
};

// Carga una imagen y devuelve una promesa que se cumple cuando terminó de cargar.
function cargarImagen(ruta) {
    return new Promise((resolver, rechazar) => {
        const img = new Image();
        img.onload = () => resolver(img);
        img.onerror = () => rechazar(`Error al cargar la imagen: ${ruta}`);
        img.src = ruta;
    });
}

// Carga todas las imágenes de RUTAS y devuelve un objeto { nombre: imagen }.
async function cargarImagenes() {
    const nombres = Object.keys(RUTAS);

    const promesas = nombres.map((nombre) => {
        const ruta = RUTAS[nombre];
        return cargarImagen(ruta);
    });
    const listaImg=await Promise.all(promesas);

    const imagenes = {};
    nombres.forEach((nombre, i) => {
        imagenes[nombre] = listaImg[i];
    });
    return imagenes;
}

// Inicia el juego cargando las imágenes y creando el controlador.
async function iniciar() {

    try {
        const imagenes = await cargarImagenes();

        // Verificación temporal: tienen que aparecer las 5 imágenes.
        console.log("Imágenes cargadas:", imagenes);

        const controlador = new Controlador(canvas, imagenes);

        const panelVista = new PanelVista();

        setInterval(() => {
            panelVista.actualizar({
                reloj: controlador.formatearTiempo(),
                movimientos: controlador.cantidadMovimientos,
                mensaje: controlador.mensaje
            });
        }, 100);

        document.querySelectorAll('input[name="ficha"]').forEach(input => {
            input.addEventListener("change", (e) => {
                const personaje = e.target.value;
                controlador.cambiarPersonaje(personaje);
            });
        });

        document.querySelector("#btn-reiniciar").addEventListener("click", () => {
            controlador.reiniciar();
        });

    } catch (error) {
        // Si alguna imagen falla, lo mostramos y no arrancamos el juego a medias.
        console.error("No se pudo iniciar el juego:", error);
    }
}

iniciar();
