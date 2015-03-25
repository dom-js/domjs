/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-7
 * Time: 上午9:17
 * To change this template use File | Settings | File Templates.
 */
/** 按照module版本进行模块加载，在模块版本未指定时，使用默认版本，默认版本*/
 define({
     version:"1.0.0",
     normalize: function (name, normalize) {
         var minfo = name.split(":"),
         modelpath = (normalize(minfo[0]));

         if(minfo[1]){
             minfo[1] = normalize(minfo[1]).replace(/_unnormalized\d+/gi,"")

           var  modelname = modelpath.split("/"),version = minfo[1]
             modelpath+="/"+version+"/"+modelname[modelname.length-1]
         }
           if(/^\//.test(modelpath)){
                 modelpath+=".js"
             }
     return modelpath;
    },
    load:function(name,req,load,config){

        if(name==""){
            load()
            return
        }
        require([name],function(m){
            load(m)
        },function(err){
            // console.log(err)
            throw  err
            return
            if(err.requireModules){
               // console.log(err.requireType)
                $.each(err.requireModules,function(i,errm){
                    if(err.requireType=="scripterror"){
                        alert("模块："+ errm + "不存在")
                        //throw  new Error("模块："+ errm + "不存在")
                    }
                    if(err.requireType=="define"){
                       // alert("模块："+ errm + "错误")
                        if(typeof console!= "undefined"&&  typeof console.log!= "undefined"){
                            console.log(err.stack)
                        }else{
                            require(["./widget/jbox"],function(jbox){
                                jbox(err.stack.replace(/\n/,"<br>"),{
                                    title:"javascript 错误：模块"+errm,
                                    width:800
                                })
                            })
                        }
                        //throw  new Error("模块："+ errm + "不存在")
                    }
                    requirejs.undef(errm);
                })
            }
        })
    }
 })