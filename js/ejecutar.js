const btn = document.getElementById('btnCompartir');
const panel = document.getElementById('panel');

btn.addEventListener('click', () => {
    panel.classList.toggle('abierto');
});