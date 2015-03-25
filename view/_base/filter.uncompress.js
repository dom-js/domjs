/*!
 *过滤器用于生成一个过滤选择面板，并将数据组号成一个查询字符串
 */
/**
 * 2013-5-10 修改filter条件字段添加方式，支持自定义搜素字段，通知添加了缺省搜素字段的支持
 * 2013-5-13 修改生产搜素字符串的方式，同名字段“或” 连接，不同字段“与”连接，支持一个字段内
 * 2013-12-19 添加记录支持
 */
define(["jquery","widget/_base/widget","plugin/tmpl","plugin/jsviews","i18n!nls/system","base/objectjengine","base/util"],function($,widget,tmpl,jsViews,i18n,ObjEng,util){
    var Filter = widget.sub()
    var conditionTyps = {
        "contains":"包含"
        ,"=":"等于"
        ,">":"大于"
        ,"<":"小于"
        ,">=":"大于等于"
        ,"<=":"小于等于"
        ,"!=":"不等于"
        ,"<>":"不等于"
        ,"query":""
    }
    Filter.fn.extend({
        __initTmpl:function(){
            this.__initTmplList()
            this.__initTmplDrop()
            this.__initTmplCrumbs()
            this.fieldsMap={
                query:{
                    txLabel:"",
                    txFieldName:"query",
                    txParams:"",
                    txListValues:"",
                    txFieldType:"",
                    txDefaultShow:"",
                    txSearchEvent:"",
                    ValuesMap:{},
                    condition:"query"
                }
            }
            this.css({
                "float":"left",
                "padding":"0px 0px" ,
                "width":"98%" ,
                "font-size":"12px"
            })
        },
        __initTmplList:function(){
            var tmpls={
                "dep":"<input style='height: 20px;padding:0px;vertical-align:middle;' data-type='department'   name='${txFieldName}' ${txParams} />",
                "name":"<input style='height: 20px;padding:0px;vertical-align:middle;' data-type='names'   name='${txFieldName}' readonly  ${txParams} />",
                "text":"<input style='height: 20px;padding:0px;vertical-align:middle;'  name='${txFieldName}'  ${txParams} />",
                "num":"<input  style='height: 20px;padding:0px;vertical-align:middle;' name='${txFieldName}'  ${txParams} />",
                "date":  "<input style='height: 20px;padding:0px;vertical-align:middle;' data-type='datepicker'  name='${txFieldName}'   ${txParams} />",
                "list":"<select  style='height: 22px;padding:0px;vertical-align:middle;'  name='${txFieldName}'   ${txParams} >" + "<option value=''>--"+i18n["Please Select"]+"--</option>" +
                    "{{each(i,val) txListValues}}" +
                    "<option value='${val.value}' >${val.text}</option>" +
                    " {{/each}}" +
                    "</select>",
                "listformula":"<select   style='height: 24px;padding:0px;vertical-align:middle;' name='${txFieldName}'   ${txParams} />",
                "custom":"{{html txParams}}"
            };
            var __tmplA={}

            var tmpl = []

            tmpl.push("<div style='float: left;margin-left: 5px; padding:5px 5px 0px ; height: 30px;' class='__filter__base__one__'>")
            tmpl.push("<div style='float: left;width: 16px;height:22px; margin-left:10px; cursor: pointer ' class='__fliter__base__one__delete__'>" +
                "<img style='display:none;width: 8px;height: 8px;margin-top: 8px;' src=\""+require.toUrl("view/source/clear.png")+"\"  ></div>")

            tmpl.push("<div class='__fliter__base__one__label__' " +
                "style='float: left;text-align: right ;height:20px; line-height: 20px;margin-top: 0px;white-space:nowrap;padding: 0px 10px;'>")

            tmpl.push("${txLabel}:")
            tmpl.push( "</div>")

            tmpl.push("{{if txFieldType==\"date\"||txFieldType==\"num\"}}" +
                "<div style='float: left;' class='__fliter__base__one__condition__'>" +
                "<select style='height: 22px;padding:0px;vertical-align:middle;'>" +
                "<option value='='>"+i18n["Equal"]+"</option>" +
                "<option value='\>'>"+i18n["Greater"]+"</option>" +
                "<option value='\<'>"+i18n["Less"]+"</option>" +
                "</select></div>" +
                "{{/if}}")
            tmpl.push("<div style='float: left;' class='__fliter__base__one__field__'>")

            tmpl.push("____tmplete___")
            tmpl.push("</div>")

            tmpl.push("</div>")
            __tmplA={}
            $.each(tmpls,function(key,tpl){
                __tmplA[key]=util.uid()
                $.template( __tmplA[key] ,tmpl.join("").replace("____tmplete___",tpl))
            })
            //template
            //    console.log(tmpls)
            this.__tmplA = __tmplA
            //this.__tmplA  = "<script type='text/x-domjs-tmpl'>"+tmpl.join("")+"</script>"
        } ,
        __initTmplDrop:function(){
            var tmpl = []
            tmpl.push("<option>${txLabel}</option>")
            this.__tmplB  = "<script type='text/x-domjs-tmpl'>"+tmpl.join("")+"</script>"
        } ,
        __initTmplCrumbs:function(){
            var tmpl = []
            tmpl.push("<span><span style='background-color: #FFFFCC;border: 1px solid #EFEFEF;padding: 3px;'>")
            tmpl.push("${label} ${logical} ${values}")
            tmpl.push("<img style='cursor: pointer;width: 8px;height: 8px;margin-top: 8px;margin: 0px 3px;' src=\""+require.toUrl("view/source/clear.png")+"\"  >")
            tmpl.push("</span></span>")

            this.__tmplC = tmpl.join("")
        },
        __initDropBt:function(){
            var drop = this.doms.dropBtn = $("<div style='position: absolute;'></div>")
        } ,
        __initWidget:function(){
            var _self =this;
            var dom1 = this.doms.filterPanel = $("<div style=' '></div>")
            var searchcrumbs = $("<span><input type='checkbox'title='结果内过滤' style='display: none;' class='filterasbase'><span class='searchcrumbs'></span></span>")
            var select = $("<select name='fieldslist' style='height: 18px;padding:0px'></select>").append(tmpl(this.__tmplB).tmpl(this.options.items))
            var bt = $("<input style='height: 18px;padding:0px;margin: 0px 5px;' type='button' value='"+i18n["Add"]+"' name='filteradd'>")
            var b2 = $("<input style='height: 18px;padding: 0px;margin: 0px 5px;' type='button' value='"+i18n["Search"]+"' name='filtersearch'>")
            var b3 = $("<input style='height: 18px;padding: 0px;margin: 0px 5px;' type='button' value='"+i18n["Clear"]+"' name='filterclear'>")
            var dom2 = $("<div style='height:20px;padding: 3px 5px;background-color: #e8e8e8'></div>").append(select,bt,b2,b3,searchcrumbs)
            //this.__initDropBt();
            this.append(dom2,dom1)
            this.css({
                "background-color":" #ffffcc",
                "border":" 1px solid #efefef"
            })
            $.each(this.options.items,function(i,item){
                if(item.txFieldType=="date"){
                    item.condition = "="
                } else{
                    item.condition = "CONTAINS"
                }
                item.showCount=0
                if(!$.isArray(item.txListValues)){
                    item.txListValues=[item.txListValues]
                }
                item.ValuesMap={

                }
                item.txListValues = $.map(item.txListValues,function(str,i){
                    var val ={},_val = String(str).split("|")
                    val.text=_val[0]
                    val.value=_val[1]||_val[0]
                    item.ValuesMap[ val.value]= val.text
                    return val
                })
                if(item.txDefaultShow=="1"){
                    item.showCount=1
                    _self.addCondition(item)
                }
                _self.fieldsMap[item.txFieldName] = item
            })
            this.refreshWidth()
        }  ,
        refreshWidth:function(){
            var   width = Math.min(this.options.view.width(),$(window).width())
            $(this).width(width)
        },
        addCondition:function(item){
            var _self= this;
            var dom = $.tmpl(this.__tmplA[item.txFieldType],[$.extend({},item)])
            ObjEng(dom)
            if(item.txSearchEvent){
                events = typeof item.txSearchEvent=="string"?[item.txSearchEvent]:item.txSearchEvent;
                try{
                    $.each(events,function(i,e){
                        dom.on(e,function(){
                            _self. __search();
                        })
                    })
                }catch(e){}
            }
            this.doms.filterPanel.append(dom)
            return dom;
        },
        __search:function(){
            this.trigger("search",[this.getQueryStr(),this.options.view,"filter"])
        },
        __initEvent:function(){
            var _self = this
            var event = $.Event("search")
            this.on("keyup","input",function(e){
                if(e.keyCode==13){
                    _self. __search()
                }
            })
            $(window).on("resize",function(){
                _self.refreshWidth();
            })
            this.on("click","input[name=filtersearch]",function(){
                _self. __search()
            })
            this.on("click","input[name=filterclear]",function(){
                _self.clear()
            })

            this.on("mouseenter",function(){
                // _self.doms.filterPanel.show();
            })
            this.on("mouseleave",function(){
                // _self.doms.filterPanel.hide();
            })
            this.on("mouseenter",".__filter__base__one__",function(){
                $(".__fliter__base__one__delete__ img",this)     .show()
                $(this).css({
                    "background-color":"floralwhite"
                })
            })
            this.on("mouseleave",".__filter__base__one__",function(){
                $(".__fliter__base__one__delete__ img",this).hide()
                $(this).css({
                    "background-color":""
                })
            })
            this.on("click",".__fliter__base__one__delete__ img",function(){
                var othis = $(this)
                var item =  othis.tmplItem().data
                item.showCount --
                othis.parent().parent().remove()
            })
            this.on("click",".searchcrumbs img",function(){
                var othis = $(this)
                var item =  othis.tmplItem().data

                othis.parent().remove()
                $(_self).find(".__fliter__base__one__field__ [name="+item.field+"]").val("")
                $(_self).find(".filterasbase").attr("checked",true)
                item.del()
                _self.__search()
            })
            this.on("click","input[name=filteradd]",function(){
                var item = _self.find("select[name=fieldslist] option:selected").tmplItem().data
                _self.addCondition(item)
            })
            this.on("change",".__fliter__base__one__condition__ select",function(){
                var item = $(this).tmplItem().data
                item.condition = $(this).val()
            })
        },
        refreshSearchCrumbs:function(data){

            if(data.length>0){
                $(this).find(".filterasbase").show()
            }else{
                $(this).find(".filterasbase").hide()
            }
            $(this).find(".searchcrumbs").empty().append(tmpl(this.__tmplC).tmpl(data))
        },
        setBaseFilter:function(q,flag){
            var query=q;
            if(typeof  q =="string"){
                query = this.queryReTransfer(q);
                if(flag)
                    $(this).find(".filterasbase").attr("checked",true)
            }
            var _qs = q.split(q)
        },
        getQueryStr:function(){
            var _self = this , objs={}
            var inputs =   _self.doms.filterPanel.find(".__fliter__base__one__field__ :input");
            inputs.each(function(i,el){
                var othis = $(el)
                if(othis.val()==""||el.name=="") return true
                if((el.type=="checked"||el.type=="radio") && el.checked==false ) return true
                var vals = othis.val().split(",")
                var item =othis.tmplItem().data
                _self.__computerCondition(objs,item,vals)

            })

            var data = []
            var str =  this.queryTransfer(objs,data)
            this.refreshSearchCrumbs(data)
            return str;
        }  ,
        __computerCondition:function(objs,item,vals){
            if(!objs[item.txFieldName]){
                objs[item.txFieldName]={
                    label:item.txLabel,
                    field:item.txFieldName,
                    type:item.txFieldType,
                    valuemap:item.ValuesMap,
                    org:item,
                    condition:{}
                }
            }
            var cs = objs[item.txFieldName] ,vinfo={
                values:vals
            }
            if(!cs.condition[item.condition]){
                cs.condition[item.condition]=[]
            }
            cs.condition[item.condition] = cs.condition[item.condition].concat(vals)
        },
        queryReTransfer:function(q){
            var _qs={},  _self = this , objs={}

            $.each(q.split("AND"),function(_,_q){
                return $.each(_q.split("OR"),function(_,_q){
                    var qinfo = _q.match(/\[([\d\w_]*)\]\s+((?:CONTAINS)|>|=|<)\s+\(?([^\)]*)\)?/mi)

                    var q={ }

                    if(qinfo){
                        _self.__computerCondition(objs,_self.fieldsMap[$.trim(qinfo[1])],$.map(qinfo[3].split(","),function(v){return $.trim(v)}))
                    }else{
                        _self.__computerCondition(objs,_self.fieldsMap["query"],$.map(_q.split(","),function(v){return $.trim(v)}))
                    }
                })
            })
            var data = []
            var str =  this.queryTransfer(objs,data)

            this.refreshSearchCrumbs(data)

        },
        queryTransfer:function(conditions,data){

            if(!this.orgConditions){
                this.orgConditions={}
            }

            var orgconditions = $.extend(true,{},this.orgConditions);

            if($(this).find(".filterasbase").attr("checked"))
                $.each(conditions,function(key,item){

                    if(orgconditions[key]){
                        var i = 0
                        // console.log(orgconditions[key].condition.CONTAINS)

                        $.each(orgconditions[key].condition,function(c,vs){
                            i++

                            if(item.condition[c])
                                orgconditions[key].condition[c]=item.condition[c].concat(vs)
                            else
                                orgconditions[key].condition[c]=vs
                        });
                        if(i==0)  {
                            orgconditions[key] = item;
                        }
                        else
                        {
                            $.each(item.condition,function(c,vs){
                                if(!orgconditions[key].condition[c]){
                                    orgconditions[key].condition[c]=vs;
                                }
                            })
                        }
                    } else
                        orgconditions[key] = item


                });
            else
                orgconditions=conditions
            this.orgConditions = orgconditions
            return $.map(this.orgConditions,function(item,field){
                var col={},c1=[],c2=[];

                $.each(item.condition,function(c,vs){
                    if(vs.length==0)return true;
                    util.unique(vs)
                    var vtexts = $.map(vs,function(v){
                        return item.valuemap[v]||v;
                    })
                    var cT = conditionTyps[c.toLowerCase()]
                    var res={
                        field:field,
                        label:item.label,
                        logical:cT,
                        _logical:c,
                        del:function(){
                            item.condition[c]=undefined
                            delete item.condition[c]

                        },
                        values:vtexts
                    }
                    data.push(res)
                    if(field=="query"){
                        c1.push(vs)
                    }else  if(c==">"||c=="<"){
                        var _vs=vs
                        if(item.type=="date"){
                            var date;
                            var _vs = $.map(vs,function(_v){
                                var v=_v.split(/-/);return new Date(v[0],v[1]-1,v[2]).getTime();
                            })
                        }
                        var vb = Math[c==">"?"max":"min"].apply(Math,_vs)
                        var idx = $.inArray(vb,_vs);
                        col[c]=vb
                        c2.push("["+field+"]  "+c+" "+vs[idx]+"")

                    }else if(c=="="){
                        $.each(vs,function(i,v){
                            c1.push("["+field+"] "+c+" "+v+"")
                        })
                    }else{
                        c1.push("["+field+"] "+c+" ("+vs.join(",") +")")
                    }
                })
                if(col["<"]&&col[">"]&&col["<"]>col[">"]){
                    c2 = c2.join(" AND ")
                }else{
                    c2 = c2.join(" OR ")
                }
                if(c2!="")  c1.push("("+c2+")")
                return c1.length==0?null:"("+c1.join(" OR ") +")"
            }).join(" AND ")
        },
        clear:function(){
            this.doms.filterPanel.find(".__fliter__base__one__field__ :input").each(function(i,el){
                $(el).val("")
            })
            if(!$(this).find(".filterasbase").attr("checked")){
                this.refreshSearchCrumbs([])
                this.orgConditions={}
            }
            this.trigger("clear")
        }
    })
    return Filter
})