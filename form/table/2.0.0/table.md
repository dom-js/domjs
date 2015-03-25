# table V2.0.0 #


## 更新说明 ##
- **2013/10/31**
> 1. 优化字段处理，对冗余字段进行过滤，解决文档内垃圾无一语字段占用字段空间的问题。 
> 2. 添加XMLCollection支持，解决因代理保存引发的冗余文档产生，同时降低表格字段保存的复杂度。 

- **2013/10/21 14:51:32**
>添加uid支持，表格为每一条记录生成一个32位ID，并保持在表格数据源为前缀`_uid_[i]`为后缀的字段内。在对应的表格item内可以通过item.uid获取,在模板内可以通过${uid}获取

>在遇到附近时，可以使用此id将附件绑定到独立的文档上。如下动态表格创建独立文档，支持附件的一段代码
>
> 	<input data-name='s1_attachment' data-unid34="WF${uid}"  data-type=attachment2 data-version=2.0.0  />
>使用这段代码，可以将附件绑定到WF_DocUnid为 WF${uid}的流程文档上。需要注意到是，此时你需要将WF${uid}写入动态生成的流程文档WF_DocUnid内。

## 构造器 ##

- **HTML**

		<input name='s1_table'  data-type='table' data-version='2.0.0' >

- **Javascript**

		

## 方法 ##
### addRow ###
为表格添加新行
#### 参数 ####

- item (PlainObject )[Option]：新行item，如果为空则表示添加一个新行
- RowIndex（Number）[Option]：行号索引，如果存在，则在此索引前插入一条记录

#### Case####

- **在第一条记录前插入一条空行**

		table.addRow({},0)



### deleteRow ###
删除一条记录行

### 参数 ###

- RowIndex(Number)[Option]:要删除的行索引，如果为空则删除最后一行


### getLocalData ###

此方法可以直接返回修改后的table的数据对象

### save ###
保存数据到服务器，返回一个jQuery promise。

## 事件 ##

### init ###

表格初始化时执行
#### 参数 ####
- **table** ：表格对象


		$("[name=s1_table]").on("init",function(e,table){
		})

>由于表格是有 main函数初始化，因此调用此事件需要页面初始化时执行。如果如果代码在用户js内部被执行，可以尝试在jsheader内通过如下方法执行：

> 	$("body").on("init","[name=s1_table]",function(e,table){
	})


 
### inited ###

表格初始化完成执行

#### 参数 ####


- **table** ：表格对象
- **cfg** ：表格配置，直接从表格配置文档获取，配置属性对应表格配置字段


		$("[name=s1_table]").on("inited",function(e,table,cfg){ 
		
		})


### update ###

表格加载完成后执行

#### 参数 ####
- **table** 表格对象
- **items** 表格初始化时加载的数据集合，可以通过修改items控制数据表格加载的内容。
 

	$("[name=s1_table]").on("loaded",function(e,table,items){
		
		
	})	



### updateed ###

表格加载完成后执行

#### 参数 ####
- **table** 表格对象
- **items** 表格初始化时加载的数据集合，可以通过修改items控制数据表格加载的内容。
 

	$("[name=s1_table]").on("loaded",function(e,table,items){
		
		//table 表格对象

		//items 表格初始化时加载的数据集合
	})	

### delete\deleted ###

表格删除操作


#### 参数 ####
- **table** 表格对象
- **rowDom** 删除行的dom对象
- **rowIndex** 删除行的索引

#### Case- 获取删除的item ####
		$("[name=s1_table]").on("delete",function(e,table,rowDom,rowIndex){	
			var item = $(rowDom).tmplItem().data;

		})
 

	