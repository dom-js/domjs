define(["jquery","store/memory","store/dxlstore","store/util/QueryResults","store/util/iNotesNamesQueryEngine"],
	function($,Memory,dxlstore,QueryResults,QueryEngine){ 
	var NamesStore = $.extend(function(ops){
		$.extend(this,ops)
	},Memory)  
	var me = this;
	me.result=[];
	me.matchlist=[]; //记录完全匹配的查询，则不再到服务器查询
	
	NamesStore.localstore = new Memory({idProperty:"unid",label:"lastname"});
	//执行本地查询操作
	var _queryLocal = function(query,options){
		var store = NamesStore.localstore;  
		var results=[] 
		var j,queryObj;
		var isAllMatch=true; //如果所有查询在本地都有 匹配，则不执行远程查询/ 
		var qlen=query.length;
		for (j in query){
			var qReg = new RegExp("^"+$.trim(query[j]).replace(/[\\\/].*/gi,""),"gi")
			queryObj={
				shortname:qReg,
				lastname:qReg,
				abbreviate:qReg,
				type:options.type||/.*/
			} 
			options.condition=function(obj){ 
				return obj.type &&( obj.shortname || obj.lastname || obj.abbreviate)
			}
			results = store.query(queryObj,options) ;  
			//更新查询关键字  
			var isMatch = false;
		 
			results.each(function(index,item){  
			 
				 item.originalname=query[j];
				 if(NamesStore.isMatch(item)) {
					 me.matchlist.push(item.originalname)
					 isMatch =  true; 
				 }  
				 
			})   
			isAllMatch = isAllMatch && isMatch;
		}  
		var ops = $({},options) 
		
		var maxlength = ops.count||this.count||10
		me.result=[];
		me.result = results 
		if(results.length>=maxlength||isAllMatch||NamesStore.filterQuery(query).length==0){   
			return true
		}else
			return false;
	}
	  
	NamesStore.prototype.queryEngine=QueryEngine;
	NamesStore.prototype.get=function(shortname){
		var store = NamesStore.localstore; 
		var items=store.query({shortname:shortname});
		if(items.length>0){
			return items[0];
		}else{
			return null;
		}
	}
	
	
	/**
	 * 查询用户,query是一组数组,每一个元素是一个用户shortname or lastname字符串
	 * @param query ,options
	 * @return item对象
	 */
	NamesStore.prototype.query=function(query,options){  
		if(options&&options.querylength){
			 String.prototype.charlength=function(){
			    a=this.match(/[^\x00-\xff]/ig)
			    return this.length+(a==null?0:a.length)
			}
			query=$.grep(query,function(q,i){
				return q.charlength()>=options.querylength;
			}) 
		}
		var store = NamesStore.localstore; 
		var deferred = new $.Deferred();
		if(_queryLocal(query,options)){  
			deferred.resolve(me.result) 
			return QueryResults(deferred) 
		}else{ 
			//使用NamesQueryEngine查询服务器信息
			var _results = QueryResults(this.queryEngine(query.toString().replace(/,/gi,";").replace(/\s*;/,";").replace(/\s*$/,"").replace(/^\s*/,""),{mailpath:this.mailpath}))
			
			//查询结果存入本地
			var _i =0
			_results.each(function(index,item){

				_i=index;
				store.put(item)
			}) 
			//再次执行本地查询
			_results.done(function(){  
				var _count = options&&options.count||10
				 //没有配置 count或者配置count但是记录数小于count，都进行处理
				//if(!options || !options.count ||_i<= options.count)
				if(_i<= _count)
				for(_j in query){
					NamesStore.fullmatch.push(query[_j]);
				} 
			
				_queryLocal(query,options)

				deferred.resolve(_results)
			})
		}
		return  QueryResults(_results)
	}
	//查询是否完全匹配
	NamesStore.filterMatch = function(results,matchlist){
		  return $.grep(results,function(item,i){
			 return ($.inArray(item.originalname,matchlist)==-1||(NamesStore.isMatch(item))) 
		 })
	}
	NamesStore.fullmatch=[]; //记录远程记录不满足查询最大数量的，则之后的搜索不再到远程查询
	
	NamesStore.filterQuery = function(query){
		return $.grep(query,function (q,i){
			var _i,_m,_reg
			
			for(_i in NamesStore.fullmatch){ 
				m =  NamesStore.fullmatch[_i]
				_reg = new RegExp(m) 
				if(q,m,_reg.test(q)) return false;
			} 
			return true;
		}) 	 
	}
	NamesStore.isMatch = function(item){
		 
		var getMatchString = function(str){
			return str.replace(/\s/gi,"").toLowerCase();
		}
		var abbreviate = getMatchString(item.abbreviate) 
		var originalname =getMatchString(item.originalname)  
		var lastname = getMatchString(item.lastname)   
		var shortname=  getMatchString(item.shortname)   
		return abbreviate==originalname||lastname==originalname||shortname==originalname
		//return item.abbreviate.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")||item.lastname.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")||item.shortname.replace(/\s/gi,"")==item.originalname.replace(/\s/gi,"")
	}
	return NamesStore;
})