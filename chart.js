const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("chart"));
const ctx = canvas.getContext("2d");

const grafics = {
    g1: { 1: 10, 2: 4, 3: 15, 4: 22, 5: 16, 6: 20, 7: 18, 8: 13, 9: 16, 10: 35 },
    g2: { 1: 11, 2: 10, 3: 8, 4: 6, 5: 13, 6: 12, 7: 22, 8: 18, 9: 16, 10: 15 },
    g3: { 1: 5, 2: 4, 3: 2, 4: 1, 5: 7, 6: 6, 7: 16, 8: 12, 9: 10, 10: 9 },
    g4: { 1: 3, 2: 4, 3: 8, 4: 12, 5: 15, 6: 18, 7: 21, 8: 22, 9: 25, 10: 27 }
}

const colors = ['#f00', '#0f0', '#00f', '#0ff'];

const maxCount = 35 + 10;
const x0 = y0 = 30;
const width = canvas.width - 80;
const height = canvas.height - 90;
const stepY = Math.round(height / maxCount);
const stepX = Math.round(width / 10);