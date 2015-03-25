/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-4
 * Time: 下午4:54
 * 基于Objectj的html代码解析引擎 *
 * 20120823
 * 修嘎模块加载错误的处理机制
 */
define(["./objectj"], function (obj) {
    var objectjEngine = obj.sub();
    objectjEngine.fn.extend(new $.Deferred())
    objectjEngine.fn.extend({
        main:function (selector, context) {
            var _self = this;
            this.initComplete =[]
            $(function(){
                _self.initModules();
            })
        },
        initModules:function(){
            var _self = this
            var defs =this.initComplete
            var modules = [],els=[]
            this.find("[data-type]").each(function(i,el){
                var type = $(el).attr("data-type"),_t = type.split("/"), version =  $(el).attr("data-version"),m;
                if(_t.length==1)_t.unshift("form")
                type = _t.join("/")
                if(version){
                    m = "m!"+type+":"+version;
                }else{
                    m = type
                }

                switch(m){
                    case undefined:
                    case "undefined":
                    case "":
                        break;
                    default:
                        //对象载入并初始化完成，deferred 返回

                        modules.push(m);
                        els.push(el)

                }
            })

            require.apply(require,[modules,function(){

                var ms = {}
                $.each(arguments,function(i,molude){
                    var deferred =  new $.Deferred()
                    defs.push(deferred)
                    var el = els[i]
                    $(el).data("deferred",deferred)
                    try{
                        var m
                        switch(molude.modeltype){
                            case "objectj":
                                 m =  molude(el);
                                $.when.apply($,[m].concat(m.initComplete)).then(function(){
                                    deferred.resolve();
                                },function(e){
                                    deferred.reject(e);
                                });
                                break;
                            default:
                                var _ops = obj.__getHTMLParams.call($(el));
                                _ops.__element=el;
                                  m = new molude(_ops)
                                $(el).data("this", m)
                                $.when.apply($,[m].concat(m.initComplete)).then(function(){
                                    deferred.resolve()
                                },function(e){
                                    deferred.reject(e)
                                })
                        }
                        ms[modules[i]]={
                            module:molude,
                            instances:m
                        }

                    }catch (e){
                        deferred.reject(e)
                    }

                })
                //$(document).trigger("domjs.inited",[ms])
            },function(err){
                require(["base/util"],function(util){
                    util.error(err)
                    deferred.reject(e)
                })
            }])

        }

    })
    return objectjEngine;
})