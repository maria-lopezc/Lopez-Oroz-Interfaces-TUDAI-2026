//solo para testear (mover a otro archivo)
const fichas = document.querySelectorAll('input[name="ficha"]');
const tablero = document.getElementById("tablero");

fichas.forEach((ficha) => {
    ficha.addEventListener("change", (event) => {
        tablero.innerHTML = `<p>Ficha seleccionada: ${event.currentTarget.value}</p>`;
        
        console.log("Ficha seleccionada:", event.currentTarget.value);
    });
});
//fin del testeo
