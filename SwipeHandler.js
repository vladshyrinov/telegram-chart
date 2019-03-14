function SwipeHandler(options) {

    /* GETTING OBJECT PROPERTIES START */

    var container = options.container;
    var swipeLeft = options.swipeLeft || null;
    var swipeRight = options.swipeRight || null;
    var swipeTop = options.swipeTop || null;
    var swipeDown = options.swipeDown || null;
    var swipePercentWidth = options.swipePercentWidth || null;
    var swipePercentHeight = options.swipePercentHeight || null;

    /* GETTING OBJECT PROPERTIES END */

    /* WORK VARIABLES DEFINITION START */

    var slide = container.getElementsByClassName("slide")[0];
    var slideWidth = slide.clientWidth;
    var slideHeight = slide.clientHeight;
    var thresholdWidth = swipePercentWidth ? slideWidth * swipePercentWidth / 100 : slideWidth * 0.2;
    var thresholdHeight = swipePercentHeight ? slideHeight * swipePercentHeight / 100 : slideHeight * 0.2;
    var startX;
    var startY;
    var containerElements = [].slice.call(container.getElementsByTagName("*"));
    var slides = container.getElementsByClassName("slide");
    var slidesCount = slides.length;

    /* WORK VARIABLES DEFINITION END */

    /* CANCELLATION OF CONTAINER ELEMENTS DRAG POSIBILITY START */

    containerElements.forEach(function (element) {
        element.ondragstart = function (event) {
            return false;
        };
    });

    /* CANCELLATION OF CONTAINER ELEMENTS DRAG POSIBILITY END */


    /* ASSIGNING THE SLIDES' INDEXES START */

    for (var i = 0; i < slides.length; i++) {
        slides[i].setAttribute("data-idx", i);
    }

    /* ASSIGNING THE SLIDES' INDEXES START */


    /* SWIPE DIRECTION LOGIC START */

    container.style.position = "relative";

    function touchStartHandler(event) {
            startX = event.clientX || event.touches[0].clientX;
            startY = event.clientY || event.touches[0].clientY;
            var target = event.target;
            var children = [].slice.call(container.children);
            children.forEach(function (child) {
                if (child.getAttribute("class").indexOf("active_slide") !== -1) {
                    while (target != container) {
                        if (target == child) {
                            container.addEventListener('touchmove', touchMoveHandler);
                            break;
                        }
                        target = target.parentNode;
                    }
                }
            });
    }

    container.addEventListener("touchstart", touchStartHandler);

    container.addEventListener("touchend", function (event) {
        container.removeEventListener('touchmove', touchMoveHandler);
    });

    function touchMoveHandler(event) {
        var currentX = event.clientX || event.touches[0].clientX;
        var currentY = event.clientY || event.touches[0].clientY;
        var Xdiff = startX - currentX;
        var Ydiff = startY - currentY;
        if (Math.abs(Xdiff) > Math.abs(Ydiff)) {
            if (Xdiff > 0 && Math.abs(Xdiff) > thresholdWidth) {
                if (swipeLeft) {
                    swipeLeft(container, slides, event);
                    container.removeEventListener('touchmove', touchMoveHandler);
                }
            }
            if (Xdiff < 0 && Math.abs(Xdiff) > thresholdWidth) {
                if (swipeRight) {
                    swipeRight(container, slides, event);
                    container.removeEventListener('touchmove', touchMoveHandler);
                }
            }
        } else {
            if (Ydiff > 0 && Math.abs(Ydiff) > thresholdHeight) {
                if (swipeTop) {
                    swipeTop(container, slides, event);
                    container.removeEventListener('touchmove', touchMoveHandler);
                }
            }
            if (Ydiff < 0 && Math.abs(Ydiff) > thresholdHeight) {
                if (swipeDown) {
                    swipeDown(container, slides, event);
                    container.removeEventListener('touchmove', touchMoveHandler);
                }
            }
        }
    }

    /* SWIPE DIRECTION LOGIC END */
}
