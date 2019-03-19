const windowSizerWrapper = document.getElementById('window-sizer-wrapper');
const windowSizer = document.getElementById('window-sizer');
const sizerRight = document.querySelector('.sizer-right');
const sizerLeft = document.querySelector('.sizer-left');

windowSizer.onmousedown = (event) => {
    event.preventDefault();

    const shiftXLeft = event.clientX - windowSizer.getBoundingClientRect().left;
    const shiftXRight = windowSizer.getBoundingClientRect().right - event.clientX; 
    const target = event.target;

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

            const widthMiminum = windowSizerWrapper.getBoundingClientRect().width / 10;

            if (newWidth < widthMiminum) {
                newWidth = widthMiminum;
            }

            const maxWidth = windowSizerWrapper.getBoundingClientRect().width - (windowSizer.getBoundingClientRect().left - windowSizerWrapper.getBoundingClientRect().left);

            if (newWidth > maxWidth) {
                newWidth = maxWidth;
            }

            windowSizer.style.width = newWidth + 'px';
        } else {
            const previousLeft = windowSizer.getBoundingClientRect().left;
            windowSizer.style.left = event.clientX - shiftXLeft - windowSizerWrapper.getBoundingClientRect().left + 'px';
            const currentLeft = windowSizer.getBoundingClientRect().left;
            const leftDifference = (currentLeft - previousLeft);
            windowSizer.style.width = windowSizer.getBoundingClientRect().width - leftDifference + 'px';

            const rightEdge = windowSizerWrapper.getBoundingClientRect().left;


            const widthDiff = windowSizerWrapper.getBoundingClientRect().width - windowSizer.getBoundingClientRect().width;

            if (windowSizer.getBoundingClientRect().left < rightEdge) {
                windowSizer.style.left = 0 + 'px';
                console.log(rightEdge);
                windowSizer.style.width = windowSizerWrapper.getBoundingClientRect().width - widthDiff + 'px';
            }
        }
    }

    const onMouseUp = () => {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

};

windowSizer.ondragstart = () => {return false;};
