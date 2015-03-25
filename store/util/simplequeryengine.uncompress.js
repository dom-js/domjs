//>>built
define("store/util/SimpleQueryEngine", ["jquery"], function($) {
  //  module:
  //    store/util/SimpleQueryEngine
  //  summary:
  //    定义了一个简单的Store对象查询引擎 

return function(query, options){
	// summary:
	//		一个简单的查询引擎 
	//
	// query: Object
	//		一个含有store内item的filed的hash表,用于查询，values可以是一个==操作，也可以是一个正则或者含有test方法的对象
 	// options: store.util.SimpleQueryEngine.__queryOptions?
	//		含有返回结果的排序等信息的参数，保护sort,start,count
	//
	// returns: Function
	//		返回函数缓存里与 查询参数匹配的信息。
	//
	// example:
	//		定义一个 Store，引用该引擎
	//
	//	|	var myStore = function(options){
	//	|		//	其他一些操作可以在这里实现
	//	|		this.queryEngine = dojo.store.util.SimpleQueryEngine;
	//	|		//	定义查询使用 查询引擎查询
	//	|		this.query = function(query, options){
	//	|			return dojo.store.util.QueryResults(this.queryEngine(query, options)(this.data));
	//	|		};
	//	|	};


	switch(typeof query){
		default:
			throw new Error("Can not query with a " + typeof query);
		case "object": case "undefined":
			var queryObject = query;
			 
			query = function(object){
				
				for(var key in queryObject){
					
					var required = queryObject[key];
					if(required && required.test){
						//console.log(required.toSource(),object[key],required.test(object[key]))
						if(required.test(object[key])){ 
							return true;
							break;
						} 
					}else if(required == object[key]){ 
						return true;
						break
					}
				} 
				//console.log(object)
				return false;
			};
			
			break;
		case "string":
			// named query
			if(!this[query]){
				throw new Error("No filter function " + query + " was found in store");
			}
			query = this[query];
			// fall through
		case "function":
			// fall through
	}
	function execute(array){
		// 执行过滤
		var results = $.grep(array, query);
		 
		//排序
		if(options && options.sort){
			results.sort(function(a, b){
				for(var sort, i=0; sort = options.sort[i]; i++){
					var aValue = a[sort.attribute];
					var bValue = b[sort.attribute];
					if (aValue != bValue) {
						return !!sort.descending == aValue > bValue ? -1 : 1;
					}
				}
				return 0;
			});
		}
		// 计算分页
		if(options && (options.start || options.count)){
			var total = results.length;
			results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
			results.total = total;
		}
		var deferred = new $.Deferred();

        deferred.resolve(results) 
		return deferred;
	}
	
	//execute.matches = query;
	return execute;
};
});
