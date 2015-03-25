define([ "jquery" ], function ($) {
    /**
     * ops={ id: String 表格id layout：Table.Layout[] Option 表格布局（一个表格行的布局）
     * Store:Store.api.store Option 表格数据（表格的数据源） }
     */
    var Table = function (ops) {

        $.extend(this, $("<table>"));
        ops.classname && this.attr("class", ops.classname)
        ops.css && this.css(ops.css)
        this.valuefield = $("[name=" + ops.valuefield + "]");

        this.rowKeyName = (ops.id || ("table_" + parseInt(Math.random() * 10000))) + "_row" //保存每行唯一标识的表示名称
        this.data = []
        this.keys = []
        //this.rowKeyName = this.id + "_row" //保存每行唯一标识的表示名称
        $.extend(this, ops);

    }
    /**
     * 需要单独保存的关键字（关键字是用于存储唯一值得）
     */

    Table.prototype.set = function (attrname, attrvalue) {
        this[attrname] = attrvalue;
    }
    Table.prototype.initHead = function () {
        if (this._head) {
            this.append(this._head)
        } else {
            for (var a in this.layout) {

            }
        }

    }
    Table.prototype.initBody = function (bodystr) {
        var me = this;
        if (me.data.length > 0) {
            $.each(me.data, function (i, item) {
                me.addRow(item)
            })
        } else if (bodystr && $.trim(bodystr) != "") {
            $.each(this.unserializeVal(bodystr), function (i, item) {
                if (typeof item == "object")
                    me.addRow(item)
            })
        } else {
            for (var i = 0; i < this.minrowscount; i++) {
                me.addRow()
            }
        }

    }
    Table.prototype.getRowTemplate = function () {

    }

    Table.prototype.addRow = function (item) {
        /**
         * Summary 添加一个新行 item:Object Option 新行内容
         */
        if (this[0].rows.length > this.maxrowscount)
            return false;
        var _row = this._row.clone(true);

        var _keys = {}
        var _keysStr = "";

        /**
         * 如果存在item，则将item内地key值赋值给_keys 列表备用
         */
        var DefaultKey = parseInt(Math.random() * 1000000);
        if (typeof item == "object") {

            DefaultKey = item[this.rowKeyName]
        }

        $.each(this.keys, function (i, k) {

            if (k != "")
                if (typeof item == "object") {
                    _keys[k] = item[k]
                } else {
                    _keys[k] = DefaultKey
                }
            _keysStr += _keys[k]
        })

        $.data(_row[0], "keys", _keys);
        //default key (缺省关键字)
        //对于该行 的 rowKeyName 值
        _row.attr("data-key", DefaultKey)
        $.data(_row[0], "keysstr", _keysStr);
        /**
         * radio name，此处进行重命名
         */
        _row.find("td[data-type=radio]").each(
            function (i, td) {
                var _extendname = _keysStr
                $(td).find("input").each(function (j, el) {
                    if (el.outerHTML) { // 在ie6/7下无法修改，此处使用兼容处理
                        $(el).after(
                            (el.outerHTML.replace("__name__",
                                el.name + _extendname)))
                        $(el).remove();
                    } else {
                        el.name = el.name + _extendname
                    }
                })
            })
        _row.find("input[data-type=delbt]").on("click", {
            table: this,
            row: _row
        }, function (e) {
            e.data.table.deleteRow(DefaultKey, true)
        })

        this.append(_row)
        // this.refresh(); //更新索引

        // 如果存在更新行函数，则更新行
        this._updateRow && this._updateRow(_row, item)
        this.refresh();
    }
    /**
     * 更新索引信息
     *
     * @return
     */
    Table.prototype.refresh = function () {

        $("tr[data-key]", this[0]).each(function (i, tr) {

            $(tr).attr("data-rowindex", i + 1);
        })

        $("td[data-type=serialno]", this[0]).each(function (i, el) {
            $(el).text(i + 1);
        })
    }
    /**
     *
     * @param key
     *            删除的行标记
     * @param flag
     *            true,使用行id删除，flase：使用行索引删除
     * @return
     */
    Table.prototype.deleteRow = function (key, flag) {
        /**
         * Summary 删除一行记录 id：String 删除行
         */
        if (this[0].rows.length - 1 <= this.minrowscount)
            return false;
        if (key) {

            if (flag) {
                $("tr[data-key=" + key + "]", this[0]).remove();
            } else {
                $("[data-rowindex=" + key + "]", this[0]).remove();
            }
        }
        this.refresh();

    }

    Table.prototype.tablehtml = function () {
        var _A = $("<div data-type=table>").text(this.serializeVal())
        return _A.html();
    }
    Table.prototype.unserializeVal = function (str) {
        var _reg, _p, _n;
        var _result = [];
        $.each(str.split("&"), function (i, p) {

            var item = {}
            _reg = new RegExp("(^.*)=(.*$)")
            _p = _reg.exec(p)
            _n = /(^.*)_(\d+$)/.exec(_p[1])
            if (!_result[_n[2] - 1]) {
                _result[_n[2] - 1] = {}
            }

            _result[_n[2] - 1][_n[1]] = decodeURIComponent(_p[2].replace(/\+/g,
                " "))

            // console.log(_reg.exec(p))
        })
        return _result;
    }
    Table.prototype.serializeVal = function () {
        var _result = {};
        var _data = [];
        var me = this;
        $("tr:gt(0)", this[0]).each(
            // 处理每一行
            function (i, eltr) {
                var n = i + 1;
                _data[i] = {}
                // 处理列
                $(eltr).find("td[data-name]").each(function (j, td) {
                    //
                    td.type = "td"
                    var $el = $(td).find("*").is("[data-name]") ? $(td)
                        .find("[data-name]") : $(td);
                    $el.each(function (i, el) {
                        var _name = $.trim($(el).attr("data-name"))
                        var _fieldname = _name + "_" + n

                        switch (el.type) {
                            case "td":
                                _result[_fieldname] = ($(el).text())
                                break;
                            case "radio":
                            case "checkbox":
                                if (el.checked)
                                    _result[_fieldname] = ($(el).val())
                                break;
                            default:
                                _result[_fieldname] = ($(el).val())
                        }

                        _data[n - 1][_name] = _result[_fieldname] || "";
                    })

                })
                // 获取key列表，保存时更新key
                var keyvalues = $.data(eltr, "keys");
                $.each(me.keys, function (i, k) {
                    if (!_result[k + "_" + n]) {
                        _result[k + "_" + n] = _data[n - 1][k] = keyvalues[k]
                    }
                })

                if (!_result[me.rowKeyName + "_" + n]) {

                    _result[me.rowKeyName + "_" + n] = _data[n - 1][me.rowKeyName] = $(eltr).attr("data-key")
                }

            })

        this.data = _data;
        return ($.param(_result))
    }

    Table.Layout = function (ops) {
        /**
         * Summary ops:String/Object Array String(HTML String) 结构字符串,td 数组
         * ObjectArray 创建一个表格的行/列 布局 -title：列标题 -name:String 列名 -type:String 类型
         */
    }
    return Table;
})