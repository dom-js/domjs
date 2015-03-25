/**
 * Store结果集
 * 20130520 更新addIterativeMethod方法，修正添加延迟方法的相关错误
 */
define(["jquery"],function($){

    var QueryResults=function(results){
        //summary:
        // 	将查询结果进行封装处理，依赖 jQuery.when 以及 jQuery.Deferred;
        //Description:
        //	将一个查询结果的数组集和进行简单的封装，
        if(!results) return results;


        //flag是否返回结果集
        function addIterativeMethod(method,flag){
            if(!results[method]){
                var _res= $.when(results)
                //jQuery 方法扩展
                if(typeof $[method]=="function"){
                    results[method] = function(){
                        var args = arguments
                        var _re = _res.pipe(function(res){
                            Array.prototype.unshift.call(args, res);
                            return $[method].apply($, args);
                        });
                        if(flag){
                            return QueryResults(_re)
                        }else{
                            _re
                        }

                    } ;
                }else{
                    //延迟方法扩展
                    if(flag){
                        results[method]  =function(){
                            var args = arguments
                            var res = _re[method].apply(new $.Deferred(), args);
                            return QueryResults(_re)
                        }
                    }
                    results[method]  =_res[method]
                }
            }
        }
        //console.log(results)
        addIterativeMethod("pipe",true);// 添加此方法后，result执行pipe后依然返回一个result 而非Deferred
        addIterativeMethod("then");
        addIterativeMethod("done");
        addIterativeMethod("fail");


        addIterativeMethod("grep",true);
        addIterativeMethod("each");
        addIterativeMethod("map",true);
        // addIterativeMethod("promise");//promise 后返回的是一个result promise 而非 Deferred的promise
       if(!results.total){
            results.total =  $.when(results.total).then(function(total){
                return total
            })
        }
        return results;
    }
    return QueryResults
})	
