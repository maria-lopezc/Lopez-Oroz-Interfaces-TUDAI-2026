// 2 modos: juego regular y testeo.
export const MODOS = {
    normal: { limite: 180, fichas: null },   // null = tablero completo de 33 fichas
    demo:   { limite: 15,  
        fichas: [{ fila: 1, col: 3 },
        { fila: 2, col: 3 },
        { fila: 3, col: 2 },
        { fila: 3, col: 5 }]}
};