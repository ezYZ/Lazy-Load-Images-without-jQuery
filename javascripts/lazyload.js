/*!
 * Lazy Load Images without jQuery
 * http://kaizau.github.com/Lazy-Load-Images-without-jQuery/
 *
 * Original by Mike Pulaski - http://www.mikepulaski.com
 * Modified by Kai Zau - http://kaizau.com
 */
(function () {
    "use strict";

    var addEventListener = window.addEventListener || function (n, f) { window.attachEvent('on' + n, f); },
        removeEventListener = window.removeEventListener || function (n, f) { window.detachEvent('on' + n, f); },
        lazyLoader = {};

    lazyLoader = {
        cache: [],
        mobileScreenSize: 500,
        //tinyGif: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',

        addObservers: function () {
            addEventListener('scroll', lazyLoader.throttledLoad);
            addEventListener('resize', lazyLoader.throttledLoad);
        },

        removeObservers: function () {
            removeEventListener('scroll', lazyLoader.throttledLoad, false);
            removeEventListener('resize', lazyLoader.throttledLoad, false);
        },

        throttleTimer: new Date().getTime(),

        throttledLoad: function () {
            var now = new Date().getTime();
            if ((now - lazyLoader.throttleTimer) >= 200) {
                lazyLoader.throttleTimer = now;
                lazyLoader.loadVisibleImages();
            }
        },

        // For IE7 compatibility
        // Adapted from http://www.quirksmode.org/js/findpos.html
        getOffsetTop: function (el) {
            var val = 0;
            while (el.offsetParent) {
                val += el.offsetTop;
                el = el.offsetParent;
            }
            return val;
        },

        loadVisibleImages: function () {
            var scrollY = window.pageYOffset || document.documentElement.scrollTop,
                pageHeight = window.innerHeight || document.documentElement.clientHeight,
                range = {
                    min: scrollY - 200,
                    max: scrollY + pageHeight + 200
                },
                i = 0,
                onloadFunc = function () {
                    this.className = this.className.replace(/(^|\s+)lazy-load(\s+|$)/, '$1lazy-loaded$2');
                };

            while (i < lazyLoader.cache.length) {
                var image         = lazyLoader.cache[i],
                    imagePosition = lazyLoader.getOffsetTop(image),
                    imageHeight   = image.height || 0;

                if ((imagePosition >= range.min - imageHeight) && (imagePosition <= range.max)) {
                    var mobileSrc = image.getAttribute('data-src-mobile');

                    image.onload = onloadFunc.bind(image);

                    if (mobileSrc && screen.width <= lazyLoader.mobileScreenSize) {
                        image.src = mobileSrc;
                    } else {
                        image.src = image.getAttribute('data-src');
                    }

                    image.removeAttribute('data-src');
                    image.removeAttribute('data-src-mobile');

                    lazyLoader.cache.splice(i, 1);
                    continue;
                }

                i++;
            }

            if (lazyLoader.cache.length === 0) {
                lazyLoader.removeObservers();
            }
        },

        init: function () {
            // Patch IE7- (querySelectorAll)
            if (!document.querySelectorAll) {
                document.querySelectorAll = function (selector) {
                    var doc = document,
                        head = doc.documentElement.firstChild,
                        styleTag = doc.createElement('STYLE');
                    head.appendChild(styleTag);
                    doc.__qsaels = [];
                    styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
                    window.scrollBy(0, 0);
                    return doc.__qsaels;
                };
            }

            addEventListener('load', function lazyLoaderInit() {
                var imageNodes = document.querySelectorAll('img[data-src]');

                for (var i = 0; i < imageNodes.length; i++) {
                    lazyLoader.cache.push(imageNodes[i]);
                }

                lazyLoader.addObservers();
                lazyLoader.loadVisibleImages();

                removeEventListener('load', lazyLoaderInit, false);
            });
        }
    };

    lazyLoader.init();
}());
