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


        function addIterativeMethod(method){
            if(!results[method]){
                results[method] = function(){
                    var args = arguments
                    var _re
                    //jQuery 方法扩展
                    if(typeof $[method]=="function"){
                        _re = results.pipe(function(results){
                            Array.prototype.unshift.call(args, results);
                            return $[method].apply($, args,results);
                            //return QueryResults($[method].apply($, args,results));
                        });
                    }else{
                        //延迟方法扩展
                        _re = $.when(results)[method]
                    }
                    return QueryResults(_re)
                } ;
            }else{
                if(!results["old_"+ method]){
                    var methodHandler =  results["old_"+ method] =  results[method]
                    results[method] = function(){
                        var args = arguments
                        var _res = methodHandler.apply(results,args)
                        _res["old_"+ method]=methodHandler
                        return QueryResults(_res)
                    }
                }else{
                    delete results["old_"+ method]
                }
            }
        }
        //console.log(results)
        addIterativeMethod("pipe");// 添加此方法后，result执行pipe后依然返回一个result 而非Deferred
        addIterativeMethod("then");
        addIterativeMethod("done");
        addIterativeMethod("fail");


        addIterativeMethod("grep");
        addIterativeMethod("each");
        addIterativeMethod("map");
        // addIterativeMethod("promise");//promise 后返回的是一个result promise 而非 Deferred的promise


        if(!results.total){

            // results.total = results.promise();
            results.total =  $.when(results.total).then(function(total){
                return total
            })

        }
        return results;
    }
    return QueryResults
})	
