/**
 * Store API,Store对象基础API，为其他用户组建提供数据支持
 * 本API实现与Dojo.store.api相同，可以处理Dojo.sote.api数据
 * 
 */
define(function(){
	var Store = function(){  
	}
	Store.prototype={
			
			//Summary:
			//	对象标识符
			idProperty:"id",
			//Summary：
			//	对象查询引擎
			//return :Function etc.
			queryEngine:null,
			get:function(id){
				//Summary:
				//	根据ID获取内容信息
				//id:String||Number
				//	对象标识符
				//return:Object
				//
			},
			getIdentity:function(object){
				//Summary:
				//	获取对象的ID标识符
				//object:Object
				//	要回去标识符的对象
				//return:String||Number
				
			},
			put:function(object,directives){ 
				//Summary:
				//更新一个对象
				//object:Object
				//	对象
				//directives:Store.PutDirectives
				//	指定对象的id，位置，父对象，以及是否覆盖
			},
			add:function(object,directives){
				//Summary:
				//	添加一个对象
				//object:Object
				//	对象
				//directives:Store.PutDirectives
				//	指定对象的id，位置，父对象，以及是否覆盖
			},
			remove:function(id){
				//Summary:
				//	移除一个对象
				//Id:String||Number
				//	对象标识符
				delete this.index[id]; 
				var data = this.data, idProperty = this.idProperty;
				for(var i = 0, l = data.length; i < l; i++){
					if(data[i][idProperty] == id){
						data.splice(i, 1);
						return;
					}
				}
			},
			query:function(query,options){   
				//summary:
				//	执行一个查询
				//query:String|Object|Function
				//	查询条件
				//options:Store.QueryOptions
				//	包含一系列查询条件
				//return:Store.QueryResults; 
			}, 
			transaction:function(){
				//summary:
				//	执行操作事务
				//	很多时候虽然存在事务操作,但是transaction()将不被直接调用，如果执行add,put,delete等操作时，这种情况向，将会通过auto-commit执行事务
				//  return Store.Transaction 
			},
        /**
         * 根据当前对象获取其子对象
         * @param parent:Object 要回去子节点的父对象
         * @param options:Store.QueryOptions 包含一系列查询条件辅助（翻页等）
         * @return return:Store.QueryResults;
         */
			getChildren:function(parent,options){

			},
			getMetadata:function(object){
				//summarg:
				//	返回对象的元数据
				//object:
				//	需要返回元数据的对象
				//return: object
			} 
		 
		}
	Store.PutDirectives =function(id,before,parent,overwrite){
		//将指令传递给  put() 和 add() ，以更新这两个操作对对象内容的更新和创建 
		this.id=id;
		this.before=before;
		this.parent=parent;
		this.overwrite=overwrite;
	}
	Store.SortInformation = function(attribute, descending){
		// summary:
		//		对象排序属性的方式（指定的属性 attribute排序方式）
		// attribute: String
		//		排序属性名称.
		// descending: Boolean
		//		排序方法，缺省为 flase
		this.attribute = attribute;
		this.descending = descending;
	}
	Store.QueryOptions =function(sort,start,count){
		//summary:
		//	添加对象查询条件的辅助参数
		//sort:sort.SortInformation[]
		//	要排序的指令集和，如[{attribute:name,descending:true}]
		//start:Number
		//	返回记录的起点
		//count:Number
		//	返回记录的数量
		this.sort=sort;
		this.start=start;
		this.count=count;
		
	}
	Store.QueryResults ={
		each:function(callback){
			//summary:
			//	执行循环查询 执行对Array的循环处理
			//callback:Function
			//	回调函数
		},
		grep:function(callback){
			//summary:
			//	执行一个过滤操作，对于dojo的 filter
			//callback：Function
			//过滤函数
			//return:Store.QueryResults
		},
		forEach:function(callback,thisObject){ 
			//summary:
			//	执行循环查询 执行对Array的循环处理
			//callback:callback:Function
			// 	回调函数
			//thisObject:object
			//	callback内的this对象
			//this.each.call(thisObject,callback)
		},
		filter:function(calllback,thisObject){
			//summary：
			//	对查询结果进行过滤操作
			//callback:Function
			//	执行filter或对数据处理的函数
			//thisObject:Object
			//	callback内的this对象
			//return:Store.QueryResults
		},
		map:function(callback,thisObject){
			
		},
		then:function(callback,thisObject){
			//summary:
			// 查询执行完成之后进行的处理
		},
		observe:function(listener,includeAllUpdates){
			//summarg:
			//  注册一个事件用于监听结果的修改变化
			//listenner：Function
			// 监听函数，当查询结果发生变化时是否对查询结果产生影响，该函数定义如下
			// arguments:
			// |listenner(object,removeForm,insertInto)
			// 		*object:将要创建/修改或删除的对象
			//		*reniveForm:object对象在数组中的位置的索引，如果为-1，表示对象不在数组之内，则该对象将被添加到查询结果集合之内
			//		*insertInto:object 对象要存入数组中的索引位置，如果为-1,表示对象不在数组内，则将结果添加到数组中
			//includeAllUpdates:Boolean
			//	是否对原集合产生影响。默认为false
		},
		//Nummber|Promise?
		//返回记录总数，该值也可能是一个 响应——在延迟处理（如异步处理时）可能无法理解返回一个结果
		total:0 
	};
	Store.Transaction = {
		commit:function(){
			//summary:
			//	提交一个操作事务,发生错误将会抛出异常,如果存在延迟，也可能返回一个响应
		},
		abort:function(callback,thisObject){
			//summary:
			//	终止事务操作,发生错误将会抛出异常,如果存在延迟，也可能返回一个响应
			 
		}
	}
	return  Store;
}
)