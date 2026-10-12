import Ficha from "./ficha.js";

//Cargar y guardar records al recargar la página
const CLAVE_RECORDS = "blocka_records";
let records = cargarRecords();

function cargarRecords() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_RECORDS)) || {};
    } catch {
        return {};
    }
}

function guardarRecords() {
    try {
        localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records));
    } catch {}
}

function claveRecord(nivel) {
    return `${dificultadActual}-${nivel}`;     // ej: "medio-2"
}

function actualizarRecord(nivel, tiempo) {
    const clave = claveRecord(nivel);
    const anterior = records[clave];

    const esRecord = anterior === undefined || tiempo < anterior;

    if (esRecord) {
        records[clave] = tiempo;
        guardarRecords();
    }
    return esRecord;
}

const menu = document.getElementById("menu");
const canvas=document.getElementById("canva");
const btnComenzar = document.getElementById("btnComenzar");
const finNivel = document.getElementById("finNivel");
const msj = document.getElementById("mensajeFin");
const btnSig = document.getElementById("btnSiguiente");
const btnMenu = document.getElementById("btnMenu");
const tiempoEl = document.getElementById("tiempo");
const recordEl = document.getElementById("recordFin");
const btnAyuda = document.getElementById("btnAyuda");
let inicioNivel = 0;
let idTimer = null;
let ayuda=true;

let clickeable=true;

let nivelActual = 1; 

const filtrosPorNivel = {
    1: "brillo",  
    2: "grises",   
    3: "negativo"  
};

// cargar imagen
let dif=document.getElementById("dif")

let ctx=canvas.getContext("2d");
let width=500;
let height=500;

canvas.width = width;  
canvas.height = height;

let filtroActual = "ninguno";
const img= new Image();
const fichas=[];

const bancoImagenes = [
    'img/japon.svg',
    'img/juego.svg',
    'img/montania.svg',
    'img/noria.svg',
    'img/rio.svg',
    'img/ruina.svg'
];
let imgUsadas=[];

let dificultadActual = "facil";
let columnas = 2;
let filas = 2;
let anchoFicha;
let altoFicha;

btnComenzar.addEventListener("click", function() {
    menu.classList.add("oculto");
    canvas.classList.remove("oculto");
    tiempoEl.classList.remove("oculto");
    btnAyuda.classList.remove("oculto");
    btnAyuda.disabled = false
    imgUsadas=[];
    ayuda=true;
    aplicarDificultad();
    iniciarNivel();
});

btnMenu.addEventListener("click", function() {
    nivelActual=1;
    menu.classList.remove("oculto");
    canvas.classList.add("oculto");
    tiempoEl.classList.add("oculto");
    finNivel.classList.add("oculto");
});

btnSig.addEventListener("click", function() {
    nivelActual++;
    ayuda=true;
    iniciarNivel();
});

btnAyuda.addEventListener("click",function(){
    ayuda=false;
    btnAyuda.disabled = true;
    inicioNivel -= 5000;
    actualizarTiempo();
    const resolver=fichas.filter(ficha => Math.abs(ficha.ang) > 0.01);
    if(resolver != undefined || array.length != 0){
        resolver[0].ang = 0;
        resolver[0].fijar();
        dibujarJuego();
        verificarVictoria();
    }
}
)

//Bloquear el menú desplegable del botón derecho en el Canvas
canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault(); 
});

//Controlar la rotación con los botones del mouse
canvas.addEventListener('mousedown', function(event) {
    if (clickeable){
        // Obtener las coordenadas del clic relativas al Canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Recorrer las fichas para ver cuál recibió el clic
        fichas.forEach(ficha => {
            const clicEnX = mouseX >= ficha.x && mouseX <= (ficha.x + ficha.w);
            const clicEnY = mouseY >= ficha.y && mouseY <= (ficha.y + ficha.h);

            if ((clicEnX && clicEnY)&&!ficha.fija) {

                
                // --- DETECCIÓN DE BOTONES ---
                if (event.button === 0) {
                    // BOTÓN IZQUIERDO: Gira hacia la izquierda (sentido antihorario -> restamos 90°)
                    ficha.ang -= Math.PI / 2;
                } 
                else if (event.button === 2) {
                    // BOTÓN DERECHO: Gira hacia la derecha (sentido horario -> sumamos 90°)
                    ficha.ang += Math.PI / 2;
                }

                //Limite 2pi
                ficha.ang = ficha.ang % (Math.PI * 2);

                //Angulo negativo pasa a su contraparte positiva
                if (ficha.ang < 0) {
                    ficha.ang += Math.PI * 2;
                }
                
                //Elimina errores de redondeo
                if (Math.abs(ficha.ang) < 0.01 || Math.abs(ficha.ang - Math.PI * 2) < 0.01) {
                    ficha.ang = 0;
                }

                dibujarJuego();
                verificarVictoria();
            }
        });
    }
    
});

function aplicarDificultad() {
    dificultadActual = dif.value;
    if (dificultadActual === "facil") {
        columnas = 2; filas = 2;
    } else if (dificultadActual === "medio") {
        columnas = 3; filas = 3;
    } else {
        columnas = 4; filas = 4;
    }
}

function iniciarNivel() {
    finNivel.classList.add("oculto");
    tiempoEl.textContent = "Tiempo: 00:00";
    btnAyuda.classList.remove("oculto");
    btnAyuda.disabled = false
    const usables = bancoImagenes.filter(ruta => !imgUsadas.includes(ruta))
    const indice = Math.floor(Math.random() * usables.length);
    img.onload = function () {
        iniciarTablero();
        dibujarJuego();
        clickeable=true;
        iniciarTemporizador();
    };

    img.src = usables[indice]; 
    imgUsadas.push(usables[indice]);
}

function verificarVictoria() {
    const juegoCompletado = fichas.every(ficha => Math.abs(ficha.ang) < 0.01);

    if (juegoCompletado) {
        clickeable=false;

        detenerTemporizador();  
        actualizarTiempo()
        const tiempoFinal = tiempoTranscurrido();
        const esRecord = actualizarRecord(nivelActual, tiempoFinal);
        const mejor = records[claveRecord(nivelActual)];
        recordEl.textContent =
            `Tu tiempo: ${formatearTiempo(tiempoFinal)} · Récord: ${formatearTiempo(mejor)}` +
            (esRecord ? " · ¡Nuevo récord!" : "");

        filtroActual = "ninguno";
        dibujarJuego();
        btnAyuda.classList.add("oculto");
        if (nivelActual < 3) {
            msj.innerText = `¡Nivel ${nivelActual} completado! Prepárate para el siguiente nivel...`;
            btnSig.classList.remove("oculto");
        } else {
            msj.innerText = `¡Felicidades! Has completado todos los niveles 🎉`;
            btnSig.classList.add("oculto");
        }
        finNivel.classList.remove("oculto");
    }
}

function iniciarTablero(){
    fichas.length=0;

    filtroActual = filtrosPorNivel[nivelActual];

    anchoFicha = width / columnas; 
    altoFicha = height / filas;

    for (let f = 0; f < filas; f++) {
        for (let c = 0; c < columnas; c++) {
            // Calculamos la posición multiplicando la columna/fila por el tamaño
            let posX = c * anchoFicha;
            let posY = f * altoFicha;
            
            // Ángulo inicial aleatorio 
            const angulosPosibles = [Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
            let anguloAleatorio = angulosPosibles[Math.floor(Math.random() * angulosPosibles.length)];

            let nuevaFicha = new Ficha(posX, posY, anchoFicha, altoFicha, anguloAleatorio);
            
            fichas.push(nuevaFicha);
        }
    }
}

function dibujarJuego() {
    cleanImg();
    fichas.forEach(ficha => {
        ctx.save();
        let centroX = ficha.x + ficha.w / 2;
        let centroY = ficha.y + ficha.h / 2;

        ctx.translate(centroX, centroY); 
        ctx.rotate(ficha.ang);           

        ctx.drawImage(
            img, 
            ficha.x, ficha.y, ficha.w, ficha.h,   // RECORTE: Usamos x e y de la foto original
            -ficha.w / 2, -ficha.h / 2, ficha.w, ficha.h // PANTALLA: Centrado en el nuevo origen
        );

        ctx.restore();

        if (filtroActual !== "ninguno") {
            let imgDataFicha = ctx.getImageData(ficha.x, ficha.y, ficha.w, ficha.h);
            let imgDataFiltrada = aplicarFiltroAImageData(imgDataFicha, filtroActual);
            ctx.putImageData(imgDataFiltrada, ficha.x, ficha.y);
        }
    });
}

//Limpiar el canvas
function cleanImg(){
    let r=255;
    let g=255;
    let b=255;
    let a=255;

    let imageData = ctx.createImageData(width, height);
    drawRect(imageData, r, g , b, a);
    ctx.putImageData(imageData, 0, 0)
}

function drawRect(imageData, r, g, b, a){
    for(let x=0; x < width; x++){
        for (let y=0; y < height; y++){
            setPixel(imageData, x, y, r, g, b, a);
        }
    }
}

function setPixel(imageData, x, y, r, g, b, a){
    let index=(x + y * imageData.width)*4;
    imageData.data[index+0]=r;
    imageData.data[index+1]=g;
    imageData.data[index+2]=b;
    imageData.data[index+3]=a;
}

function aplicarFiltroAImageData(imageData, tipoFiltro) {
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];     // Rojo
        let g = data[i + 1]; // Verde
        let b = data[i + 2]; // Azul

        if (tipoFiltro === "grises") {
            let gris = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i]     = gris; 
            data[i + 1] = gris; 
            data[i + 2] = gris; 
        } 
        else if (tipoFiltro === "brillo") {
            data[i]     = Math.min(255, r*1.3); 
            data[i + 1] = Math.min(255, g*1.3); 
            data[i + 2] = Math.min(255, b*1.3); 
        } 
        else if (tipoFiltro === "negativo") {
            // Invertir los colores restándolos del valor máximo (255)
            data[i]     = 255 - r; 
            data[i + 1] = 255 - g; 
            data[i + 2] = 255 - b; 
        }
    }
    return imageData;
}

function iniciarTemporizador() {
    detenerTemporizador();
    inicioNivel = performance.now();
    actualizarTiempo();
    idTimer = setInterval(actualizarTiempo, 100);
}

function detenerTemporizador() {
    clearInterval(idTimer);
    idTimer = null;
}

function tiempoTranscurrido() {            
    return performance.now() - inicioNivel;
}

function actualizarTiempo() {
    tiempoEl.textContent = "Tiempo: " + formatearTiempo(tiempoTranscurrido());
}

function formatearTiempo(ms) {
    const total = Math.floor(ms / 1000);
    const min = String(Math.floor(total / 60)).padStart(2, "0");
    const seg = String(total % 60).padStart(2, "0");
    const dec = Math.floor((ms % 1000) / 100);
    return `${min}:${seg}.${dec}`;
}