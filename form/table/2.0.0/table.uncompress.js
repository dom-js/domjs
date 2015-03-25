/*!
 * 2013-6-28 更新addRow 方法，解决添加一个新item时流水序号无法自动更新的问题
 */
define(["plugin/jquery.tmpl.min","widget/_base/widget","base/objectjengine","appinfo","docinfo","base/util","i18n!nls/system"],
    function($,widget,widgetengine,appinfo,docinfo,util,i18n){

        var table = widget.sub()

        // the code of these two functions is from mootools
        // http://mootools.net
        var $specialChars = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };
        var $replaceChars = function(chr) {
            return $specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
        };
        table.extend({
            // the code of this function is from
            // http://lucassmith.name/pub/typeof.html
            objtype:function(o) {
                var _toS = Object.prototype.toString;
                var _types = {
                    'undefined': 'undefined',
                    'number': 'number',
                    'boolean': 'boolean',
                    'string': 'string',
                    '[object Function]': 'function',
                    '[object RegExp]': 'regexp',
                    '[object Array]': 'array',
                    '[object Date]': 'date',
                    '[object Error]': 'error'
                };
                return _types[typeof o] || _types[_toS.call(o)] || (o ? 'object' : 'null');
            },
            toJSON:function(o) {
                var s = [];
                switch (table.objtype(o)) {
                    case 'undefined':
                        return 'undefined';
                        break;
                    case 'null':
                        return 'null';
                        break;
                    case 'number':
                    case 'boolean':
                    case 'date':
                    case 'function':
                        return o.toString();
                        break;
                    case 'string':
                        return '"' + o.replace(/[\x00-\x1f\\"]/g, $replaceChars) + '"';
                        break;
                    case 'array':
                        for (var i = 0, l = o.length; i < l; i++) {
                            s.push(table.toJSON (o[i]));
                        }
                        return '[' + s.join(',') + ']';
                        break;
                    case 'error':
                    case 'object':
                        for (var p in o) {
                            s.push(p + ':' + table.toJSON (o[p]));
                        }
                        return '{' + s.join(',') + '}';
                        break;
                    default:
                        return '';
                        break;
                }
            },
            evalJSON : function(s) {
                if (table.objtype(s) != 'string' || !s.length) return null;
                return eval('(' + s + ')');
            }
        })

        table.fn.extend({
            options:{
                source:undefined,
                sourcetype:undefined,
                editable:undefined
            },
            __init:function(){
                this.initComplete=[new $.Deferred()]
                var _self = this;
                //this.initDef = new $.Deferred()
                this.doms={}
                this.hide()
                this.data("table",this)
                if(this.options.editable===undefined){
                    var me = this[0]
                    this.options.editable=( me.type && (me.type=="text"||me.type=="textarea"))?true:false
                }

                if(this.parent()[0]&&this.parent()[0].tagName=="TD"){
                    this.parent().css({
                        "padding":"2px"
                    })
                }
                this.rows = []
                this.doms.table = $("<table style='width: 100%;border: none;' class='inputForm_table'></table>")

                this.after(this.doms.table)

                this.options.id = this.options.id || this.attr("id")||this.attr("name")
                this.trigger("init",[this]);

                this.__getStruct().then(function(tools,head,tmpl,cfg){
                    try{
                        // console.log(cfg.TableRow_Edit,tmpl)
                        _self.__initHead(head);
                        _self.__initField(cfg);
                        _self.__initToolbar(tools);
                        _self.__initTmpl(tmpl)
                        _self.__initWidget(cfg);
                        _self.__initEvent(cfg);
                        _self.trigger("inited",[_self,cfg]);
                    }catch(err){
                        console.log(err.stack)
                        throw err
                    }

                },function(err){
                    console.log(err.stack)
                    throw err
                })
                if(this.options.editable){
                    var beforesubmitpromise = $("form").data("beforesubmitpromise")||[]
                    beforesubmitpromise.push(function(){
                        return _self.save()
                    })
                    $("form").data("beforesubmitpromise",beforesubmitpromise)
                }

            },
            __initHead:function(head){
                var head =  $(head);
                if(head.get(0).tagName!="THEAD"){
                    this.doms.head =$("<thead></thead>").append(head)
                }else{
                    this.doms.head = head
                }
                this.doms.table.append(this.doms.head)
            },
            __initField:function(cfg){
                var fields =[],item={}

                if(cfg.DataSource&&cfg.DataSource!=""){
                    fields.push({
                        name:cfg.DataSource+"_uid",
                        type:"uid"
                    })
                    item[cfg.DataSource+"_uid"]=util.uid();
                }

                $(cfg.TableRow_Edit).find("[data-name]").each(function(i,el){
                    var field = {},$el = $(el)
                    field.name = $el.attr("data-name")
                    field.type = $el.attr("data-coltype")||$el.attr("data-type")


                    fields.push( field)
                    item[field.name]=""
                    if(field.type=="serialno")item.__serialnofield__=field.name
                })

                this.options.emptyItem=item

                return  this.options.fields =fields
            },
            __initToolbar:function(tools){
                if(!this.options.editable)return
                var buttons = $(tools)
                var toolbar = this.doms.table.find(".tableToolbar")
                if(toolbar.length==1){
                    toolbar.append(toolbar)
                }else{
                    this.doms.table.after(buttons)
                }
            },
            __initTmpl:function(tmpl){
                this.__tmpl = "<script type='text/x-domjs-tmpl'>"+tmpl+"</script>"
            },
            __initWidget:function(cfg){
                var _self = this
                this.options.minRowsCount = cfg.MinRowsCount
                this.options.maxRowsCount = parseInt(cfg.MaxRowsCount)

                try{
                    this.__getData(cfg).then(function(data){
                        _self.update(data)
                        _self.initComplete[0].resolve()
                        _self.__initComplete.resolve()
                        $(_self).trigger("loaded",[_self,data])
                    },function(e){
                        _self.__initComplete.reject(e)
                        console.log(e)
                    })
                }catch (e){
                    throw e
                }
            },
            __getData:function(data){
                var _self = this
                switch (this.options.sourcetype){
                    case "view":
                        return _self.__getViewStore(data)
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
                        return _self.__getStore(data)
                    default :
                        return $.when([])
                }
            },
            __getStruct:function(){
                if(this.options.source){
                    return this.__getViewStruct()
                }else{
                    return this.__getCfgStruct();
                }
            },
            __getViewStruct:function(){
                return []
            },

            __getCfgStruct:function(){
                var _self = this

                var cfg = appinfo.getdoc("fmTable"+this.options.id,appinfo.dbpath).pipe(function(data){
                    $.each(data,function(key,value){
                        data[key]= $.trim(value)
                    })
                    // console.log("|"+data.DataSource+"|")
                    var source = data.DataSource,sourcetype=data.DataSourceType

                    if(source==""){
                        source=data.StoreId
                        sourcetype=data.StoreType
                    }
                    _self.options.sourcetype = sourcetype
                    _self.options.source = source
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
            __getStore:function(data){
                var trs
                if(this.options.editable){
                    trs = $(this.val()).find("tr")
                }else{
                    trs = this.find("tr")
                }
                var items = []
                trs.each(function(i,tr){
                    var item = {}
                    $("[data-name]",tr).each(function(i,el){
                        var $el =$(el),name = $.trim($(el).attr("data-name")),val = $.trim($el.text())
                        item[name]=val
                    })
                    items.push(item)

                })
                return $.when(items)
            },
            //初始化保存为独立域的数据原
            __getFieldStore:function(cfg){
                var _self = this, fields = _self.options.fields, keyname = cfg.KeyName||fields[0].name
                //console.log()
                //cfg.DataSource
                if(docinfo.isnewdoc){
                    return _self.__getStore(cfg)
                    return  $.when([])
                } else{
                    return   appinfo.getdoc(docinfo.unid).pipe(function(doc){
                        var i = 0, suffix = "_"+(++i),res=[]
                        //cfg.DataSource
                        if(!cfg.KeyName&&cfg.DataSource&&doc[cfg.DataSource+"_uid"+suffix]){
                            keyname = cfg.DataSource+"_uid"
                        }
                        while(doc[keyname+suffix]){

                            var item = {}
                            $.each(fields,function(i,field){
                                var name = field.name
                                try{
                                    item[name] = decodeURIComponent(doc[name+suffix]||"")
                                }catch(e){
                                    item[name] = (doc[name+suffix]||"")
                                }
                            })
                            item["uid"]= doc[cfg.DataSource+"_uid"+suffix]||util.uid();
                            res.push(item)

                            suffix = "_"+(++i)
                        }

                        return res
                    }).fail(function(err){
                            console.log(err)
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
            __initEvent:function(){
                var _self =this
                this.doms.table.on("click","[data-coltype=delbt] button,[data-coltype=delbt] input[type=button]",function(e){

                    var data = $(this).tmplItem(),nodes = data.nodes
                    _self.deleteRow($(nodes).data("rowIndex"))
                })
            },
            update:function(res){
                var _self = this;
                this.doms.table.find("tbody").empty()
                this.rows=[]

                //  return  this.__getData(this.cfg).pipe(function(){
                //$(this[0]).trigger("update",[this,res])
                $.when(res).then(function(data){
                    _self.trigger("update",[_self,data]);
                    if(_self.options.editable&& data.length< _self.options.minRowsCount ){
                        for(var i=data.length;i<_self.options.minRowsCount;i++){
                            var item = $.extend({},_self.options.emptyItem)
                            item[item.__serialnofield__] = i+1
                            data.push(item)
                        }
                    }
                    $.each(data,function(i,item){
                        _self.addRow(item)
                    })
                    // console.log(_self[0].outerHTML)
                    _self.trigger("updateed",[_self,data]);
                })

            },
            getRow:function(){

            },
            addRow:function(oitem,i){
                var _self=this,item = oitem
                var rowIndex =  this.rows.length
                //  if(!item){
                item = $.extend({},this.options.emptyItem,item)
                item[item.__serialnofield__] = rowIndex+1
                if(!item.uid){
                    item.uid = util.uid();
                }

                var row = $(this.__tmpl).tmpl([item])
                if(oitem)
                    oitem.node = row
                item.node = row


                $.each(this.options.fields,function(i,field){
                    if(field.type=="increment"){
                        var el = $(row).find("[data-name="+field.name+"]")
                        el.attr("data-_name",field.name)
                        el.attr("data-name", field.name+"_"+rowIndex)
                    }
                })

                $(row).data("rowIndex",rowIndex)
                this.rows.push(row)
                if(i===undefined){
                    this.doms.table.append(row)
                }else{
                    var rowDom = this.doms.table.find("tr:eq("+i+")")
                    if(rowDom.length==0){
                        this.doms.table.append(row)
                    }else{
                        rowDom.before(row)
                    }

                }
                widgetengine(row)
            },
            deleteRow:function(rowIndex){
                var serialfield = this.options.emptyItem.__serialnofield__
                var _self = this;
                rowIndex =typeof rowIndex=="undefined"?this.rows.length-1:rowIndex;
                this.rows = $.grep(this.rows,function(row,i){
                    if(i==rowIndex){
                        _self.trigger("delete",[_self,row,i])
                        row.remove();
                        _self.trigger("deleted",[_self,row,i])
                        return false
                    }else if(i>rowIndex){
                        row.data("rowIndex",i-1)
                        row.find("[data-coltype=serialno][data-name="+serialfield+"]").text(i)
                    }
                    return true
                })
            },
            getLocalData:function(){
                var _self = this, data=[]
                $.each(this.rows,function(i,row){
                    var item = {},els = row.find("[data-name]")
                    $.each(_self.options.fields,function(i,field){
                        var val
                        if(field.type=="serialno"){
                            var el = els.filter("[data-name="+field.name+"]");
                            val = el.text()
                        }else if(field.type=="increment"){
                            var el = els.filter("[data-_name="+field.name+"]");
                            val = el.val()
                        }else{
                            var el = els.filter("[data-name="+field.name+"]:not([type=button])");
                            var vals = $.map(el,function(el,i){
                                if(el.tagName=="INPUT" && !el.type)el.type="text";
                                if(el.type){
                                    switch(el.type){
                                        case "checkbox":
                                        case "radio":
                                            if(el.checked){
                                                return el.value;
                                            }else{
                                                return null
                                            }
                                            break;
                                        default :
                                            return $.trim($(el).val());
                                    }
                                }else{
                                    return $.trim($(el).text());
                                }
                            });
                            val = vals;
                        }
                        item[field.name] = val
                    })
                    var newitem = $.extend({},row.tmplItem().data)
                    $.extend(newitem,item)
                    if(_self.options.source){
                        newitem[_self.options.source+"_uid"] = newitem.uid;
                    }

                    delete newitem.uid;
                    delete  newitem.node;
                    delete newitem.__serialnofield__
                    data.push(newitem)
                })

                return data;
            },
            saveToCollection:function(data){
                var el =  $("[name=WF_Collection]");
                if(el.length==0)return false;
                var strXML = "<doc>";
                strXML +="<head>";
                strXML +="<length>";
                strXML +=data.length;
                strXML += "</length>";
                strXML += "<action name='savetodoc'>";
                strXML += "<param name=\"document\" type=\"notesdocument\" value='DOCTARGET' />"
                strXML += "</action>";
                strXML +="</head>";
                strXML +="<body>";
                var createValueNode=function(value){
                    var str=""
                    if(/&(?![a-z]*;)|<|\n/.test(value.toString())){
                        str +="<![CDATA[";
                        str +=  encodeURIComponent(value.toString());
                        str +="]]>";
                    }else{
                        str +=value.toString();
                    }
                    return str
                }
                var  fields = []
                if(data.length>0){

                    $.each(data[0],function(key,value){

                        fields.push(key)
                    })
                }else{
                    $.each(this.options.fields,function(key,field){
                        fields.push(field.name)
                    })
                }
                strXML +="<entries ";
                strXML +=" fields=\"";
                strXML +=fields.join(",");
                strXML +="\" ";
                strXML +=" idproperty=\"";
                strXML +=fields[0];
                strXML +="\" ";

                strXML +=">";
                $.each(data,function(i,item){
                    var suffix = "_" +(i+1)
                    strXML +="<entry";
                    strXML +=  " >"

                    $.each(item,function(key,value){

                        strXML +="<field ";
                        strXML +="name=\"";
                        strXML +=(key);
                        strXML +=  "\"";



                        if(!value || value==""){

                            strXML +="/>"
                        }else{

                            strXML +=">"

                            if(!$.isArray(value)){
                                value = [value]
                            }
                            $.each(value,function(i,val){
                                strXML +="<value>"
                                strXML += createValueNode(val)
                                strXML +="</value>"
                            })
                            strXML +="</field>"
                        }
                    })
                    strXML +="</entry>"
                });
                strXML +="</entries>"
                strXML +="</body>"
                strXML +="</doc>";

                if(el.val()==""){
                    el.val("<collection></collection>")
                }
                var value  = el.val().replace(/(<\/collection>)$/,strXML+"$1")

                $("[name=WF_Collection]").val(value)

                return true
            },
            save:function(){
                if(!this.options.editable)return $.when(true);
                var _self = this, data=_self.getLocalData();
                switch (this.options.sourcetype){
                    case "view":
                        return _self.__setViewStore(data)
                        break;
                    case "doc":
                        return _self.__setDocStore(data)
                        break;
                    case "field":
                        return  $.when( _self.saveToCollection(data)).pipe(function(flag){
                            if(!flag) {
                                return  _self.__setFieldStore(data)
                            }else{
                                return flag
                            }
                        });
                        // return _self.__setFieldStore(data)
                        break;
                    case "json":
                        return _self.__setJsonStore(data)
                    case "none":
                        return _self.__setStore(data)
                    default :
                        return []
                }
                return  $.when(false);;
            },
            __setStore:function(data){
                var _self = this ,tab = $("<table style='display: none;' data-id='"+this.options.id+"'></table>");
                $.each(this.options,function(name,value){
                    if(_self.attr("data-"+name)==value){
                        tab.attr("data-"+name,value)
                    }
                })
                return  this.cfg.pipe(function(cfg){
                    var trs =  $("<script type='text/x-domjs-tmpl'>"+cfg.TableRow_Disp+"</script>").tmpl(data)
                    tab.append(trs)
                    var __div = $("<div></div>").append(tab)
                    _self.val(__div.html())
                    return _self.val()
                })
            },
            __setFieldStore:function(data){
                var _self = this;
                this.__setStore(data)
                var key = docinfo.unid34,view="FlowByDocUNID",form="fmMain",fields=[],doc={
                    __View:view,
                    __Key:key,
                    __KeyFields:["WF_DocUNID"],
                    __Form:form,
                    __Fields:fields,
                    __AuthorsField:"WF_CurrentAuthors",
                    __autoFields:$.map(this.options.fields,function(field){return field.name?field.name:null}),
                    __autoFieldsLength:data.length
                }

                $.each(data,function(i,item){

                    // console.log(item)
                    var suffix = "_"+ (i+1)
                    $.each(item,function(name,value){
                        fieldname = name+suffix
                        doc[fieldname]=value
                        fields.push(fieldname)
                    })

                    //  console.log(item)
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