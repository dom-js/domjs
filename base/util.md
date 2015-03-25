# 基本功能组件 #
- **类型**：公共函数库
 
## util.trigger ##

**Summary**

 触发一个Dom的操作事件，区别与[`$.trigger()`](http://api.jquery.com/trigger/),提供一个返回值，该值会根据通过[`$.on()`](http://api.jquery.com/on/)绑定的事件返回结果进行计算，如果最终得到一个最终结果。

如果通过$.on("eventname")，绑定一个事件到对应的Dom上，改绑定需要安装如下实例规则进行编码
	
	$("form").on("show",function(e){
		var res

		//业务代码
		e.results.push(res)
		or
		return [res].concat(e.result)
	})

在上述事例中，的返回结果格式是固定的，要求返回一个数组。已当前结果堆放在事件结果集合内；

返回结果res是一个Boolean类型或者一个[`$.Deferred`](http://api.jquery.com/category/deferred-object/)类型，如果是$.Deferred类型时，要求其返回值为Boolean类型。

在所有事件执行后，如果所有的结果都为true，则最终结果为true否则为false
 
- **类型**函数
- **参数**
	- **selector**(String/Dom): 要绑定事件的Dom元素、对应选择器
	- **eventname**(String)：事件名称
	- **args**(Array)[Option] 要传递给事件的参数

- **返回值**
	
	该方法返回一个[`$.Deferred`](http://api.jquery.com/category/deferred-object/)实例，其值为类型为`Boole`	

### 调用说明 ###
通过 util.trigger 触发的事件，可以被阻断，而且支持多个阻断，支持异步阻断，支持异步事件的顺序执行。
如下代码

- **Case**
	
	事件触发
	 
		util.trigger("#abc","show").then(function(flag){
			if(flag){
				alert("OK")
			}else{
				alert("false")
			}
		})

	事件调用
		
		$("#abc").on("show",function(e){ 
			e.results.push(true)
		})

		$("#abc").on("show",function(e){ 
			return [false].concat(e)
		})

	返回结果`flag:false`

在事件调用是 e.results可以push boolean、deferred、function

- boolean：false将产生阻断
- deferred：包含的结果为flase将阻断
- function：将会在上一个deferred完成之后在执行function，如果上一个deferred返回false，则不会执行。
	利用function的机制，可以实现延迟事件队列，队列内地异步事件将会逐个执行，并且有一个返回false，后续事件队列将会终止。



## util.uid ##

**创建一个十六进制随机ID**
### 参数 ###
 - **len**(Number)[option]:随机值长度，默认32，最大可以返回64位
### Case ###

创建32位随机ID10个
<button type=button class=btn id="util-uid-01" >创建</button>
<script>
require(["base/util"],function(util){
	$("#util-uid-01").on("click",function(){
		var str = "" 
		for(var i=0;i<10;i++){
			str+= (("000"+(i+1)).slice(-2)+":"+util.uid()+"<br>")
		}
		$("#util-uid-console-01").html(str)
	})
})
</script>
><div class='alert' id="util-uid-console-01"  style="font-family: serif;"> </div>

- Code

		<button type=button class=btn id="util-uid-01" >创建</button>
	 	<div class='alert' id="util-uid-console-01"  style='font-family: serif;'> </div>
		<script>
		require(["base/util"],function(util){
			$("#util-uid-01").on("click",function(){
				var str = "" 
				for(var i=0;i<10;i++){
					str+= (("000"+(i+1)).slice(-2)+":"+util.uid()+"<br>")
				}
				$("#util-uid-console-01").html(str)
			})
		})
		</script>
	
## util.toDate(datestring) ##
将日期字符串转换成日期对象
主要解决不同浏览器下对字符串格式要求不兼容的问题

### 参数 ###
- datestring(string):支持格式 日期部分：yyyymd yyyymmdd、yyyy-mm-dd 、yyyy/mm/dd等，时间部分hh:mm:ss,h:m:s,hhmmss等。时间和日期直接需要有空格或者T。时间部分后可以跟任意字符串（预览解决时区问题机制）
### Code ###
	 
		require(["base/util"],function(util){
		   util.toDate("20131212")
		   util.toDate("2013-12-12")
		   util.toDate("2013/12/12")
		   util.toDate("2013-12-12 12:12:12")
		   util.toDate("2013/2/2 12:12:12")
		   util.toDate("20130212 12:12:12")
		   util.toDate("2013212 121212")
		   util.toDate("201322 12:12:12")
		   util.toDate("2013-2-12 121212")
		   util.toDate("2013-02-12 2:2:2")
		   util.toDate("2013/02/2 2:2:2")
		})
		 

##util.ajax ##

**Summary**

参考jQuery.ajax，实现跨域支持。
跨域支持，只需要在返回的HTTPHeader 中添加如下两个属性即可：

- Access-Control-Allow-Credentials: true
- Access-Control-Allow-Origin : *.
		允许访问跨域请求的源，为*表示无限制
- Access-Control-Allow-Headers:accept,origin,content-type,soapaction
- Access-Control-Allow-Methods:POST,GET
	

 

## util.base64##

**Summary**
Base64 编码对象
### 方法 ###
	
- **encode(str)** 对字符串str进行base64编码
- **decode(base64code)** 对base64编码字符串base64code 进行解码 


### 属性 ###

**_VERSION**　版本

 
### Case ###

	var str= "abcd"
	var a=util.base64.encode(str);
	var b = util.base64.decode(a) 
	
## util.ws ##

**Summary**
对js调用WebService进行支持，可以返回webservice的所有操作，并可以直接使用这些操作

### 参数 ###
- **opts**(PlainObject):
	- **wsdl**（String）:wsdl地址。
	- **dataType**（String）[Option]：操作返回的数据列席，默认为文本，可以为`json`、`xml`。建议在操作返回后进行解析。
	- **onlyie**（Boolean） [Option]:默认为false，当ws只能在IE下实现跨域时，此值设为true。
	
### Case ###
<button class=btn id="util-ws-z4-actionlist">查询WS方法列表</button>	
<br>
<input name="util-ws-input-bomcode" value='300801254'/>
<input name="util-ws-input-bomstatus" value='Z4'/>
<br>
<button class=btn id="util-ws-checkstatus">查询状态</button>	如果返回物料待办，则物料状态与指定状态一致，否则不一致
<div class="alert" id="util-ws-console"></div>	
<script>
	
	require(["base/util"],function(util){
	
	var getAction = function(){
		return  util.ws({wsdl:"http://10.1.11.24:8088/materialManageSer/materialService.ws?wsdl"});
	}
	
	$("#util-ws-z4-actionlist").on("click",function(){
		getAction().then(function(as){
			var list = $.map(as,function(fun,key){
				return "<li>"+key+"</li>"
			})
			var html = "<ul>"+list.join("")+"</ul>"
			$("<div class='modal fade in'><div class='modal-body'>"+html+"</div></div>").modal({})
		})
	})
	$("#util-ws-checkstatus").on("click",function(){
		getAction().then(function(soapAction){
			var code = $("[name=util-ws-input-bomcode]").val(),
			status = $("[name=util-ws-input-bomstatus]").val()
		 
	 		soapAction.checkNoteMaterialStatus2(code,status).then(function(res){
			  $("#util-ws-console").text(res)
			})
		})
	})
	
	});
	 
</script>

<div id="util-ws-z4-console" class="alert-info"></div>
	<button class=btn id="util-ws-z4-actionlist">查询WS方法列表</button>	
	<input name="util-ws-input-bomcode" value='300801254'/>
	<input name="util-ws-input-bomstatus" value='Z4'/>
	<button class=btn id="util-ws-checkstatus">查询状态</button>	
	
	<script>
	
		require(["base/util"],function(util){
		
		var getAction = function(){
			return  util.ws({wsdl:"http://10.1.11.24:8088/materialManageSer/materialService.ws?wsdl"});
		}
		
		$("#util-ws-z4-actionlist").on("click",function(){
			getAction().then(function(as){
				var list = $.map(as,function(fun,key){
					return "<li>"+key+"</li>"
				})
				var html = "<ul>"+list.join("")+"</ul>"
				$("<div class='modal fade in'><div class='modal-body'>"+html+"</div></div>").modal({})
			})
		})
		$("#util-ws-checkstatus").on("click",function(){
			getAction().then(function(soapAction){
				var code = $("[name=util-ws-input-bomcode]").val(),
				status = $("[name=util-ws-input-bomstatus]").val()
			 
		 		soapAction.checkNoteMaterialStatus2(code,status).then(function(res){
				  $("#util-ws-console").text(res)
				})
			})
		})
		
		});
		 
	</script>


##util.getjsonp##

**Summary**

获取远程jsonp格式数据（跨域访问应用较多），要求远程数据已define定义如下结构

	define("modulename",function(){return {}});
或者

	define("modulename",{});

URL访问格式为  http://bac.com/action?moduelname=moduelname
### 参数 ###
	
- **url**(String) :jsonp数据地址
- **options**（PlainObject） [Option]:可传递的参数
- **module**(String)[Optons]:数据库模块名称,对应url的`moduelname`,如果`moduelname`为`module`、`cb`、`callback`时可以省略。options内同名参数会覆盖此参数。

### Case ###
<button type=button class=btn  id="util-getjsonp-btn">获取分类息</button>

<script>
require(["base/util"],function(util){
$("#util-getjsonp-btn").on("click",function(){
	util.getjsonp("http://xxx.xxx.com.cn/CertQuery/jsonp_authcategory.action").then(function(data){
		var html = $.map(data,function(item){
				return "<li>"+ item.name +"</li>"
			}).join("")
			html = "<div class='modal-body'>"+html+"</div>";
		
		  $("<div class='modal fade in'>"+html+"</div>").modal()
	})

})
})
	
</script>
		 
		<button type=button class=btn  id="util-getjsonp-btn">获取分类信息</button>
		<script>
		require(["base/util"],function(util){
		$("#util-getjsonp-btn").on("click",function(){
			util.getjsonp("http://cert.xxx.com.cn/CertQuery/jsonp_authcategory.action").then(function(data){
				var html = $.map(data,function(item){
						return "<li>"+ item.name +"</li>"
					}).join("")
				html = "<div class='modal-body'>"+html+"</div>";
		
				$("<div class='modal fade in'>"+html+"</div>").modal()
			}) 
		
		})
		})
			
		</script> 