define(function () {
    var __rkeys = {
        "a.z": "K",
        "a,z": "L",
        "a?z": "M",
        "a;z": "N",
        "a:z": "O",
        "a'z": "P",
        'a"z': "Q",
        "a\\z": "R",
        "a+z": "S",
        "a-z": "T",
        "a*z": "U",
        "a/z": "V",
        "a%z": "W",
        "a>z": "X",
        "a<z": "Y",
        "a=z": "Z",
        "a!z": "A",
        "a|z": "B",
        "a&z": "C",
        "a^z": "D",
        "a(z": "E",
        "a)z": "F",
        "a[z": "G",
        "a]z": "H",
        "a{z": "I",
        "a}z": "J",
        "a`z": "1",
        "a~z": "2",
        "a@z": "3",
        "a#z": "4",
        "a$z": "5",
        a_z: "6",
        "a z": "7"
    }, __getKeyCode = function (word) {
        return __rkeys["a" + word + "z"];
    };
    var _getName = function (name, action) {
        var action = (action || "cn").toUpperCase();
        switch (action) {
            case"ABBREVIATE":
                name = name.replace((/(cn=)?([^\/]*\/)((ou=)?([^\/]*\/))?((ou=)?([^\/]*\/))?o=([^\/]*)$/gi), "$2$5$8$9");
                break;
            case"CN":
            default:
                name = name.replace((/(cn=)?([^\/]*).*/gi), "$2");
        }
        return name;
    };
    var xhr = function (opts) {
        var isCors = (XMLHttpRequest && "withCredentials" in new XMLHttpRequest());
        if (window.ActiveXObject && (!isCors || opts.onlyie)) {
            opts.crossDomain = false;
            opts.xhr = function () {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            };
        } else {
            opts.crossDomain = true;
        }
        delete opts.onlyie;
        return $.ajax(opts);
    };
    var _wslist = {};
    var ws = function (opts) {
        var wsdl = opts.wsdl || opts.url;
        if (_wslist[wsdl]) {
            return _wslist[wsdl];
        }
        var soapFactory = function (url, soapaction, namesacpe, name, params, resname) {
            var bodyFactory = function () {
                var data;
                data = "";
                data = data + '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="' + namesacpe + '">';
                data += "<soapenv:Header/> ";
                data += "<soapenv:Body>";
                if (params) {
                    data = data + "<web:" + name + ">";
                    if (params.length) {
                        $.each(params, function (i, p) {
                            if (typeof p.value != "undefined") {
                                data += "<" + p.name + ">" + p.value + "</" + p.name + ">";
                            }
                        });
                    } else {
                        data += params.value;
                    }
                    data += "</web:" + name + ">";
                } else {
                    data += "<web:" + name + "/>";
                }
                data += "</soapenv:Body>";
                data += "</soapenv:Envelope>";
                return data;
            };
            var action = function () {
                $.each(arguments, function (i, v) {
                    if (typeof params == "string") {
                        params = {name: params, value: v};
                    }
                    if (params && params[i]) {
                        params[i].value = v;
                    }
                });
                var data = bodyFactory();
                var _p = $.extend({contentType: "application/x-www-form-urlencoded"}, opts);
                _p.wsdl = undefined;
                delete _p.wsdl;
                $.extend(_p, {
                    url: url, data: data, type: "POST", dataType: "text", beforeSend: function (xhr) {
                        try {
                            xhr.setRequestHeader("SOAPAction", soapaction);
                        } catch (e) {
                        }
                        return true;
                    }
                });
                return xhr(_p).pipe(function (strXml) {
                    strXml = strXml.replace(/<(\/)?[A-z0-9]*:/gi, "<$1");
                    strXml = $.trim(strXml);
                    var doc = $.parseXML(strXml);
                    var $xml = $(doc);
                    var res = $xml.find(resname).text();
                    switch (opts.dataType) {
                        case"json":
                            data = $.parseJSON(res);
                            break;
                        case"xml":
                            data = $.parseXML(res);
                            break;
                        default:
                            data = res;
                    }
                    return data;
                });
            };
            return action;
        };
        var factory = function (doc) {
            var as = {};
            if (typeof doc == "string") {
                doc = $.parseXML(doc);
            }
            var docWSDL = $(doc);
            var root = doc.lastChild;
            if (root.nodeType == 3) {
                root = doc.firstChild;
            }
            var ns = root.getAttribute("targetNamespace");
            var address = root.getElementsByTagName("address");
            address = address.length == 0 ? root.getElementsByTagName("wsdlsoap:address") : address;
            address = address.length == 0 ? root.getElementsByTagName("soap:address") : address;
            address = address ? address[0] : null;
            if (!address) {
                alert("WSDL解析错误！");
                return false;
            }
            var url = opts.location || address.getAttribute("location");
            var _messages = root.getElementsByTagName("message");
            _messages = _messages.length == 0 ? root.getElementsByTagName("wsdl:message") : _messages;
            messages = {};
            $.each(_messages, function (i, el) {
                var name = el.getAttribute("name");
                var part = el.getElementsByTagName("part");
                part = part.length == 0 ? el.getElementsByTagName("wsdl:part")[0] : part[0];
                messages[name] = typeof part == "undefined" ? "" : part.getAttribute("element").replace(/[A-z]*:/, "");
            });
            var _types = root.getElementsByTagName("types");
            _types = _types.length == 0 ? root.getElementsByTagName("wsdl:types")[0] : _types[0];
            var _schema = root.getElementsByTagName("schema");
            _schema = _schema.length == 0 ? root.getElementsByTagName("xsd:schema") : _schema;
            _schema = _schema.length == 0 ? root.getElementsByTagName("s:schema") : _schema;
            _schema = _schema ? _schema[0] : null;
            if (!_schema) {
                alert("WSDL 解析错误");
                return false;
            }
            var parameters = {};
            window._schema = _schema;
            var getParams = function (el, _schema) {
                var ns = _schema.getAttribute("targetNamespace") == "qualified" ? "web:" : "";
                var name = el.getAttribute("name");
                var paras = $(el).find("[name]").get();
                paras = paras.length == 0 ? el.getElementsByTagName("xsd:element") : paras;
                if (paras.length == 0) {
                    return ns + name;
                } else {
                    return $.map(paras, function (el) {
                        var type = el.getAttribute("type") || "";
                        type = type.replace(/[A-z]*:/, "");
                        return {name: ns + el.getAttribute("name"), type: type};
                    });
                }
            };
            if (_schema.childNodes.length == 1 && /import$/.test(_schema.childNodes[0].tagName)) {
                var _p = $.extend({}, opts, {async: false, url: _schema.childNodes[0].getAttribute("schemaLocation")});
                var doc = $(xhr(_p).responseXML);
                _schema = xhr(_p).responseXML.lastChild;
                for (var key in messages) {
                    var el = doc.find("[name=" + key + "]:last").get(0);
                    parameters[key] = getParams(el, _schema);
                }
            } else {
                $.each(_schema.childNodes, function (i, el) {
                    if (el.nodeType == 1) {
                        var name = el.getAttribute("name");
                        parameters[name] = getParams(el, _schema);
                    }
                });
            }
            var binding = root.getElementsByTagName("binding");
            binding = binding.length == 0 ? root.getElementsByTagName("wsdl:binding")[0] : binding[0];
            var soapActions = {};
            $.each(binding.childNodes, function (i, el) {
                if (el.nodeName && /([A-z]*:)?operation/.test(el.nodeName)) {
                    var name = el.getAttribute("name");
                    var _soapAction = el.getElementsByTagName("operation");
                    _soapAction = _soapAction.length == 0 ? el.getElementsByTagName("wsdlsoap:operation") : _soapAction;
                    _soapAction = _soapAction.length == 0 ? el.getElementsByTagName("soap:operation") : _soapAction;
                    _soapAction = _soapAction ? _soapAction[0] : null;
                    if (!_soapAction) {
                        alert("WSDL 解析错误");
                        return false;
                    }
                    soapActions[name] = _soapAction.getAttribute("soapAction");
                }
            });
            var portType = root.getElementsByTagName("portType");
            portType = portType.length == 0 ? root.getElementsByTagName("wsdl:portType")[0] : portType[0];
            var operation = portType.getElementsByTagName("operation");
            operation = operation.length == 0 ? portType.getElementsByTagName("wsdl:operation") : operation;
            $.each(operation, function (i, el) {
                var name = el.getAttribute("name");
                var input = el.getElementsByTagName("input");
                input = input.length == 0 ? el.getElementsByTagName("wsdl:input")[0] : input[0];
                var output = el.getElementsByTagName("output");
                output = output.length == 0 ? el.getElementsByTagName("wsdl:output")[0] : output[0];
                var reqname = input.getAttribute("message").replace(/[A-z]*:/, "");
                var resname = messages[output.getAttribute("message").replace(/[A-z]*:/, "")];
                var pname = messages[reqname];
                var params = parameters[pname];
                var soapaction = soapActions[name];
                as[name] = soapFactory(url, soapaction, ns, pname, params, resname);
            });
            return as;
        };
        var _p = $.extend({}, opts, {onlyie: opts.onlyie, url: wsdl, dataType: "text"});
        _p.wsdl = undefined;
        delete _p.wsdl;
        _wslist[wsdl] = xhr(_p).pipe(function (strXml) {
            var doc = $.parseXML(strXml);
            return factory(doc);
        }, function (e) {
            new Error(e);
        });
        return _wslist[wsdl];
    };
    var base64 = (function () {
        var _PADCHAR = "=", _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", _VERSION = "1.0";

        function _getbyte64(s, i) {
            var idx = _ALPHA.indexOf(s.charAt(i));
            if (idx === -1) {
                throw"Cannot decode base64";
            }
            return idx;
        }

        function _decode(s) {
            var pads = 0, i, b10, imax = s.length, x = [];
            s = String(s);
            if (imax === 0) {
                return s;
            }
            if (imax % 4 !== 0) {
                throw"Cannot decode base64";
            }
            if (s.charAt(imax - 1) === _PADCHAR) {
                pads = 1;
                if (s.charAt(imax - 2) === _PADCHAR) {
                    pads = 2;
                }
                imax -= 4;
            }
            for (i = 0; i < imax; i += 4) {
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6) | _getbyte64(s, i + 3);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255, b10 & 255));
            }
            switch (pads) {
                case 1:
                    b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6);
                    x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255));
                    break;
                case 2:
                    b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12);
                    x.push(String.fromCharCode(b10 >> 16));
                    break;
            }
            return x.join("");
        }

        function _getbyte(s, i) {
            var x = s.charCodeAt(i);
            if (x > 255) {
                throw"INVALID_CHARACTER_ERR: DOM Exception 5";
            }
            return x;
        }

        function _encode(s) {
            if (arguments.length !== 1) {
                throw"SyntaxError: exactly one argument required";
            }
            s = String(s);
            var i, b10, x = [], imax = s.length - s.length % 3;
            if (s.length === 0) {
                return s;
            }
            for (i = 0; i < imax; i += 3) {
                b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8) | _getbyte(s, i + 2);
                x.push(_ALPHA.charAt(b10 >> 18));
                x.push(_ALPHA.charAt((b10 >> 12) & 63));
                x.push(_ALPHA.charAt((b10 >> 6) & 63));
                x.push(_ALPHA.charAt(b10 & 63));
            }
            switch (s.length - imax) {
                case 1:
                    b10 = _getbyte(s, i) << 16;
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _PADCHAR + _PADCHAR);
                    break;
                case 2:
                    b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8);
                    x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _ALPHA.charAt((b10 >> 6) & 63) + _PADCHAR);
                    break;
            }
            return x.join("");
        }

        return {decode: _decode, encode: _encode, VERSION: _VERSION};
    }());
    var random = function (i) {
        i = i ? i > 14 ? 14 : i : 14;
        var r = String(Math.random() * Math.random()).substr(2);
        r = parseInt(r).toString(16);
        return r.length >= i ? r.substr(0, i) : util.random();
    };
    var uid = function (length) {
        var len = length || 32;
        var _random = "";
        var limit = len < 25 ? 1 : len < 36 ? 2 : len < 48 ? 3 : 4;
        for (var i = 0; i < limit; i++) {
            _random += random();
        }
        _random = parseInt((new Date()).getTime()).toString(16) + _random;
        if (len < 16) {
            return _random.toUpperCase().slice(-len);
        } else {
            return _random.toUpperCase().slice(0, len);
        }
    };
    var getremotemodule = function (url, options, cb) {
        var key = uid();
        var cbinfo = {module: key, cb: key, callback: key};
        if (cb) {
            cbinfo[cb] = key;
        }
        return $.ajax({dataType: "script", url: url, data: $.extend({}, cbinfo, options)}).pipe(function (script) {
            var def = new $.Deferred();
            require([key], function (data) {
                def.resolve(data);
            });
            setTimeout(function () {
                def.reject("数据加载超时");
            }, 15000);
            return def;
        });
    };
    var util = {
        getjsonp: getremotemodule,
        base64: base64,
        xhr2: xhr,
        ajax: xhr,
        ws: ws,
        mixin: function (obj1, obj2, flag) {
            var i, _obj;
            _obj = flag ? {} : obj1;
            for (i in obj2) {
                if (obj1[i] && typeof obj2[i] == "object") {
                    _obj[i] = $.mixin(obj1[i], obj2[i]);
                } else {
                    _obj[i] = obj2[i];
                }
            }
            return _obj;
        },
        xmlToString: function (xmlData) {
            var xmlString = undefined;
            if (window.ActiveXObject) {
                xmlString = xmlData.xml;
            }
            if (xmlString === undefined) {
                var oSerializer = new XMLSerializer();
                xmlString = oSerializer.serializeToString(xmlData);
            }
            return xmlString;
        },
        parseJSON: function (json) {
            return (new Function("return " + json))();
        },
        toJSON: function (obj) {
            var str = "";
            if ($.isArray(obj)) {
                str += "[";
                var arr = [];
                for (var i = 0; i < obj.length; i++) {
                    arr.push(util.toJSON(obj[i]));
                }
                str += arr.join(",");
                str += "]";
            } else {
                if ($.isPlainObject(obj)) {
                    str += "{";
                    var arr = [];
                    for (name in obj) {
                        arr.push('"' + name + '":' + util.toJSON(obj[name]));
                    }
                    str += arr.join(",");
                    str += "}";
                    return str;
                } else {
                    var objStr = Object.prototype.toString.call(obj).replace(/(.*HTML).*(Element)/, "$1$2");
                    switch (objStr) {
                        case"[object String]":
                            return '"' + obj.replace(/([\\\"])/g, "\\$1").replace(/[\n\r\t]/g, function () {
                                    var a = arguments[0];
                                    return (a == "\n") ? "\\n" : (a == "\r") ? "\\r" : (a == "\t") ? "\\t" : "";
                                }) + '"';
                            break;
                        case"[object Number]":
                        case"[object Null]":
                        case"[object Undefined]":
                        case"[object Boolean]":
                        case"[object RegExp]":
                            return String(obj);
                            break;
                        case"[object Date]":
                            return "new Date(" + obj.getTime() + ")";
                            break;
                        case"[object Object]":
                            if (obj === null) {
                                return String(obj);
                            }
                            return '"' + String(obj) + '"';
                            break;
                        case"[object Function]":
                            var name = obj.name;
                            if (typeof name == "undefined") {
                                try {
                                    name = obj.toString().match(/function\s(.*)\(/)[1];
                                } catch (e) {
                                    name = "";
                                }
                            }
                            if (name) {
                                if (window[name]) {
                                    return name;
                                } else {
                                    if (document[name]) {
                                        return "document." + name;
                                    } else {
                                        if (Math[name]) {
                                            return "Math." + name;
                                        } else {
                                            if (!/native code/.test(obj.toString())) {
                                                return String(obj);
                                            } else {
                                                return '"[object Function] Function' + name + '"';
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (!/native code/.test(obj.toString())) {
                                    return String(obj);
                                } else {
                                    return '"[object Function]"';
                                }
                            }
                            break;
                        default:
                            return "undefined";
                    }
                }
            }
            return str;
        },
        getName: function (names, action) {
            var action = (action || "cn").toUpperCase();
            if ($.isArray(names)) {
                $.map(names, function (name) {
                    return _getName(names, action);
                });
            } else {
                return _getName(names, action);
            }
        },
        formatdatetime: function (datetime) {
            var reg;
            if (datetime.match(/T/i) == null) {
                reg = /(\d{4})\D?(\d{2})\D?(\d{2})(.?)(.?)(.?)(.?)(.?)/;
            } else {
                reg = /(\d{0,4})\D?(\d{0,2})\D?(\d{0,2})T(\d{2})\D?(\d{2})\D?(\d{2}),?\d{0,2}([+-]?)(\d{0,2})/;
            }
            var i, _date, _time, _d = datetime.match(reg);
            _date = _d.slice(1, 4).join("-");
            _time = _d.slice(4, 7).join(":");
            return _d[1] == "" ? _time : _d[4] == "" ? _date : _date + " " + _time;
        },
        toDate: function (s) {
            var date = new Date(s);
            if (!isNaN(date)) {
                return date;
            }
            var reg = /(\d{4})[\D]?(\d{1,2})[\D]?(\d{1,2})[\D]*(?:(\d{1,2})\D?(\d{1,2})(?:\D?(\d{1,2}))?)?/;
            var a = s.replace(reg, function (a, y, m, d, h, mm, s) {
                return y + "," + ((m - 1)) + "," + d + "," + (h || "0") + "," + (mm || "0") + "," + (s || "0");
            }).split(",");
            if (a.length == 1) {
                reg = /^((?:0?[1-9])|(?:1[0-2]))\/([0-3]?[0-9])\/(\d{4})(?:\D+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/;
                a = s.replace(reg, function (a, m, d, y, h, mm, s) {
                    if (/en-US/i.test(window.navigator.language || window.navigator.systemLanguage)) {
                        var _d = m, m = d, d = _d;
                    }
                    return y + "," + ((m - 1)) + "," + d + "," + (h || "0") + "," + (mm || "0") + "," + (s || "0");
                }).split(",");
            }
            return new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
        },
        getcookie: function (cookiename) {
            var _reg = new RegExp(cookiename + "=([^=]*)(;|$)", "i");
            var _info = _reg.exec(document.cookie);
            return _info && _info[1];
        },
        getKeyCode: function (word) {
            return __getKeyCode(word);
        },
        strToKey: function (str) {
            return typeof str != "string" ? str : encodeURIComponent(str.replace(/[\`\~\!\@\#\$\%\^\&\*\(\)\_\+\-\=\{\}\[\]:\"\|\;'\\\<\>\?,\.\/\s]/g, __getKeyCode)).replace(/\%/g, "");
        },
        urlcom: function (_url) {
            _url = _url || window.location.href;
            var reg = _urlobj = {};
            return _urlobj;
        },
        isIE6: ($.browser.msie && parseInt($.browser.version) < 7) || document.compatMode == "BackCompat",
        translateStr: function (str, i18n, obj, flag) {
            if (!i18n) {
                return str;
            }
            var langflag = str.match(/\$\{[A-Za-z0-9_\s,，\.。、]+\}/gi);
            if (langflag) {
                for (var j = 0; j < langflag.length; j++) {
                    if (str.replace) {
                        var lang = langflag[j].replace(/[\$\{\}]/g, "").replace(/(^\s)|(\s$)/g, "");
                        var langRep = "";
                        if (i18n[lang]) {
                            langRep = i18n[lang];
                        } else {
                            if (flag) {
                                langRep = lang;
                            } else {
                                langRep = langflag[j];
                            }
                        }
                        str = str.replace(langflag[j], langRep);
                    }
                }
            }
            if (obj) {
                for (var i in obj) {
                    str = str.replace(new RegExp("\\$" + i), obj[i]);
                }
            }
            return str;
        },
        translate: function (model, selector, type, obj) {
            var _self = $(selector);
            var deferred = new jQuery.Deferred();

            function _translate(str, i18n) {
                return util.translateStr(str, i18n, obj);
            }

            function _translateEL(node, i18n) {
                var cnode = node.childNodes;
                for (i in cnode) {
                    if (cnode[i].nodeType == 1) {
                        if (cnode[i].type && cnode[i].type == "button") {
                            cnode[i].value = _translate(cnode[i].value, i18n);
                        }
                        if (cnode[i].title && cnode[i].title != "") {
                            cnode[i].title = _translate(cnode[i].title, i18n);
                        }
                    }
                    if (cnode[i].nodeType == 3 && cnode[i].data) {
                        cnode[i].data = _translate(cnode[i].data, i18n);
                    }
                }
            }

            require([(type || "i18n") + "!" + model], function (i18n) {
                _self.each(function (i, el) {
                    _translateEL(el, i18n);
                    $(el).find("span,p,th,td,tr,font,div,a,li,option,").each(function (i, node) {
                        _translateEL(node, i18n);
                    });
                    $(el).find(".lang").each(function (i, node) {
                        if ($(node).find("option").length > 0) {
                            $(node).find("option").each(function (i, option) {
                                option.innerHTML = _translate(option.innerHTML, i18n) || option.innerHTML;
                            });
                        } else {
                            node.innerHTML = i18n[node.innerHTML] || node.innerHTML;
                        }
                    });
                });
                deferred.resolve();
                return deferred;
            });
            return deferred;
        },
        isNotesBox: function () {
            var notes = navigator.userAgent.match(/lotus/gi);
            if (notes) {
                return true;
            }
            return false;
        },
        uid: uid,
        unique: function (arr) {
            var o = {};
            arr.sort();
            for (var i = arr.length - 1; i >= 0; i--) {
                o[arr[i]] ? (arr.splice(i, 1)) : o[arr[i]] = 1;
            }
            return arr;
        },
        trigger: function (selector, eventname, args) {
            var Event;
            if (typeof eventname == "string") {
                Event = $.Event(eventname);
            } else {
                Event = eventname;
            }
            Event.results = [];
            Event.results.push = function () {
                var res, args = arguments;
                if (typeof args[0] == "function") {
                    var def = this.length == 0 ? true : this[this.length - 1];
                    res = $.when(def).pipe(function (flag) {
                        if (!flag) {
                            return false;
                        }
                        if (args.length == 3) {
                            return args[0].apply(args[1], args[2]);
                        } else {
                            if (args.length == 2) {
                                if ($.isArray(args[1])) {
                                    return args[0].apply(window, args[1]);
                                } else {
                                    return args[0].call(args[1]);
                                }
                            } else {
                                return args[0]();
                            }
                        }
                    });
                } else {
                    res = args[0];
                }
                Array.prototype.push.call(this, res);
            };
            $(selector).one(Event.type, function (e) {
                var res = $.isArray(e.result) ? e.result : [e.result];
                $.each(res, function (i, r) {
                    if (typeof r != "undefined") {
                        Event.results.push(r);
                    }
                });
            });
            $(selector).trigger(Event, args);
            return $.when.apply($, Event.results).pipe(function () {
                var flag = true;
                $.each(arguments, function (i, arg) {
                    if (arg === false) {
                        flag = false;
                    }
                });
                return flag;
            });
        },
        random: random,
        warnrep: function (name, repname) {
            if (typeof console != "undefined" && typeof console.warn != "undefined") {
                console.warn(name + " 已经被废弃，请使用" + repname + "代替");
            }
        },
        warn: function (name, repname) {
            if (typeof console != "undefined" && typeof console.warn != "undefined") {
                console.warn(Array.prototype.join.call(arguments, " "));
            }
        },
        error: function (err) {
            throw err;
            return;
            if (err.requireModules) {
                $.each(err.requireModules, function (i, errm) {
                    if (typeof console != "undefined" && typeof console.warn != "undefined") {
                        throw err;
                    } else {
                        require(["widget/jbox"], function (jbox) {
                            jbox(err.stack.replace(/\n/, "<br>"), {title: "模块" + errm + ":" + err.message, width: 800});
                        });
                    }
                    requirejs.undef(errm);
                });
            } else {
                if (typeof console != "undefined" && typeof console.warn != "undefined") {
                    throw err;
                } else {
                    throw err;
                    require(["widget/jbox"], function (jbox) {
                        jbox(err.stack.replace(/\n/, "<br>"), {title: "模块" + errm + ":" + err.message, width: 800});
                    });
                }
            }
        },
        getBytesCount: function (str) {
            if (str == null || str == undefined) {
                return 0;
            } else {
                return (str.length + str.replace(/[\u0000-\u00ff]/g, "").length);
            }
        },
        winclose: function (refresh) {
            if (typeof window.postMessage != "undefined") {
                if (window.parent) {
                    try {
                        window.parent.postMessage("childwindowclose", "*");
                    } catch (e) {
                    }
                }
            }
            var close = function () {
                if (!this.isNotesBox) {
                    window.opener = null;
                    window.open("", "_self");
                }
                window.top.close();
            };
            if (refresh) {
                try {
                    if (window.opener) {
                        if (window.opener.refreshPortletList && window.opener.refreshPortletList.todo) {
                            window.opener.refreshPortletList.todo();
                        } else {
                            window.opener.location = window.opener.location;
                        }
                    }
                } catch (e) {
                    try {
                        document.domain = "xxx.com.cn";
                        if (window.opener) {
                            if (window.opener.refreshPortletList && window.opener.refreshPortletList.todo) {
                                window.opener.refreshPortletList.todo();
                            } else {
                                window.opener.location = window.opener.location;
                            }
                        }
                    } catch (e) {
                    }
                } finally {
                    close();
                }
            } else {
                close();
            }
        },
        getDefsPromise: function (defs) {
            var def = new $.Deferred();
            return $.when.apply($, defs).pipe(function () {
                var res = [];
                $.each(arguments, function (i, item) {
                    res = res.concat(item);
                });
                return res;
            });
            return def;
            var i, defs, res;
            if (arguments.length == 1) {
                defs = arguments[0];
                i = defs.length - 1;
                res = [];
            } else {
                i = arguments[0];
                defs = arguments[1];
                res = arguments[2];
            }
            var _self = this;
            var def = defs[i];
            return def.pipe(function (data) {
                data = $.map(data, function (item, i) {
                    item.__store__ = def.__store__;
                    return item;
                });
                res = res.concat(data);
                if (i == 0) {
                    return res;
                } else {
                    return _self.getDefsPromise(i - 1, defs, res);
                }
            });
        }
    };
    return util;
});