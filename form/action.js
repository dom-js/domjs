define(
    [ "jquery", "widget/jbox", "plugin/AjaxSubmit","base/util","i18n!nls/form" ,"docinfo"],
    function($, jbox,__undefined__,util,i18n,docinfo) {

        var action = function(ops) {
            /**
             * 提交完成后执行回调
             */
            var _onsubmited = function(data) {
                jBox.closeTip();
                var dom,error,buttons={},_len;
                var url = window.location.href;
                try{
                    var dom = $(data)
                    var error = dom.find("error"), desc, title
                    if (error.length > 0) {
                        error = error.text()
                        title =  util.translateStr(dom.find("title").text(),i18n);
                        desc =  util.translateStr(dom.find("description").text(),i18n) ;
                        url = dom.find("url").text()
                    } else {
                        title = i18n["The operation failed"]
                        desc = data.responseText;
                        //url = dom.find("url").text()
                    }
                    _len = desc.match(/<br>/gi);
                }catch(e){
                    error == 1
                    title = desc = i18n["The operation failed"]
                }
                util.trigger("form","aftersubmit",[ops,data]).then(function(flag){
                    if(flag){
                        _submitedDialog(error,desc,title,url)
                    }
                })
            }
            var _submitedDialog =function(error,desc,title,url){
                var buttons={},_len = desc.match(/<br>/gi), height = _len&&_len.length>10?$(window).height()*0.7:"auto";
                buttons[i18n["Continue"]]=1;
                buttons[i18n["Close"]]=0
                jBox.info(desc, title, {
                    width:500,
                    height:height,
                    icon : error == 0 ? "success" : "error",
                    submit : function(v, h, f) {
                        $("form").trigger("submited",[v])
                        switch (v) {
                            case 1:
                                window.location = url;
                                break;
                            case 0:
                            default:
                                    util.winclose(true);

                        }

                    },
                    showClose : false,
                    buttons :buttons,
                    buttonsFocus:1
                });
            }
            var callback = typeof (ops.callback) == "function" ? ops.callback
                : function() {
                if (ops.afterSubmit()) {
                    return   util.trigger("form","afterconfirm",[ops]).pipe(function(flag){
                        if(flag){
                            document.forms[0].Action.value = ops.action;
                            document.forms[0].$$QuerySaveAgent.value = ops.agent!=undefined?ops.agent:"(WebQuerySaveDocument)";
                            $(document.forms[0]).ajaxSubmit( {
                                error : _onsubmited,
                                success : _onsubmited
                            });
                            return true;
                        }
                        return false
                    })

                } else
                    return false
            }

            var _callback = function() {

                if (ops.jconfirm) { // jConfirm 使用jBox进行提示，true/false
                    var tipMsg = i18n["Are you sure"];
                    switch (ops.action) {
                        case "save":
                        case "saveClose":
                        case "saveCloseNoRef":
                            tipMsg = ops.actiontip || i18n["Do you want to save the document"];
                            break;
                        case "savenovali":
                            ops.action = "save";
                            tipMsg = ops.actiontip || i18n["Do you want to save the file without checking the validity of the input"];
                            break;
                        case "cancel":
                            tipMsg = ops.actiontip || i18n["Do you want to invalidate the document"];
                            break;
                        case "transfer":
                            tipMsg =  ops.actiontip ||i18n["Do you want to deal with permissions to be forwarded to another approver"];
                            break;
                        default:
                            afterSubmit = ops.afterSubmit
                            tipMsg = ops.actiontip || i18n["Do you want to submit the document"];
                    }
                    var buttons = {}
                    buttons[i18n["OK"]]="ok",
                        buttons[i18n["Cancel"]]="cancel",
                        jBox.confirm(tipMsg, i18n["Tips"], function(v, h, f) {
                            if (v == 'ok') {

                                if (!ops.beforeSubmit()) {
                                    ops.rollback();
                                    return false;
                                }

                                /**
                                 * 刷新最后修改时间
                                 */
                                var refreshOpened=function(){
                                    if(!docinfo.isnewdoc) return ;
                                    docinfo.formula({md:"@Modified",by:"$UpdatedBy"}).then(function(data){
                                         //console.log(data.by[data.by.length-1],docinfo.user)
                                        if((new RegExp("CN="+docinfo.user+"/")).test(data.by[data.by.length-1])){
                                            docinfo.opened = data.md
                                        }
                                    })
                                }
                                var defs = $("form").data("beforesubmitpromise")||[]

                                function queueDefs (defs,result){
                                    var result = result ||[]
                                    if($.isArray(defs)){
                                        if(defs.length<=0)return result
                                        var fun = defs.shift(),def
                                        if($.isFunction(fun)){
                                            def = fun()
                                        }else{
                                            def = fun
                                        }
                                       return   $.when(def).pipe(function(res){
                                           result.push(res)

                                             return queueDefs(defs,result)
                                        })
                                    }else{
                                        return $.when(defs).pipe(function(){return arguments })
                                    }

                                }
                               var def = new $.Deferred()
                                //并发异步操作
                             //   $.when.apply($,defs||[]).pipe(function(){

                               $.when(queueDefs($.map(defs,function(def){return def}))).then(function(result){

                                    var isResovle = true
                                    $.each(result,function(i,res){
                                      //  console.log(res)
                                        if(res===false){
                                            refreshOpened()
                                            def.reject(defs[i])
                                            return false
                                        }
                                    })
                                    if(isResovle){
                                        def.resolve()
                                    }
                                },function(e){
                                    refreshOpened()
                                    def.reject(e)
                                })

                                def.then(function(){
                                    jBox.tip(i18n["Please wait"], 'loading');
                                    callback().pipe(function(flag){
                                        if(flag){
                                            document.forms[0].disabled = true;
                                            $("input").attr("disabled", true);
                                            $("button").attr("disabled", true);
                                        } 
                                    })
                                },function(){
                                    ops.rollback();
                                    jBox.close(false);
                                })

                                return true; // close
                            } else if (v == 'cancel') {
                                ops.rollback();
                                jBox.close(false);
                                return false;
                            }
                        },{
                            buttons:buttons
                        });
                } else if (ops.confirm()) {
                    callback().pipe(function(flag){
                        if (!flag) {
                            ops.rollback();
                        } else {
                            $.jBox.tip(i18n["Please wait"], 'loading');
                            document.forms[0].disabled = true;
                            $("input").attr("disabled", true);
                            $("button").attr("disabled", true);
                        }
                    })

                } else {
                    if (_cf == "undefined") {
                        jBox.alert(i18n["Invalid parameter, confirm parameters must have a return value, please contact your administrator"])
                    }
                    ops.rollback();
                }
            }
            if (ops.isLock&&!docinfo.isnewdoc) {
                // url 后添加时间戳，防止缓存
                $
                    .get(
                    ops.checklockurl + "&type=text",
                    function(data) {
                        if (!Number(data.error)) {
                            if (docinfo.modified?(data.modified != docinfo.modified):new Date(data.modified) >new Date(ops.opened)){
                                jBox
                                    .alert(i18n["The current document have been  edit and save by others, please re-open the editor and submit or save"])
                            } else {
                               // $("form").trigger("beforesubmit")
                                util.trigger("form","beforesubmit",[ops]).then(function(flag){
                                    if(flag){
                                        _callback();
                                    }
                                })

                            }
                        }
                    }, "json").fail(function(data){
                        jBox.alert("登录超时或没有权限")
                    })
            } else {
                util.trigger("form","beforesubmit",[ops]).then(function(flag){
                    if(flag){
                        _callback();
                    }
                })
            }
        }
        return action
    })