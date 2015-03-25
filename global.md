# global.js #
全局对象模块，如有服务器有部署res/index.nsf
## hasdoc ##
判断文档是否存在

**hasdoc(key,path,view)[Public]**

### 参数 ###
- **key**(String):unid或key(32位时失败为unid)
- **path**(String)[Option]:文档所在数据库，默认为当前数据库
- **view**(String)[Option]:Domino视图，默认为`(All)`视图，如果指定视图，则会使用dblookup检查，性能比unid差。

## getdoc##
**getdoc(key,path,view,nocache) [Public]**
### 参数 ###
- **key**(String):视图第一列key或者文档unid
- **path**(String)[Option]:文档所在数据库，默认为当前数据库
- **view**(String)[Option]:Domino视图，默认为`(All)`视图
- **nocache**(Boolean)[Option]:getdoc默认会进行结构缓存（页面级），如果nocahce为true，则不使用缓存
### 代码 ###
  		getdoc=function(key,dbpath,view，nocache){
            key = key.toUpperCase()
            var dbpath = typeof dbpath=="string"?(dbpath==""?this.dbpath:dbpath):this.dbpath;
            var view = typeof view=="string"?(view==""?"(all)":view):"(all)";
            var _url = dbpath+"/"+view+"/"+key+"?opendocument&form=SysOpenDocByJSON"
            // if(key.length!=32)
            var cacheKey = _url
            if(!docCache[cacheKey]||!docCache[cacheKey].pipe||nocache){ 
				docCache[cacheKey] =getdocaspart(_url,key); 
            }
            
            return  docCache[cacheKey] ;
        }
### 依赖 ###

- Domino数据库表单`	01.System\13.Open Doc With JSON | SysOpenDocByJSON`
- Domino视图 `(All)` 或者其他可以通过url参数`Form`且值为`SysOpenDocByJson`指定文档打开视表单的视图

- 数据库表单返回文档格式`application/json` 

		define("<计算的值>",
		//begin v1.x content
		{
			<计算的值>	
		}
		);
- 计算公式1：

		@If(@UrlQueryString("module")="";@Text(@DocumentUniqueID);@UrlQueryString("module"))

- 计算公式2：
		
		fields:=@DocFields;
		vals:="";
		start:=@UrlQueryString("start");
		limit:=@UrlQueryString("limit");
		start:=@If(start="";1;@TextToNumber(start));
		limit:=@If(limit="";500;@TextToNumber(limit));
		max:=@Elements(fields);
		len:=start-1;
		rejectlist:="$Revisions":"$UpdatedBy":"$$HTMLHead":"Query_String_Decoded":"$$QuerySaveAgent":"$V2AttachmentOptions":"$ConflictAction";
		
		@For(i:=start;i<start+limit;i:=i+1;@Do(
		
		 f:=fields[i];
		   _v:=@IfError(@GetField(f);"");
		
		@If(@IsMember(f;rejectlist);@Do(max:=max-1);
		@Do(
		   len:=len+1;
		    @If(@Elements(_v)>1;@Do(
				__v:="[";
				@For(j:=1;j<=@Elements(_v);j:=j+1;@Do(
						__v2:=_v[j];
		   				__v1:=@If(@IsNumber(__v2);__v2;@If(@Text(__v2)="";"\"\"";"decodeURIComponent(\""+@ReplaceSubstring(@URLEncode("UTF-8";@Text(__v2));"%00";"")+"\")"));
		   				__v:=__v+ __v1+@If(j=@Elements(_v);"";",")
		   		 	)
				);
		   		__v:=__v+"]"
		   	);@Do(
					__v2:=_v;
					__v:=@If(@IsNumber(__v2);__v2;@If(@Text(__v2)="";"\"\"";"decodeURIComponent(\""+@ReplaceSubstring(@URLEncode("UTF-8";@Text(__v2));"%00";"")+"\")"))
				)
			);
		   v:=__v;
		   f:="\""+f+"\":"+@Text(v)+"";
		  	vals:=vals:f
		))
		));
		vals:("\"$$unid\":\""+@Text(@DocumentUniqueID)+"\"");
		vals:=vals:("\"$$max\":"+@Text(max));
		vals:=vals:("\"$$length\":"+@Text(len));
		@Trim(vals)



## formula ##

formula(fs,dbpath,unid,cachename)

**summary**

 /**
     * 执行domino公式
     * @param formula:必填
     * 当只有两个参数时
     *      如果第二个参数是一个数据库路径（http开头或者/开头，.nsf结尾的被识别为数据库，但不做有效性检查）
     *      如果第二个参数识别不是一个数据库路径，则自动识别为一个缓存名称，执行结果会被缓存，下一次使用此缓存名称执行任何公式都不会被执行，并将得到缓存结果
     * 当存在三个参数时
     *      如果第二个参数被识别为缓存名称，第三个参数会覆盖第二个参数缓存名称
     *      如果第二个参数识别为数据库地址，且第三个参数是32位16进制，则第三个参数将会识别为一个文档UNID，否则第三个参数将被识别为缓存名称
     * 如果存在四个参数
     *      后三个参数将会被自动识别为 数据库路径，文档unid，以及缓存名称。如果数据库路径或unid识别失败，最后一个参数将，被识别的参数将自动作为缓存名称，前面识别识别的参数无效。
     * 对应参数 数据库路径和unid，必须具有前后顺序但无位置强制，而对于缓存名称，可以在后三个参数的任意位置。
     * @returns {$.Deferred}
     */


### 参数 ###
- **fs**(String|String Array|PlainObject)：公式，如果是一个字符串，自动换为{"fs":fs}结构，一般使用
特点文档内的域名字段读取
- **dbpath**（String）[Option]：如果通过require("global!"),require(["globale!host.com.cn"])等方式加载，dbpath可以省略，默认为配置库。如果是跨域执行，需要数据库全路径
- **unid**(String)[Option]：32位16进制字符串，如果指定unid，可以使用formula直接读取文档域值
- **cachename**(string)[Option]:任意字符串，如果指定，查询工作结构将被缓存，多次执行统一调用是结果不变。
  