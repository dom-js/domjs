define(function(){var Store=function(){};Store.prototype={idProperty:"id",queryEngine:null,get:function(id){},getIdentity:function(object){},put:function(object,directives){},add:function(object,directives){},remove:function(id){delete this.index[id];var data=this.data,idProperty=this.idProperty;for(var i=0,l=data.length;i<l;i++){if(data[i][idProperty]==id){data.splice(i,1);return;}}},query:function(query,options){},transaction:function(){},getChildren:function(parent,options){},getMetadata:function(object){}};Store.PutDirectives=function(id,before,parent,overwrite){this.id=id;this.before=before;this.parent=parent;this.overwrite=overwrite;};Store.SortInformation=function(attribute,descending){this.attribute=attribute;this.descending=descending;};Store.QueryOptions=function(sort,start,count){this.sort=sort;this.start=start;this.count=count;};Store.QueryResults={each:function(callback){},grep:function(callback){},forEach:function(callback,thisObject){},filter:function(calllback,thisObject){},map:function(callback,thisObject){},then:function(callback,thisObject){},observe:function(listener,includeAllUpdates){},total:0};Store.Transaction={commit:function(){},abort:function(callback,thisObject){}};return Store;});