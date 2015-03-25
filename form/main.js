/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-3
 * Time: 上午8:40
 * To change this template use File | Settings | File Templates.
 */
 (function(){
        var apppath = window.location.href.match(/.*\.nsf/)[0];
        var apppath = window.location.href.replace(window.location.search,"").match(/.*\.nsf/)[0];

        require.config({
            paths:{
                app:apppath,
                "form/section":"form/section/"+($.browser.msie?"section-msie":"section")
            }
        })

    })();
define(["jquery","widget/jbox","appinfo","docinfo"],function($,jbox,appinfo,docinfo){

$( function() {
    //多状态处理提示控制
    !function(){

            var hn=  $("[name=WF_HandleNode]")
            //#_RefreshKW_WF_HandleNode
            var ls = hn.find("option")
            if(ls.length>1&&location.hash!="#_RefreshKW_WF_HandleNode"){

               if(hn.modal){
                   var str= "<div class='modal fade in alert alert-info'>";
                       str +=  "<div class='modal-header'>当前多个状态需要您处理，请选择你需要处理等状态</div>" ;
                       str +=    "<div class='modal-body'>";

                   ls.each(function(i,el){
                       if(el.value=="")return ;
                       str += "<div class='row-fluid' style='padding:10px;text-align: center'><button class='btn btn-large "+(i==1?"btn-primary":"")+"'  type='button' value='"+el.value+"'>" ;
                       var text =el.text+"——("+el.value+")";
                       str+= el.text = text;
                       str +=    "</button></div>"
                   })
                       str +=    "</div>" ;
                       str +=    "</div>";

                   var modal =  $(str);
                   modal.modal({});
                   modal.on("click",".btn",function(){
                       hn.val($(this).attr("value"));
                       hn.change()
                   })
                   modal.on("hidden",function(){
                       hn.val("");
                       hn.change()
                   })
               }else{
                   hn.val("");
                   hn.change()
               }
           }
    }()
    //应用维护提示控制
    !function(){
        if(appinfo&&appinfo.dicLookUp)
            appinfo.dicLookUp("SYS_APP_MAINENANCE",["values_1","values_2","values_3","values_4"]).pipe(function(res){

                if(res.values_1=="1"){
                    if(res.values_4!=""){
                        return docinfo.formula({flag:res.values_4}).pipe(function(fs){
                            var flag = !(fs.flag=="0")
                            return {
                                show:flag,
                                msg:res.values_2
                            }
                        })
                    }else{
                        return {
                            show:true,
                            msg:res.values_2
                        }
                    }

                }else{
                    return {
                        show:false,
                        msg:res.values_2
                    }
                }

        }).then(function(res){
                    if(!res.show)return false;
                    var modal =  $("<div class='modal fade in alert alert-info'>"+res.msg+"</div>");
                    if(modal.modal){
                        modal.modal({});
                        modal.on("hidden",function(){
                            $(".formHeader").before("<div style='position: fixed;top:35px;left:30px;right:30px' class=' alert alert-error'>" +
                                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>"+res.msg+"</div>");
                        });

                    }else{
                        $(".formHeader").before("<div style='position: fixed;top:35px;left:30px;right:30px;padding:8px 15px;border:1px solid #eed3d7;color:#b94a48; background-color:rgb(242, 222, 222)' >"+
                            res.msg+"</div>");
                    }
         })
    }()
    $("input").each(function(i,el){

        if( typeof el.type=="undefined" ||el.type=="text"){

            el.type = "text"
            // $(el).attr("type","text");
        }
    })
    if(!jbox)return false
    jbox.tip("loading","loading",{opacity:0.2})
    var defs =  [new $.Deferred(),new $.Deferred()]

    $.when.apply($,defs).then(function(){
        $("html").css({ "background-color":"#FFF"})
        jbox.closeTip()
    },function(e){
        console.log(e.stack)
        throw(e)
    })

    requirejs.onScriptError = function(err) {
        require(["base/util"],function(util){
            util.error(err)
        })
    };
    // 获得当前数据库地址，并且将app指向当前应用，baseUrl设置为/domjs

    require(
        [ "jquery", "docinfo"  ,"form/toolbar"],
         function($, docinfo) {
            // 这三个对象已经定义，无需载入
             $("form").css({
                 "background-color":"#FFF"
             }).fadeIn(1000)
            if (docinfo.flowname == "") {
                $(".ToolButton .icon").parent().hide();
                $(".iconexit").parent().show()
                return;
             }
            require(["base/objectjEngine", "form/form","form/section"], function (eg)
                {
                    try{
                        var ob = eg("body")
                        $.when.apply($, ob.initComplete).then(defs[0].resolve,defs[0].reject)
                    }catch (e){
                        defs[0].reject(e)
                    }
                },
                defs[0].reject
            )

            require(["jquery","docinfo","base/util"],function($,docinfo,util){
                     if(docinfo.langpack&&docinfo.langpack!=""){
                         require(["di18n!"+docinfo.langpack],function(i18n){
                             document.title = i18n[document.title]||document.title
                             util.translate(docinfo.langpack,"div.formHeader","di18n")
                             util.translate("nls/form","div.formHeader")
                             $("div.formHeader").show();
                             defs[1].resolve()
                         },defs[1].reject)
                     }else{
                             util.translate("nls/form","div.formHeader")
                             $("div.formHeader").show();
                             defs[1].resolve()
                     }
                 },defs[1].reject)

        })
})})