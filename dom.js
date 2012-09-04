define([
    'exports',
    'qwery',
    'bean',
    './lib/html'
],
function (exports, qwery, bean, html) {

    exports.init = function () {
        return {};
    };

    exports.receive = function (process, from, msg, state) {
        if (msg.text) {
            var els = exports.getElements(document, msg);
            for (var i = 0; i < els.length; i++) {
                els[i].innerText = msg.text;
                els[i].textContent = msg.text;
            }
        }
        else if (msg.html) {
            var str = msg.html;
            if (typeof str !== 'string') {
                str = html.stringify(str);
            }
            var els = exports.getElements(document, msg);
            for (var i = 0; i < els.length; i++) {
                els[i].innerHTML = str;
            }
        }
        else if (msg.bind) {
            for (var i = 0; i < msg.bind.length; i++) {
                var ev = msg.bind[i];
                var els = qwery(ev[1], document);
                for (var j = 0; j < els.length; j++) {
                    var el = els[j];
                    bean.add(el, ev[0], function (e) {
                        e.preventDefault();
                        var emsg = { type: e.type, data: ev[2] };
                        if (e.target.tagName === 'FORM') {
                            emsg.values = exports.formValues(e.target);
                        }
                        process.send(from, { event: emsg });
                        return false;
                    });
                }
            }
        }
        else {
            process.send(from, {error: 'Unknown message', msg: msg});
        }
        return state;
    };

    exports.formValues = function (el) {
        var els = qwery('input[name], textarea[name], select[name]', el);
        var values = [];
        for (var i = 0; i < els.length; i++) {
            values.push([els[i].name, els[i].value]);
        }
        return values;
    };

    exports.getElements = function (document, msg) {
        if (msg.id) {
            return [document.getElementById(msg.id)];
        }
        if (msg.selector) {
            return qwery(msg.selector, document);
        }
        return [];
    };

});
