/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-9-4
 * Time: 上午9:31
 * 视图搜素功能，主要配合domino视图搜素进行扩展
 */
/**
 * 2012-5-8 如果为视图指定特殊搜素视图，则搜素时自动跳转值视图的搜素界面，如果是分类视图，没有指定特殊搜素界面，则自动使用SearhAll视图
 */

define(["./view","./viewinfo","appinfo","./_base/filter","widget/jbox","css!"+require.toUrl("view/source/css/defaultview.css")],function(View,viewinfo,appinfo,Filter,jbox){
    var searchView = View
    var lang = []

    if(viewinfo.langpack&&viewinfo.langpack!=""){
        lang = new $.Deferred()
        require(["di18n!"+ $.trim(viewinfo.langpack)],function(i18n){
            lang.resolve(i18n)
        })
    }
    var Toolbar = View.Toolbar
    var Searchbar = View.Searchbar

    var hitchs = [];
    //视图自带按钮处理
    (function(){
        var form = $("form"),firstEl  =  form.find(">*")
        firstEl.filter("br,font").remove()
        var table =  firstEl.filter(":first")
        var hr = table.find("+hr")

        var _bts = table.find("td>a")
        table.remove()
        var bts1 = _bts.filter("[onhelp]")
        var bts2 = _bts.filter("[onclick]")

        if(hr.length>0){
            hr.remove()
            var hitchToolbar={
                name:"toolbar.initWidget",
                fn:function(toolbar){
                    var _self = this
                    bts2.each(function(i,el){
                        toolbar.addButton({
                            label:el.innerText,
                            fn:el.onclick
                        })
                    })

                },
                type:"fn",
                args:[]
            }

            hitchs.push(hitchToolbar)
            bts1.each(function(i,el){
                var hitch = {
                    name:el.target,
                    fn:new Function($(el).attr("onhelp"))
                }
                hitchs.push(hitch)

                // (new Function($(el).attr("onhelp"))).call(_self)
            })


        }
    })();
    //国际化支持处理
    (function(){
        var hitch = {
            name:"view.loadLayout",
            fn:function(layouts){
                lang.then(function(i18n){
                    $.each(layouts,function(i,layout){
                        layout.title = i18n[layout.title] ||layout.title
                    })
                })
            },
            type:"fn",
            args:[]
        }
        hitchs.push(hitch)
    })();
    (function(){
        var hitch = {
            name:"view.init",
            fn:function(){
                var _self = this
                var hash =  window.location.hash.replace(/^#/,"")
                if(hash!=""){
                    _self.options.autoload=false;//(hash);
                }
                $.when(lang).then(function(i18n){
                    if(_self.options.basefilter)
                    $.each(_self.options.basefilter,function(i,layout){
                        layout.label = i18n[layout.label] ||layout.label
                    })
                })
            },
            type:"fn",
            args:[]
        }
        hitchs.push(hitch)
    })();
    (function(){
        var hitch = {
            name:"view.inited",
            fn:function(){
                var _self = this
                var hash =  window.location.hash.replace(/^#/,"")
                if(hash!=""){
                     _self.search(hash);
                }

            },
            type:"fn",
            args:[]
        }
        hitchs.push(hitch)
    })();

    //IE6 样式兼容处理
    (function(){
        var hitch = {
            name:"range.addPage",
            fn:function(page){
                if(!$.support.cssFloat) {
                    page.filter(":odd").find("td").css("background-color","#fcfcfc")
                }
                page.find("a").attr("target","_blank")
            },
            type:"fn",
            args:[]
        }
        hitchs.push(hitch)
    })();
    //视图配置
    (function(){



        var hitch = {
            name:"toolbar.initWidget",
            fn:function(toolbar){
                var _self = this;
                var initToolbar=function(cfg){
                    var buttons =[]
                    try{
                        buttons = (new Function("return "+cfg.viewToolbar))()
                    }catch (e){

                    }

                    if($.isArray(buttons)){

                        $.each(buttons,function(i,bt){

                            toolbar.addButton($.extend({
                                label:bt.label,
                                fn:bt.events.click
                            },bt));
                        })
                    }

                    if(cfg.viewIsExport&&cfg.viewIsExport=="1"){
                        var bt = toolbar.addButton($.extend({
                                label:"Exports",
                                fn:function(){

                                   var url = appinfo.dbpath+"/(ExportToExcel)?openAgent&vwName="+escape(viewinfo.viewname)+"&queryStr="+escape(viewinfo.querystring);

                                    var defs = [],   totaldefs=[]
                                       var tipkey= "__exports__" + $.expando


                                    var count=50,totals=[]

                                    _self.__getDesign().pipe(function(layout){
                                        var def = new $.Deferred();

                                        jbox.open("","选择要导出的字段",300,400,{
                                            buttons:{"全选":1,"开始导出":2},
                                            loaded:function(h){
                                                var html = "<table><td colspan='2'>字段</td><td>链接</td>";
                                                for(var i = 0 ;i<layout.length;i++){
                                                    html+="<tr>";
                                                    html+="<td style='width: 20px'><input type='checkbox' name='_fieldname_'checked value='"+i+"'> </td>";
                                                    html+="<td>";
                                                    html+=layout[i].title;
                                                    html+="</td>"  ;
                                                    html+="<td  ><input type='checkbox'  name='_fieldlink_' "+(i==0?" checked ":"")+" value='"+i+"'></td>";
                                                    html+="</tr>";
                                                }
                                                html+"</table>";
                                                h.append(html);
                                            },
                                            submit:function(v,f){
                                                if(v==1){
                                                      f.find("input[name=_fieldname_]").attr("checked",true)
                                                    return false
                                                }else if(v==2){
                                                    layout = $.map(layout,function(item,i){
                                                       return  f.find("[name=_fieldname_][value="+i+"]").attr("checked")?item:null
                                                    })
                                                    layout = $.map(layout,function(item,i){
                                                        item.__link__ = f.find("[name=_fieldlink_][value="+i+"]").attr("checked")
                                                        return item
                                                    })
                                                    def.resolve(layout)
                                                }
                                            }
                                        })
                                        return def
                                    }).pipe(function(layout){
                                       jbox.tip("<span class='"+tipkey+"'>正在计算记录数</span>","loading",{timeout:0});
                                        var theads = $.map(layout,function(c){
                                            return "<th>"+ c.title+"</th>"
                                        }).join("");
                                        theads = "<thead><tr>"+theads+"</tr></thead>";
                                        var getHTML=function(items){
                                            return $.map(items,function(item){
                                                var tds = $.map(layout,function(c){
                                                    var val = item[c.name]
                                                    if(c.__link__){
                                                       // if(item[c.name+"_html"]){
                                                      //      val = item[c.name+"_html"]
                                                       // }
                                                        if(item._docurl){
                                                           val ="<a href='"+item._docurl+"'>"+item[c.name]+"</a>"
                                                       }
                                                         if(item._unid&&item.__store__){
                                                            val ="<a href='http://"+(item.__store__.options.host||window.location.host)+"/"+item.__store__.options.dbpath+"/0/"+item._unid+"'>"+item[c.name]+"</a>"
                                                        }
                                                        alert(val)
                                                    }


                                                        return  "<td>"+val+"</td>"
                                                })
                                                return   "<tr>"+tds.join("")+"</tr>";
                                            })
                                        }
                                        $.each(_self.options.stores,function(i,store){
                                            //store.clearQuery()
                                            var def = store.query({query:viewinfo.querystring},{count:count,start:1})
                                            totaldefs.push(def)
                                            defs.push(def.pipe(function(data){
                                                return getHTML(data)
                                            }))
                                        })
                                        var total = 0
                                        var currIndex= 1;
                                        var html = ""
                                        $.when.apply($,totaldefs).pipe(function(){
                                            $.each(arguments,function(i,data){
                                                totals.push(data.total)
                                                total += data.total
                                            });

                                            if(total>5000){
                                                jbox.closeTip()
                                                var def = new $.Deferred();
                                                msg = "总记录数"+total+"，导出速度可能较慢较慢，是否继续导出"
                                                if(total>10000){
                                                    msg="总记录数"+total+"，导出过程中浏览器会暂停响应,是否继续导出"
                                                }
                                                jbox.confirm(msg,"提示",function(v){
                                                    if(v=="ok"){
                                                        def.resolve(total)
                                                        jbox.tip("<span class='"+tipkey+"'>正在获取数据</span>","loading",{timeout:0});
                                                    }else{
                                                        def.reject()
                                                    }
                                                }
                                            )
                                                return def
                                            }else{
                                                $("."+tipkey).text("记录数总计"+total)
                                            }

                                           return total

                                        }).pipe(function(total){
                                                var qs = []
                                                $.each(_self.options.stores,function(i,store){
                                                    var m =totals[i]/count,n=Math.round(m),l=m==n?m-1:m>n?n:n-1;
                                                    for(j=1;j<=l;j++){
                                                        var start = (count*j+1)
                                                        var q = function(){
                                                            return store.query({query:viewinfo.querystring},{count:count,start:start})
                                                        }
                                                        qs.push(q)
                                                        defs.push(store.query({query:viewinfo.querystring},{count:count,start:start}).pipe(function(data){
                                                            currIndex++
                                                            $("."+tipkey).text("正在下载，已完成"+Math.round(currIndex*count/total*100)+"%")
                                                            $.each(data,function(_,item){
                                                                item.__store__= store
                                                            })
                                                            return getHTML(data)
                                                        }))
                                                    }
                                                })
                                                var atq = function(a,l,b){
                                                    if(!b)b=[];
                                                    b.push(a.splice(0,l));
                                                    if(a.length>0) atq(a,l,b);
                                                    return b;
                                                }
                                                var qq = atq(qs,5)
                                               var  whenqq= function(qq){
                                                        var ret = qq.splice(0,1)
                                                        return ret.pipe(function(r1){
                                                            if(qq.length==0)return r1;
                                                            return whenqq(qq).pipe(function(r2){
                                                                r1.concat(r2)
                                                            })
                                                        })
                                                }
                                                var data = []
                                                return $.when.apply($,defs).pipe(function(){
                                                    $.each(arguments,function(i,_data){
                                                        data=data.concat(_data)
                                                    })

                                                    return data
                                                })
                                            }).pipe(function(trs){

                                                var fieldname = "导出数据.xls"
                                                $("."+tipkey).text("下载完成，正在生成Excel");
                                                jbox.closeTip()

                                                html="<table>"+theads+" <tbody>"+trs.join("")+"</tbody></table>";
                                                    jbox.info("<a href=\"#\" download='"+fieldname+"'>点击下载</a>","数据导出完成",{buttons:[],loaded:function(h){
                                                        h.find("a").on("click",function(){
                                                           if(typeof $("<a>").get(0).download=="string"){
                                                               var uri = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
                                                               this.href = uri
                                                               $(this).after("已下载")
                                                               $(this).hide();
                                                               return true;
                                                           }
                                                            var  xlsWin = window.open("", "_blank","scrollbars=no,width=1,height=1");
                                                               xlsWin.document.write(html);
                                                              xlsWin.document.close();
                                                              var d = new Date()
                                                              if(!xlsWin.document.execCommand('SaveAs', true, fieldname)){
                                                                 if(new Date()-d<100){
                                                                     h.hide().after("您的因您的计算机安全设置或浏览器版本过低，无法直接另存为xls格式，请手动修改文件后缀名")
                                                                     xlsWin.document.execCommand('SaveAs', true, fieldname+".html");
                                                                 }
                                                              }else{
                                                                  $(this).after("已下载")
                                                                  $(this).hide();
                                                              }
                                                              xlsWin.close();
                                                            return false;
                                                        })
                                                }})

                                       })
                                    })
                                }
                        },{}));

                        bt[(viewinfo.querystring&&viewinfo.querystring!="")?"show":"hide"]();

                        $(_self).on("search",function(e,q){
                            bt[q!=""?"show":"hide"]();
                        })
                        $(_self).on("clear",function(){
                            bt.hide();
                        })
                    }
                };
                viewinfo.getConfig("view").then(function(confs){
                    try{

                        if($.isArray(confs)){
                            $.each(confs,function(i,cfg){
                                initToolbar(cfg);
                            });
                        }else{
                            initToolbar(confs);
                        }

                    }catch (e){
                        throw e
                    }
                });
            },
            type:"fn",
            args:[]
        }
        hitchs.push(hitch)
    })();
    //搜索配置处理
    (function(){
        var hitch = {
            name:"search.inited",
            fn:function(searchbar){
                var view = this

                var toolbar =       searchbar.options.toolbar;

                viewinfo.getConfig("search").then(function(confs){

                    if(confs.length>0){
                        var img = $("<img src='"+ searchbar.__getIconUrl("expand")+"'>");
                        var bt = $("<div style='float: left;margin: 3px 5px;;'></div>").append(img);
                        searchbar.append(bt);
                        $.when(lang).then(function(i18n){
                            $.each(confs,function(i,item){

                                item.txLabel = i18n[item.txLabel ] ||item.txLabel
                            })
                        })

                        var filter =    Filter("<div style='display: none'></div>",{
                            items:confs,
                            view:view
                        })

                        toolbar.after(filter)
                        var fnexpend = function(){
                            this.src = searchbar.__getIconUrl("collapse")
                            filter.slideDown(function(){
                                view.refreshSize()
                            })

                            },fncollapse =function(){
                            this.src = searchbar.__getIconUrl("expand")
                            filter.slideUp(function(){
                                view.refreshSize()
                            })

                        }

                        /**
                         * 控制状态
                         */
                        if( $.grep(confs,function(item,i){
                            return item.txShowFilter=="1"
                        }).length>0){
                            filter.slideDown(function(){
                                view.refreshSize()
                            });
                            img[0].src = searchbar.__getIconUrl("collapse")
                            img.toggle(fncollapse,fnexpend)
                        }else{
                            img.toggle(fnexpend,fncollapse)
                        }
                        var baseq =window.location.hash.replace(/^#/,"");
                        if(baseq!=""){
                            filter.setBaseFilter(baseq,true)
                        }

                        filter.on("search",function(e,query){
                           searchbar.resetFilterItem()
                           view.search(query )
                        })
                        filter.on("clear",function(e,query){
                            filter.__search()
                        })
                        searchbar.on("clear",function(){
                            filter.clear()
                        })
                        searchbar.on("search",function(e,q){
                            filter.setBaseFilter(q)
                        })
                    }
                })

            },
            type:"fn",
            args:[]
        }


        hitchs.push(hitch)
    })();
    //搜索配置处理
    (function(){
        var hitch = {
            name:"range.search",
            fn:function(query){
                var q=query.query

                if(viewinfo.searchname!=viewinfo.viewname){

                    var href =  window.location.href

                    if(window.location.search==""){
                        href+="?openview"
                    }else{
                        href=href .replace(window.location.search,"?openview")
                    }
                    href = href.replace(/[^\\]*(\?openview)/,viewinfo.searchname+"$1")

                    if(window.location.hash!=""){
                        href = href.replace(window.location.hash,"#"+q)
                    }else{
                        href+="#"+q
                    }
                    //如果是搜索视图和当前视图不一致，则将查询条件写入hash表，然后重新加载视图
                    window.location = href
                }
                viewinfo.querystring = q;

            },
            type:"fn",
            args:[]
        }

        hitchs.push(hitch)
    })();
    var options=$.extend({},View.prototype.options,{
        hitchs:hitchs
    })
    searchView.fn.extend({
        options:options
    })
    searchView.fn.extend({
        __init:function(){
            var _self =this
            $.when(lang).then(function(){
                _self.superclass.__init.call(_self)
            })

        }
    })
    return searchView
})