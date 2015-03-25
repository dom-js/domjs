 
**Summary**

依赖appinfo和docinfo。因此此组件只能在notes文档内使用（目前只有notes新版流程文档同时定义appinfo和docinfo）

## 依赖说明 ##


### appinfo ### 
- flashdoc：是否转换为flash预览格式
- filesagentpath：代理服务器地址
- username：当前用户
- appname：应用名称 
### docinfo ###

- isauthorcurr：是否当前作者
- isdocbeingedited:文档当前状态（是否编辑）
- unid34:文档34位ID（附件绑定次ID）
- unid:依赖此ID定位文档生成附件地址


### 表单fmAttachmendDownload ###

所有附件需要经过此地址进行跳转进行附件下载，此表单会进行权限校验。


|asd|asd|
|asd|2323|

## 调用方式 ##

- **HTML调用**
		
		<input name=attachment type=text data-type='attachment2' data-version=2.0.0 />

- **JS调用**

		require(["form/attachment/2.0.0/attachment"],function(atth){
			atth("input[name=attachment]",{})
		})

##参数options##

所有参数在html定义时通过 data-参数名 格式定义，在js调用是使用PlainObject格式作为第二个参数传入

- **isauthor**：是否作者，如果是一个非表单标签，且用户设置了editable，根据aditable计算
- **name**：名称默认input的name
- **editable**：是否可以编辑，如果绑定一个表单标签，且用户为定义，则默认根据docinfo.isdocbeingedited和docinfo.isauthorcurr进行计算,否则为false
- **unid**：默认docinfo.unid
- **unid34**:默认docinfo.unid34
- **username**:默认appinfo.username，当前用户
- **appname**：默认appinfo.appname,当前应用名称
- **flashdoc**：默认appinfo.flashdoc,是否转换flahs格式，可以预览
- **writelog**：是否记录日志，默认false
- **downable**：是否允许下载，默认true 
- **previewwin**：预览窗口，默认jbox弹出预览。flashdoc时次参数生效
- **saveparams**：数组，要保写入html内地属性
- **localsave**:是否将数据保存为html（此方式直接保存静态地址）
- **auto_upload**：是否自动上传

## getItem ##

**Summary**

获取附件列表，返回promise[PlainObjectArray]

### 返回值单Item字段 ###

- type：文件类型
- url：url地址/此地址没有权限校验。服务器启用校验策略后不能正常访问
- text：文件名
- size：文件大小
- unid:文件唯一标识符
- flashdoc：为1表示已经转换为flash格式，支持在线预览
- org：服务器返回的原始文档信息(PlainObject) 

### Case ###


		attach.getItem().then(function(items){
			console.log(items)
		})	

## getDownLoadUrl(item,preview) ##
获取文档下载地址

### 参数 ###

- **item**(PlianObject)：getItem返回的记录信息
- **preview**(Blooean):如果该参数为true，则返回预览地址默认为false
	
	如果需要手动计算预览地址只需在返回的下载地址后添加`&action=previewFile`.效果等同preview=true
	<div class=alert ><b style='color:red'>注意:</b>如果组件参数flashdoc为false或者文件类型不能转换，则预览地址无效</div>
### Case ###

- HTML代码

		<input name=attachment type=text data-type='attachment2' data-version=2.0.0 />
		<input name=attachmenturl  />
	

- JS代码

		$("input[name=attachment]").on("loaded",function(e,attch,items){
				attach.getItem().then(function(items){
				var url =  attach.getDownLoadUrl(items[0]);
					$("[name=attachmenturl]").val(url)
				})	
		})


## enable/disable ##
 禁用附件

 

### 参数 ###

- **flag**：true，同时删除附件，false，不删除附件。设置为true时。不指定参数时，会提示是否需要同步删除附件。

### 调用方式 ###

- 启用

		attach.enable()


- 禁用，并且附件将自动删除

		attach.disable(true)


- 禁用，但件文件不从服务器删除

		atach.disable(false)


- 提示是否删除附件，确认后取消后执行 attach.disable(true)或attach.disable(false) 

		attach.disable()


	
### case ###

- HTML
	
		<input name='clyj' type='radio' value=1>同意
		<input name='clyj' type='radio' value=0>不同意 
		<input name=attachment type=text data-type='attachment2' data-version=2.0.0 />

- JS代码

		$("input[name=attachment]").on("loaded",function(e,attch,items){
			 $("[name=clyj]").on("click",function(){
				if(this.value==1){
					attch.enable()
				}else{
					attch.disable(true)
				}
			})
		})
		
## 事件 ##

### loaded ###

附件列表加载完成执行

		$("input[name=attachment]").on("loaded",function(e,attch,items){
			//e.事件对象
			//attach附件对象 
			//items，加载的items记录
		})

### download ###

点击下载执行的事件

		$("input[name=attachment]").on("download",function(e,params,item，type){
			//e.事件对象
			//params，下载时需要扩展给附件接口的参数，PlainObject，extparams为保留字。 
			//item 下载的文件对应的item 
			//type：download 或 preview
		})

