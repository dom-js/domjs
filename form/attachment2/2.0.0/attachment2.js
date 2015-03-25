define([ 'jquery', "base/objectj", "base/util","appinfo", "docinfo", "i18n!nls/form", "widget/jbox", "base/util","require","exports","module"],
    function ($, obj,util,appinfo, docinfo, i18n, jbox, util,require,exports,module) {
        /**
         * appinfo/docinfo 说明
         * // docinfo.isauthorcurr
         // docinfo.isdocbeingedited,
         // docinfo.unid34,
         // appinfo.filesagentpath,
         // appinfo.username,
         // appinfo.appname
         //docinfo.unid
         */

//       var exports = module.exports=function(opts){
//            var _self = this,opts=this.options= $.extend({
//                isauthor:false,
//                name:undefined,
//                editable:undefined,
//                agentpath:undefined,
//                unid:undefined,
//                unid34:undefined,
//                username:undefined,
//                flashdoc:false,
//                writelog:false,
//                downable:false,
//                preview:"jbox",
//                printable:true,
//                target:"_blank",
//                charset:"utf-8",
//                fileicopath:"upload/src/fileico"
//            },opts),doms=this.doms={
//                node:$(opts.__element)
//            }
//        }

        var base64  = util.base64;
        var attachment2 = obj.sub();

        function getNiceFileSize(bitnum) {
            var _K = 1024;
            var _M = _K * 1024;
            if (bitnum < _M) {
                if (bitnum < _K) {
                    return bitnum + 'B';
                } else {
                    return Math.ceil(bitnum / _K) + 'K';
                }

            } else {
                return Math.ceil(100 * bitnum / _M) / 100 + 'M';
            }
        }

        attachment2.fn
            .extend({
                main: function (selector, context) {
                    var _self = this
                    if (!this.options.agentpath) {
                        alert("需要管理员配置文件代理路径")
                    }
                    if (this.data("this"))
                        return this.data("this");
                    this.data("this", this)
                    $.extend(this.options, context);

                    var othis = this[0];

                    // 名称
                    this.name = this.options.name || this.attr("name");

                    // 是否作者
                    var othis = this[0];

                    if (othis && othis.type && othis.type == "text") {
                        this.options.isauthor = this.options.editable;
                    }
                    if (typeof this.options.editable == "undefined") {
                        var othis = this[0];

                        if (othis && othis.type && othis.type == "text") {
                            //this.options.isauthor = this.options.editable;
                            this.options.editable = docinfo.isauthorcurr && docinfo.isdocbeingedited;
                        } else {
                            this.options.editable = false;
                        }
                    } else {
                        this.options.editable = false;
                    }
                    // 显示区域
                    this.panel = attachment2.createdPanel(this.name)
                    this.before(this.panel).hide()
                    // 处理上传按钮

                    if (this.options.editable) {
                        var _self = this;
                        this.button = attachment2.createdButtonUpload();
                        this.button.bind("click", function () {
                            _self.selectFile.call(_self)
                        })
                        this.panel.append(this.button);
                    }
                    // 附件列表
                    this.listpanel = attachment2.createdListPanel();

                    this.panel.append(this.listpanel);
                    //if (othis && othis.type && othis.type == "text"&&othis.value=="")return this
                    this.enable().then(function () {

                        _self.getFilesList().then(function (data) {
                            $(_self).trigger("loaded", [_self, data])
                        })
                    })

                    return this
                },
                validate: function () {

                    return this.val() != "";
                },
                options: {
                    isauthor: docinfo.isauthorcurr,
                    name: undefined, // 附件的域名称，如果指定了此致，则附件会双穿到此值对应的域位置
                    editable: undefined,//docinfo.isauthorcurr
                    //&& docinfo.isdocbeingedited,
                    agentpath: appinfo.filesagentpath,
                    unid: docinfo.unid,
                    unid34: docinfo.unid34,
                    username: appinfo.username,
                    appname: appinfo.appname,
                    flashdoc: appinfo.flashdoc || false,
                    writelog: false,
                    downable: true,
                    previewwin: "jbox",
                    printable: true,
                    target: "_blank",
                    charset: "utf-8",
                    fileicopath: "upload/src/fileico",
                    saveparams:[],
                    localsave:true
                },
                panel: null,
                button: null,
                listpanel: null,
                name: "",
                selectFile: function () {
                    attachment2.selectFile.call(this);
                },
                getFilesList: function () {
                    if (!this.fileslist) {
                        this.fileslist = this.getItem()
                    }
                    return this.fileslist
                },
                getItem: function () {

                    var url = this.options.agentpath
                        + "/getfileList.action?";
                    var callback = "attachment/" + this.name
                        + "/" + (new Date()).getTime() + "/" + Math.random().toString().substr(2);
                    url += "&callback=" + callback;
                    url += "&wf_unid=" + this.options.unid34;
                    url += "&position=" + this.name;

                    var _self = this// new (function(){return othis})();
                    var def = new $.Deferred();
                    try {
                        $.ajax({
                            url: url,
                            dataType: 'script',
                            scriptCharset: _self.options.charset,
                            statusCode: {
                                404: function () {
                                    console.log("page not found");
                                }
                            },
                            complete: function () {
                                require([ callback ], function (data) {
                                    _self.listpanel.empty();
                                    if (!data)return
                                    var items = []
                                    $.each(data, function (i, item) {
                                        var type = item.FILE_REALNAME.match(/\.{1}([^\.]*$)/)
                                        if (type && type.length == 2) {
                                            type = type[1]
                                        } else {
                                            type = "unknown"
                                        }
                                        var opts = {
                                            type: type,
                                            url: item.FILE_URL,
                                            text: item.FILE_REALNAME,
                                            size: getNiceFileSize(item.FILE_SIZE),
                                            unid: item.FILE_ID,
                                            flashdoc: item.EXP_1 == "1" || false,
                                            org: item
                                        }
                                        _self.addItem(opts);
                                        items.push(opts)
                                    })

                                    def.resolve(items)

                                    _self.computervalue(items)
                                }, function (e) {
                                    def.reject()
                                    util.warn("Files Server Error:", e)
                                })
                            }
                        }).fail(function (e) {
                                //   console.log(e)
                                // def.reject()
                                //util.warn("Server Not Run;",e)
                                //console.log("Server Not Run;",e)
                            })
                    } catch (e) {
                        def.reject()
                        util.warn("Get File List Error;", e)
                    }
                    this.fileslist = def
                    return def
                },
                getFiles: function () {

                },
                getListHTML:function(items){
                    var _self =this;
                    if(!items)return ""

                    return $.map(items,function(item){
                        var url = _self.getDownLoadUrl(item);
                        var icopath = require.toUrl(_self.options.fileicopath + "/" + item.type + ".gif")
                        return "<span style='width: 100%;display: inline-block'  class='attachment-link'  ><img src='"+icopath+"' " +
                            " title='' alert=''" +
                            " style='width: 13px; height: 16px;border:null' >" +
                            "<a target='_blank' href='"+url+"'>"+item.text+"</a></span>"
                    }).join("")
                },
                computervalue: function (items) {
                    var html = ""
                    if (this.listpanel.find("span").length > 0) {
                        html += "<div";
                        html += " data-name='" + this.name + "'";
                        if (this.options.savemoreinfo) {
                            html += " data-printable='" + this.options.printable + "'";
                            html += " data-previewwin='" + this.options.previewwin + "'";
                            html += " data-writelog='" + this.options.writelog + "'";
                            html += " data-agentpath='" + this.options.agentpath + "'";
                            html += " data-unid34='" + this.options.unid34 + "'"
                        }
                        html +=  $.map(this.options.saveparams,function(param){
                            var v = this.options[param]
                            if(typeof v !="undefined"){
                                return  " data-"+param+"=\"" + this.options[param] + "\""
                            }else{
                                return null
                            }
                        }).join(" ");

                        if(!this.options.localsave&&!this.options.flashdoc){
                            html+=" data-type='attachment2'"
                            html += ">";
                        }else{
                            html += ">";
                            html += this.getListHTML(items);

                        }
                        html +="</div>";
                    }
                    this
                        .val(html)
                },
                getDownLoadUrl:function(item,flag){

                    var key = this.getKey(item.unid)
                    var url = appinfo.dbpath + "/(all)/" + this.options.unid34 + "?opendocument&fileId=" + item.unid + "&form=fmAttachment2Download&key=" + key
                    url += "&writelog=" + this.options.writelog+"&empName="+util.getName(appinfo.username)
                    if(flag){
                        url+="&action=previewFile"
                    }
                    return url;
                },
                addItem: function (opts, panel) {
                    var _self = this;
                    var domRow = $("<span></span>")
                    opts.key = _self.getKey(opts.unid)
                    if (this.options.editable) {
                        var delDom = attachment2.createdButtonDelete()
                             .attr("dataDocLink", opts.url).css(
                                "cursor", "pointer").bind("click",
                            function () {
                                _self.delItem(opts.unid, opts.key, this)
                            })
                        domRow.append(delDom);
                        domRow.append("&nbsp;")
                    }
                    var domLink = $("<a></a>");
                    if (opts.type) {
                        var icopath = require.toUrl(_self.options.fileicopath + "/" + opts.type + ".gif")
                        var domType = $("<img>").attr(
                            "src",
                            icopath);
                        domRow.append(domType)
                        domType.error(function () {
                            var icopath = require.toUrl(_self.options.fileicopath + "/unknown.gif")
                            domType.attr("src", icopath)
                                .attr("width", 13).attr("height", 16)
                        })
                    }

                    domRow.append("&nbsp;")
                    var url = appinfo.dbpath + "/(all)/" + this.options.unid + "?opendocument&fileId=" + opts.unid + "&form=fmAttachment2Download&key=" + opts.key
                    url += "&writelog=" + this.options.writelog+"&empName="+util.getName(appinfo.username)

                    if (opts.url) {
                        domLink.css({
                            "cursor": "pointer"
                        })
                        //  if(_self.options)
                        if (opts.text)
                            domLink.html(opts.text)
                        else
                            domLink.html(opts.url)

                        domLink.on("click", null, opts, function (e) {
                            _self.download(url, opts)
                        })
                    } else {
                        if (opts.text)
                            domLink.html(opts.text)
                    }
                    domRow.append(domLink)
                    if (opts.flashdoc) {
                        var domPreview = $("<span style='cursor: pointer; padding:1px;margin:1px;margin-left: 3px; margin-right: 3px;border:1px dotted #666;'>" + i18n["Preview"] + "</span>")
                        domPreview.on("click", function () {
                            _self.preview(url, opts) // alert(i18n["Preview"])
                        })
                        domRow.append(domPreview)
                    }
                    domRow.append("(" + opts.size + ")")
                    domRow.append("<br>");
                    this.listpanel.append(domRow);
                    //domRow.hide();
                    //domRow.show("slow");
                },
                getKey: function (unid) {
                    var key = ""
                    //生成base64编码字符串
                    var j = this.name.length;
                    var m, n
                    //循环32次，按照name的长度开始计算与32求余，从余数位开始，循环重新组装64位unid
                    for (m = 0; m < 32; m++) {
                        n = m + j;

                        //   n>31?n-=31:n
                        n = n < 61 ? (n > 31 ? n - 31 : n) : n % 32;
                        //n = n % 32;
                        key1 = this.options.unid34.substr(n + 2, 1), key2 = unid.substr(31 - n, 1)
                        key += key1 + key2;
                    }
                    return  base64.encode(key)
                },
                delItem: function (fileid, key, el, refresh) {
                    var _self = this
                    var refresh = typeof refresh == "undefined" ? true : refresh
                    var url = this.options.agentpath
                        + "/deletefile.action?fileId=" + fileid;
                    var callback = "attachment/delete/" + fileid
                        + "/" + (new Date()).getTime() + "/" + Math.random().toString().substr(2);
                    url += "&callback=" + callback
                    url += "&key=" + key
                    url += "&writelog=" + this.options.writelog+"&empName="+appinfo.username
                    var _self = this;
                    var def = new $.Deferred();
                    require([ "widget/jbox" ], function (jBox) {

                        jBox.tip(i18n.deleting, "waiting")

                        $.getScript(url, function (data) {
                            require([ callback ], function (data) {
                                jBox.closeTip()
                                if (refresh) {
                                    if (el) {
                                        $(el).parent().remove()
                                        _self.computervalue();
                                        def.resolve()
                                    }
                                    else
                                        _self.getItem().then(function () {
                                            def.resolve()
                                        });
                                } else {
                                    def.resolve()
                                }

                            })
                        })

                    })
                    return def;
                },

                disable: function (flag) {
                    var _self = this
                    if (_self.valistatus === undefined) {
                        _self.valistatus = _self.data("data-validate")
                    }
                    if (this.status == "disable") {
                        return $.when(this.status)
                    } else {
                        _self.status = "disable"
                        if (flag === undefined) {
                            return $.when(this.status)
                        }
                        return  $.when(this.getFilesList()).pipe(function (items) {
                            var def = new $.Deferred()

                            if (items.length > 0) {
                                if (flag) {
                                    _self.deleteAll().pipe(function () {
                                        return _self.getItem()
                                    }).then(function () {
                                            def.resolve(_self.status)
                                        })
                                } else {
                                    jbox.confirm("附件列表存在附件，是否需要同步删除", "提示", function (v) {

                                        if (v == "ok") {
                                            _self.deleteAll().pipe(function () {
                                                return _self.getItem()
                                            }).then(function () {
                                                    def.resolve(_self.status)
                                                })
                                        } else {
                                            def.resolve(_self.status)
                                        }
                                    })
                                }

                            } else {
                                def.resolve(_self.status)
                            }
                            return def.pipe(function (res) {
                                _self.data("data-validate", false)
                                try {
                                    _self.panel.hide()
                                } catch (e) {
                                }
                                return res
                            });
                        })
                    }
                },
                enable: function () {
                    var _self = this;
                    var def
                    if (this.status == "enable") {
                        def = $.when(this.status)
                    } else {
                        this.status = "enable"
                        def = this.getItem().pipe(function () {
                            return _self.status
                        });
                    }
                    return def.pipe(function (res) {

                        _self.data("data-validate", _self.valistatus)
                        try {
                            _self.panel.show()
                        } catch (e) {
                        }
                        return res
                    });
                },
                deleteAll: function () {
                    var _self = this;
                    return  $.when(this.getFilesList()).pipe(function (items) {

                        var defs = $.map(items, function (item) {
                            return _self.delItem(item.unid, item.key, null, false)
                        })
                        return  $.when.apply($, defs).pipe(function () {
                            return items
                        })
                    })
                },
                download: function (url, item) {
                    if (docinfo.isnewdoc) {
                        jbox.alert(i18n["Please save the document and then download or preview."])
                        return
                    }
                    if (!this.options.downable) {
                        return false
                        //domLink.attr("href", url+"&action=download")
                    } else {
                        if (this.options.target == "attachment") {
                            var iframe = $("iframe[name=attachment]")
                            if (iframe.length == 0) {
                                iframe = $("<iframe  style='display:none' name=attachment></iframe>")
                                $("body").append(iframe)
                            }
                        }
                        var vargs = []
                        vargs.push("height=120")
                        vargs.push("width=500")
                        vargs.push("top=" + ((window.screen.availHeight - 10 - 120) / 2))
                        vargs.push("left=" + ((window.screen.availWidth - 10 - 500) / 2))
                        vargs.push("toolbar=no")
                        vargs.push("location=no")
                        vargs.push("status=no")
                        vargs.push("resizable=no")
                        vargs.push("scrollbars=no")
                        //  url += "&writelog=" + this.options.writelog+"&empName="+appinfo.username
                        var o={}
                        $(this).trigger("download",[o,item,"download"])
                        var extparams=[];
                        var _self = this
                        $.each(o,function(key,value){
                            if(typeof _self.options[key]!="undefined"||key=="extparams")return true
                            extparams.push(key);
                            url+="&"+key+"="+value
                        })
                        url+="&extparams="+extparams.join(",")
                        var _win = window.open(url + "&action=download", this.options.target, vargs.join(","))

                        if (_win && _win.open && !_win.closed) {
                            _win.focus();
                            setTimeout(function () {
                                _win.close()
                            }, 10000)
                        }
                    }

                    //http://192.0.0.99:8088/swfUploadDemo/previewFile.action?fileId=
                    //   domLink.attr("target", this.options.target)


                },
                preview: function (url, item) {
                    if (docinfo.isnewdoc) {
                        jbox.alert(i18n["Please save the document and then download or preview."])
                        return
                    }
                    //  url += "&writelog=" + this.options.writelog+"&empName="+appinfo.username
                    var o={}
                    $(this).trigger("download",[o,item,"preview"])
                    var extparams=[];
                    var _self = this
                    $.each(o,function(key,value){
                        if(typeof _self.options[key]!="undefined"||key=="extparams")return true
                        extparams.push(key);
                        url+="&"+key+"="+value
                    })
                    url+="&extparams="+extparams.join(",")

                    switch (this.options.previewwin) {
                        case "jbox":
                            require(["widget/jbox"], function (jbox) {
                                var buttons = {}, width, height;
                                $("html").css({
                                    overflow: "hidden"
                                })

                                width = $("body").width() - 40
                                height = $(window).height() - 40
                                jbox("iframe:" + url + "&action=previewFile", {
                                    draggable: false,
                                    top: 20,
                                    width: width,
                                    height: height,
                                    title: i18n["Preview"] + ":" + item.text,
                                    buttons: {},
                                    closed: function () {
                                        $("html").css({
                                            overflow: "auto"
                                        })
                                    }
                                })
                            })
                            break;
                        case "modal":
                            var width, height, vargs = [];
                            width = $("body").width() - 40
                            height = $(window).height() - 40
                            vargs.push("dialogHeight=" + height + "px")
                            vargs.push("dialogWidth=" + width + "px")
                            vargs.push("center=yes");
                            vargs.push("scroll=no");
                            window.showModalDialog([url + "&action=previewFile"], [], vargs.join(";"))
                            break;
                        default:
                            var _win, width, height, vargs = [];


                            width = $("body").width() - 40
                            height = $(window).height() - 40
                            vargs.push("height=" + height)
                            vargs.push("width=" + width)
                            vargs.push("top=20")
                            vargs.push("left=20")
                            vargs.push("toolbar=no")
                            vargs.push("location=no")
                            vargs.push("status=no")
                            vargs.push("resizable=yes")
                            vargs.push("scrollbars=no")
                            _win = window.open(url + "&action=previewFile", this.options.previewwin, vargs.join(","));
                            if (_win && _win.open && !_win.closed) {
                                _win.focus();
                            }
                    }

                },
                getButton: function (id /* string */) {
                    $("div[dataID='" + id + "'] [dataType='button']")
                    return $("div[dataID='" + id + "'] [dataType='button']")
                }
            });

        attachment2
            .extend({
                //
                created: function (selector, context) {
                    return attachment2(selector, context)
                },
                createdPanel: function (position) {
                    return $("<div  data-position='"
                        + position + "'></div>")
                },
                createdListPanel: function () {
                    return $("<div ></div>")
                },
                createdButtonUpload: function () {
                    var bt = $("<a ></a>")
                    $(
                        "<img  style=\"BACKGROUND-IMAGE: url(/iNotes/Forms8.nsf/commonactionicons.gif?OpenFileResource&MX&TS=20080904T004937,78Z); BACKGROUND-POSITION: -80px 0px\">")
                        .attr("src",
                            "/iNotes/Forms8.nsf/transparent.gif")
                        .attr("title", i18n.attachment).attr("alt",
                            i18n.attachment).css("height", 16).css(
                            "width", 16).appendTo(bt);

                    bt.css("cursor", "pointer").append(
                        i18n.attachmentselect)
                    return bt;
                },
                createdButtonDelete: function () {
                    return $(
                        "<img dataType='btDel'  style=\"BACKGROUND-IMAGE: url(/iNotes/Forms8.nsf/commonactionicons.gif?OpenFileResource&MX&TS=20080904T004937,78Z); BACKGROUND-POSITION: -48px 0px\">")
                        .attr("src",
                            "/iNotes/Forms8.nsf/transparent.gif")
                        .css("height", 16).css("width", 16)
                },
                // 选择文件
                selectFile: function () {
                    var _self = this;
                    require([ "upload/upload" ], function (upload) {
                        var up = upload(_self, _self.options)
                        up.showDialog()
                    })
                }

            })
        return attachment2
    })