class Chart {
    constructor(_initChartData) {
        this.chartData = _initChartData.chartData;

        this.entryPoint = _initChartData.entryPoint;
        
        this.axisOptions = _initChartData.axis;

        this.chartNameOptions = _initChartData.chartName;

        this.chartDrawingOptions = _initChartData.chartDrawingOptions;

        this.generalChartDrawingOptions = _initChartData.generalChartDrawingOptions;
    }

    get _initHTMLMarkup() {
        return `
            <div class="charts-container">
                <canvas id="detailed-chart" width="${this.chartDrawingOptions.chartWidth + 100}" height="${this.chartDrawingOptions.chartHeight + 100}"></canvas>
                <div class="ruler-container">
                    <canvas id="chart" width="${this.generalChartDrawingOptions.chartWidth}" height="${this.generalChartDrawingOptions.chartHeight}"></canvas>
                    <div id="window-sizer-wrapper">
                        <div id="window-sizer">
                            <div class="sizer sizer-left"></div>
                            <div class="sizer sizer-right"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="checkboxes-container">
            <label class="category-checkbox">
                <span class="category-name"></span>
                <input type="checkbox" name="checkbox1" checked>
                <span class="checkmark"></span>
            </label>
            <label class="category-checkbox">
                <span class="category-name"></span>
                <input type="checkbox" name="checkbox2" checked>
                <span class="checkmark"></span>
            </label>
            </div>`;
    }

    startUp() {
        document.querySelector(this.entryPoint).innerHTML = this._initHTMLMarkup;

        this._initSharedCtx(this.entryPoint);

        this._initializeChartDrawing(this.chartDrawingOptions, this.detailedCtx);

        this._initializeChartDrawing(this.generalChartDrawingOptions, this.generalCtx);

        this._setCheckBoxesClickEvent();

        this._callDragHandler();
    }

    _initSharedCtx(entryPoint) {        
        this.detailedCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} #detailed-chart`));

        this.detailedCtx = this.detailedCanvas.getContext('2d');

        this.generalCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} #chart`));

        this.generalCtx = this.generalCanvas.getContext('2d');
    }

    _drawCoordinateAxis(options, ctx) {
        const offsetX = !isNaN(options.offsetX) ? options.offsetX : 10;
        const offsetY = !isNaN(options.offsetY) ? options.offsetY : 10;

        const chartWidth = !isNaN(options.chartWidth) ? options.chartWidth : 110
        const chartHeight = !isNaN(options.chartHeight) ? options.chartHeight : 110

        const xMax = !isNaN(options.xMax) ? options.xMax : 10;
        const xMin = !isNaN(options.xMin) ? options.xMin : 10;
        const yMax = !isNaN(options.yMax) ? options.yMax : 10;
        const yMin = !isNaN(options.yMin) ? options.yMin : 10;

        const stepsX = !isNaN(options.stepsX) ? options.stepsX : 5;
        const stepsY = !isNaN(options.stepsY) ? options.stepsY : 5;

        const xValueDifference = xMax - xMin;

        const stepXValue = xValueDifference / stepsX;
        const stepYValue = yMax / stepsY;

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
            const representativeDate = this._getRepresentationDate(date);

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

    _drawLine(options, ctx) {
        const offsetX = !isNaN(options.offsetX) ? options.offsetX : 10;
        const offsetY = !isNaN(options.offsetY) ? options.offsetY : 10;

        const xValues = options.xValues || [2, 6, 10];
        const yValues = options.yValues || [2, 6, 10];

        const chartWidth = !isNaN(options.chartWidth) ? options.chartWidth : 110
        const chartHeight = !isNaN(options.chartHeight) ? options.chartHeight : 110

        const xMax = !isNaN(options.xMax) ? options.xMax : 10;
        const xMin = !isNaN(options.xMin) ? options.xMin : 10;
        const yMax = !isNaN(options.yMax) ? options.yMax : 10;
        const yMin = !isNaN(options.yMin) ? options.yMin : 10;

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
        ctx.closePath();
    }

    _drawChartName(options, ctx) {
        const title = options.title || '';

        const offsetX = options.offsetX || 10;
        const offsetY = options.offsetY || 10;

        ctx.font = options.font || '20px sans-serif';
        ctx.fillStyle = options.fontColor || '#000000';
        ctx.fillText(title, offsetX, offsetY / 2);
    }

    _initializeLabelsData(options) {
        const labels = options.labels;
        const colors = Object.values(this.chartData.colors);
        const lineNames = Object.values(this.chartData.names);
        const lineSymbols = Object.keys(this.chartData.names);

        labels.forEach((label, i) => {
            const labelOptions = {
                lineName: lineNames[i],
                color: colors[i],
                idx: i,
                lineSymbol: lineSymbols[i]
            }

            this._setLabelParameters(label, labelOptions);
        });
    }

    _setLabelParameters(label, options) {
        document.documentElement.style.setProperty('--checkbox' + (options.idx + 1) + 'Color', options.color || '#00ff00');
        label.querySelector('.category-name').innerText = options.lineName || 'Not Set';
        label.querySelector('input').setAttribute('data-line-symbol', options.lineSymbol);
    }

    _initializeChartDrawing(options, ctx) {
        const columns = this.chartData.columns;
        const linesColors = this.chartData.colors;
        const linesNames = this.chartData.names;
        const columnsTypes = this.chartData.types;
        const detailedChart = (options.detailedChart === false) ? false : true;

        const yColumns = [];
        let allYValues = [];
        let xValues = [];

        const labelsDataOptions = {
            labels: Array.from(document.querySelectorAll(`${this.entryPoint} .checkboxes-container label`))
        }

        this._initializeLabelsData(labelsDataOptions);

        const lines = this._getActiveLinesFromCheckBoxes();

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

        if (!allYValues.length) {
            allYValues = [0];
        }

        const xyMaxMins = {
            xMax: Math.max(...xValues),
            xMin: Math.min(...xValues),
            yMax: Math.max(...allYValues),
            yMin: 0
        }

        if (detailedChart) {
            this._drawCoordinateAxis({...options, ...xyMaxMins, ...this.axisOptions}, ctx);
            this._drawChartName({...options, ...this.chartNameOptions}, ctx);
        }

        for (const c of yColumns) {
            const lineSymbol = c[0];

            if (lines.includes(lineSymbol)) {
                
                const lineOptions = {
                    lineColor: linesColors[lineSymbol],
                    name: linesNames[lineSymbol],
                    xValues,
                    yValues: c.slice(1)
                }

                this._drawLine({...options, ...xyMaxMins, ...lineOptions}, ctx);
            }
        }
    }

    _setCheckBoxesClickEvent() {
        const labels= Array.from(document.querySelectorAll(`${this.entryPoint} .checkboxes-container label`))

        labels.forEach((label) => {
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('click', (e) => {
                this.detailedCtx.clearRect(0, 0, this.detailedCanvas.width, this.detailedCanvas.height);
                this._initializeChartDrawing(this.chartDrawingOptions, this.detailedCtx);
                this.generalCtx.clearRect(0, 0, this.generalCanvas.width, this.generalCanvas.height);
                this._initializeChartDrawing(this.generalChartDrawingOptions, this.generalCtx);
            }, false);
        });
    }

    _getRepresentationDate(ms) {
        const monthsShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const date = new Date(ms);

        const day = date.getDate();
        const month = monthsShortNames[date.getMonth()];

        return month + ' ' + day;
    }

    _getActiveLinesFromCheckBoxes() {
        const checkboxes = Array.from(document.querySelectorAll('.checkboxes-container label input'));

        const lines = [];

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                lines.push(checkbox.dataset.lineSymbol)
            }
        });

        return lines;
    }

    _callDragHandler () {
        const windowSizerWrapper = document.querySelector(`${this.entryPoint} #window-sizer-wrapper`);
        const windowSizer = document.querySelector(`${this.entryPoint} #window-sizer`);
        const sizerRight = document.querySelector(`${this.entryPoint} .sizer-right`);
        
        windowSizer.onmousedown = (event) => {
            event.preventDefault();
        
            const target = event.target;
        
            const shiftXLeft = event.clientX - windowSizer.getBoundingClientRect().left;
            const shiftXRight = windowSizer.getBoundingClientRect().right - event.clientX; 
        
            const onMouseMove = (event) => {
                if (target === windowSizer) {
                    let newLeft = event.clientX - shiftXLeft - windowSizerWrapper.getBoundingClientRect().left;
        
                    if (newLeft < 0) {
                        newLeft = 0;
                    }
            
                    const rightEdge = windowSizerWrapper.offsetWidth - windowSizer.offsetWidth;
                    
                    if (newLeft > rightEdge) {
                        newLeft = rightEdge;
                    }
            
                    windowSizer.style.left = newLeft + 'px';
                } else if (target === sizerRight) {
                    let newWidth = event.clientX - windowSizer.getBoundingClientRect().left + shiftXRight;
        
                    const minWidth = windowSizerWrapper.clientWidth / 10;
        
                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                    }
        
                    const maxWidth = windowSizerWrapper.clientWidth - (windowSizer.getBoundingClientRect().left - windowSizerWrapper.getBoundingClientRect().left);
        
                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                    }
        
                    windowSizer.style.width = newWidth + 'px';
                } else {
                    const oldLeft = windowSizer.getBoundingClientRect().left - windowSizerWrapper.getBoundingClientRect().left;
                    const oldWidth = windowSizer.clientWidth;
                    
                    let newLeft = event.clientX - shiftXLeft - windowSizerWrapper.getBoundingClientRect().left;
                    let newWidth = oldWidth + (oldLeft - newLeft);
        
                    if (newLeft < 0) {
                        newLeft = 0;
                    }
        
                    const minWidth = windowSizerWrapper.getBoundingClientRect().width / 10;
                    const rightEdge = (windowSizer.getBoundingClientRect().right - windowSizerWrapper.getBoundingClientRect().left) - minWidth;
        
                    if (newLeft > rightEdge) {
                        newLeft = rightEdge;
                    }
                    
                    const rightDiff = windowSizerWrapper.getBoundingClientRect().right - windowSizer.getBoundingClientRect().right;
                    const maxWidth = windowSizerWrapper.clientWidth - rightDiff;
                    
                    if (maxWidth < newWidth) {
                        newWidth = maxWidth;
                    }
        
        
                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                    }
        
                    windowSizer.style.left = newLeft + 'px';
                    windowSizer.style.width = newWidth + 'px';
                }
    
    
                console.log(this.generalCanvas.clientWidth);
                console.log(windowSizer.clientWidth);
            }
        
            const onMouseUp = () => {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }
        
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };
        
        windowSizer.ondragstart = () => {return false;};
    }

}

const init = async () => {
    const chartsData = await fetch('./data/chart_data.json').then(res => res.json());

    const initChartData = {
        chartData: chartsData[0],
        entryPoint: '#telegram-chart',
        chartDrawingOptions: {
            offsetX: 40,
            offsetY: 80,
            chartWidth: 400,
            chartHeight: 400
        },
        generalChartDrawingOptions: {
            offsetX: 0,
            offsetY: 0,
            chartWidth: 500,
            chartHeight: 50,
            detailedChart: false
        },
        chartName: {
            title: 'My Chart',
            font: 'bold 16px Verdana'
        },
        axis: {
            fontColor: '#96A2AA',
            axisColor: '#DFE6EB',
            font: '10px Verdana'
        }
    }

    new Chart(initChartData).startUp();
}

init();


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



// const canvas2 = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
// const ctx2 = canvas2.getContext('2d');



// for(let i=0; i < 300; i++) {
//     setTimeout(() => {
//         ctx2.moveTo(0, i);
//         ctx2.lineTo(100, i);
//         ctx2.clearRect(0,0,canvas2.width, canvas2.height);
//         ctx2.stroke();
//     }, i * 100);
// }

// var posY = 0;

// function loop() {
//     ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
//     posY +=1;
//     ctx2.beginPath();
//     ctx2.moveTo(0, posY)
//     ctx2.lineTo(100, posY);
//     ctx2.stroke();

//     if(posY < canvas2.width) {
//         window.requestAnimationFrame(loop);
//     }
// }

// window.requestAnimationFrame(loop);


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
