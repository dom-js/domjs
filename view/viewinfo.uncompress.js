/*！
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-9-5
 * Time: 上午10:56
 * 获取视图基本配置信息
 */
define(["jquery","appinfo","base/util"],function($,appinfo,util){
    var getViewConfig = function(key){
            var fs={}
            if($.isArray(key)){
                $.each(key,function(i,k){
                    fs["key"+i]='@ifError(@DbLookup("";"";"SysViewConfig";"'+k+'";"Dockey");"")'
                })
            }else{
                fs.key = '@ifError(@DbLookup("";"";"SysViewConfig";"'+key+'";"Dockey");"")'
            }
            return appinfo.formula(fs).pipe(function(res){
                delete res.error
                var defs=[]
                $.each(res,function(key,val){
                    if(res[key]!=""){
                        defs.push(  appinfo.getdoc( "SysViewConfig"+val))
                    }
                })
                return $.when.apply($,defs).pipe(function(){
                    var docs = []
                    $.each(arguments,function(i,arg){
                        var formname=arg.Form||arg.FORM||"";
                        if(formname.toLowerCase() =="sysviewconfig"){
                            docs.push(arg)
                        }
                    })
                    return docs
                })

            })
        },
        getSearcgConfig = function(key){
            return appinfo.formula({
                cols: '@DbLookup("";"";"vwSearchConfig";"'+key+'";"Dockey")'
            }).pipe(function(res){
                    var defs = $.map(res.cols,function(ckey){
                        return   appinfo.getdoc("fmSearchConfig"+ ckey).pipe(function(doc){

                            if(doc.txFieldType=="listformula"){
                                return appinfo.formula({
                                    txListValues:doc.txListValues
                                }).pipe(function(res){
                                        doc.txListFormula = doc.txListValues
                                        doc.txListValues = res.txListValues
                                        doc.txFieldType="list"
                                        return [doc]
                                    })
                            }else{
                                return [doc]
                            }

                        })
                    })
                    return util.getDefsPromise(defs).pipe(function(res){
                        return res
                    })
                })
        }
    return {
        getConfig:function(type){
            var type = type||"view"
            if(type=="view"){
                var  key
                if(this.cate!=""&&this.cate!="*"){
                    key  =[this.viewname,this.viewname+this.cate]
                }else{
                    key  =this.viewname
                }
                return getViewConfig(key)
            } else{
                return getSearcgConfig(this.searchname)
            }
        }
    }
})

