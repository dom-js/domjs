/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-14
 * Time: 上午11:47
 * Names *
 * 2013-7-6 优化 selected 事件，无用户信息时也可以出发事件
 */
define(["jquery", "base/objectj", "m!widget/dropdown:1.0.0", "m!store/reststore:1.0.0", "i18n!nls/system", "appinfo", "base/util"], function ($, obj, dropdown, Store, i18n, appinfo, util) {
    var autoComplete = dropdown.sub();
    var SelectPanel = obj.sub();
    SelectPanel.fn.extend({
        main: function () {
            require(["css!form/names/1.0.0/default"]);
            this.__initPanel();
            this.__initEvent();
        },
        __copy: function () {
            var _self = this;
            var _txts = [];
            $.each(this.options.valuelist, function (i, item) {
                _txts.push(item[_self.options.valuefield]);
            });
            txt = _txts.join(",");
            if (window.clipboardData) {
                window.clipboardData.clearData();
                window.clipboardData.setData("Text", txt);
            } else {
                if (window.netscape) {
                    try {
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                    } catch (e) {
                        require(["widget/jbox"], function (jbox) {
                            var buttons = {};
                            buttons[i18n.OK] = 0;
                            jbox.alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将 'signed.applets.codebase_principal_support'设置为'true'<p>" + txt + "</p>", i18n.Tips, {buttons: buttons});
                        });
                    }
                    var clip = Components.classes["@mozilla.org/widget/clipboard;1"].createInstance(Components.interfaces.nsIClipboard);
                    if (!clip) {
                        return;
                    }
                    var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
                    if (!trans) {
                        return;
                    }
                    trans.addDataFlavor("text/unicode");
                    var str = new Object();
                    var len = new Object();
                    var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
                    var copytext = txt;
                    str.data = copytext;
                    trans.setTransferData("text/unicode", str, copytext.length * 2);
                    var clipid = Components.interfaces.nsIClipboard;
                    if (!clip) {
                        return false;
                    }
                    clip.setData(trans, null, clipid.kGlobalClipboard);
                } else {
                    require(["widget/jbox"], function (jbox) {
                        var buttons = {};
                        buttons[i18n.OK] = 0;
                        jbox.alert(i18n["The browser does not support auto-copy, manually copy the following text."] + "<p>" + txt + "</p>", i18n.Tips, {buttons: buttons});
                    });
                    return false;
                }
            }
            require(["widget/jbox"], function (jbox) {
                var buttons = {};
                buttons[i18n.OK] = 0;
                jbox.alert(i18n["Copy success."], i18n.Tips, {buttons: buttons});
            });
        },
        options: {depend: undefined, label: "USER_NOTESNAME", valuefield: "USER_NOTESNAME", valuelist: []},
        doms: {toolbar: null, listpanel: null},
        __customEvent: "add remove",
        __initEvent: function () {
            var _self = this;
            this.on("click", ".delbt", function (e) {
                var dom = $(this);
                _self.removeItem(dom);
            });
            this.doms.toolbar.on("click", ".copy", function (e) {
                _self.__copy();
                return false;
            });
        },
        __initPanel: function () {
            if (!this.options.depend) {
                this.options.depend = $("body");
            }
            this.options.depend.append(this);
            this.css({
                outline: "none",
                "list-style-type": "none",
                position: "absolute",
                margin: "0px",
                padding: "0px",
                border: "1px solid #c3c3c3",
                "background-color": "#FFF",
                "z-index": "988",
                display: "none"
            });
            this.attr("tabindex", 1);
            this.doms.toolbar = $("<div  ></div>");
            this.doms.listpanel = $("<div></div>");
            this.append(this.doms.toolbar, this.doms.listpanel);
            this.__initToolbar();
        },
        __initToolbar: function () {
            var selall = $("<span class='copy' data-foucsDom=true style='cursor: pointer;height: 16px;line-height: 16px;margin:3px;padding:2px;border: 1px solid #c0c0c0;font-size: 11px;'>" + i18n.Copy + "</span>");
            this.doms.toolbar.append(selall);
        },
        __createdItemDom: function (item, key) {
            var dom = $("<div style='float: left;' class='__selitemdom__ namesselectpanel' ></div>");
            dom.attr("data-valuekey", encodeURIComponent(item[this.options.valuefield]).replace(/%/g, ""));
            var label = $("<div style='float: left;white-space:nowrap;'>" + item[this.options.label] + "</div>");
            var del = $("<div class='delbt' style='float: left;margin-left:3px;width: 6px;height: 12px;vertical-align: middle; text-align: center' >&nbsp;&nbsp;</div>");
            del.data("item", item);
            del.data("dom", dom);
            dom.attr("data-foucsDom", true);
            label.attr("data-foucsDom", true);
            del.attr("data-foucsDom", true);
            dom.append(label).append(del);
            return dom;
        },
        addItem: function (item) {
            var dom = this.find("[data-valuekey=" + encodeURIComponent(item[this.options.valuefield]).replace(/%/g, "") + "]");
            if (dom.length == 0) {
                var dom = this.__createdItemDom(item);
                this.doms.listpanel.append(dom);
            }
            this.trigger("add", [this.options.valuelist, item]);
        },
        removeItem: function (dom) {
            var _item = dom.data("item");
            this.options.valuelist = $.grep(this.options.valuelist, function (item, i) {
                return item != _item;
            });
            dom.data("dom").remove();
            if (this.options.valuelist.length == 0) {
                this.hide();
            }
            this.trigger("remove", [this.options.valuelist, _item]);
        },
        refresh: function (_position) {
            if (this.options.valuelist.length > 0) {
                var _pos = $.extend(true, this.options.depend.position(), _position);
                _pos.height = "auto";
                this.css(_pos);
                var _top = _pos.top - $(document).scrollTop();
                var _height = this.height(), _width = this.width() > _pos.width ? this.width() : _pos.width;
                var _left = _pos.left;
                _right = $(window).width() - _width - _pos.left;
                if (_position.__dropposition == 1) {
                    if (_top < this.height()) {
                        if (_left > _right) {
                            _pos.left -= _width + 4;
                        } else {
                            _pos.left += _pos.width + 4;
                        }
                    } else {
                        _pos.top -= this.height() + 4;
                    }
                } else {
                    _pos.top -= this.height() - _pos.height - 4;
                    if (_left > _right) {
                        _pos.left -= _pos.width + 4;
                    } else {
                        _pos.left += _pos.width + 4;
                    }
                }
                this.css(_pos);
                this.show();
            } else {
                this.hide();
            }
        }
    });
    autoComplete.fn.extend({
        main: function (selector, context) {
            if (this.options.readonly) {
                this.__initStore();
                this.__initValue();
                return;
            }
            if (this.data("form/names")) {
                return this.data("form/names");
            }
            this.data("form/names", this);
            if (this.options.listtype.toLocaleLowerCase() == "g") {
                this.__initEvent();
                return false;
            }
            if (!this.options.depend) {
                this.wrap("<div></div>");
            }
            this.options.depend = this.parent();
            this.__initStore();
            this.__initValue();
            this.superclass.main.apply(this, arguments);
        },
        store: null,
        panel: null,
        selectItems: [],
        options: {
            depend: undefined,
            querykey: "empinfoId",
            valuefield: "USER_NOTESNAME",
            multi: false,
            listtype: "p",
            querylength: 4
        },
        __initStore: function () {
            var _self = this;
            if (typeof this.options.store == "string") {
                var _initerval = setInterval(function () {
                    var store = $("[data-id=" + _self.options.store + "]").data("this");
                    if (typeof store != "undefined") {
                        _self.store = _self.options.store = store;
                        clearInterval(_initerval);
                    }
                }, 10);
            } else {
                if ((typeof this.options.store == "undefined") || this.options.store == null) {
                    this.store = new Store({url: appinfo.hrwspath + "getEmpinfo.action"});
                } else {
                    this.store = this.options.store;
                }
            }
        },
        __initValue: function () {
            if (this.val() != "") {
                var _self = this;
                this.store.query(this.__createQueryObj()).then(function (data) {
                    if (!data) {
                        return;
                    }
                    if (data.length > 0) {
                        _self.selectItems = $.grep(data, function (item) {
                            return item.BJ == "1";
                        });
                        if (_self.options.multi) {
                            $(_self).trigger("load", [_self.selectItems, data]);
                        } else {
                            $(_self).trigger("load", [data[0], data]);
                            _self.__completefileds(data[0]);
                        }
                    }
                    $(_self).trigger("selected", [_self.selectItems, data]);
                });
            }
        },
        __initPanel: function () {
            this.superclass.__initPanel.call(this);
            this.panel.appendTo(this.options.depend);
            this.options.depend.width("inherit");
            this.panel.width(this.options.depend.width() < 300 ? 300 : this.options.depend.width());
            this.__initSelectPanel();
        },
        __customEvent: "load select querybefore query queryafter",
        __initEvent: function () {
            var _self = this;
            this.attr("autocomplete", "off");
            if (this.options.dialog || this.options.hasbt || this.options.listtype.toLocaleLowerCase() != "p" || _self.attr("readonly") == "readonly") {
                var showDialog = function () {
                    var singleFlag = !_self.options.multi, selType = _self.options.listtype;
                    try {
                        var t = new Date();
                        var pramStr = "";
                        if (singleFlag) {
                            pramStr = "&singleValue=" + singleFlag;
                        }
                        if (selType) {
                            pramStr = pramStr + "&selType=" + selType;
                        }
                        pramStr = pramStr + "&t=" + t;
                        var url = "";
                        var features;
                        if (singleFlag) {
                            url = "/XXX/HikOrg.nsf/(PM SelectSinglePeopleAll)?open" + pramStr;
                            features = "center:yes;DialogHeight:385px;DialogWidth:380px;help:no;status:no;resizable:no";
                        } else {
                            url = "/XXX/HikOrg.nsf/(PM SelectPeopleAll)?open" + pramStr;
                            features = "center:yes;DialogHeight:385px;DialogWidth:456px;help:no;status:no;resizable:no";
                        }
                        var regexp = /,|;/;
                        var origValue = _self.val();
                        var origValueArr = origValue.split(regexp);
                        var selectValue = window.showModalDialog(url, origValueArr, features);
                        if (selectValue || selectValue == "") {
                            selectValue = $.map(selectValue.split(","), function (u) {
                                return u.replace(/(cn=)?([^\/]+).*/gi, "$2");
                            });
                            _self.val(selectValue);
                            _self.__initValue();
                        }
                    } catch (e) {
                    }
                };
                if (this.options.hasbt || _self.attr("readonly") == "readonly") {
                    var bt = $("<input type=button  value='" + i18n.Select + "'>").on("click", showDialog);
                    this.after(bt);
                    bt.css({"margin-left": "2"});
                    this.width(this.width() - bt.outerWidth() - 2);
                }
                this.on("dblclick", showDialog);
            }
            if (this.options.listtype.toLocaleLowerCase() == "g" || _self.attr("readonly") == "readonly") {
                return;
            }
            $("body").on("scroll", function () {
                _self.__refreshPosition();
            });
            this.on("keydown", function (e) {
                switch (e.keyCode) {
                    case 38:
                        _self.moveup(e);
                        break;
                    case 40:
                        _self.movedown(e);
                        break;
                    case 186:
                    case 188:
                        return false;
                }
                e.stopImmediatePropagation();
            }).on("keyup", function (e) {
                var key = e.keyCode;
                switch (e.keyCode) {
                    case"":
                        break;
                    case 38:
                    case 40:
                        e.stopImmediatePropagation();
                    case 16:
                    case 17:
                    case 18:
                        return false;
                        break;
                    case 13:
                        if (_self.options.multi) {
                            if (_self.list.length == 1) {
                                _self.__foucsDom = _self.list[0];
                            }
                        } else {
                            if (_self.list.length > 0 && _self.__foucsDom == null) {
                                _self.__foucsDom = _self.list[0];
                            }
                        }
                        e.target = _self.__foucsDom;
                        if ($(_self.__foucsDom).data("item") && _self.list.length > 0) {
                            _self.__select(e);
                            break;
                        }
                    default:
                        if (e.ctrlKey || e.altKey || e.shiftKey) {
                            return false;
                        }
                        _self.__queryEvent(e);
                }
            }).on("paste", function (e) {
                setTimeout(function () {
                    _self.__queryEvent(e);
                }, 0);
            });
            var __blur = function (e) {
                setTimeout(function () {
                    var activeEl = document.activeElement;
                    var isblur = activeEl !== _self[0] && activeEl !== _self.panel[0] && activeEl !== _self.__selectPanel[0];
                    isblur = isblur && !$(activeEl).attr("data-foucsDom");
                    if (isblur) {
                        if (_self.options.multi) {
                            var vals = [];
                            _self.selectItems = _self.__selectPanel.options.valuelist;
                            $.each(_self.selectItems, function (i, item) {
                                vals.push(item[_self.options.valuefield]);
                            });
                            if (_self.options.listtype.toLocaleLowerCase() != "p") {
                                onmatch = _self.val().split(",");
                                vals = vals.concat(onmatch);
                            }
                            _self.val(vals.join(","));
                            _self.__selectPanel.hide();
                        } else {
                            if (_self.selectItems.length == 1 && _self.val() != _self.selectItems[0][_self.options.valuefield] && _self.val() != "") {
                                _self.val(_self.selectItems[0][_self.options.valuefield]);
                            } else {
                                if (_self.selectItems.length == 0) {
                                    if (_self.options.listtype.toLocaleLowerCase() == "p") {
                                        _self.val("");
                                    }
                                }
                            }
                            _self.onblur();
                        }
                        _self.onblur();
                    }
                }, 0);
            };
            var __focus = function (e) {
                if (_self.__foucsDom == null && _self.list[0]) {
                    _self.__foucsDom = $(_self.list[0]);
                    _self.__foucsDom.css(_self.options.css.active);
                }
                var vals = _self.val().split(/,/);
                var selvals = [];
                if (_self.options.multi) {
                    _self.__selectPanel.show();
                    for (i in _self.selectItems) {
                        var item = _self.selectItems[i];
                        selvals.push(item[_self.options.valuefield]);
                        _self.__selectPanel.addItem(item);
                    }
                    _self.__selectPanel.show();
                    vals = $.grep(vals, function (v, i) {
                        return $.inArray($.trim(v), selvals) == -1;
                    });
                    _self.val(vals.join(","));
                    _self.__refreshSelPosition();
                    _self.__refreshSelPosition();
                }
            };
            this.on("focus", function (e) {
                e.target = _self.panel[0];
                __focus(e);
            });
            this.__selectPanel.on("focusout", function (e) {
                e.target = _self.panel[0];
                __blur(e);
            });
            this.__selectPanel.on("blur", "span.namesselectpanel", function (e) {
                e.target = _self.panel[0];
                __blur(e);
            });
            this.__selectPanel.on("remove", function (e) {
                _self.selectItems = _self.__selectPanel.options.valuelist;
            });
            this.on("blur", function (e) {
                e.target = _self.panel[0];
                __blur(e);
            });
            this.superclass.__initEvent.call(this);
        },
        __selectPanel: null,
        __initSelectPanel: function () {
            var _self = this;
            var panel = this.__selectPanel = SelectPanel("<div></div>", {
                depend: this.options.depend,
                onremove: function (e, newlist, item) {
                    this.options.valuelist = newlist;
                    return true;
                }
            });
        },
        __getLabel: function (item) {
            var dept = item.DEPT_PATH.split(/\\/gi);
            if (dept.length > 2) {
                dept.reverse();
                dept.shift();
                dept.reverse();
            }
            dept = dept.join("\\");
            var label = $("<span style='float: left;margin:0px 3px;' title='" + item.DEPT_PATH + "'>" + item[this.options.valuefield] + "</span>");
            var ext = $("<span style='float: right;margin-left:30px ;margin-right: 5px;;overflow:visible;text-align: right'>" + dept + "</span>");
            var dom = $("<span></span>");
            dom.append(label);
            dom.append(ext);
            if (this.__isSelect(item)) {
                $(dom).css({color: "#CFCFCF"});
            }
            return dom;
        },
        __getItemKey: function (item) {
            var key = item[this.options.valuefield].replace(/[\s\.\-\+\=\,]/);
            key = encodeURIComponent(key).replace(/%/g);
            return key;
        },
        __dropposition: 1,
        __refreshPosition: function () {
            var _width = this.options.depend.width(), _height = this.panel.height();
            this.panel.width(function () {
                return _width > 300 ? _width : 300;
            });
            _width = this.panel.width();
            var _pos = this.position();
            var _top = _pos.top - $(document).scrollTop();
            if ($(window).height() - _top - this.height() > 250) {
                _pos.top += this.outerHeight();
                this.__dropposition = 1;
            } else {
                _pos.top -= _height;
                this.__dropposition = 0;
            }
            if ($(window).width() - _pos.left < _width) {
                _pos.left -= (_width - this.width());
            }
            this.panel.css(_pos);
        },
        __refreshSelPosition: function () {
            this.__selectPanel.options.valuelist = this.selectItems;
            this.__selectPanel.refresh($.extend(this.position(), {
                width: this.width(),
                __dropposition: this.__dropposition
            }));
        },
        __setCursorPosition: function (start, end) {
            return false;
            if (this[0].setSelectionRange) {
                this[0].setSelectionRange(start, end);
            } else {
                if (this[0].createTextRange) {
                    var range = this[0].createTextRange();
                    range.collapse(true);
                    range.moveEnd("character", end);
                    range.moveStart("character", start);
                    range.select();
                }
            }
        },
        __foucs: function (e) {
            this.superclass.__foucs.call(this, e);
            var _val = this.__getval(e);
            this.val(_val);
            this.__setCursorPosition(_val.length, _val.length);
        },
        __getval: function (e) {
            try {
                var item = $(e.target).data("item");
                var _val = item[this.options.valuefield] || item[this.options.label];
                if (!_val) {
                    _val = this.getLabel(item);
                }
                return _val;
            } catch (ex) {
                return "";
            }
        },
        __selectMultiItem: function (e) {
            var _self = this;
            var item = $(e.target).data("item");
            if (!this.__isSelect(item)) {
                this.selectItems.push(item);
                this.__selectPanel.addItem(item);
                this.__refreshSelPosition();
                this.__foucsDom = null;
                this.val("");
                this.panel.empty();
            }
        },
        __isSelect: function (item) {
            var _self = this;
            var _val = item[this.options.valuefield];
            var isSel = false;
            $.each(this.selectItems, function (i, item) {
                var val = item[_self.options.valuefield];
                if (val == _val) {
                    isSel = true;
                }
            });
            return isSel;
        },
        __select: function (e) {
            var item = $(e.target).data("item");
            if (this.options.multi) {
                this.__selectMultiItem(e);
            } else {
                var _val = this.__getval(e);
                this.selectItems[0] = item;
                this.val(_val);
                this.__completefileds(item);
                this.__foucsDom = null;
                this.panel.empty();
            }
            this.hide();
            this.triggerHandler("select", [item, this]);
        },
        __completefileds: function (item) {
            if (item.DEPT_MANAGER) {
                item.DEPT_MANAGER_CN = util.getName(item.DEPT_MANAGER);
            }
            if (this.options.autofileds) {
                for (i in this.options.autofileds) {
                    var f = this.options.autofileds[i];
                    $("input[name=" + f + "]").val(item[i]);
                }
            }
            if (this.options.autofileds2) {
                for (i in this.options.autofileds2) {
                    var f = this.options.autofileds2[i];
                    $("input[name=" + i + "]").val(item[f]);
                }
            }
        },
        __createQueryObj: function () {
            var query = {};
            query[this.options.querykey] = encodeURIComponent(this.val());
            return query;
        },
        __queryEvent: function (e) {
            var _self = this;
            if (this.options.listtype.toLocaleLowerCase() == "g" || _self.attr("readonly") == "readonly") {
                return;
            }
            if ($.trim(_self.val()) == "") {
                _self.hide();
                return;
            }
            var vals = _self.val().split(/[，；;,]/);
            var valtxt = vals.join(",");
            if (vals.length > 1 && !_self.options.multi) {
                valtxt = valtxt.substr(0, valtxt.indexOf(","));
            }
            if (valtxt.replace(/[^x00-xff]/g, "XX").length >= _self.options.querylength) {
                _self.trigger("querybefore", [valtxt]);
                var query = _self.__createQueryObj();
                var result = _self.query(query).then(function (data) {
                    _self.trigger("queryafter", [data]);
                });
                _self.trigger("query", [result]);
            }
        },
        query: function (query) {
            var _self = this;
            var keys = decodeURIComponent(query[this.options.querykey]).split(/,/);
            var result = this.store.query(query).pipe(function (data) {
                _self.panel.empty();
                return data;
            }).grep(function (item) {
                if (_self.options.multi && keys.length > 1) {
                    if (!_self.__isSelect(item) && $.inArray(item[_self.options.valuefield], keys) > -1) {
                        _self.selectItems.push(item);
                        _self.__selectPanel.addItem(item);
                        _self.__refreshSelPosition();
                    }
                    return false;
                } else {
                    if (_self.options.multi) {
                        return !_self.__isSelect(item);
                    } else {
                        return true;
                    }
                }
            });
            result.each(function (i, item) {
                if (i >= 10) {
                    return false;
                }
                _self.addItem(item);
            });
            result.then(function (data) {
                if (data.length == 0) {
                    _self.hide();
                } else {
                    _self.list = $(_self.panel.find("li"));
                    _self.show();
                    _self.__refreshPosition();
                }
            });
            return result;
        },
        show: function () {
            this.superclass.show.call(this);
        }
    });
    return autoComplete;
});