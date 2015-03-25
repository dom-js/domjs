/**
 * 2013-1-17 添加getTableData 相关方法，处理html转文本的功能
 */
define(["plugin/jquery.tmpl.min","widget/_base/widget","base/objectjengine","appinfo","docinfo","base/util","i18n!nls/system","form/form","widget/jbox"],
    function($,widget,widgetengine,appinfo,docinfo,util,i18n,form,jbox){
        function setItemAttr(item,name,value){
            if(item[name]){
                if($.isArray(item[name])){
                    item[name].push(value)
                }else{
                    item[name]=[item[name],value]
                }
            }else{
                item[name] = value
            }
        }
        var table = widget.sub()
        table.fn.extend({
            options:{
                source:undefined,   //数据源，该参数用于在代码内进行参数指定
                sourcetype:undefined,
                editable:undefined,
                loadremotedata:false //默认不加载独立存储的数据
            },
            __init:function(){
                var _self = this;
                this.doms={}

                this.hide()
                this.data("table",this)

                if(this.options.editable===undefined){
                    var me = this[0]
                    this.options.editable=( me.type && (me.type=="text"||me.type=="textarea"))?true:false
                }
                if(this.options.id===undefined){
                    this.options.id= this.attr("data-id")|| this.attr("id")|| this.attr("data-name")|| this.attr("name")
                }

                if(this.options.editable){
                    this.__initEdit()
                }else{
                    this.__initDisp()
                }
                if(this.parent()[0]&&this.parent()[0].tagName=="TD"){
                    this.parent().css({
                        "padding":"2px"
                    })
                }

            },
            __initDisp:function(){
                this.__baseInit();

            },
            __initEdit:function(){
                var _self =this;
                this.__baseInit();
                this.__extInit();
                //将save方法添加到 提交前执行的promise内，保证表单提交前表格可以被自动提交
                var beforesubmitpromise = $("form").data("beforesubmitpromise")||[]
                beforesubmitpromise.push(function(){
                    return _self.save();
                })
                $("form").data("beforesubmitpromise",beforesubmitpromise);
            },
            //基础信息初始化
            __baseInit:function(){
                var el,table
                if(this.options.render){
                    el = $(this.options.render)
                }else{
                    el = $(this)
                }
                var tn = el.get(0).tagName.toLowerCase();
                if(tn=="table"){
                    table = el
                }else if(tn=="input"||tn=="textarea"){

                    table = $(el.val() )// $("<table class='inputForm_table' cellspacing=0><thead></thead><tbody></tbody></table>")
                    if(table.length==0||table.get(0).tagName.toLowerCase()!="table"){
                        table =$("<table class='inputForm_table' cellspacing=0 style='width:100%'><thead></thead><tbody></tbody></table>")
                    }else{
                        table.show()
                    }
                    el.after(table)
                }else{
                    table = el.find(">table")

                    if (table.length==0){
                        table = $("<table class='inputForm_table' cellspacing=0 style='width:100%'><thead></thead><tbody></tbody></table>")
                        el.append(table)
                        el.show()
                    }
                }
                this.doms.table = table
            },

            //扩展功能初始化，主要是Edit状态时需要进行的初始化
            __extInit:function(){
                var _self = this;
                this.rows = []

              //  this.doms.table = $("<table style='width: 100%;border: none;' class='inputForm_table'></table>")
               // this.after(this.doms.table)
                //如果没有指定ID，则使用 id属性或name属性
                //this.options.id = this.options.id || this.attr("id")||this.attr("name")
                this.__getStruct().then(function(tools,head,tmpl,cfg){
                    try{
                        // console.log(cfg.TableRow_Edit,tmpl)
                        _self.__initHead(head);
                        _self.__initField(cfg.TableRow_Edit);
                       _self.__initToolbar(cfg);
                       _self.__initTmpl(tmpl)
                        _self.__initWidget(cfg);
                       _self.__initEvent(cfg);
                    }catch(err){
                        console.log(err.stack)
                        throw err
                    }

                },function(err){
                    console.log(err.stack)
                    throw err
                })
            },
            __initHead:function(head){
               // var head =  $(head).tmpl(this.options);
                var thead = this.doms.table.find("thead")
                if(thead.length==0){
                    thead =$("<thead></thead>")
                    this.doms.table.prepend(thead)
                }
                this.doms.head = thead;
                if(this.options.editable){
                    thead.empty()

                    thead.append(head)

                }

            },

            __initField:function(tmpl){
                var _self=this, uid = this.options.id+"_uid", fields =[],item={},_fields=[uid]
                item[uid]=""
                $(tmpl).find("[data-name],[name]").each(function(i,el){
                    var name = _self.__getElname(el)
                    if($.inArray(name,_fields)>-1)return ; //如果fieldname已经存在，则处理下一个 2013-2-18
                    _fields.push(name)
                    item[name]=""
                })

                this.options.emptyItem=item

                this.options.fields =_fields
            },
            __getElname:function(el){
               var $el = $(el),
                name = $el.attr("data-name")

                if(!name ||/[{}]/.test(name) ) {
                    name = $el.attr("name")
                }
                if(/[{}]/.test(name)){
                    alert("配置错误:name属性或者 data-name属性至少有一个不能包含符号“{}”")
                }
                return name
            },
            __initToolbar:function(cfg){
                if(!this.options.editable)return

                var tools = cfg.TableTools
                var buttons = $(tools)

                var toolbar = this.doms.table.find(".tableToolbar")

                if(toolbar.length==1){

                    toolbar.append(toolbar)
                }else{
                    $(this).after(buttons)
                   this.doms.table.after(buttons)
                }
            },
            __initTmpl:function(tmpl){
                var _self=this,tmpldom = $(tmpl)
                //获取简单的html 标签属性
                var getAttr = function(t,name){
                    var reg =new RegExp("\\s"+name+"=['\"]?([^'\"\\s\\/>]*)['\"]?","i")
                    var _m = t.match(reg)
                    return _m?_m[1]:undefined
                }
                //获取标签name属性
                var getFieldName = function(t){
                    var fieldname = getAttr(t,"data-name")

                    if(fieldname){

                        if(/[{}]/.test(fieldname)){
                            fieldname =getAttr(t,"name")
                        }
                    }else{
                        fieldname = getAttr(t,"name") // t.match(/\sname=['"]?([^"'\s]+)['"]?/i)
                    }
                    if(/[{}]/.test(fieldname)){
                        alert("配置错误:name属性或者 data-name属性至少有一个不能包含符号“{}”")
                    }

                    return fieldname
                }

                //处理sn自动，保证自动刷新
//                tmpldom.find(":contains(${sn})").each(function(i,el){
//                    $(el).attr("data-tabledatarefresh","true")
//                })
                //为sn部分添加refresh属性，
                var sns1= tmpl.match(/<(\w+)[^>]*\$\{sn\}?[^>]*>((?!\1).)*<\/\1>/gi),

                    sns2= tmpl.match(/<(\w+)[^>]*>((?!\1).)*\$\{sn\}((?!\1).)*<\/\1>/gi),
                    sns= sns1&&sns2?sns1.concat(sns2):sns1?sns1:sns2?sns2:[];

                var __tmplupdate = this.__tmplupdate = {}
                $.each(sns,function(i,t){
                   if(!/\sdata-tabledatarefresh=/.test(t)){
                       var key = util.uid()
                       _t = t.replace(/(\/?>)/," data-tabledatarefresh=\""+key+"\" $1")
                       __tmplupdate[key] = _t
                       tmpl = tmpl.replace(t,_t)
                   }
                })

                //处理uid部分
                var uidm = tmpl.match(/<\w+[^>]*>/)
                if(uidm){
                    var t = uidm[0],uid =  getAttr(t,"data-uid")
                    if(uid==undefined){
                        _t = (t.replace(/>/," data-uid=\"$\{uid\}\" >"))
                        tmpl = tmpl.replace(t,_t)
                    }else if($.trim(uid)==""){
                        _t = t.replace(/\sdata-uid=[\'\"]?\s*[\'\"]?/,"data-uid=\"$\{uid\}\" ")
                        tmpl = tmpl.replace(t,_t)
                    }
                }


                //处理表单字段，字段填充value
                var  fieldname,
                 tmplInput = tmpl.match(/<input[^>]*>/gi),
                    tmplTextarea = tmpl.match(/<textarea.((?!<\/textarea).)*<\/textarea>/gi),
                    tmplSelect =  tmpl.match(/<select.((?!<\/select).)*<\/select>/gi)
                //处理form标签，对value进行处理，实现值得显示，简化模板的配置
                if(tmplInput){
                    $.each(tmplInput,function(i,t){
                      //  console.log(t)
                        fieldname= getFieldName(t)
                        if(!fieldname)return false

                        var type = getAttr(t,"type"),type=type||"text"
                            value =  getAttr(t,"value")
                        switch(type.toLowerCase()){
                            case "text":
                                if(value==undefined){
                                    _t = (t.replace(/\/?>/," value=\"$\{" +fieldname+ "\}\" />"))
                                    tmpl = tmpl.replace(t,_t)
                                }else if($.trim(value)==""){
                                    _t = t.replace(/\svalue=[\'\"]?\s*[\'\"]?/," value=\"$\{" +fieldname+ "\}\" ")
                                    tmpl = tmpl.replace(t,_t)
                                }

                                break;
                            case "checkbox":
                               if(!/checked/.test(t)){
                                   _t = (t.replace(/\/?>/," \{\{if  $.isArray("+fieldname+")?$.inArray(\""+value+"\","+fieldname+")>-1:"+fieldname+"==\""+value+"\" \}\}checked\{\{/if\}\} />"))
                                   tmpl = tmpl.replace(t,_t)
                               }

                                break;
                            case "radio":
                                if(!/checked/.test(t)){
                                    _t = (t.replace(/\/?>/," \{\{if  "+fieldname+"==\""+value+"\" \}\}checked\{\{/if\}\} />"))
                                    tmpl = tmpl.replace(t,_t)
                                }
                                break;

                        }
                      //  console.log(fieldname,type)
                    })
                }
                if(tmplTextarea){
                    $.each(tmplTextarea,function(i,t){
                        fieldname= getFieldName(t)
                        if(!fieldname)return false
                        var _t = t.replace(/(<textarea[^>]*>)(.*)(<\/textarea>)/,function(){
                            var a=arguments,val = $.trim(a[2])==""? "\${" + fieldname +"}":a[2]
                            return  a[1]+val+a[3]
                        })
                        tmpl = tmpl.replace(t,_t)
                    })
                }
                if(tmplSelect){
                    $.each(tmplSelect,function(i,t){
                        fieldname= getFieldName(t)
                        if(!fieldname)return false
                        var tmpOptions = t.match(/<option.((?!<\/option).)*<\/option>/gi)
                        if(tmpOptions){
                            $.each(tmpOptions,function(i,op){
                                var value =  getAttr(op,"value")
                                if(!value){
                                    var _v = op.match(/>(.*)<\/option>/)
                                    value = _v&&_v[1]||""
                                }
                                if(!/selected/.test(op)){
                                    _t = (op.replace(/(<option)/,"$1 \{\{if  "+fieldname+"==\""+value+"\" \}\}selected\{\{/if\}\} "))
                                    tmpl = tmpl.replace(op,_t)
                                }
                            })
                        }
                    })
                }
               this.__tmpl = $("<script type='text/x-domjs-tmpl'>"+tmpl+"</script>")
            },
            __initWidget:function(cfg){
                var _self = this
                this.options.minRowsCount = cfg.MinRowsCount
                this.options.maxRowsCount = parseInt(cfg.MaxRowsCount)
                try{
                    this.__getData(cfg).then(function(data){

                         _self.update(data)
                        _self.__initComplete.resolve()
                    },function(e){
                        _self.__initComplete.reject(e)
                        console.log(e.stack)
                    })
                }catch (e){
                    throw e
                }
            },
            __getData:function(data){
                var _self = this

               if(data.HtmlStore=="1") return $.when(_self.__getHTMLStore())
                var datasource = data.DataSource

                switch (this.options.sourcetype){
                    case "select":
                        return appinfo.getstore(datasource).pipe(function(store){
                            return store.load()
                        })
                        break;
                    case "doc":
                        return _self.__getDocStore(data)
                        break;
                    case "field":
                        return _self.__getFieldStore(data)
                        break;
                    case "json":
                        return _self.__getJsonStore(data)
                    case "none":
                        return $.when( _self.__getHTMLStore())
                    default :
                        return $.when([])
                }
            },
            __getStruct:function(){
                return this.__getCfgStruct();
            },
            __getCfgStruct:function(){
                var _self = this
                var cfg = appinfo.getdoc("fmTable"+this.options.id,appinfo.dbpath).pipe(function(data){
                    var source = data.DataSource,sourcetype=data.DataSourceType
                    if(source==""){
                        source=data.StoreId
                        sourcetype=data.StoreType
                    }
                    _self.options.sourcetype = sourcetype.toLowerCase()

                    return data
                },function(err){
                    throw  err
                })
                var tools =  cfg.pipe(function(data){ return data.TableTools }),
                    head =cfg.pipe(function(data){ return data.TableHead }),
                    tmpl=cfg.pipe(function(data){return data[_self.options.editable?"TableRow_Edit":"TableRow_Disp"] })
                _self.cfg = cfg
                return $.when(tools,head,tmpl,cfg)
            },
            //保存表格字符串
            __getHTMLStore:function(tableinfo){
                var _self=this,data = []
                var autofields = this.options.fields

                var tBody = tableinfo?$(tableinfo).find("tbody"):this.doms.table.find("tbody")
               //console.log( tBody.find("tr"))

                tBody.find("tr").each(function(i,tr){
                    var item={},uid =  $(tr).attr("data-uid")
                    data.push(item)
                    $(tr).find("td").each(function(j,td){
                        var itemsDom = $(td).find(">*")
                        if(itemsDom.length>0){
                            itemsDom.each(function(i,el){
                                //获取fieldname
                                var $el=$(el)
                                var fieldname=  $el.attr("data-name")//_self.__getElname(el);
                                if(!fieldname||(new RegExp(uid)).test(fieldname)){
                                    fieldname =  $el.attr("name")
                                }

                                switch(el.tagName){
                                    case "INPUT":
                                        switch (el.type) {
                                            case "checkbox":
                                            case "radio":
                                                fieldname =fieldname ||autofields[j]
                                                el.checked && setItemAttr(item,fieldname,el.value)

                                                break;
                                            default:
                                                if(fieldname){  item[fieldname]= $(el).val();}

                                        }

                                        break;
                                    case "TEXTAREA":
                                    case "SELECT":
                                        item[fieldname]=$(el).val()
                                        break;
                                    case "DIV":
                                    case "P":
                                    case "A":
                                    case "IMG":
                                    case "BUTTON":
                                    case "SPAN":
                                        if(fieldname){
                                            setItemAttr(item,fieldname,$(el).text())
                                        }

                                        break;
                                    case "UL":
                                        fieldname = $(el).attr("name")
                                        if(fieldname){
                                            $(el).find(">*").each(function(i,subel){
                                                setItemAttr(item,fieldname,$(subel).text())
                                            })

                                        }
                                        break;
                                    default:
                                        fieldname =$(el).attr("name")||el.tagName.toLowerCase()
                                        setItemAttr(item,fieldname,$(el).text())

                                }

                            })
                        }else{
                            var  fieldname = $(td).attr("data-name") || $(td).attr("name")||autofields[j]
                            item[fieldname]=$(td).text()
                        }
                    });
                    item.uid = item[_self.options.id+"_uid"] = uid
                });

                //console.log(this.options.map)
                var map =this.options.map;
                var sn = 1

                data = $.map(data,function(item){
                    $.each(autofields,function(i,f){
                        if(typeof item[f]=="undefined"){
                            item[f]=""
                        }
                    })
                    if(map){
                        var flag = map.call(this,item)
                        if(flag!=null){
                            item.sn = sn++
                        }
                        return  flag;
                    }else{
                        item.sn = sn++
                        return item
                    }

                })

                return data;
            },
            //初始化保存为独立域的数据原
            __getFieldStore:function(cfg){
                var _self = this, fields = _self.options.fields, keyname = cfg.KeyName||fields[0].name
                if(docinfo.isnewdoc){
                    return  $.when([])
                } else{
                    return   appinfo.getdoc(docinfo.unid).pipe(function(doc){
                        var i = 0, suffix = "_"+(++i),res=[]

                        while(doc[keyname+suffix]){
                            var item = {}
                            $.each(fields,function(i,field){
                                var name = field.name
                                item[name] = doc[name+suffix]
                            })
                            res.push(item)
                            suffix = "_"+(++i)
                        }

                        return res
                    }).fail(function(err){
                            console.log(err.stack)
                    })
                }
            },
            __getDocStore:function(data){
                return  $.when(data).pipe(function(cfg){
                    var key = docinfo.unid34+cfg.StoreName,f='@ifError(@DbLookup("";"";"vwPluginTableDoc";"'+key+'";3);"[]")'
                    return  appinfo.formula({res:f},"number").pipe(function(data){
                        if($.isPlainObject(data.res)){
                            return [data.res]
                        }
                        return  data.res
                    })
                })
            },
            __addValueToItem:function(item,fieldname,value){
                if( typeof item[fieldname] =="undefined"){
                    item[fieldname] = []
                }
                item[fieldname].push(value)

            },
            //将jQuery Dom作为
            __initEvent:function(){
                var _self =this

                this.doms.table.on("click","[data-coltype=delbt]",function(e){

                    var item = $(this).tmplItem().data
                    _self.deleteRow(item.sn)
                })
            },
            update:function(res){
                var _self = this,tbody = this.doms.table.find("tbody")
                tbody.empty()
                this.rows=[]
                $.when(res,this.cfg).then(function(data,cfg){

                    if(_self.options.editable&& data.length< cfg.MinRowsCount ){
                        for(var i=data.length;i<cfg.MinRowsCount;i++){
                            var item = $.extend({},_self.options.emptyItem)

                            data.push(item)
                        }
                    }

                    $.each(data,function(i,item){

                        _self.addRow(item,true)
                    })
                })

            },
            refresh:function(){
                var _self = this;
               return  this.cfg.pipe(function(cfg){
                   _self.__initWidget(cfg)
               })

            },
            getRow:function(){

            },
            addRow:function(item,flag){
                var _self=this,item = item,uidfield =  _self.options.id+"_uid",flag=flag||false
                return  this.cfg.pipe(function(cfg){
                    if(!flag&&_self.rows.length>=cfg.MaxRowsCount){
                        jbox.alert("表格最多只能包含"+cfg.MaxRowsCount+"条记录")
                        return false
                    }
                    var rowIndex =  _self.rows.length
                    if(!item){
                        item = $.extend({},_self.options.emptyItem)
                    }
                    //如果不存在unid，则创建unid
                    item.uid = item[uidfield]= item[uidfield] ||  item.uid|| util.uid()

                    item.sn = rowIndex+1

                    var row = _self.__tmpl.tmpl([item])
                    _self.rows.push(row)
                    $(row).attr("data-uid",item.uid)
                    widgetengine(row)
                    _self.doms.table.append(row)
                    return true
                })
            },
            deleteRow:function(sn){
                var _self = this, serialfield = this.options.emptyItem.__serialnofield__,flag = false
              return  this.cfg.pipe(function(cfg){

                   if(_self.rows.length<=cfg.MinRowsCount){
                       jbox.alert("表格要求至少保留"+cfg.MinRowsCount+"条记录")
                      return false
                   }else{
                       _self.rows = $.grep(_self.rows,function(row,i){
                           var item = row.tmplItem().data
                           if(i+1==sn){
                               var f = false
                               //控制，如果是附件，则必须先删除附件
                               row.find("[data-type=attachment2],[data-type=attachment]").each(function(i,el){
                                   if($.trim(el.value)!="")f = true
                               })
                               if(f  ==  false){
                                   row.remove();
                                   flag = true;
                                   return false
                               } else{
                                   jbox.alert("请先删除附件")
                                   flag = false;
                                   return true
                               }
                           }else{
                               if(flag){
                                   item.sn = i
                                   _self.refreshRow(row,item)
                               }
                               return true
                           }

                       })
                       return flag
                   }
              })
            },
            refreshRow:function(row,item){

                $.each(this.__tmplupdate,function(key,tmpl){
                   var $el  =  row.find("[data-tabledatarefresh="+key+"]")
                    $el.after($("<script type='text/x-domjs-tmpl' >"+tmpl+"</script>").tmpl([item])).remove()
                })

            },
            save:function(){
                if(!this.options.editable){
                    return $.when(true)
                }
                var _self = this;
                var data = this.__getHTMLStore()


                switch (this.options.sourcetype){
                    case "view":
                        return _self.__setViewStore(data)
                        break;
                    case "doc":
                        return _self.__setDocStore(data)
                        break;
                    case "field":
                        return _self.__setFieldStore(data)
                        break;
                    case "json":
                        return _self.__setJsonStore(data)
                    case "none":
                        return   _self.__setStore(data)
                    default :
                        return []
                }
                return false;
            },
            validate:function(){
                //兼容validate函数，实现表格验证处理
                return true;
            },
            __setStore:function(data){
                var _self = this ,tab = this.doms.table.clone()  // $("<table style='display: none;' data-id='"+this.options.id+"'></table>");
                tab.find("tbody").empty()
                return  this.cfg.pipe(function(cfg){
                    var tmplDom =  $("<script type='text/x-domjs-tmpl'>"+cfg.TableRow_Disp+"</script>"),
                        trs =  tmplDom.tmpl(data)
                    trs.each(function(i,tr){
                        var tmplItem =$(tr).tmplItem(),item =tmplItem.data
                       // tr0.attr("data-uid",item.uid)
                       $(tr).attr("data-uid",item.uid)
                      //  console.log(data)
                    })
                    tab.append(trs)
                    var __div = $("<div></div>").append(tab)

                    _self.val(__div.html())
                    return _self.val()
                })
            },
            __setFieldStore:function(data){
                this.__setStore(data)
                var key = docinfo.unid34,view="FlowByDocUNID",form="fmMain",fields=[],doc={
                    __View:view,
                    __Key:key,
                    __KeyFields:["WF_DocUNID"],
                    __Form:form,
                    __Fields:fields,
                    __AuthorsField:"WF_CurrentAuthors",
                    __autoFields:$.map(this.options.fields,function(field){return field.name}),
                    __autoFieldsLength:data.length
                }

                $.each(data,function(i,item){
                    var suffix = "_"+ (i+1)
                    $.each(item,function(name,value){
                        if(name=="uid"||name=="sn") return true;
                        fieldname = name+suffix
                        doc[fieldname]=value
                        fields.push(fieldname)
                    })
                })
                var url = appinfo.dbpath+"/agSavePostToDoc?openagent"
                return $.ajax({
                    type: 'POST',
                    url: url,
                    data: doc,
                    dataType: "json"
                }).pipe(function(data){

                        if(data.error){
                            return false
                        }else
                            return true
                    },function(e){
                        return false
                    })
            },

            __setDocStore:function(data){
                var _self=this,res = []
                return  $.when(this.cfg).pipe(function(cfg){
                    $.each(data,function(i,item){
                        var def = _self.__setOneDocStore(i,item,cfg)
                        res.push(def)
                    })
                    return $.when.call($,res)
                })
            },
            __setOneDocStore:function(i,item,cfg){
                var key = docinfo.unid34+cfg.StoreName,rowkey=item[cfg.KeyName]||(i+1),view="vwPluginTableDoc",form="fmTableDoc",fields=[],doc={
                    __View:view,
                    __Key:[key,rowkey],
                    __KeyFields:["TableKey","RowKey"],
                    __Form:form,
                    __Fields:fields,
                    __autoFields:[],
                    __autoFieldsLength:0
                }
                item.WF_DocUNID=docinfo.unid34
                item.TableID = cfg.StoreName
                item.TableKey=key
                item.RowKey = rowkey
                $.each(item,function(name,value){
                    fieldname = name
                    doc[fieldname]=value
                    fields.push(fieldname)
                })
                var url = appinfo.dbpath+"/agSavePostToDoc?openagent";
                return $.ajax({
                    type: 'POST',
                    url: url,
                    data: doc,
                    dataType: "json"
                }).pipe(function(data){
                        if(data.error){
                            return false
                        }else
                            return true
                    },function(e){
                        return false
                    })
            }
        })
        return table
    })