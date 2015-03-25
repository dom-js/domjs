/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 13-12-2
 * Time: 上午9:54
 * To change this template use File | Settings | File Templates.
 */
define(function(require,exports,module){
   var $=require("jquery");
    var bootstro =  require("./bootstrap/bootstro/bootstro");
    require("css!./bootstrap/bootstro/bootstro.min") ;
    var appinfo = require("appinfo");
    var Store =  require("./store/viewstore");
    exports = module.exports = bootstro;
    var storeSubject , storeItem;
    var localStorage = window.localStorage;
    var baseKey = appinfo.dbpath.toLowerCase();
    var loadSubject=function(opts){
         storeSubject = new Store({
            db:opts.dbpath||appinfo.dbpath
            ,view:opts.view||"vwIntroSubject"
            , count:opts.count||100
        });
        storeItem = new Store({
            db:opts.dbpath||appinfo.dbpath
            ,view:opts.view||"vwIntroItem"
            , count:opts.count||100
            ,idProperty:"cate"
        });
        return  storeSubject.load()
    }

    var runSubjects = function(data){
        // $( "<i class='icon-question-sign' style='position: fixed;top:8px;right: 25px;'></i>")
        var strHTML="<div class=\"dropdown nav pull-right\" style='position: fixed;top:8px;right: 25px;z-index: 100'> "+
            "<i class='icon-question-sign' ></i>"+
            '<a class="dropdown-toggle" id="dLabel" role="button" data-toggle="dropdown" data-target="#" href="/page.html"> Help <b class="caret"></b> </a>' +
            ' <ul class="dropdown-menu nav pull-right" role="menu" aria-labelledby="dLabel"> ' +
            '</ul> ' +
            '</div>'
        var domHelp  = $(strHTML)

       var isInit=false
        var Runing=false
        $.each(data,function(i,item){

            try{
                var fn = new Function( item.scripts)
                var run = function(flag){
                    runSubject(item,flag)
                }
                $.when(fn.call({
                        run:run,
                        getList:function(){
                            return getSubjectList(item)
                        }
                })).pipe(function(flag){
                        if(!isInit){
                            $("#toolbar").before(domHelp)
                            isInit=true;
                        }
                        var helpItem=$("<li class='dropdown'><a style='cursor: pointer'>"+item.subject+"</a></li>")
                        domHelp.find(".dropdown-menu").append(helpItem);
                        helpItem.on("click",function(){
                            run(true)
                        })

                        //IE9+自动播放
                        if(flag!==false&&!Runing&&$.support.htmlSerialize){
                            Runing=true;
                            run()
                        }else{
                            getSubjectList(item)
                        }
                })
            }catch(e){
              //  console.log(e)
            }
        })
    }
    var cache={};
    var getSubjectList =function(ItemSubject){
        if(cache[ItemSubject.subject])  return  cache[ItemSubject.subject];
        return  cache[ItemSubject.subject] = storeItem.getChildren({
            cate:ItemSubject.subject
        }).map(function(item){
                //if($(item.selector).size()<1)return null;
                var result= $.extend({
                    "finishButton":" " +
                        "<button type='button' class=' btn  btn-mini bootstro-finish-btn' value='2' title='不再提示'><i class=' icon-minus-sign'></i></button>" +
                        "<button type='button' class='btn btn-mini bootstro-finish-btn' value='1' title='结束指引'><i class='icon-stop'></i></button>"
                } ,item);
                 if(!$.support.htmlSerialize){
                     result.content +="<div class=' alert'>使用最新浏览器可以获得更好的性能与效果</div>" ;
                }
                if(item.tipselector){
                    $(item.tipselector).append("<i class='icon-question-sign' style='cursor:help;'></i>");
                    $(item.tipselector+" i").popover($.extend({
                        trigger:"hover",
                        html:true,
                        template : '<div class="popover" style="max-width: ' + item.width  + ';width: ' + item.width  + ';"   ><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div>' +
                        '</div>'
                    },item,{
                        placement:item.tipplacement?item.tipplacement: item.placement
                        ,selector:false
                    }))
                }
                if(item.scripts){
                    try{
                        var start=function(i){
                            if(i){
                                bootstro.start("body",{
                                    startstep: i
                                })
                            }else{
                                bootstro.start("body",{
                                    result: [item]
                                })
                            }
                        }
                        var run = function(){
                            start()
                        }
                        var fn = (new Function( item.scripts ))
                        if(fn.call({
                            item:item,
                            bootstro:exports,
                            run:run,
                            start:start,
                            refresh:function(){
                                if(RunList[ItemSubject]&&RunList[ItemSubject].runing){
                                    bootstro.start(ItemSubject.selector,{},true)
                                }
                            },
                            next:function(){
                                if(RunList[ItemSubject]&&RunList[ItemSubject].runing){
                                    exports.next();
                                }
                            }
                        },item)===false){
                            return null
                        }
                    }catch(e){
                    }
                }

                return result;
            });
    };
    var RunList={

    }
    var runSubject = function(ItemSubject,flag){
        getSubjectList(ItemSubject) .pipe(function(items){
                RunList[ItemSubject]={
                    start:false,
                    runing:false,
                    finish:false
                };
                if(!flag){
                    if(!window.localStorage)return false;
                    if(localStorage.getItem(baseKey+"allIntro")=="1")return false
                    if(localStorage.getItem(baseKey+"Intro"+ItemSubject.subject)=="1") return false;
                }
                RunList[ItemSubject]. finish=false;
                RunList[ItemSubject]. runing=true
                bootstro.start(ItemSubject.selector,{
                    result: items
                    ,onExit:function(arg){
                             var e = arg.e;
                           if(e && e.currentTarget && e.currentTarget.value){
                                if(e.currentTarget.value==2){
                                    localStorage.setItem(baseKey+"Intro"+ItemSubject.subject,"1")
                               }
                           }
                        RunList[ItemSubject]. runing=false
                        RunList[ItemSubject].finish=true;
                    },
                    onComplete:function(arg){
                        RunList[ItemSubject]. runing=false
                        RunList[ItemSubject].finish=true;
                       // bootstro.isComplate=true
                    }
                })
        });
    };
    var    isrun =false;
    exports.run=function(opts){
        var opts = opts||{}
        if(isrun)return ;

        setTimeout(function(){
            isrun=true;
            loadSubject(opts).pipe(function(data){
                runSubjects(data);
            });
       },1000)
        return ;
    }
})