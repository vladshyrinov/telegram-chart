const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("detailed-chart"));
const ctx = canvas.getContext("2d");

//значения графиков
const grafics = {
    g1: { 1: 10, 2: 4, 3: 15, 4: 22, 5: 16, 6: 20, 7: 18, 8: 13, 9: 16, 10: 35 },
    g2: { 1: 11, 2: 10, 3: 8, 4: 6, 5: 13, 6: 12, 7: 22, 8: 18, 9: 16, 10: 15 },
    g3: { 1: 5, 2: 4, 3: 2, 4: 1, 5: 7, 6: 6, 7: 16, 8: 12, 9: 10, 10: 9 },
    g4: { 1: 3, 2: 4, 3: 8, 4: 12, 5: 15, 6: 18, 7: 21, 8: 22, 9: 25, 10: 27 }
}
//цвета линий
const colors = ['#f00', '#0f0', '#00f', '#0ff'];

const maxCount = 35 + 10;
const x0 = y0 = 30;
const width = canvas.width - 80;
const height = canvas.height - 90;
const stepY = Math.round(height / maxCount);
const stepX = Math.round(width / 10);

ctx.beginPath();
//Вертикальная линия
ctx.moveTo(x0, y0);
ctx.lineTo(x0, height + y0);
//горизонтальная линия
ctx.lineTo(width + x0, height + y0);

const x_max = 10;
//нижняя разметка и цифры
for (let i = x0, m = 0; m < x_max; i += stepX, m++) {
    ctx.moveTo(i, height + y0);
    ctx.lineTo(i, height + y0 + 15);
    ctx.fillText(m, i + 3, height + y0 + 15);
}

ctx.lineWidth = 2;
ctx.stroke();
ctx.closePath();

//рисуются кривые
let nr_color = 0;
for (const g in grafics) {
    ctx.beginPath();

    for (const m in grafics[g]) {
        const count = grafics[g][m];
        const x = x0 + ((m - 1) * stepX);
        const y = y0 + (height - count * stepY);

        if (1 == m)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);


        ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
        ctx.fillText(count, x - 5, y - 5); //текст над точками
        ctx.fillText(count, x0 - 15, y); //текст у боковой линии

    }

    ctx.strokeStyle = colors[nr_color]; //цвет линии
    nr_color++;
    ctx.lineWidth = 3; //толщина линии		
    ctx.stroke();
}

canvas.addEventListener('click', (e) => {
    const loc = windowToCanvas(canvas, e.clientX, e.clientY);
    console.log('clientX', e.clientX);
    console.log('clientY', e.clientY);
    console.log('loc', loc);
});

function windowToCanvas(canvas, x, y) {
    const bbox = canvas.getBoundingClientRect();

    console.log('box', bbox);
    console.log('width', canvas.width);
    console.log('height', canvas.height);

    return {
        x: x - Math.ceil(bbox.left),
        y: y - Math.ceil(bbox.top)
    };
}