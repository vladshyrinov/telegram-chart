const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('detailed-chart'));
const ctx = canvas.getContext('2d');

const init = async () => {
    const getRepresentationDate = (ms) => {
        const monthsShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const date = new Date(ms);

        const day = date.getDate();
        const month = monthsShortNames[date.getMonth()];

        return month + ' ' + day;
    }

    const chartsData = await fetch('./data/chart_data.json').then(res => res.json());

    const setCheckboxParameters = (checkbox, options) => {
        checkbox.querySelector('.category-name').innerText = options.lineName || 'Not Set';
    }

    const drawCoordinateAxis = (options) => {
        const offsetX = options.offsetX || 10;
        const offsetY = options.offsetY || 10;

        const chartWidth = options.chartWidth || 110;
        const chartHeight = options.chartHeight || 110;

        const xMax = options.xMax || 10;
        const xMin = options.xMin || 10;
        const yMax = options.yMax || 10;
        const yMin = options.yMin || 10;

        const stepsX = options.stepsX || 5;
        const stepsY = options.stepsY || 5;

        const xValueDifference = xMax - xMin;

        const stepXValue = xValueDifference / stepsX;
        const stepYValue = yMax / stepsY; 1

        const startPosX = offsetX;
        const endPosX = chartWidth + offsetX;
        const startPosY = chartHeight + offsetY;
        const endPosY = offsetY;

        const stepXAxis = (endPosX - startPosX) / stepsX;
        const stepYAxis = (startPosY - endPosY) / stepsY;

        // Axis parameters 

        ctx.lineWidth = options.lineWidth || 1;
        ctx.strokeStyle = options.axisColor || '#000000';
        ctx.fillStyle = options.fontColor || '#000000';
        ctx.font = options.font || '8px sans-serif';

        ctx.beginPath();


        // X axis values

        for (let curPosX = startPosX, curXValue = xMin; curPosX <= endPosX;
            curPosX += stepXAxis, curXValue += stepXValue) {

            const date = new Date(curXValue);
            const representativeDate = getRepresentationDate(date);

            ctx.fillText(representativeDate, curPosX, startPosY + 15);
        }

        // Y axis values

        for (let curPosY = startPosY, curYValue = yMin; curPosY >= endPosY;
            curYValue += stepYValue, curPosY -= stepYAxis) {
            const amount = Math.ceil(curYValue);

            ctx.moveTo(startPosX, curPosY);
            ctx.lineTo(endPosX, curPosY);
            ctx.fillText(amount, startPosX - 2, curPosY - 6);
        }

        ctx.stroke();
        ctx.closePath();
    }

    const drawLine = (options) => {
        const offsetX = options.offsetX || 10;
        const offsetY = options.offsetY || 10;
        
        const xValues = options.xValues || [2, 6, 10];
        const yValues = options.yValues || [2, 6, 10];
        
        const chartHeight = options.chartHeight || 110;
        const chartWidth = options.chartWidth || 110;
        
        const xMax = options.xMax || 10;
        const xMin = options.xMin || 10;
        const yMax = options.yMax || 10;
        const yMin = options.yMin || 10;

        const stepY = chartHeight / (yMax - yMin);
        const stepX = chartWidth / (xMax - xMin);

        // Chart parameters

        ctx.strokeStyle = options.lineColor || '#000000';
        ctx.lineWidth = options.lineWidth || 2; 

        // Chart drawing

        ctx.beginPath();

        for (let i = 0; i < yValues.length; i++) {
            
            const y = offsetY + chartHeight - Math.round(stepY * (yValues[i] - yMin));
            const x = offsetX + Math.round(stepX * (xValues[i] - xMin));

            // const yValue = yValues[i];
            // const xValue = xValues[i];

            if (i === 0) {
                ctx.moveTo(x, y);
                continue;
            }

            ctx.lineTo(x, y);
        }

        ctx.stroke();
    }

    const drawChartName = (options) => {
        const name = options.name || '';

        const offsetX = options.offsetX || 10;
        const offsetY = options.offsetY || 10;

        ctx.font = options.font || '20px sans-serif';
        ctx.fillStyle = options.fontColor || '#000000';
        ctx.fillText(name, offsetX, offsetY / 2);
    }

    const initializeChartDrawing = async (chartData, lines, options) => {
        console.log(chartData);

        const columns = chartData.columns;
        const linesColors = chartData.colors;
        const linesNames = chartData.names;
        const columnsTypes = chartData.types;
        
        const yColumns = [];
        let allYValues = [];
        let xValues = [];

        for (const c of columns) {
            const lineSymbol = c[0];
            
            if (columnsTypes[lineSymbol] === 'x') {
                xValues = c.slice(1);
            } 

            if (columnsTypes[lineSymbol] === 'line' && lines.includes(lineSymbol)) {
                yColumns.push(c);
                allYValues = [...allYValues, ...c.slice(1)];
            }
        }

        const xyMaxMins = {
            xMax: Math.max(...xValues),
            xMin: Math.min(...xValues),
            yMax: Math.max(...allYValues),
            yMin: 0
        }

        const axisOptions = {
            ...options,
            ...xyMaxMins,
            fontColor: '#96A2AA',
            axisColor: '#DFE6EB',
            font: '10px Verdana'
        }

        const chartNameOptions = {
            ...options,
            name: 'My Chart',
            font: 'bold 16px Verdana'
        }

        drawCoordinateAxis(axisOptions);

        drawChartName(chartNameOptions);

        for (const c of yColumns) {
            const lineSymbol = c[0];

            if (lines.includes(lineSymbol)) {                
                const lineOptions = {
                    ...options,
                    ...xyMaxMins,
                    lineColor: linesColors[lineSymbol],
                    name: linesNames[lineSymbol],
                    xValues,
                    yValues: c.slice(1)
                }

                drawLine(lineOptions);
            }
        }
    }

    const initChartDrawingOptions = {
        offsetX: 40,
        offsetY: 80,
        chartWidth: canvas.width - 100,
        chartHeight: canvas.height - 100,
    }

    initializeChartDrawing(chartsData[0], ['y0', 'y1'], initChartDrawingOptions);

    const checkboxes = document.querySelectorAll('.checkboxes-container label');
    const colors = Object.values(chartsData[0].colors);
    const names = Object.values(chartsData[0].names);

    [].forEach.call(checkboxes, (checkbox, i) => {

        console.log('--checkbox' + (i + 1) + 'Color');
        console.log(colors[i]);
        document.documentElement.style.setProperty('--checkbox' + (i + 1) + 'Color', colors[i]);

        const checkboxOptions = {
            lineName: names[i]
        }
        
        setCheckboxParameters(checkbox, checkboxOptions);
    });


    // setTimeout(() => {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     initializeChartDrawing(chartsData[0], ['y1'], initChartDrawingOptions);
    // }, 2000);

    // setTimeout(() => {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     initializeChartDrawing(chartsData[0], ['y0'], initChartDrawingOptions);
    // }, 4000);

    // setTimeout(() => {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     initializeChartDrawing(chartsData[0], ['y1'], initChartDrawingOptions);
    // }, 6000);



    // canvas.addEventListener('click', (e) => {
    //     const loc = windowToCanvas(canvas, e.clientX, e.clientY);
    //     console.log('clientX', e.clientX);
    //     console.log('clientY', e.clientY);
    //     console.log('loc', loc);
    // });

    // function windowToCanvas(canvas, x, y) {
    //     const bbox = canvas.getBoundingClientRect();

    //     console.log('box', bbox);
    //     console.log('width', canvas.width);
    //     console.log('height', canvas.height);

    //     return {
    //         x: x - Math.ceil(bbox.left),
    //         y: y - Math.ceil(bbox.top)
    //     };
    // }
}

init();

const canvas2 = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx2 = canvas2.getContext('2d');



// for(let i=0; i < 300; i++) {
//     setTimeout(() => {
//         ctx2.moveTo(0, i);
//         ctx2.lineTo(100, i);
//         ctx2.clearRect(0,0,canvas2.width, canvas2.height);
//         ctx2.stroke();
//     }, i * 100);
// }

var posX = 0;

function loop() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    posX +=1;
    ctx2.beginPath();
    ctx2.moveTo(posX, 0)
    ctx2.lineTo(posX, 100);
    ctx2.stroke();
    
    if(posX < canvas2.width) {
        window.requestAnimationFrame(loop);
    }
}

window.requestAnimationFrame(loop);


// var canvas = document.getElementById("canvas");
// var ctx = canvas.getContext("2d");
// ctx.strokeStyle = "Green";
// var posY = 0;
// var lineLength = 100;
// var speed = 2;

// function drawLine() {
//     ctx.beginPath();
//     ctx.moveTo(10, posY);
//     ctx.lineTo(10, posY + lineLength);
//     ctx.stroke();
// }

// function moveLine() {
//     posY += speed;

//     if (posY < 0 || posY > canvas.height) {
//         speed = speed * -1;
//     }
// }

// function loop() {
//     // clear old frame;
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     moveLine();
//     drawLine();
//     requestAnimationFrame(loop);
// }
// requestAnimationFrame(loop);
