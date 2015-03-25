## Summary##
  
  appinfo继承global.js

## runrule 

**runrule(rulecode,doc,unid,dbpath) [Public]**

**Summary**

如果应用程序支持规则机制，则可以通过此方法调用一个规则

### 参数 ###

- **rulecode**(Stirng): 规则编码
- **doc**(PlainObject):要传给规则的上下文`docContext`
	- **__AutoSave**:是否字段保存DocTarget，默认为True，规则操作完`docTarget`会自动保存。	
- **unid**(String)[Option]：规则`docTarget`文档unid，如果不存在，则使用`docContext`作为俄`docTarget`
- **dbpath**(String)[Option]:规则所在数据库，默认appinfo.dbpath

## dicLookUp ##

**dicLookUp(key,field,multi) **

### 参数 ###
	
- **key**(String|Array):数据字典关键字
- **field**(String|Array):字段列表
- **multi**(Boolean) [Option]:是否多值，默认false，如果为true，则会返回一个多值映射

## dicDoc ##
**dicDoc(key)**
### 参数 ###	
- **key**(String|Array):数据字典关键字 ###