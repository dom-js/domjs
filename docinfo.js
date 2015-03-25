/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-5-22
 * Time: 下午2:02
 * 2013-1-24 修复dbpath在新疆文档时无法获取的bug
 *  *
 */

define(["jquery"],function ($) {
    //console.error("docinfo 未定义docinfo，请在具体应用内定义具体的docinfo")

//    var pathinfo = window.location.pathname.match(/^(.*\.nsf)\/[^\/]*\/([\w\d]{32})$/),
    var pathinfo =  window.location.pathname.match(/^(.*\.nsf)\/([^\/]*\/([\w\d]{32}))?/),
        dbpath = pathinfo && pathinfo[1],
        unid = pathinfo && pathinfo[3],
        jsrespath = "//"+ window.location.host+"/domjs",
        isnewdoc = /\?openform/gi.test(window.location.href),
        isdocbeingedited =  /\?(openform|edit)/gi.test(window.location.href),
    //获取cookie信息
        getcookie=function(cookiename) {
            try{
                var _reg = new RegExp(cookiename + "=([^=]*)(;|$)", "i")
                var _info = _reg.exec(document.cookie);
                return _info && _info[1]
            }catch(e){
                return undefined
            }
        },
        username=getcookie("LastVisitUserName"),
        /**
         * 当前文档内执行notes公式
         * formula 公式
         * type，返回值类型，如果类型为sting则返回字符串，默认返回jsonp
         * module，模型名称，一般如果需要反复使用同一个公式，切可以使用缓存的时候才有此方法。
         */
        formula=function(formula,type,module){
            if(this.isnewdoc){return $.when(undefined)}
            var deferred = new $.Deferred()
            if(typeof formula=="string"){
                formula = formula
            }else{
                var arr=[];
                for(i in formula){
                    arr.push(i+"="+formula[i])
                }
                formula = arr.join(",")
            }
            var url = this.dbpath+"/(all)/"+this.unid+"?opendocument&form=SysComputerFormula&formula="+formula
            if(type){
                url+="&type="+type
            }
            if(module){
                url+= "&module="+module
            }else{
                module = "FORMULA/T" + (new Date()).getTime()+"/R"+Math.random().toString().substr(2);
                url+= "&module="+module
            }
            $.getScript(url).then(function(){
                require([module],function(data){
                    if(data.error==0){
                        deferred.resolve(data)
                    }else{
                        deferred.reject(data)
                    }
                },function(e){
                    deferred.reject(e)
                })
            }).fail(function(e){
                deferred.reject(e)
            })
            return deferred
        }
    return {
        jsrespath:jsrespath,
        unid:unid,
        // unid34:"",
        //  unidparent:"",
        isauthor:false,
        dbpath:dbpath,
        // isauthorcurr:false,
        user:username,
        isnewdoc:isnewdoc,
        //opened:"",
        // checklockurl:""+(new Date()).getTime(),
        // islock:true,
        isdocbeingedited:isdocbeingedited,
        //  handlesec:"",
        //      langpack:"",
        formula:formula
    };
})