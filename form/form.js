/*!
 * @author yinkehao@hotmail.com
 * @version 00.01.00
 * @说明 对表单进行提交验证 20110629 添加表单初始化相关操作 20111125 引入jBox，美化提示
 * @ 20120426 通过objectj 对代码进行重构
 */

define(
    [ "jquery", "base/objectj", "app/appinfo", "docinfo", "base/util","css!./theme/css/form" ],
    function($, obj, appinfo, doc, util) {

        var form = obj.sub();

        form.fn
            .extend( {
            main : function(selector, options) {
                if (this.data("this"))
                    return this.data("this")
                else
                    this.data("this", this)
                util.translate("nls/form", "div.admin_Tools");
                this.extend(this.options, options);
                this.initAdmintools();

            },
            options : {
                isLock : !doc.isnewdoc ,
                beforeSubmit : function() {
                    return true
                },

                afterSubmit : function() {
                    return true
                },
                confirm : function() {
                    return true
                },
                rollback : function() {
                    return true
                },
                action : "submit",
                validate : function() {
                    return true
                },
                jconfirm : true
            },
            setOptions : function(opts) {
                this.options = $.extend(true,this.options, opts);
            },

            initAdmintools : function() {
                this
                    .find("#idAdministratorTools")
                    .live(
                    "click",
                    function() {
                        var adminWin = window
                            .open(
                            appinfo.dbpath
                                + "/fmAdminTools?openform&unid="
                                + doc.unid,
                            'adminWin',
                            'height='
                                + 250
                                + ', width='
                                + 500
                                + ', top='
                                + ($(
                                "body")
                                .height() - 250)
                                / 2
                                + ', left='
                                + ($(
                                "body")
                                .width() - 500)
                                / 2
                                + ', toolbar=no,menubar=no, scrollbars=no, resizable=no,location=no, status=no')

                    })
            },
            submit : function() {

                // 发布保存通知
                var _self = this;

                var afterSubmit = function() {
                    return true
                };

                var ops = $.extend( {
                    afterSubmit : true
                }, this.options);
                var callback;

                var _ops;
                _ops = {};
                if (arguments.length == 1) {
                    if (typeof arguments[0] == "function")
                        callback = arguments[0];
                    else {
                        _ops = arguments[0]
                    }
                }

                if (arguments.length == 2) {
                    _ops = arguments[0]

                    callback = arguments[1];
                }
                ops = $.extend(ops, _ops);
                // action 单用于保存操作
                ops.action = typeof _ops.action == "undefined" ? "submit"
                    : _ops.action

                require( [ "plugin/subscribe" ], function() {
                    $.publish("form/submit", [ ops ])
                })


                ops.callback = callback
                ops.checklockurl = doc.checklockurl
                ops.opened = doc.opened
                this.options = ops

                var _save = function() {

                    require( [ "form/action" ], function(save) {
                        save(_self.options)
                    })
                }
                // 校验类型判断
                var _validatetype = 1;
                switch (ops.action) {
                    case "submit":
                        _validatetype = 0;
                        break;
                    default:
                        _validatetype = 1;
                }

                switch (typeof (_ops.validate)) {
                    case "function":
                        _validatetype = _ops.validate() ? 1 : 2; // 1验证通过，2验证未通过
                        break;
                    case "boolean":
                        _validatetype = _ops.validate ? 1 : 0;// 0,需要使用默认验证，1：验证通过
                        break;
                    case "undefined":
                        // _validatetype = 0; // 使用默认验证
                        break;
                    default:
                }

                // 不同校验类型进行不同处理
                switch (_validatetype) {
                    case 1: // 无需校验或自定义校验通过，直接保存
                        _save();
                        break;
                    case 2:
                        // 自定义校验错误
                        return false;
                        break;
                    case 0:
                    default:

                        require( [ "form/validate" ], function(vali) {
                            var v = new vali()
                            $.when(v.validate()).then(function(flag){
                               // console.log()
                                if (flag) {
                                    _save();
                                } else {
                                    return false;
                                }
                            })

                        })

                }
                return;
            },
            close : function() {
                require(
                    [ "widget/jbox", "i18n!nls/form" ],
                    function(jBox, i18n) {
                        var buttons = {}
                        buttons[i18n["OK"]] = "ok",
                            buttons[i18n["Cancel"]] = "cancel",
                            jBox
                                .confirm(
                                i18n["Are you sure close the document without saving"],
                                i18n["Tips"],
                                function(v, h,
                                         f) {
                                    if (v == 'ok') {
                                        util.winclose()
                                    }
                                    return true; // close
                                },
                                {
                                    buttons : buttons
                                });
                    })
            }
        })
        window.BForm = form("form");
        return window.BForm;


    })