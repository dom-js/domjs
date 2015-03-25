define(
    [ "jquery","plugin/util","base/objectjEngine","widget/_base/widget", "appinfo", "widget/table","docinfo","i18n!nls/form" ,"plugin/subscribe" ],
    function($,util,objectjEngine,widget, appinfo, Table,docinfo,i18n) {
        /**
         * 定义Table 控件,Table 控件有 Model 和View 两部分构成 本部分属于View
         */
        /*
         var formTable = widget.sub();
         formTable.fn.extend({
         options:{
         id:undefined,
         css:{},
         classname:"",
         editable:undefined
         },
         doms:{},
         __initWidget:function(){

         this.options.id =  typeof this.options.id =="undefined"?this.attr("name"):this.options.id
         this.options.editable = typeof this.options.editable =="undefined"?(this.attr("tagname")=="INPUT"||this[0].tagName=="INPUT"):this.options.editable
         this.__loadConfig()

         },
         __initHead:function(){

         },
         __loadConfig:function(){
         var deferred = new $.Deferred()
         var modulename = this.options.id

         $.getScript(appinfo.dbpath + "/vwPluginTable/" + modulename+ "?opendocument&form=fmTableInfo").then(function(){
         require([modulename],function(info){
         deferred.resolve(info)
         })
         })
         return deferred
         require( [ appinfo.dbpath + "/vwPluginTable/" + this.options.id
         + "?opendocument&form=fmTableInfo" ], function(info) {
         if(!info){
         require(["widget/jbox"],function(jbox){
         jbox.alert(i18n["Tables failed to initialize, Please Refresh try.If the problem persists, please contact management."])
         })

         return undefined
         }

         return
         $.extend(me, info)
         // 获取keyname关键字
         me.rowKeyName = me.storename + "_row" // 保存每行唯一标识的名称
         if ($.trim(me.keyname) == "") {
         me.keys = [ me.rowKeyName ]
         } else {
         me.keys = me.keyname.replace(/\s/g, "").split(",")
         }
         // 表格head部分处理
         var _headcells = $(me.tablehead)
         _headcells.each( function(i, el) {
         if (!me.editable) {
         switch ($(el).attr("data-type")) {
         case "delbt":
         $(el).hide();
         $(el).empty();
         }
         }
         })
         me._head = $("<tr>").append(_headcells)

         // 表格列处理，生产行模板
         var _cells = $(me.tablerow)
         _cells.each( function(i, el) {
         if (!me.editable) {
         switch ($(el).attr("data-type")) {
         case "delbt":
         $(el).hide()
         $(el).empty();
         }
         }
         })
         me._initCells(_cells)
         me._row = $("<tr>").append(_cells)
         me.loadData();
         })
         }
         })
         return formTable;
         * */
        var formTable = function(ops) {
            var me = this;
            $.extend(this, ops)
            $.extend(this, new $.Deferred())

            $.extend(this, new Table( {
                classname : ops.classname,
                css : ops.css,
                id : $(me.element).attr("data-table")
                    || $(me.element).attr("id")
                    || $(me.element).attr("name")
            }))
            // console.log($(me.element).attr("data-table")||$(me.element).attr("id")||$(me.element).attr("name"))
            this.editable = ops.editable
                || (($(me.element).attr("tagname") || me.element.tagName) == "INPUT") ? true
                : false;
            // 为表格添加验证属性
            $(me.element).attr("data-validate", true)

            this.panel = $("<div></div>");
            this.toolbar = $("<span></span>")
            this.buttons = {};
            this.data = []
            this.keys = []
            $(me.element).hide();

            this.init = function() {
                $(me.element).before(me.panel)
                me
                    .done( function() {
                    me.panel.append(me);
                    me._initToolbar();
                    me.initHead();
                    var _bodystr = "";
                    if (($(me.element).attr("tagname") || me.element.tagName) == "INPUT") {
                        if (me.element.value != "")
                            _bodystr = $(me.element.value).text()
                    } else {
                        _bodystr = $(me.element).text()
                    }
                    me.initBody(_bodystr);
                })
            }
            this.initEventLister();
            /**
             * 加载表格配置信息
             */
            require( [ appinfo.dbpath + "/vwPluginTable/" + ops.id
                + "?opendocument&form=fmTableInfo" ], function(info) {
                if(!info){
                    require(["widget/jbox"],function(jbox){
                        jbox.alert(i18n["Tables failed to initialize, Please Refresh try.If the problem persists, please contact management."])
                    })

                    return undefined
                }
                $.extend(me, info)
                // 获取keyname关键字
                me.rowKeyName = me.storename + "_row" // 保存每行唯一标识的名称
                if ($.trim(me.keyname) == "") {
                    me.keys = [ me.rowKeyName ]
                } else {
                    me.keys = me.keyname.replace(/\s/g, "").split(",")
                }
                // 表格head部分处理
                var _headcells = $(me.tablehead)
                _headcells.each( function(i, el) {
                    if (!me.editable) {
                        switch ($(el).attr("data-type")) {
                            case "delbt":
                                $(el).hide();
                                $(el).empty();
                        }
                    }
                })
                me._head = $("<tr>").append(_headcells)

                // 表格列处理，生产行模板
                var _cells = $(me.tablerow)
                _cells.each( function(i, el) {
                    if (!me.editable) {
                        switch ($(el).attr("data-type")) {
                            case "delbt":
                                $(el).hide()
                                $(el).empty();
                        }
                    }
                })
                me._initCells(_cells)
                me._row = $("<tr>").append(_cells)
                // objectjEngine(me._row)
                me.loadData();

            })
            me.init()
        }
        formTable.prototype = {
            /**
             * 初始化数据计数器
             */
            accumulator : 0,
            /**
             * 初始化开始（局部初始化）
             *
             * @return
             */
            initStart : function() {
                this.accumulator++;
            },
            /**
             * 初始化完成
             *
             * @return
             */
            initComplate : function() {
                this.accumulator--;
                // 如果计数器为0，则表示数据初始化全部完成
                if (this.accumulator == 0) {
                    this.resolve();
                }
            },
            initEventLister : function() {
                var me = this;
                me.done( function() {
                    if (me.editable) {
                        $.subscribe("form/submit", function(args) {
                            switch (args.action) {
                                case "transfer":
                                    me.transfer();
                                    break;
                            }
                            me.save();
                        })
                        $.subscribe("form/save", function() {
                            me.save();
                        })
                    }

                })

            },
            /**
             * 加载表格数据
             *
             * @return
             */
            loadData : function() {
                this.initStart();
                var me = this;

                if (me.datasource != "") {
                    var getURL = function() {
                        var _url = appinfo.dbpath;

                        switch (me.datasourcetype) {
                            case "field":
                                _url += "/pgFieldTable?openpage&key="
                                    + me.datasource + "&unid=" + me.docunid;
                                break;
                            case "doc":
                                _url += "/pgXMLTable?openpage&key="
                                    + me.docwfunid + me.datasource
                                break;
                            default: {

                            }
                        }
                        return _url;
                    }
                    var _url = getURL()
                    $.ajax( {
                        url : _url,
                        complete : function(data) {

                            var _data = []
                            try {
                                eval("_data =" + data.responseText)
                            } catch (e) {
                                alert("数据错误，请与管理员联系")
                            }

                            me.data = _data;
                            me.initComplate()
                        }
                    })
                } else {
                    me.initComplate();
                }
            },
            /**
             * 添加新行时更新该行
             *
             * @param _rows
             * @param item
             * @return
             */
            _updateRow : function(_row, item) {
                var _keys = {}
                var me = this;
                if (item) {
                    $.each(this.keys, function(i, k) {
                        _keys[k] = item[k]
                    })
                }

                // 如果存在权限控制，则进行权限控制
                if (this.editable)
                    if (_row.find("td").is("[data-right=true]")) {

                        var _user = appinfo.username.replace(
                            /(cn=)?([^\/]*)\/.*/gi, "$2")

                        var _isAuthor = false;
                        var _value = item[_row.find("[data-right=true]")
                            .attr("data-name")]

                        if (typeof _value == "string")
                            _value = _value.split(",")
                        $.each(_value, function(i, u) {

                            if ($.trim(u).replace(/(cn=)?([^\/]*)\/.*/gi,
                                "$2") == _user)
                                _isAuthor = true
                        })

                        if (_isAuthor) {
                            _row.find("td").attr("data-editable", "true")

                        } else {
                            _row.find("td").attr("data-editable", "false")
                            _row.find("td[data-type=delbt]").text("")
                        }
                    }
                // data-right = true
                var _rowinfo = {
                    key : _row.attr("data-key"),
                    index : _row.attr("data-rowindex")
                }

                _row.find("td").each( function(i, td) {
                    me._updateCell(td, item, _rowinfo)
                })
            },
            /**
             * 更新列行的列
             *
             * @param el
             * @return
             */
            _updateCell : function(td, item, rowinfo) {

                var me = this;
                /**
                 * 更新编辑状态
                 *
                 * @param td
                 * @param item
                 * @return
                 */
                var updateEdit = function(td, item) {
                    var _jel = $(td).find("[data-type]");
                    var _value = ""
                    if (item) {
                        _value = item[$(td).attr("data-name")] || ""
                    }

                    switch (_jel.attr("data-type")) {
                        case "serialno":
                        case "delbt":
                            break;
                        case "radio":
                            $(td).find("input[value=" + _value + "]").attr(
                                "checked", true)
                            break;
                        case "viewselect":
                            $(td).find("select").val(_value)
                            break;
                        case "notesid":
                            // 初始化notesid
                            $(td).find("input").each(
                                function(i, el) {
                                    el.name = $(el).attr("data-name") + "_"
                                        + rowinfo.key
                                    el.value = _value
                                    me._initNotesName(el)
                                    document.forms[0][el.name] = el;
                                })

                            break;
                        case "attachment":
                            // 初始化附件
                            _jel.attr("name", _jel.attr("data-name") + "_"
                                + rowinfo.key)

                            me._initAttachment(_jel)
                            break;

                        case "submittime":
                            var date = new Date()
                            var now = date.getFullYear() + "-";
                            now += (date.getMonth() + 1) + "-";
                            now += date.getDate() + " ";
                            now += date.getHours() + ":";
                            now += date.getMinutes() + ":";
                            now += date.getSeconds();
                            $(td).text(now)
                            break;
                        case "autotextarea":
                            require(["form/autotextarea"], function(tt){
                                tt(_jel);
                                _jel.val(_value).width("92%")
                            })
                            break
                        case "textarea":
                        case "text":
                            _jel.val(_value).width("92%")
                            break;
                        default:
                            $(td).html("<pre>" + _value.toString() + "</pre>")
                    }
                }
                /**
                 * 更新非编辑状态
                 *
                 * @param td
                 * @param item
                 * @return
                 */
                var updateDisp = function(td, item) {
                    var _value = ""
                    if (item) {
                        _value = item[$(td).attr("data-name")] || ""
                    }
                    switch ($(td).attr("data-type")) {
                        case "autotextarea":
                        case "textarea":
                            $(td).html("<pre>" + _value.toString() + "</pre>");
                            break;
                        case "attachment":
                            $(td).empty()
                            if (_value.toString() == "")
                                break;
                            var el = $("<input>").attr("data-name",
                                $(td).attr("data-name"))
                                .attr(
                                "name",
                                $(td).attr("data-name") + "_"
                                    + rowinfo.key).attr(
                                "data-editable", false)

                            $(td).append(el)
                            // var el=$(td).find("attachment")

                            // _jel.attr("name",_jel.attr("data-name") + "_"+
                            // rowinfo.key)
                            me._initAttachment(el)
                            break;
                        case "submittime":
                            $(td).text(_value.toString());
                            break;
                        default:
                            $(td).html(_value.toString());
                    }

                }
                // 执行更新
                if ($(td).attr("data-editable") == "true") {
                    updateEdit(td, item)
                } else {
                    updateDisp(td, item)
                }

            },
            /**
             * 工具栏目
             */
            buttons : null,
            /**
             * 初始化工具栏
             *
             * @return
             */
            _initToolbar : function() {
                if (this.editable) {
                    var _tools = $(util.translateStr(this.tabletools,i18n))
                    this.buttons = _tools// $(this.tabletools)
                    this.before(this.buttons)
                }
            },
            /**
             * 初始化列
             *
             * @param _cells
             * @return
             */
            _initCells : function(_cells) {
                var me = this;
                _cells.each( function(i, el) {
                    me._initCell(el)
                })
            },
            _initCell : function(el) {
                var me = this;
                switch (el.tagName) {
                    case undefined:
                    case "TD":
                        var _child;
                        $(el).attr("data-editable") == undefined
                        && $(el).attr("data-editable", me.editable)
                        if (me.editable) {
                            switch ($(el).attr("data-type")) {
                                case "viewselect":
                                    _child = $("<select data-type='viewselect' >")
                                        .attr("name", $(el).attr("data-name"))
                                    me._initViewSelect(el, _child);
                                    break;
                                case "serialno":
                                    break;
                                case "radio":
                                    if ($(el).attr("data-values")) {
                                        var _vals = $(el).attr("data-values")
                                            .split(",");
                                        _child = $("<span>");
                                        var _radio, _text;

                                        for ( var i in _vals) {
                                            var _val = _vals[i].split(/\|/)
                                            _radio = $("<input type=radio  name='__name__'  data-type='radio' />");

                                            _radio.attr("name",
                                                $(el).attr("data-name")).attr(
                                                "data-name",
                                                $(el).attr("data-name")).attr(
                                                "value", _val[1] || _val[0])
                                            _text = _val[0]
                                            _child.append(_radio).append(_text)
                                        }
                                    }
                                    break;
                                case "textarea":
                                case "autotextarea":
                                    _child = $("<textarea type=text data-type='text' ></textarea>").width("95%")
                                    break;
                                case "text":

                                    _child = $("<input type=text data-type='text' >").width($(el).width())
                                    break;
                                case "delbt":
                                    _child = $(
                                        "<input type='button' data-type='delbt'>")
                                        .val("Del");
                                    break;
                                default:
                                    _child = $("<input type=text >")
                            }
                            if ($.browser.msie) {
                                for ( var a in el) {
                                    if (a.match(/^data-/)) {
                                        $(_child).attr(a, $(el).attr(a))
                                    }
                                }
                            } else { // 非IE
                                for ( var i in el.attributes) {
                                    var a = el.attributes[i]
                                    if (a && a.nodeName && a.nodeValue) {
                                        $(_child).attr(a.nodeName, a.nodeValue)
                                    }
                                }
                            }
                            $(el).append(_child)
                        } else {
                            switch ($(el).attr("data-type")) {
                                case "delbt":
                                    $(el).remove()
                                default:
                            }
                        }
                        break;
                    default:
                }
            },
            _initViewSelect : function(el, _child) {
                //this.accumulator++;
                var me = this;
                require( [ "form/viewselect" ,"base/objectj"], function(select,obj) {
                    require( [ "form/viewselect" ], function(select) {
                        var _ops = obj.__getHTMLParams.call($(el))
                        var s = new select(_child,_ops)
                        //var s = new select(_child, $(el))
                        s.done( function() {
                            //   me.initComplate();
                        })

                    })
                })
            },
            _initNotesName : function(_child) {
                // this.accumulator++;
                //var me = this;
                require( [ "form/notesid" ], function(notesname) {
                    new notesname(_child)
                    // me.initComplate();
                })
            },
            // 初始化附件
            _initAttachment : function(el) {
                this.accumulator++;
                var me = this;
                require( [ "form/attachment" ], function(attachment) {
                    attachment(el,{
                        name:$(el).attr("name")
                    })
                    me.initComplate();
                });
            },
            /**
             * 验证表格
             *
             * @return
             */
            validate : function() {

                if (!this.editable)
                    return true;
                var me = this;
                var keyslist = []
                var isValidate = true;
                $.each(this.data, function(i, item) {
                    var keylist = "";

                    $.each(me.keys, function(i, key) {
                        if (key != me.rowKeyName)
                            keylist += item[key]

                    })
                    //无关键字，则不进行校验
                    if(keylist==""){
                        return true;
                    }
                    if(keylist=="undefined"|| $.trim(keylist)==""){
                        me.valierrel = $(me).find(
                            "[data-name=" + me.keys[0] + "]")[0];
                        $(me.valierrel).attr("data-errmsg", "关键字不能为空")
                        isValidate = false;
                        return false;
                    }
                    if ($.inArray(keylist, keyslist) > -1) {
                        me.valierrel = $(me).find(
                            "[data-name=" + me.keys[0] + "]")[0];
                        $(me.valierrel).attr("data-errmsg", "关键字必须唯一")
                        isValidate = false;
                        return false;
                    }
                    keyslist.push(keylist)
                })

                return isValidate;
            },
            /**
             * 将需要保存的域保存到指定字段内 可以进行统计计算/编辑更新/合并存储等
             *
             * @return
             */
            _saveField : function() {
                /**
                 * 编辑字段保存到独立域内
                 *
                 * @return
                 */
                var me = this;
                var saveFieldToNo = function() {
                    var _content = {};
                    $(me).find("input[data-storefield]").each(
                        function(i, el) {
                            var _key = $(el).attr("data-storefield")
                            if (_content[_key]) {
                                _content[_key] += "," + el.value
                            } else {
                                _content[_key] = el.value
                            }

                        })
                    for ( var a in _content) {
                        $("input[name=" + a + "]").val(_content[a])
                    }
                }
                /**
                 * 所有字段更新到独立域内
                 */
                var saveAllFieldToNo = function() {

                }

                saveFieldToNo()

            },
            save : function() {
                this._saveField()
                if (!this.editable)
                    return;
                // var _A = $("<div
                // data-type=table>").text(me.serializeVal())
                var _str = "<div data-type=table style=\"display:none;\"  data-table=\""
                    + this.id + "\""
                _str += $(this.element).attr("data-css") ? " data-css=\""
                    + $(this.element).attr("data-css") + "\"" : "";
                _str += $(this.element).attr("data-calss") ? " data-calss=\""
                    + $(this.element).attr("data-calss") + "\""
                    : "";
                _str += ">";
                _str += this.serializeVal();
                _str += "</div>";
                $(this.element).val(_str);
            },
            transfer : function() {

                var ReplaceUser = function(strusers, user) {
                    var _user = appinfo.username.replace(
                        /(cn=)?([^\/]*)\/.*/gi, "$2");
                    var users = strusers.split(/,/)
                    $
                        .each(
                        users,
                        function(i, u) {
                            if ($.trim(u).replace(
                                /(cn=)?([^\/]*)\/.*/gi,
                                "$2") == _user)
                                users[i] = $(
                                    "input[name=WF_Transfer]")
                                    .val();
                        })
                    return users.toString();
                }
                $(this).find("td[data-right=true][data-editable=true]")
                    .each(
                    function(i, td) {
                        if ($(td).find("[data-name]").is(
                            "[data-name]")) {

                        } else {
                            $(td).text(
                                ReplaceUser($(td).text()))
                        }
                    })
            }

        }

        var table = widget.sub();
        table.fn.extend({
            __initWidget:function(){
                var table =  new formTable({
                    element : this[0],
                    initForm : document.forms[0],
                    id :this.options.table || this.attr("name"),
                    classname :"inputForm_table",
                    css : this.options.css,
                    docwfunid : docinfo.unid34,
                    docunid : docinfo.unid
                })

                this.data("table",table)
            }
        })
        return table;
    })