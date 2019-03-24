class Chart {
    constructor(_initChartData) {
        this.chartData = _initChartData.chartData;

        this.entryPoint = _initChartData.entryPoint;

        this.axisOptions = _initChartData.axis;

        this.chartNameOptions = _initChartData.chartName;

        this.chartDrawingOptions = _initChartData.chartDrawingOptions;

        this.generalChartDrawingOptions = _initChartData.generalChartDrawingOptions;

        this.detailedInfoOptions = _initChartData.detailedInfo;

        this.mode = this._mode;
    }

    get _initHTMLMarkup() {
        return `
            <div class="my-chart-wrapper">
            <button class="switch-mode-btn" data-mode="${this.mode}">${this.mode ? 'Switch to Day Mode' : 'Switch to Night Mode'}</button>
            <div class="charts-container">
                <div class="detailed-chart-container"> 
                    <canvas class="detailed-chart" width="${this.chartDrawingOptions.chartWidth}" height="${this.chartDrawingOptions.chartHeight + 15}"></canvas>
                </div>
                <div class="ruler-container">
                    <canvas class="chart" width="${this.generalChartDrawingOptions.chartWidth}" height="${this.generalChartDrawingOptions.chartHeight}"></canvas>
                    <div class="window-sizer-wrapper">
                        <div class="window-sizer">
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

    get _mode() {
        let mode = +localStorage.getItem(`${this.entryPoint}-mode`);

        if (mode === null) {
            mode = 0;
        }

        return mode;
    }

    set _mode(mode) {
        localStorage.setItem(`${this.entryPoint}-mode`, mode);

        this.mode = mode;
    }

    startUp() {
        this._setDOMElementsNodes(this.entryPoint);

        this._initSharedCtx(this.entryPoint);

        this._getColors();

        this._initializeChartDrawing(this.chartDrawingOptions, this.detailedCtx, this._getRange());

        this._initializeChartDrawing(this.generalChartDrawingOptions, this.generalCtx);

        this._setCheckBoxesClickEvent();

        this._setDragHandler();

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

            endIndex = Math.ceil(dataLength * (1 - endHiddenPercentage)) - 1;

            startIndex = endIndex - valuesAmount + 1;
        } else {
            startPoint = this.windowSizer.getBoundingClientRect().left - this.windowSizerWrapper.getBoundingClientRect().left + this.sizerRight.clientWidth;

            startHiddenPercentage = startPoint / this.windowSizerWrapper.clientWidth;

            startIndex = Math.ceil(dataLength * startHiddenPercentage) + 1;

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
            bluishgray: '#334557',
            transparent: 'transparent'
        }
    }

    _initSharedCtx(entryPoint) {
        this.detailedCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} .detailed-chart`));

        this.detailedCtx = this.detailedCanvas.getContext('2d');

        this.generalCanvas = /** @type {HTMLCanvasElement} */ (document.querySelector(`${entryPoint} .chart`));

        this.generalCtx = this.generalCanvas.getContext('2d');
    }

    _setDOMElementsNodes(entryPoint) {
        document.querySelector(entryPoint).innerHTML = this._initHTMLMarkup;

        this.windowSizerWrapper = document.querySelector(`${entryPoint} .window-sizer-wrapper`);

        this.windowSizer = document.querySelector(`${entryPoint} .window-sizer`);

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

        const startPosX = offsetX - 1;
        const endPosX = chartWidth - 1;
        const endPosXNames = chartWidth - 1 - 35;
        const startPosY = chartHeight - 1;
        const endPosY = offsetY - 1;

        const stepXAxis = (endPosXNames - startPosX) / stepsX;
        const stepYAxis = (startPosY - endPosY) / stepsY;

        ctx.save();
        ctx.beginPath();

        // Axis parameters 

        ctx.lineWidth = options.lineWidth || 1;
        ctx.strokeStyle = options.axisColor || this.colors.black;
        ctx.fillStyle = options.fontColor || this.colors.black;
        ctx.font = options.font || '8px sans-serif';

        // X axis values

        for (let curPosX = startPosX, curXValue = xMin; curPosX <= endPosXNames;
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

        const lineSymbol = options.lineSymbol;

        const stepY = (chartHeight - offsetY - 1) / (yMax - yMin);
        const stepX = (chartWidth - offsetX - 1) / (xMax - xMin);

        ctx.save();
        ctx.beginPath();

        // Chart parameters

        ctx.strokeStyle = options.lineColor || this.colors.black;
        ctx.lineWidth = options.lineWidth || 2;

        // Chart drawing

        for (let i = 0; i < yValues.length; i++) {

            const y = chartHeight - Math.round(stepY * (yValues[i] - yMin));
            const x = offsetX + Math.round(stepX * (xValues[i] - xMin));

            const yValue = yValues[i];
            const xValue = xValues[i];
            
            if(ctx === this.detailedCtx) {
                this.coordsValuesAccordance[`${x}-${lineSymbol}`] = { x, y, yValue, xValue }; 
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

        ctx.save();
        ctx.font = options.font || '20px sans-serif';

        let fontColor = options.dayMode.fontColor;

        if (this.mode) {
            fontColor = options.nightMode.fontColor;
        }

        ctx.fillStyle = fontColor || this.colors.black;
        ctx.fillText(title, offsetX, offsetY / 2);
        ctx.restore();
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
        label.querySelector('.checkmark').style.borderColor = options.color || this.colors.lightgreen;
        const checkedCheckmark = label.querySelector('input[type=checkbox]:checked + .checkmark');
        if (checkedCheckmark) {
            checkedCheckmark.style.backgroundColor = options.color || this.colors.lightgreen;
        }
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

        if (range) {
            this.coordsValuesAccordance = {};
        }

        if (detailedChart) {
            this._drawCoordinateAxis({ ...options, ...xyMaxMins, ...this.axisOptions }, ctx);
            this._drawChartName({ ...options, ...this.chartNameOptions }, ctx);
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
                    lineSymbol
                }

                this._drawLine({ ...options, ...xyMaxMins, ...lineOptions }, ctx);
            }
        }

        if (detInfoData) {
            this._drawDetailedInfo(ctx, detInfoData, { ...options, ...this.detailedInfoOptions });
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
                const checkmark = e.target.nextElementSibling;
                checkmark.style.backgroundColor = this.colors.transparent;
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
        const checkboxes = Array.from(document.querySelectorAll(`${this.entryPoint} .checkboxes-container label input`));

        const lines = [];

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                lines.push(checkbox.dataset.lineSymbol)
            }
        });

        return lines;
    }

    _sizerMoveHandler(touch, event) {
        event.preventDefault();

        const target = event.target;
        const clientX = !isNaN(event.clientX) ? event.clientX : event.touches[0].clientX;

        const shiftXLeft = clientX - this.windowSizer.getBoundingClientRect().left;
        const shiftXRight = this.windowSizer.getBoundingClientRect().right - clientX;

        const onMove = (event) => {
            const clientX = !isNaN(event.clientX) ? event.clientX : event.touches[0].clientX;
            if (target === this.windowSizer) {
                let newLeft = clientX - shiftXLeft - this.windowSizerWrapper.getBoundingClientRect().left;

                if (newLeft < 0) {
                    newLeft = 0;
                }

                const rightEdge = this.windowSizerWrapper.offsetWidth - this.windowSizer.offsetWidth;

                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                this.windowSizer.style.left = newLeft + 'px';
            } else if (target === this.sizerRight) {
                let newWidth = clientX - this.windowSizer.getBoundingClientRect().left + shiftXRight;

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

                let newLeft = clientX - shiftXLeft - this.windowSizerWrapper.getBoundingClientRect().left;
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

                newLeft = Math.ceil(newLeft);

                if (touch) {
                    newWidth = Math.floor(newWidth);
                } else {
                    newWidth = Math.ceil(newWidth);
                }

                this.windowSizer.style.left = newLeft + 'px';
                this.windowSizer.style.width = newWidth + 'px';

                this._redrawDetailedChart(true);
                return;
            }

            this._redrawDetailedChart();
        }

        if (touch) {
            const onTouchEnd = () => {
                document.removeEventListener('touchend', onTouchEnd);
                document.removeEventListener('touchmove', onMove);
            }

            document.addEventListener('touchend', onTouchEnd);
            document.addEventListener('touchmove', onMove);
        } else {
            const onMouseUp = () => {
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mousemove', onMove);
            }
    
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mousemove', onMove);
        }
    };

    _setDragHandler() {
        this.windowSizer.onmousedown = this._sizerMoveHandler.bind(this, false);

        this.windowSizer.ontouchstart = this._sizerMoveHandler.bind(this, true);

        this.windowSizer.ondragstart = () => { return false; };
    }

    _setSwitchModeListener() {
        const switchModebtn = document.querySelector(`${this.entryPoint} .switch-mode-btn`);

        const switchMode = (e, switchMode) => {
            const target = e.target;

            const categoryNames = Array.from(document.querySelectorAll(`${this.entryPoint} .category-name`));

            const categoryLabels = Array.from(document.querySelectorAll(`${this.entryPoint} .category-checkbox`));

            const chartWrapper = document.querySelector(`${this.entryPoint} .my-chart-wrapper`);

            const modes = ['Day Mode', 'Night Mode'];

            const idx = +target.dataset.mode;

            let newIdx = idx;

            if (!switchMode) {
                newIdx = idx === 0 ? 1 : 0;
    
                target.setAttribute('data-mode', newIdx);
    
                target.innerText = `Switch to ${modes[idx]}`;
            }

            if (newIdx) {
                this._mode = 1;
                chartWrapper.classList.add('night');
                categoryNames.forEach((c) => c.classList.add('night'));
                categoryLabels.forEach((c) => c.classList.add('night'));
            } else {
                this._mode = 0;
                chartWrapper.classList.remove('night');
                categoryNames.forEach((c) => c.classList.remove('night'));
                categoryLabels.forEach((c) => c.classList.remove('night'));
            }

            this._redrawDetailedChart();
        }

        switchMode({target: switchModebtn}, true);

        switchModebtn.addEventListener('click', switchMode);
    }

    _windowToCanvas(canvas, x, y) {
        const canvasBox = canvas.getBoundingClientRect();

        return {
            x: x - Math.ceil(canvasBox.left),
            y: y - Math.ceil(canvasBox.top)
        };
    }

    _detailedInfoHandler(canvas, options, touch, event) {
        const clientX = !isNaN(event.clientX) ? event.clientX : event.touches[0].clientX;;
        const clientY = !isNaN(event.clientY) ? event.clientY : event.touches[0].clientY;
        const coords = this._windowToCanvas(canvas, clientX, clientY);

        if ((touch && (coords.y >= options.offsetY)) || !touch) {
            const yStart = (options.offsetY || 10) + canvas.clientHeight * 0.2;
            const yEnd = canvas.clientHeight;

            const drawData = { yStart, yEnd };

            drawData.x = coords.x;

            const activeLines = this._getActiveLinesFromCheckBoxes();

            if (activeLines.length) {
                let nearestX = coords.x;
                let foundXAccordance = this.coordsValuesAccordance[`${nearestX}-${activeLines[0]}`];

                if (!foundXAccordance) {
                    while (!foundXAccordance) {
                        if (nearestX < canvas.clientWidth - 1) {
                            nearestX += 1;
                            foundXAccordance = this.coordsValuesAccordance[`${nearestX}-${activeLines[0]}`];
                        } else {
                            break;
                        }
                    }
                }

                for (const line of activeLines) {
                    drawData[line] = this.coordsValuesAccordance[`${nearestX}-${line}`];
                    drawData.x = nearestX;
                }

                this._redrawDetailedChart(false, drawData);
            }
        }
    }

    _setDetailedInfoListener(canvas, options) {
        canvas.addEventListener('mousemove', this._detailedInfoHandler.bind(this, canvas, options, false));

        canvas.addEventListener('touchup', this._detailedInfoHandler.bind(this, canvas, options, true));

        canvas.addEventListener('mouseout', () => {
            canvas.onmouseout = null;
            this._redrawDetailedChart();
        });
    }

    _drawDetailedInfo(ctx, drawData, options) {
        const xRightEdge = (options.chartWidth + options.offsetX) - drawData.x;
        const xLeftEdge = drawData.x - options.offsetX;

        if (xRightEdge >= 0 && xLeftEdge >= 0) {

            this._drawValuesLine(ctx, drawData, options);

            const activeLines = this._getActiveLinesFromCheckBoxes();

            for(let idx = 0; idx < activeLines.length; idx++) {
                if (drawData[activeLines[idx]]) {
                    const strokeColor = this.chartData.colors[activeLines[idx]];
                    const x =  drawData[activeLines[idx]].x;
                    const y =  drawData[activeLines[idx]].y;
                    this._drawValuePoint(ctx, strokeColor, x, y, options);   
                }
            }
            
            this._drawInfoWindow(ctx, drawData, options);
        }
    }

    _drawInfoWindow(ctx, drawData, options) {
        const activeLines = this._getActiveLinesFromCheckBoxes();
        let yValuesLength = 0; 
        let yValuesLengthStandard = 8; 
        let xWidth = 105;
        let yHeight = 65;

        for(const line of activeLines) {
            yValuesLength += drawData[line].yValue.toString().length;
        }

        if (yValuesLength > yValuesLengthStandard) {
            xWidth += (yValuesLength - yValuesLengthStandard) * 5;
        }

        let xStart = drawData.x - 10;
        const yStart = drawData.yStart;

        const xEndPoint = xStart + xWidth;
        const xLack = xEndPoint - (options.chartWidth - 1);

        if (xLack > 0) {
            xStart = xStart - xLack;
        }

        let windowColor = options.dayMode.windowColor;
        let borderWindowColor = options.dayMode.borderWindowColor;

        if (this.mode) {
            windowColor = options.nightMode.windowColor;
            borderWindowColor = options.nightMode.borderWindowColor;
        }

        this._roundRect(ctx, xStart, yStart, xWidth, yHeight, 5, windowColor, borderWindowColor);
        this._drawInfoText(ctx, {...drawData, xStart}, options);
    }

    _roundRect(ctx, x, y, width, height, radius, windowColor, borderWindowColor) {
    
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
        ctx.fillStyle = windowColor;
        ctx.strokeStyle = borderWindowColor;
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
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    _drawInfoText(ctx, drawData, options) {
        const activeLines = this._getActiveLinesFromCheckBoxes();
        
        if (activeLines.length && drawData[activeLines[0]]) {
            const date = this._getRepresentationDate(drawData[activeLines[0]].xValue, true);
            const shiftY = 20;
            let shiftX = 0;
            const xStart = drawData.xStart;
            const yStart = drawData.yStart;
            const yValueLengthStandard = 4;
    
            ctx.save();
            ctx.font = 'bold 12px Verdana';
            let fillStyle = options.dayMode.dateInfoColor;
            if (this.mode) {
                fillStyle = options.nightMode.dateInfoColor;
            }
            ctx.fillStyle = fillStyle;
            ctx.fillText(date, xStart + 10, yStart + shiftY);
            ctx.restore();
    
            const colors = this.chartData.colors;
            const names = this.chartData.names;
    
            for (const line of activeLines) {
                this._drawValueInfo(ctx, xStart, yStart, shiftX, shiftY, colors[line], drawData[line].yValue, names[line]);
                const yValueLength = drawData[line].yValue.toString().length; 
                shiftX += 50;
                if (yValueLength > yValueLengthStandard) {
                    shiftX += (yValueLength - yValueLengthStandard) * 5;
                }
            }
        }
    }

    _drawValueInfo(ctx, xStart, yStart, shiftX, shiftY, color, value, text) {
        ctx.save();
        const standardValueLength = 4;
        const valueLength = value.toString().length
        let font = 'bold 14px Verdana';
        if(valueLength > standardValueLength) {
            const pxNum = (valueLength - standardValueLength) * 1;
            font = `bold ${14 - pxNum}px Verdana`;
        }
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(value, xStart + 10 + shiftX, yStart + shiftY + 25);
        ctx.font = 'bold 9px Verdana';
        ctx.fillText(text, xStart + 10 + shiftX, yStart + shiftY + 38);
        ctx.restore();
    }

    _drawValuePoint(ctx, strokeColor, x, y, options) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        let circleFillColor = options.dayMode.circleFillColor;
        if (this.mode) {
            circleFillColor = options.nightMode.circleFillColor
        }
        ctx.fillStyle = circleFillColor;
        const xRightEdge = options.chartWidth - 1;
        if (x + 3 >= xRightEdge) {
            ctx.arc(x - 6, y - 3, 6, 0, 2 * Math.PI);
        } else {
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    _drawValuesLine(ctx, drawData, options) { 
        ctx.save();       
        ctx.beginPath();
        ctx.moveTo(drawData.x, drawData.yStart);
        ctx.lineTo(drawData.x, drawData.yEnd - 15);
        ctx.lineWidth = 2;
        let strokeStyle = options.dayMode.lineValuesColor;
        if(this.mode) {
            strokeStyle = options.nightMode.lineValuesColor;
        }
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        ctx.restore();
    }
}

class ChartsInitalizer {
    constructor() {
        this.oldWidth = 0;
        this.width = 0;
        this.timeOutTime = 100;
        this.chartsData = null;
    }

    startUp() {
        fetch('./data/chart_data.json').then(res => res.json()).then((chartsData) => {
            this.chartsData = chartsData;
            
            this._setResizeEvent();
            
            this._resizeEvent();
        });
    }

    _setResizeEvent() {
        window.onresize = this._resizeEvent.bind(this, this.chartsData);
    }

    _resizeEvent() {
        setTimeout(this._timeOutResizer.bind(this), this.timeOutTime);
    }


    _timeOutResizer() {
        this.width = document.body.offsetWidth;

        let offsetX, offsetY;

        offsetY = 80;

        if (this.width > 500) {
            this.width = 500;
            offsetX = 40;
        } else {
            this.width -= 20;
            offsetX = 10;
        }

        if (this.width !== this.oldWidth) {
            const initChartData = {
                chartDrawingOptions: {
                    offsetX,
                    offsetY,
                    chartWidth: this.width,
                    chartHeight: this.width
                },
                generalChartDrawingOptions: {
                    chartWidth: this.width,
                    chartHeight: 50,
                    detailedChart: false
                },
                chartName: {
                    title: 'My Chart',
                    font: 'bold 16px Verdana',
                    dayMode: {
                        fontColor: '#000000'
                    },
                    nightMode: {
                        fontColor: '#FFFFFF'
                    }
                },
                axis: {
                    fontColor: '#96A2AA',
                    axisColor: '#DFE6EB',
                    font: '10px Verdana'
                },
                detailedInfo: {
                    dayMode: {
                        lineValuesColor: '#DFE6EB',
                        circleFillColor: '#FFFFFF',
                        dateInfoColor: '#000000',
                        windowColor: '#FFFFFF',
                        borderWindowColor: '#E6ECF0'
                    },
                    nightMode: {
                        lineValuesColor: '#96A2AA',
                        circleFillColor: '#242F3E',
                        dateInfoColor: '#FFFFFF',
                        windowColor: '#242F3E',
                        borderWindowColor: '#000000'
                    }
                }
            }

            const app = document.getElementById("app");

            for (const [idx, chartData] of this.chartsData.entries()) {
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

            this.oldWidth = this.width;
        }
    }
}

new ChartsInitalizer().startUp();



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
