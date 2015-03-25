define(["jquery","form/form","appinfo","docinfo","base/util","css!./theme/css/form.toolbar"],function($,form,appinfo,docinfo,util){
    //定义所有操作内部变量
    var toolbar = function(){

    }
    var action={
        edit:function(){
            require(["docinfo"],function(docinfo){
                var url=window.location.href.toLowerCase();
                if(docinfo.isauthor && !docinfo.isdocbeingedited){
                    if(url.indexOf("?edit")==-1)
                        window.location=url.replace("?open","?edit")
                }
            })

        },
        save:function(){

            form.submit({action:"savenovali",validate:true});

        },
        submit:function(){
            form.submit();
        },
        invalide:function(){
            form.submit({action:"cancel",validate:true});
        },
        transfer:function(){
            require(["form/transfer"],function(transfer){
                transfer()
            })
        },
        close:function(){
            if(docinfo.isdocbeingedited)
                form.close();
            else
                util.winclose();
        },
        expandall:function(){
            require(["form/section"],function(sec){
                sec.expandall()
            })
        },
        collapseall:function(){
            require(["form/section"],function(sec){
                sec.collapseall()
            })
        },
        reminder:function(){
            require(["widget/jbox","i18n!nls/form"],function(jBox,i18n){
                if(docinfo.remindtime){
                    jBox.tip("你已发送过催办消息，请勿重新发送","error");
                    return false
                }
                docinfo.remindtime=(new Date())
                var url=appinfo.dbpath+"/agRemind?openagent&" +docinfo.remindtime.getTime();
                $.ajax({url:url,dataType:"json",data:{unid:docinfo.unid,flowcode:docinfo.flowcode},
                    success:function(data){
                        if(data.error==0){

                            var msg = util.translateStr(i18n["Have taken place in the e-mail to remind $user"],i18n,data.data)
                            jBox.tip(msg,"success");
                        }

                    },
                    error :function(data){

                    }

                })

            })

        },
        addbuttom:function(item){
            //item.on.call()
        }

    }
    $( function() {
        util.translate("nls/form","#toolbar").then(function(){
            $("#toolbar").show();
        })
        //键盘提交/保存
        if (docinfo.isdocbeingedited)
            $(document).keydown( function(e) {
                if (e.ctrlKey && e.which == 83){
                    if (e.shiftKey&&docinfo.isauthorcurr){ //当前处理人（ctrl+alt+s 提交）
                        action.submit();
                    }else{ //作者 //ctrl + s  保存
                        action.save();
                    }
                    e.preventDefault();
                    return false;
                }
            })
        $("#toolbar_edit").on("click",action.edit)
        $("#toolbar_submit").on("click",action.submit)
        $("#toolbar_save").on("click",action.save)
        $("#toolbar_invalide").on("click",action.invalide)
        $("#toolbar_transfer").on("click",action.transfer)
        $("#toolbar_exit").on("click",action.close)
        $("#toolbar_reminder").on("click",action.reminder)
        //展开关闭
        $("#toolbar_expandall").on("click",action.expandall)
        $("#toolbar_collapseall").on("click",action.collapseall)
        //键盘关闭
        $(document).keydown( function(e) {
            //27:esc 推出 alt+q /alt+c 推出
            if( e.which==27  || (e.altKey && (e.which == 67 || e.which ==81))){
                action.close();
                e.preventDefault();
                return false

            }
        })

        if (docinfo.isauthor&&!docinfo.isdocbeingedited )
            $(document).keydown(function(e){
                if(e.ctrlKey && e.which == 69){
                    action.edit()
                }
            })
    })

    return action
})
