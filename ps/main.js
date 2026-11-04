import { Controlador } from "./controlador/Controlador.js";
import { PanelVista } from "./vista/PanelVista.js";

// Obtenemos el canvas del HTML.
const canvas = document.querySelector("#canvas");
const menu=document.querySelector("#inicio");
const juego=document.querySelector("#juego");

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

//Mostrar el menu de inicio y ocultar el juego
function mostrarMenu() {
    menu.classList.remove("hidden");
    juego.classList.add("hidden");
}

//Mostrar el juego y ocultar el menu de inicio
function mostrarJuego() {
    menu.classList.add("hidden");
    juego.classList.remove("hidden");
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

        const controlador = new Controlador(canvas, imagenes);

        const panelVista = new PanelVista();

        document.querySelector("#btn-jugar").addEventListener("click", () => {
            const personajeSelect = document.querySelector('input[name="ficha"]:checked');
            controlador.cambiarPersonaje(personajeSelect.value);
            document.querySelector("#ficha-elegida").src = RUTAS[personajeSelect.value];
            
            //Si el checkbox de demo está marcado, activamos el modo testeo
            const demoCheckbox = document.querySelector("#demo");
            if (demoCheckbox.checked) {
                controlador.cambiarModo("demo");
            }else{
                controlador.cambiarModo("normal");
            }
            mostrarJuego();
        });

        document.querySelector("#btn-menu").addEventListener("click", () => {
            controlador.reiniciar();
            mostrarMenu();
        });

        setInterval(() => {
            panelVista.actualizar({
                reloj: controlador.formatearTiempo(),
                movimientos: controlador.cantidadMovimientos,
                mensaje: controlador.mensaje,
                tipo: controlador.tipoMensaje
            });
        }, 100);

        document.querySelector("#btn-reiniciar").addEventListener("click", () => {
            controlador.reiniciar();
        });

    } catch (error) {
        // Si alguna imagen falla, lo mostramos y no arrancamos el juego a medias.
        console.error("No se pudo iniciar el juego:", error);
    }
}

iniciar();
