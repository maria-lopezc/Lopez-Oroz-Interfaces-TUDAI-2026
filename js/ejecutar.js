const btn = document.getElementById('btnCompartir');
const panel = document.getElementById('panel');

btn.addEventListener('click', () => {
    const abierto = panel.classList.toggle('abierto');
});