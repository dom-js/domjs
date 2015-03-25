/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-4
 * Time: 下午3:46
 * DropDown *
 */

define(["jquery", "base/objectj"], function ($, obj) {
    var dropdown = obj.sub();
    dropdown.fn.extend({
        main: function (selector, context) {
            this.__init()
            // this.superclass.main.apply(this, arguments)
        },
        listmatch: null,
        listnomatch: $("<div></div>"),
        list: null,
        panel: null,
        __foucsDom: null,
        options: {
            depend: undefined,
            idProperty: "id",
            label: "label",
            desc: undefined,
            layout: [
                {
                    type: "text",
                    text: "label",
                    css: {float: "left"}
                }
            ],
            css: {
                li: {
                    "font-size": "12px",
                    "width": "inherit"
                },
                active: {
                    "background-color": "#e8f6f7",
                    "border": "0px",
                    "border-top": "1px dotted",
                    "height": "23px",
                    "line-height": "23px",
                    "border-bottom": "1px dotted"
                },
                select: {},
                unactive: {
                    "background-color": "#FFFFFF",
                    "margin": "0px",
                    "border": "0px",
                    "list-style": "none",
                    "height": "25px",
                    "line-height": "25px",
                    "border": "none",
                    "overflow": "hidden"
                },
                ul: {
                    "width": "auto",
                    "height": "auto",
                    "outline": "none",
                    "list-style-type": "none",
                    "position": "absolute",
                    "margin": "0",
                    "padding": "0",
                    "border": "1px solid #c3c3c3",
                    "z-index": "998",
                    "background-color": "#FFFFFF",
                    "zoom": "1"
                }
            },
            autoremove: true,
            data: [],
            store: null
        },
        __init: function () {

            this.__initPanel()
            if (this.panel.find("li").length > 0) {
                this.__initHTMLList()
            } else if (this.options.store != null) {
                this.__initStoreList()
            } else {
                this.__initDataList();
            }
            this.__initEvent();
        },
        __initPanel: function () {
            if (this.options.panel) {
                this.panel = $(this.options.panel)
            } else {
                this.panel = $("<ul class='widget_dropdown' style='display: none;position:absolute;' hidefocus=true></ul>").appendTo("body")
            }
            this.panel.css(this.options.css.ul);
            this.panel.attr("tabindex", 0)
            this.list = $(this.panel.find("li"));
            this.list.css({
                "cursor": "pointer"
            })
            this.list.css(this.options.css.unactive)
            this.listmatch = this.list.filter("*");
        },
        __initHTMLList: function () {
            this.panel.empty();
            this.addDoms(this.listmatch)
            //this.panel.append(this.listmatch);
        },
        __initDataList: function () {
        },
        __initStoreList: function () {
        },
        __initEvent: function () {
            var _self = this;
            this.panel.on("mouseenter", "li", function (e) {
                e.target = e.currentTarget
                _self.__foucs(e)
            })
                .on("click", "li", function (e) {

                    e.target = e.currentTarget
                    _self.__select(e)
                    e.stopImmediatePropagation()
                    return false
                })
                .on("keydown", function (e) {

                    try {
                        switch (e.keyCode) {
                            case 38:
                                _self.moveup(e)
                            case 40:
                                _self.movedown(e)
                                break
                            case 9:
                            case 13:
                            case 32:
                            case 39:
                                e.target = _self.__foucsDom[0]
                                _self.__select(e)
                                break;
                            case 27:
                                _self.hide()
                                break;
                        }


                    } catch (e) {

                    }
                    // console.log( _self.__foucsDom)
                    //   console.log($(this).find("~ div"))
                    e.stopPropagation()
                    return false
                })

        },
        __select: function (e) {
            this.hide();
            if (typeof this.onselect == "function") {
                this.onselect.call(e.target)
            } else if (typeof this.options.onselect == "function") {
                this.options.onselect.call(e.target)
            }

        },
        __getLabel: function (item, _label) {
            var _label = _label || this.options.label
            if (typeof _label == "string") {
                return item[_label] || _label
            } else if ($.isFunction(_label)) {
                return _label(item)
            } else if ($.isArray(_label)) {
                var _l = []
                for (i in _label) {
                    _l.push(this.__getLabel(item, _label[i]))
                }
                return _l.join("")
            } else if ($.isPlainObject(_label)) {

            } else {

                for (i in item) {
                    return  item[i]
                }

            }
        },
        __createdDom: function (item) {
            var _li = $("<li  style=\"cursor:pointer;\"></li>");
            _li.data("item", item)
            _li.css(this.options.css.li)
            _li.css(this.options.css.unactive)
            var _mp = $("<div style='clear: both;'></div>")
            //  _li.append(_mp)
            _li.append(this.__getLabel(item))
            return _li
        },
        __foucs: function (e) {
            //console.log(e.target)
            if (this.__foucsDom) {
                $(this.__foucsDom).css(this.options.css.unactive)
            }
            this.__foucsDom = $(e.target)
            this.__foucsDom.css(this.options.css.active)
        },
        __getfoucsIndex: function () {
            var index = undefined;
            var _self = this;
            if (this.__foucsDom != null && this.__foucsDom.length == 1) {
                var dom = null;

                this.list.each(function (i, dom) {

                    if (_self.__foucsDom[0] == dom) {
                        index = i
                        return false
                    }
                })
            } else {
                if (this.list[0]) {
                    index = -1
                }
            }

            return index

        },
        __getNextDom: function () {
            var index = this.__getfoucsIndex(), dom

            if (typeof index != "undefined") {
                if (this.list.length > index + 1) {
                    dom = this.list[index + 1]
                } else {
                    dom = this.list[0]
                }

                return dom
            } else {
                return null
            }
        },
        __getPreDom: function () {
            var index = this.__getfoucsIndex(), dom

            if (typeof index != "undefined") {
                if (index > 0) {
                    dom = this.list[index - 1]
                } else {
                    dom = this.list[this.list.length - 1]
                }
                return dom
            } else {
                return null
            }
        },
        moveto: function (e, num) {

            if (this.list[num]) {
                e.target = this.list[num]
                this.__foucs(e)
            }
        },
        moveup: function (e) {
            // var dom = this.__getPreDom()
            if (this.panel.filter(":visible").length == 0)return
            e.target = this.__getPreDom()

            this.__foucs(e)
        },
        movedown: function (e) {
            if (this.panel.filter(":visible").length == 0)return
            e.target = this.__getNextDom()
            this.__foucs(e)
        },
        sort: function (fun) {
            var sortfun;
            if (typeof fun == "function") {
                sortfun = fun;
            } else {
                sortfun = function (a, b) {
                    return a == b ? 0 : a < b ? -1 : 1
                }
            }
            Array.prototype.sort.call(this.list, function (a, b) {
                var el1 = $(a), el2 = $(b);
                var el1c = el1.text(), el2c = el2.text();
                var flag = sortfun(el1c, el2c)
                if (flag > 0) {
                    el1.before(el2);
                }
                return flag
            })
        },
        show: function () {
            this.panel.css(this.options.css.ul)
            this.panel.show()
        },
        hide: function () {
            this.panel.hide()
        },

        filter: function (args) {
            var _self = this;
            var type = Object.prototype.toString.call(args)
            switch (type) {
                case "[object RegExp]":
                    break;
                case "[object Function]":
                case "[object Array]":
                case "[object Object]":
                    break;
                default:
                    var select = this.list.filter(args)
                    select.length == 0 ? this.hide() : this.show();
                    this.list.each(function (i, el) {
                        if ($.inArray(el, select) == -1) {
                            $(el).hide();
                        } else {
                            $(el).show();
                        }
                    })
            }


        },
        addDoms: function (doms) {
            this.panel.append(doms)
        },
        addItem: function (item) {
            var dom = this.__createdDom(item)
            this.panel.append(dom)
            return dom
        },
        deleteItem: function () {
        },
        onblur: function () {
            if (typeof this.options.onblur == "function") {
                if (this.options.onblur()) {
                    this.panel.hide();
                }
            } else {
                this.panel.hide();
            }

        },
        onfocus: function (e) {
            //  console.log(e)
            if (typeof this.options.onfocus == "function") {
                if (this.options.onfocus()) {
                    this.show();
                }
            } else {
                this.show();
            }
        }
    })
    return dropdown;
})