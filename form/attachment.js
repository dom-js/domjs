/*!
 *
 * @author yinkehao@hotmail.com
 * 20120412附件处理控件，用于将页面域转换成附件上传对象。并将上传结果格式化显示 20120412 使用AMD 模式重写，修改附件选择框风格式样
 * 		   添加了因附近过大等问题引起失败的错误处理机制。
 * 		   添加了国际化支持
 * 20120413实现对文件类型的校验
 * @Created 20110623
 * @version V1.00.00
 * @return
 */

define(
    [ "base/objectj", "appinfo", "docinfo", "i18n!nls/form" ],
    function($, appinfo, docinfo, i18n) {

        var jQuery = $.sub();
        jQuery.fn
            .extend( {
                main : function(selector, context) {
                    if(this.data("this"))return this.data("this")
                    this.data("this", this)

                    this.key = "";
                    var othis = this[0];

                    if (othis && othis.type && othis.type == "text") {
                        this.options.isauthor = this.options.editable;
                    } else {
                        var _tagName = (this.attr("tagname")
                        || (othis && othis.tagName) || "attachment")
                            .toLowerCase()
                        if (_tagName && _tagName == "attachment") {
                            this.options.isauthor = false;
                        } else {
                            return;
                        }
                    }

                    // 名称
                    this.name = this.options.name || this.attr("name")
                    // 是否作者
                    this.isauthor =   this.options.isauthor == undefined ? (docinfo.isauthor == 1)
                        : this.options.isauthor;
                    // 显示区域
                    this.panel = jQuery.createdPanel(this.name)
                    this.before(this.panel).hide()
                    // 处理上传按钮

                    if (this.isauthor) {
                        var _self = this;
                        this.button = jQuery.createdButtonUpload();
                        this.button.bind("click", function() {
                            _self.selectFile.call(_self)
                        })
                        this.panel.append(this.button);
                    }
                    // 附件列表
                    this.listpanel = jQuery.createdListPanel();

                    this.panel.append(this.listpanel);
                    // 加载附件列表

                    this.getItem();
                    return this
                },
                validate : function() {
                    return this.val() != "";
                },
                options : {
                    isauthor:undefined,
                    name:undefined, //附件的域名称，如果指定了此致，则附件会双穿到此值对应的域位置
                    limittype : undefined,// 附件类型限制方式,定义undefined ，使用全局设置
                    allowtype :undefined,
                    rejecttype : undefined,
                    editable : true,
                    maxcount:0,
                    mincount:0
                },
                checkFileType : undefined,
                isauthor : false,
                panel : null,
                button : null,
                listpanel : null,
                name : "",
                key : "",
                count : 0,
                url : {
                    list : appinfo.dbpath
                    + "/pgAttachmentView?openpage",
                    upload : appinfo.dbpath + "/fmAttachment?openform",
                    del : appinfo.dbpath + "/agDelAttach?openagent"
                },
                selectFile : function() {
                    var url = this.url.upload;
                    url += "&WF_DocUNID=" + docinfo.unid34;
                    url += "&fp=" + this.name;
                    url += "&fn=refreshFileList";
                    url += "&isNewDoc=" + docinfo.isnewdoc;
                    jQuery.selectFile(this, url);
                },
                getItem : function() {
                    var url = this.url.list;
                    url += "&";
                    url += (new Date()).getTime();
                    url += "&key=" + docinfo.unid34 + this.name;

                    var _self = this// new (function(){return othis})();

                    var success = function(data) {
                        _self._getItem.call(_self, data);
                    }

                    jQuery.get(url, success)
                },
                _getItem : function(data) {

                    this.listpanel.empty();
                    var listEL = $("item", data)

                    this.count = listEL.length

                    if(this.count<this.options.maxcount||this.options.maxcount==0){
                        this.button&&this.button.show();
                    }else{
                        this.button&& this.button.hide();
                    }
                    var _self = this;
                    listEL.each( function(i, item) {
                        var opts = {
                            type : $("type", item).text(),
                            url : appinfo.dbpath
                            + $("url", item).text(),
                            text : $("name", item).text(),
                            size : $("size", item).text(),
                            doclink : appinfo.dbpath
                            + $("docLink", item).text(),
                            unid : $("unid", item).text()
                        }

                        if (opts.size == 0) {
                            //
                            require( [ "widget/jbox" ], function(jBox) {
                                _self.delItem(opts.unid);
                                var buttons={};
                                buttons[i18n["OK"]]="ok";
                                jBox.alert(i18n["Invalid file or zero-byte file, please re-upload."], i18n["Invalid file"],{
                                    buttons : buttons
                                })
                            })

                        } else {
                            _self.addItem(opts);
                        }
                    })

                    this
                        .val(this.count > 0 ? "<attachment data-type='attachment' name='"
                        + this.name + "'>"
                            : "")

                },
                addItem : function(opts, panel) {

                    var _self = this;
                    var domRow = $("<span></span>")

                    if (this.isauthor) {
                        var delDom = jQuery.createdButtonDelete().attr(
                            "dataDocLink", opts.doclink).css(
                            "cursor", "pointer").bind("click",
                            function() {
                                _self.delItem(opts.unid)
                            })
                        domRow.append(delDom);
                        domRow.append("&nbsp;")
                    }
                    var domLink = $("<a></a>");

                    if (opts.type) {
                        var domType = $("<img>").attr(
                            "src",
                            "/HikDefaultSytle/images/" + opts.type
                            + ".gif");
                        domRow.append(domType)
                        domType
                            .error( function() {
                                domType
                                    .attr("src",
                                    "/HikDefaultSytle/images/unkown.gif")
                                    .attr("width", 13).attr(
                                    "height", 16)
                            })
                    }

                    domRow.append("&nbsp;")
                    if (opts.url) {
                        domLink.attr("target", "_black")
                        domLink.attr("href", opts.url)
                        if (opts.text)
                            domLink.html(opts.text)
                        else
                            domLink.html(opts.url)
                    } else {
                        if (opts.text)
                            domLink.html(opts.text)
                    }
                    domRow.append(domLink)

                    domRow.append("(" + opts.size + ")")
                    domRow.append("<br>");
                    this.listpanel.append(domRow);
                },
                delItem : function(unid) {
                    var url = this.url.del;
                    var _self = this;
                    require(
                        [ "widget/jbox" ],
                        function(jBox) {

                            jBox.tip(i18n.deleting, "waiting")

                            $
                                .getJSON(
                                url,
                                {
                                    WF_DocUNID : docinfo.unid34,
                                    AttachUNID : unid,
                                    User : docinfo.user
                                },
                                function(data) {
                                    jBox.closeTip()

                                    if (!data.result
                                        || data.result == "false") {
                                        var buttons = {};
                                        buttons[i18n.ok] = true
                                        jBox
                                            .alert(
                                            i18n.delereordescript
                                            + "<br>"
                                            + "<div style='width:100%;border:1px dotted  #006600'>"
                                            + data.msg
                                            + "</div>",
                                            i18n.delerrortitle,
                                            {
                                                buttons : buttons
                                            });
                                    } else
                                        _self.getItem();
                                })
                        })

                },
                getButton : function(id /* string */) {
                    $("div[dataID='" + id + "'] [dataType='button']")
                    return $("div[dataID='" + id
                    + "'] [dataType='button']")
                }
            });

        jQuery
            .extend( {
                //
                created : function(selector, context) {
                    return jQuery(selector, context)
                },
                createdPanel : function(position) {
                    return $("<div   data-position='"
                    + position + "'></div>")
                },
                createdListPanel : function() {
                    return $("<div  ></div>")
                },
                createdButtonUpload : function() {
                    var bt = $("<a ></a>")
                    $(
                        "<img  style=\"BACKGROUND-IMAGE: url(/iNotes/Forms8.nsf/commonactionicons.gif?OpenFileResource&MX&TS=20080904T004937,78Z); BACKGROUND-POSITION: -80px 0px\">")
                        .attr("src",
                        "/iNotes/Forms8.nsf/transparent.gif")
                        .attr("title", i18n.attachment).attr("alt",
                        i18n.attachment).css("height", 16)
                        .css("width", 16).appendTo(bt);

                    bt.css("cursor", "pointer").append(
                        i18n.attachmentselect)
                    return bt;
                },
                createdButtonDelete : function() {
                    return $(
                        "<img dataType='btDel'  style=\"BACKGROUND-IMAGE: url(/iNotes/Forms8.nsf/commonactionicons.gif?OpenFileResource&MX&TS=20080904T004937,78Z); BACKGROUND-POSITION: -48px 0px\">")
                        .attr("src",
                        "/iNotes/Forms8.nsf/transparent.gif")
                        .css("height", 16).css("width", 16)
                },
                // 选择文件
                selectFile : function(attachment, url) {
                    var buttons = {}
                    buttons[i18n.upload] = 1
                    buttons[i18n.cancel] = 0

                    require( [ "widget/jbox" ], function(jBox) {
                        jBox("iframe:" + url,
                            {
                                title : i18n.uploadtitle,
                                width : 400,
                                height : 150,
                                submit : function() {
                                    return jQuery.onselectsubmit
                                        .apply(attachment,
                                        arguments)
                                },
                                loaded : function(h) {
                                    // 上传节目加载完成后进行处理
                                    var iframe = h.find("iframe")
                                    var form = h.find("iframe")
                                        .contents().find("form");
                                    // 控制提交后的return返回
                                    form.find("input[name='$$return']")
                                        .val("");
                                    // 设置样式
                                    form.css( {
                                        "margin" : 0,
                                        "padding" : 0
                                    })
                                    // 文件选择框样式
                                    form.find("input[type=file]").css( {
                                        margin : "0px 5px",
                                        height : "25px",
                                        width : "380px",
                                        "line-height" : "25px",
                                        border : "1px solid #EEEEEE",
                                        background : "#FEFEFE"
                                    })
                                    // 提示说明及样式
                                    form.find("#uploadstatus").css( {
                                        "font-size" : "12px",
                                        margin : " 5px",
                                        "text-align" : "left"
                                    }).text(i18n.uploadinstructions);
                                },
                                buttons : buttons
                            })
                    })
                },
                // 选择事件
                onselectsubmit : function(v, h, d) {
                    // v==1 选择了upload
                    if (v == 1) {
                        var _self = this;
                        var iframe = h.find("iframe")

                        var form = h.find("iframe").contents().find(
                            "form");

                        var filename = form.find("input[type=file]")
                            .val()

                        form.find("#uploadstatus").css( {
                            "font-size" : "12px"
                        }).text(i18n.uploadinstructions);
                        if (filename == "") {
                            jBox.tip(i18n["pleaseselectfile"],
                                "warning")
                            return false;
                        }
                        if (!jQuery.checkFileType.call(_self,filename)) {
                            jBox.tip(i18n.filetypeerror, "warning")
                            return false;
                        }
                        if (!jQuery.checkFileName(filename)) {

                            return false;
                        }
                        form.submit();
                        jBox.tip(i18n.uploading, "loading")

                        var interval = setInterval( function() {
                            try {
                                iframe.contents().find("body")
                            } catch (e) {
                                clearInterval(interval)

                                jBox.closeTip();
                                jBox.close(true);
                                var buttons = {}
                                buttons[i18n.ok] = true
                                jBox.alert(i18n.uploaderror,
                                    i18n.uploaderrortitle, {
                                        buttons : buttons
                                    })
                            }
                        }, 100)
                        iframe.load( function() {
                            clearInterval(interval)
                            _self.getItem();

                            jBox.closeTip();

                            jBox.close(true);
                        })

                        return false;

                    } else {

                        return true;
                    }

                },
                checkFileName : function(filename) {
                    var _reg = /^~|`/gi
                    if (_reg.test(filename)) {
                        jBox
                            .tip(
                            i18n["The file name can not contain the following characters:"]
                            + "(~,`)", "warning")
                        return true
                    }
                    return true
                },
                // 检查文件类型
                checkFileType : function(filename) {
                    var type = filename.match(/\.[^\.]*$/)

                    type = type == null ? "" : type[0].toLowerCase();
                    var limittype = this.options.limittype||jQuery.limittype;
                    var rejecttype = this.options.rejecttype||jQuery.rejecttype;
                    var allowtype = this.options.allowtype||jQuery.allowtype;
                    if (limittype == "reject"
                        && jQuery.inArray(type, rejecttype) == -1) {
                        return true;
                    } else if (limittype != "reject"
                        && jQuery.inArray(type, allowtype) > -1) {
                        return true;
                    } else {

                        return false;
                    }
                },
                // 返回父窗口
                getTopWin : function(s) {
                    return s == window.parent ? s : jQuery
                        .getTopWin(window.parent);
                },
                limittype : "reject",// 附件类型限制方式
                allowtype : [],
                rejecttype : [ ".exe", ".js", ".ls", "", ".html",
                    ".htc", ".css" ]

            })
        return jQuery;
    })