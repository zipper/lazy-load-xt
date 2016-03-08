/*! Lazy Load XT v1.1.0 2016-03-08
 * http://ressio.github.io/lazy-load-xt
 * (C) 2016 RESS.io
 * Licensed under MIT */

(function ($, window, document, undefined) {
    var options = $.lazyLoadXT,
        documentElement = document.documentElement,
        srcsetSupport = (function () {
            return 'srcset' in (new Image());
        })(),
        reUrl = /^\s*(\S+)/,
        reWidth = /\S\s+(\d+)w/,
        reDpr = /\S\s+([\d\.]+)x/,
        infty = [0, Infinity],
        one = [0, 1],
        srcsetOptions = {
            srcsetAttr: 'data-srcset',
            srcsetExtended: true,
            srcsetBaseAttr: 'data-srcset-base',
            srcsetExtAttr: 'data-srcset-ext'
        },
        viewport = {
            w: 0,
            x: 0
        },
        property,
        limit;

    for (property in srcsetOptions) {
        if (options[property] === undefined) {
            options[property] = srcsetOptions[property];
        }
    }
    options.selector += ',img[' + options.srcsetAttr + ']';

    function mathFilter(array, action) {
        return Math[action].apply(null, $.map(array, function (item) {
            return item[property];
        }));
    }

    function compareMax(item) {
        return item[property] >= viewport[property] || item[property] === limit;
    }

    function compareMin(item) {
        return item[property] === limit;
    }

    function splitSrcset(srcset) {
        return srcset.replace(/^\s+|\s+$/g, '').replace(/(\s+[\d\.]+[wx]),\s*|\s*,\s+/g, '$1 @,@ ').split(' @,@ ');
    }

    function parseSrcset($el) {
        var srcset = $el.attr(options.srcsetAttr);

        if (!srcset) {
            return false;
        }

        var list = $.map(splitSrcset(srcset), function (item) {
            return {
                url: reUrl.exec(item)[1],
                w: parseFloat((reWidth.exec(item) || infty)[1]),
                x: parseFloat((reDpr.exec(item) || one)[1])
            };
        });

        if (!list.length) {
            return false;
        }

        viewport = {
            w: window.innerWidth || documentElement.clientWidth,
            x: window.devicePixelRatio || 1
        };

        var wx,
            src;

        for (wx in viewport) {
            property = wx;
            limit = mathFilter(list, 'max');
            list = $.grep(list, compareMax);
        }

        for (wx in viewport) {
            property = wx;
            limit = mathFilter(list, 'min');
            list = $.grep(list, compareMin);
        }

        src = list[0].url;

        if (options.srcsetExtended) {
            src = ($el.attr(options.srcsetBaseAttr) || '') + src + ($el.attr(options.srcsetExtAttr) || '');
        }

        return src;
    }
    $.lazyLoadXT.parseSrcset = parseSrcset;

    $(document).on('lazyshow', 'img', function (e, $el) {
        var srcset = $el.attr(options.srcsetAttr);

        if (srcset) {
            if (srcsetSupport) {
                if (options.srcsetExtended) {
                    srcset = $.map(splitSrcset(srcset), function (item) {
                        var i = item.indexOf(' ');
                        if (i < 0) {
                            i = item.length;
                        }
                        return ($el.attr(options.srcsetBaseAttr) || '') + item.substr(0, i) + ($el.attr(options.srcsetExtAttr) || '') + item.substr(i);
                    }).join(', ');
                }
                $el.attr('srcset', srcset);
            } else {
                $el.lazyLoadXT.srcAttr = parseSrcset;
            }
        }
    });

})(window.jQuery || window.Zepto || window.$, window, document);
