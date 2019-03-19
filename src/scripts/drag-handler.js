const windowSizerWrapper = document.getElementById('window-sizer-wrapper');
const windowSizer = document.getElementById('window-sizer');
const sizerRight = document.querySelector('.sizer-right');
const sizerLeft = document.querySelector('.sizer-left');


// let clientX;
// let offsetX;

// function moveAt(e) {
//     const target = e.target;

//     const windowSizerWrapperWidth = windowSizerWrapper.clientWidth;
//     const windowSizerWidth = windowSizer.clientWidth;
//     const distanceToMove = windowSizerWrapperWidth - windowSizerWidth;

//     if (target === windowSizer) {
//         console.log('windowSizer');
//         if(e.clientX > clientX) {
//             if(windowSizer.offsetLeft < distanceToMove) {
//                 windowSizer.style.left = e.pageX + 10 + 'px';
//             }
//             clientX = e.clientX;
//         } else {
//             if (windowSizer.offsetLeft > 0) {
//                 windowSizer.style.left = e.pageX - 10 + 'px';
//             }
//             clientX = e.clientX;
//         }
//     } else if (target === sizerRight) {
//         console.log('sizerRight');
//         // if (e.clientX > clientX && windowSizerWidth <= windowSizerWrapperWidth) {
//         //     console.log('if');
//         //     windowSizer.style.width = windowSizerWidth + (e.clientX - windowSizerWidth - 20) + 'px';
//         // } else if (e.clientX < clientX && windowSizerWidth >= 100) {
//         //     // windowSizer.style.width = windowSizerWidth - (e.clientX - windowSizerWidth - 20);
//         // }
//     } else {
//         console.log('sizerLeft');
//     }

// }






// let startEvent;
// const windowSizerWrapperWidth = windowSizerWrapper.clientWidth;
// const windowSizerWrapperCoords = windowSizerWrapper.getBoundingClientRect();
// let windowSizerWidth = windowSizer.clientWidth;
// let distanceToMove = windowSizerWrapperWidth - windowSizerWidth;


// const onSizerMove = (e) => {
//     // const target = startEvent.target;
//     // const offsetX = startEvent.offsetX;
//     // const pageX = startEvent.pageX;
    
//     if (target === windowSizer) {
//         console.log('windowSizer');
//         const windowSizerCoords = windowSizer.getBoundingClientRect();
//         // if (e.pageX - offsetX + windowSizerCoords.width <= windowSizerWrapperCoords.width &&
//         //     e.pageX - offsetX + windowSizerWrapperCoords.left >= windowSizerWrapperCoords.left) {
//         //     windowSizer.style.left = (e.pageX - offsetX) + 'px';
//         // } else {
//         //     if ((windowSizerWrapperCoords.right - windowSizerCoords.right) <= (windowSizerWidth / 25) && e.pageX > pageX) {
//         //         console.log('work right');
//         //         windowSizer.style.left = windowSizerWrapperCoords.width - windowSizerCoords.width + 'px';
//         //     }

//         //     if ((windowSizerCoords.left - windowSizerWrapperCoords.left) <= (windowSizerWidth / 25) && e.pageX < pageX) {
//         //         console.log('work left');
//         //         windowSizer.style.left = '0px';
//         //     }
//         // }


//     } else if (target === sizerRight) {
//         console.log('sizerRight');
//     } else {
//         console.log('sizerLeft');
//     }
// }

// const onSizerUp = (e) => {
//     console.log('mouseup event', e);

//     document.removeEventListener('mousemove', onSizerMove);
//     document.removeEventListener('mouseup', onSizerUp);
//     // windowSizer.removeEventListener('mouseleave', onSizerUp);
// }

// const onSizerStart = (e) => {
//     e.preventDefault();
//     console.log('mousedown event', e);

//     startEvent = e;

//     document.addEventListener('mousemove', onSizerMove);
//     document.addEventListener('mouseup', onSizerUp);
//     // windowSizer.addEventListener('mouseleave', onSizerUp);
// }

// windowSizer.ondragstart = () => { return false; };

// windowSizer.addEventListener('mousedown', onSizerStart);


// windowSizer.onmousedown = (e) => {
//     clientX = e.clientX;
//     console.log(e);
//     offsetX = e.offsetX;
//     windowSizer.addEventListener('mousemove', moveAt);

//     windowSizer.onmouseup = (e) => {
//         windowSizer.removeEventListener('mousemove', moveAt);
//         windowSizer.onmouseup = null;
//     }
// }


windowSizer.onmousedown = function (event) {
    event.preventDefault(); // prevent selection start (browser action)

    let shiftX = event.clientX - windowSizer.getBoundingClientRect().left;
    // shiftY not needed, the thumb moves only horizontally

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(event) {
        let newLeft = event.clientX - shiftX - windowSizerWrapper.getBoundingClientRect().left;

        // the pointer is out of windowSizerWrapper => lock the thumb within the bounaries
        if (newLeft < 0) {
            newLeft = 0;
        }
        let rightEdge = windowSizerWrapper.offsetWidth - windowSizer.offsetWidth;
        if (newLeft > rightEdge) {
            newLeft = rightEdge;
        }

        windowSizer.style.left = newLeft + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
    }

};

windowSizer.ondragstart = function () {
    return false;
};
