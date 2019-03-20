const windowSizerWrapper = document.getElementById('window-sizer-wrapper');
const windowSizer = document.getElementById('window-sizer');
const sizerRight = document.querySelector('.sizer-right');
const sizerLeft = document.querySelector('.sizer-left');

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
    }

    const onMouseUp = () => {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

windowSizer.ondragstart = () => {return false;};
