class Chart {
    constructor(_initChartData) {
        this.chartData = _initChartData.chartData;

        this.entryPoint = _initChartData.entryPoint;

        this.axisOptions = _initChartData.axis;

        this.chartNameOptions = _initChartData.chartName;

        this.chartDrawingOptions = _initChartData.chartDrawingOptions;

        this.generalChartDrawingOptions = _initChartData.generalChartDrawingOptions;

        this.detailedInfoOptions = _initChartData.detailedInfo;
    }

    get _initHTMLMarkup() {
        return `
            <div id="my-chart-wrapper">
            <button class="switch-mode-btn" data-mode="0">Switch to Night Mode</button>
            <div class="charts-container">
                <div class="detailed-chart-container"> 
                    <canvas id="detailed-chart" width="${this.chartDrawingOptions.chartWidth + 100}" height="${this.chartDrawingOptions.chartHeight + 100}"></canvas>
                </div>
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
            </div>
            </div>
            `;
    }

    startUp() {
        this._setDOMElementsNodes(this.entryPoint);

        this._initSharedCtx(this.entryPoint);

        this._getColors();

        this._initializeChartDrawing(this.chartDrawingOptions, this.detailedCtx, this._getRange());

        this._initializeChartDrawing(this.generalChartDrawingOptions, this.generalCtx);

        this._setCheckBoxesClickEvent();

        this._callDragHandler();

        this._setSwitchModeListener();

        this._setDetailedInfoListener(this.detailedCanvas, this.chartDrawingOptions);
    }

    _getRange(reverse) {
        const dataLength = this.chartData.columns[0].length - 1;

        const shownPercentage = +((this.windowSizer.clientWidth - this.sizerRight.clientWidth * 2) / this.windowSizerWrapper.clientWidth).toFixed(2);

        const valuesAmount = Math.round(dataLength * shownPercentage);

        let endPoint, endHiddenPercentage, startPoint, startHiddenPercentage, startIndex, endIndex;

        if (reverse) {
            endPoint = this.windowSizerWrapper.getBoundingClientRect().right - this.windowSizer.getBoundingClientRect().right + this.sizerRight.clientWidth;

            endHiddenPercentage = endPoint / this.windowSizerWrapper.clientWidth;

            endIndex = Math.round(dataLength * (1 - endHiddenPercentage)) - 1;

            startIndex = endIndex - valuesAmount + 1;
        } else {
            startPoint = this.windowSizer.getBoundingClientRect().left - this.windowSizerWrapper.getBoundingClientRect().left + this.sizerRight.clientWidth;

            startHiddenPercentage = startPoint / this.windowSizerWrapper.clientWidth;

            startIndex = Math.round(dataLength * startHiddenPercentage) + 1;

            endIndex = startIndex + valuesAmount - 1;
        }

        const range = [startIndex, endIndex];

        return range;
    }

    _getColors() {
        this.colors = {
            lightgreen: '#3cc23f',
            lightgray: '#E6ECF0',
            white: '#ffffff',
            black: '#000000',
            brightblue: '#108BE3',
            nightblue: '#242F3E',
            bluishgray: '#334557'
        }
    }

    _initSharedCtx(entryPoint) {
        this.detailedCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} #detailed-chart`));

        this.detailedCtx = this.detailedCanvas.getContext('2d');

        this.generalCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} #chart`));

        this.generalCtx = this.generalCanvas.getContext('2d');
    }

    _setDOMElementsNodes(entryPoint) {
        document.querySelector(entryPoint).innerHTML = this._initHTMLMarkup;

        this.windowSizerWrapper = document.querySelector(`${entryPoint} #window-sizer-wrapper`);

        this.windowSizer = document.querySelector(`${entryPoint} #window-sizer`);

        this.sizerRight = document.querySelector(`${entryPoint} .sizer-right`);
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

        ctx.save();
        ctx.beginPath();

        // Axis parameters 

        ctx.lineWidth = options.lineWidth || 1;
        ctx.strokeStyle = options.axisColor || this.colors.black;
        ctx.fillStyle = options.fontColor || this.colors.black;
        ctx.font = options.font || '8px sans-serif';

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
        ctx.restore();
    }

    _drawLine(options, ctx) {
        const offsetX = !isNaN(options.offsetX) ? options.offsetX : 0;
        const offsetY = !isNaN(options.offsetY) ? options.offsetY : 0;

        let xValues;
        let yValues;

        xValues = options.xValues || [2, 6, 10];
        yValues = options.yValues || [2, 6, 10];

        const chartWidth = !isNaN(options.chartWidth) ? options.chartWidth : 110
        const chartHeight = !isNaN(options.chartHeight) ? options.chartHeight : 110

        const xMax = !isNaN(options.xMax) ? options.xMax : 10;
        const xMin = !isNaN(options.xMin) ? options.xMin : 10;
        const yMax = !isNaN(options.yMax) ? options.yMax : 10;
        const yMin = !isNaN(options.yMin) ? options.yMin : 10;

        const idx = options.idx;

        const stepY = chartHeight / (yMax - yMin);
        const stepX = chartWidth / (xMax - xMin);

        ctx.save();
        ctx.beginPath();

        // Chart parameters

        ctx.strokeStyle = options.lineColor || this.colors.black;
        ctx.lineWidth = options.lineWidth || 2;

        // Chart drawing

        for (let i = 0; i < yValues.length; i++) {

            const y = offsetY + chartHeight - Math.round(stepY * (yValues[i] - yMin));
            const x = offsetX + Math.round(stepX * (xValues[i] - xMin));

            const yValue = yValues[i];
            const xValue = xValues[i];
            
            if(ctx === this.detailedCtx) {
                this.coordsValuesAccordance[`${x}-${idx}`] = { x, y, yValue, xValue }; 
            }

            if (i === 0) {
                ctx.moveTo(x, y);
                continue;
            }

            ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
    }

    _drawChartName(options, ctx) {
        const title = options.title || '';

        const offsetX = options.offsetX || 10;
        const offsetY = options.offsetY || 10;

        ctx.font = options.font || '20px sans-serif';
        ctx.fillStyle = options.fontColor || this.colors.black;
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
        document.documentElement.style.setProperty('--checkbox' + (options.idx + 1) + 'Color', options.color || this.colors.lightgreen);
        label.querySelector('.category-name').innerText = options.lineName || 'Not Set';
        label.querySelector('input').setAttribute('data-line-symbol', options.lineSymbol);
    }

    _initializeChartDrawing(options, ctx, range, detInfoData) {
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

        const activeLines = this._getActiveLinesFromCheckBoxes();

        for (const c of columns) {
            const lineSymbol = c[0];

            if (columnsTypes[lineSymbol] === 'x') {
                if (range) {
                    xValues = c.slice(range[0], range[1] + 1);
                } else {
                    xValues = c.slice(1);
                }
            }

            if (columnsTypes[lineSymbol] === 'line' && activeLines.includes(lineSymbol)) {
                yColumns.push(c);
                if (range) {
                    allYValues = [...allYValues, ...c.slice(range[0], range[1] + 1)];
                } else {
                    allYValues = [...allYValues, ...c.slice(1)];
                }
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
            this._drawCoordinateAxis({ ...options, ...xyMaxMins, ...this.axisOptions }, ctx);
            this._drawChartName({ ...options, ...this.chartNameOptions }, ctx);
        }

        if (range) {
            this.coordsValuesAccordance = {};
        }

        for (const [idx, c] of yColumns.entries()) {
            const lineSymbol = c[0];

            if (activeLines.includes(lineSymbol)) {
                let yValues;

                if (range) {
                    yValues = c.slice(range[0], range[1] + 1);
                } else {
                    yValues = c.slice(1)
                }

                const lineOptions = {
                    lineColor: linesColors[lineSymbol],
                    name: linesNames[lineSymbol],
                    xValues,
                    yValues,
                    idx
                }

                this._drawLine({ ...options, ...xyMaxMins, ...lineOptions }, ctx);
            }
        }

        if (detInfoData) {
            this._drawDetailedInfo(ctx, detInfoData, {...options, ...this.detailedInfoOptions});
        }
    }

    _redrawDetailedChart(reverse, detInfoData) {
        this.detailedCtx.clearRect(0, 0, this.detailedCanvas.width, this.detailedCanvas.height);

        const range = this._getRange(reverse);

        this._initializeChartDrawing(this.chartDrawingOptions, this.detailedCtx, range, detInfoData);
    }

    _redrawGeneralChart() {
        this.generalCtx.clearRect(0, 0, this.generalCanvas.width, this.generalCanvas.height);
        this._initializeChartDrawing(this.generalChartDrawingOptions, this.generalCtx);
    }

    _setCheckBoxesClickEvent() {
        const labels = Array.from(document.querySelectorAll(`${this.entryPoint} .checkboxes-container label`))

        labels.forEach((label) => {
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('click', (e) => {
                this._redrawDetailedChart();
                this._redrawGeneralChart();
            }, false);
        });
    }

    _getRepresentationDate(ms, weekDay) {
        const monthsShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekDaysShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];
        
        const date = new Date(ms);

        const day = date.getDate();
        const month = monthsShortNames[date.getMonth()];
        
        const monthAndDay = month + ' ' + day;
        
        if (weekDay) {
            weekDay = weekDaysShortNames[date.getDay()];
            return weekDay + ', ' + monthAndDay; 
        }

        return monthAndDay;
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

    _callDragHandler() {
        this.windowSizer.onmousedown = (event) => {
            event.preventDefault();

            const target = event.target;

            const shiftXLeft = event.clientX - this.windowSizer.getBoundingClientRect().left;
            const shiftXRight = this.windowSizer.getBoundingClientRect().right - event.clientX;

            const onMouseMove = (event) => {
                if (target === this.windowSizer) {
                    let newLeft = event.clientX - shiftXLeft - this.windowSizerWrapper.getBoundingClientRect().left;

                    if (newLeft < 0) {
                        newLeft = 0;
                    }

                    const rightEdge = this.windowSizerWrapper.offsetWidth - this.windowSizer.offsetWidth;

                    if (newLeft > rightEdge) {
                        newLeft = rightEdge;
                    }

                    this.windowSizer.style.left = newLeft + 'px';
                } else if (target === this.sizerRight) {
                    let newWidth = event.clientX - this.windowSizer.getBoundingClientRect().left + shiftXRight;

                    const minWidth = this.windowSizerWrapper.clientWidth / 10;

                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                    }

                    const maxWidth = this.windowSizerWrapper.clientWidth - (this.windowSizer.getBoundingClientRect().left - this.windowSizerWrapper.getBoundingClientRect().left);

                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                    }

                    this.windowSizer.style.width = newWidth + 'px';
                } else {
                    const oldLeft = this.windowSizer.getBoundingClientRect().left - this.windowSizerWrapper.getBoundingClientRect().left;
                    const oldWidth = this.windowSizer.clientWidth;

                    let newLeft = event.clientX - shiftXLeft - this.windowSizerWrapper.getBoundingClientRect().left;
                    let newWidth = oldWidth + (oldLeft - newLeft);

                    if (newLeft < 0) {
                        newLeft = 0;
                    }

                    const minWidth = this.windowSizerWrapper.getBoundingClientRect().width / 10;
                    const rightEdge = (this.windowSizer.getBoundingClientRect().right - this.windowSizerWrapper.getBoundingClientRect().left) - minWidth;

                    if (newLeft > rightEdge) {
                        newLeft = rightEdge;
                    }

                    const rightDiff = this.windowSizerWrapper.getBoundingClientRect().right - this.windowSizer.getBoundingClientRect().right;
                    const maxWidth = this.windowSizerWrapper.clientWidth - rightDiff;

                    if (maxWidth < newWidth) {
                        newWidth = maxWidth;
                    }


                    if (newWidth < minWidth) {
                        newWidth = minWidth;
                    }

                    this.windowSizer.style.left = newLeft + 'px';
                    this.windowSizer.style.width = newWidth + 'px';

                    this._redrawDetailedChart(true);

                    return;
                }

                this._redrawDetailedChart();
            }

            const onMouseUp = () => {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMouseMove);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        this.windowSizer.ondragstart = () => { return false; };
    }

    _setSwitchModeListener() {
        const switchModebtn = document.querySelector(`${this.entryPoint} .switch-mode-btn`);

        switchModebtn.addEventListener('click', (e) => {
            const target = e.target;

            const categoryNames = Array.from(document.querySelectorAll(`${this.entryPoint} .category-name`));

            const categoryLabels = Array.from(document.querySelectorAll(`${this.entryPoint} .category-checkbox`));

            const modes = ['Day Mode', 'Night Mode'];

            const idx = +target.dataset.mode;

            const newIdx = idx === 0 ? 1 : 0;

            target.setAttribute('data-mode', newIdx);

            target.innerText = `Switch to ${modes[idx]}`;

            if (idx) {
                this.chartNameOptions.fontColor = this.colors.black;
                this.detailedInfoOptions.circleFillColor = this.colors.white;     
                document.body.classList.remove('night');
                categoryNames.forEach((c) => c.classList.remove('night'));
                categoryLabels.forEach((c) => c.classList.remove('night'));
            } else {
                this.chartNameOptions.fontColor = this.colors.white;
                this.detailedInfoOptions.circleFillColor = this.colors.nightblue;     
                document.body.classList.add('night');
                categoryNames.forEach((c) => c.classList.add('night'));
                categoryLabels.forEach((c) => c.classList.add('night'));
            }

            this._redrawDetailedChart();
        });
    }

    _windowToCanvas(canvas, x, y) {
        const canvasBox = canvas.getBoundingClientRect();

        return {
            x: x - Math.ceil(canvasBox.left),
            y: y - Math.ceil(canvasBox.top)
        };
    }

    _setDetailedInfoListener(canvas, options) {
        canvas.addEventListener('mousemove', (e) => {
            const coords = this._windowToCanvas(canvas, e.clientX, e.clientY);

            const yStart = (options.offsetY || 10) + canvas.clientHeight * 0.2;
            const yEnd = canvas.clientHeight - (100 - options.offsetY || 10);

            const drawData = {yStart, yEnd};
            drawData.x = coords.x;
            
            const activeLines = this._getActiveLinesFromCheckBoxes();

            if (this.coordsValuesAccordance[`${coords.x}-0`]) {    
                for(const [idx, line] of activeLines.entries()) {
                    drawData[line] = this.coordsValuesAccordance[`${coords.x}-${idx}`];
                }

                this._redrawDetailedChart(false, drawData);
                this.lastDetailedInfoData = drawData; 
            } else {
                if (this.lastDetailedInfoData) {
                    for(let [idx, line] of activeLines.entries()) {
                        drawData[line] = this.coordsValuesAccordance[`${this.lastDetailedInfoData.x}-${idx}`];
                    }

                    this._redrawDetailedChart(false, drawData);
                }
            }

            // if(this.lastDetailedInfoData) {
            //     window.requestAnimationFrame(this._drawSmoothDetailedInfo.bind(this, drawData));
            // }
        });

        canvas.addEventListener('mouseout', () => {
            canvas.onmouseout = null;
            this.lastDetailedInfoData = null;
            this._redrawDetailedChart();
        });
    }

    // _drawSmoothDetailedInfo(drawData) {
    //     if (this.lastDetailedInfoData) {
            
    //         const xDiff = drawData.x - this.lastDetailedInfoData.x;

    //         console.log(drawData.x, this.lastDetailedInfoData.x);

    //         console.log(xDiff);

    //         if(xDiff > 0) {
    //             this.lastDetailedInfoData.x = this.lastDetailedInfoData.x + 1;
    //             drawData.x = this.lastDetailedInfoData.x;
    //             this._redrawDetailedChart(false, drawData);
    //             window.requestAnimationFrame(this._drawSmoothDetailedInfo.bind(this, drawData));
    //             console.log('move');                        
    //         } else if(xDiff < 0) {
    //             this.lastDetailedInfoData.x = this.lastDetailedInfoData.x - 1;
    //             drawData.x = this.lastDetailedInfoData.x;
    //             this._redrawDetailedChart(false, drawData);
    //             window.requestAnimationFrame(this._drawSmoothDetailedInfo.bind(this, drawData));
    //             console.log('move');            
    //         } else {
    //             console.log('move end');
    //         }


    //     } else {
    //         console.log('here');
    //     }
    // }

    _drawDetailedInfo(ctx, drawData, options) {
        const xRightEdge = (options.chartWidth + options.offsetX) - drawData.x;
        const xLeftEdge = drawData.x - options.offsetX;

        if (xRightEdge >= 0 && xLeftEdge >= 0) {
        
            let color = options.axisColor || this.colors.lightgray; 
            let circleFillColor = options.circleFillColor || this.colors.white;

            this._drawValuesLine(ctx, { ...drawData, color});

            const activeLines = this._getActiveLinesFromCheckBoxes();

            // TO DO

            for(let idx = 0; idx < activeLines.length; idx++) {
                if (drawData[activeLines[idx]]) {
                    color = this.chartData.colors[activeLines[idx]];
                    const x =  drawData[activeLines[idx]].x;
                    const y =  drawData[activeLines[idx]].y;
                    this._drawValuePoint(ctx, {color, circleFillColor}, x, y);   
                }
            }
            
            this._drawInfoWindow(ctx, drawData, options);
        }
    }

    _drawInfoWindow(ctx, drawData, options) {
        let xWidth = 100;
        let yHeight = 65;
        let xStart = drawData.x - 10;
        const yStart = drawData.yStart;

        const xEndPoint = xStart + xWidth;
        const xLack = xEndPoint - (options.chartWidth + options.offsetX);

        if (xLack > 0) {
            xStart = xStart - xLack;
        }
        
        this._roundRect(ctx, xStart, yStart, xWidth, yHeight, 5, this.colors.white);
        this._drawInfoText(ctx, {...drawData, xStart}, options);
    }

    _roundRect(ctx, x, y, width, height, radius) {
    
        if (typeof radius === 'undefined') {
            radius = 5;
        }

        if (typeof radius === 'number') {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
            var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }

        ctx.save();
        ctx.shadowColor = this.colors.lightgray;
        ctx.fillStyle = this.colors.white;
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = 1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _drawInfoText(ctx, drawData) {
        const activeLines = this._getActiveLinesFromCheckBoxes();
        
        if (activeLines.length && drawData[activeLines[0]]) {
            const date = this._getRepresentationDate(drawData[activeLines[0]].xValue, true);
            const shiftY = 20;
            let shiftX = 0;
            const xStart = drawData.xStart;
            const yStart = drawData.yStart;
    
            ctx.save();
            ctx.font = 'bold 12px Verdana';
            ctx.fillText(date, xStart + 10, yStart + shiftY);
            ctx.restore();
    
            const colors = this.chartData.colors;
            const names = this.chartData.names;
    
            for (const line of activeLines) {
                this._drawValueInfo(ctx, xStart, yStart, shiftX, shiftY, colors[line], drawData[line].yValue, names[line]);
                shiftX += 50;
            }
        }

        // for (const [key, name] of Object.entries(names)) {
        // }

    }

    _drawValueInfo(ctx, xStart, yStart, shiftX, shiftY, color, value, text) {
        ctx.save();
        ctx.font = 'bold 14px Verdana';
        ctx.fillStyle = color;
        ctx.fillText(value, xStart + 10 + shiftX, yStart + shiftY + 25);
        ctx.font = 'bold 9px Verdana';
        ctx.fillText(text, xStart + 10 + shiftX, yStart + shiftY + 38);
        ctx.restore();
    }

    _drawValuePoint(ctx, colors, x, y) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = colors.color;
        ctx.fillStyle = colors.circleFillColor;
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    _drawValuesLine(ctx, drawData) { 
        ctx.save();       
        ctx.beginPath();
        ctx.moveTo(drawData.x, drawData.yStart);
        ctx.lineTo(drawData.x, drawData.yEnd);
        ctx.lineWidth = 2;
        ctx.strokeStyle = drawData.color;
        ctx.stroke();
        ctx.restore();
    }
}

const init = (width) => {
    fetch('./data/chart_data.json').then(res => res.json()).then((chartsData) => {

        let offsetX, offsetY;
        offsetY = 80;
        
        if (width > 500) {
            width = 400;
            offsetX = 40;
        } else {
            width -= 100;
            offsetX = 10;
        }

        const initChartData = {
            chartDrawingOptions: {
                offsetX,
                offsetY,
                chartWidth: width,
                chartHeight: width
            },
            generalChartDrawingOptions: {
                chartWidth: width,
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
            },
            detailedInfo: {
                circleFillColor: '#FFFFFF'
            }
        }
        
        const app = document.getElementById("app");

        for (const [idx, chartData] of chartsData.entries()) {

            if(idx === 0) {
                const entryPointId = `telegram-chart-${idx}`;
                const entryPoint = '#' + entryPointId;

                const chartNode = document.createElement('div');
                chartNode.id = entryPointId;
                app.appendChild(chartNode);

                initChartData.chartData = chartData;
                initChartData.entryPoint = entryPoint;

                const chart = new Chart(initChartData);
                chart.startUp();
            }
        }
    });
}

init(document.body.offsetWidth);


window.onresize = (e) => {
    const docWidth = document.body.offsetWidth;
    
    init(docWidth);
};




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
