/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-31
 * Time: 上午11:46
 * To change this template use File | Settings | File Templates.
 */
define(["jquery","widget/_base/widget","store/util/readViewDesign","store/viewstore","../util"],function($,widget,loadViewDesign,viewStore,viewutil){

    var View = widget.sub(),Range=widget.sub(),Row=widget.sub(),Cell=widget.sub(),Head=widget.sub()
    var urlinfo = window.location.pathname.match(/[^\?]*\.nsf/)
    var dbpath = urlinfo&&urlinfo[0]
    View.extend({
        Range:Range,
        Row:Row,
        Cell:Cell,
        Head:Head
    })
    Head.fn.extend({
        __initWidget:function(){
            this.__initRows();
            this.options.parent.append(this)
        },
        __initRows:function(){
            var _self = this
            var tr = $("<tr></tr>")
            $.each (this.options.layout,function(i,cell){
                tr.append(_self.__createdTH(cell)   )
            })
            this.append(tr)
        },
        __createdTH:function(cell){
            var   th =$("<th></th>")
            th.width(cell.width)
            th.text(cell.title)
            return th
        }
    })
    Row.fn.extend({
        options:{
            status:"collapse"
        } ,
        __initWidget:function(){
            this.tds =     this.find("[data-cell-name]")
        },
        update:function(item){
            var tds =  this.tds     ,_self = this
            this.options.item=item
            var catecol,colspan
            tds.each(function(i,el){
                if(item._iscategroy&&item._catecolumn==i){
                    catecol = item._catecolumn
                    colspan = item._colspan
                    $(el).attr("colspan",colspan)
                    _self.__cateTd = $(el)
                }
                if(catecol!=undefined&&i>catecol&&i<catecol+colspan)    {
                    $(el).remove()
                }else{
                    if(!$(el).data("this")){
                        Cell(el)
                    }
                    var cell =$(el).data("this")
                    cell.update(item)
                }
            })
            if(item._iscategroy){
                this.Range = Range(this[0])
            }
        } ,
        expand:function(){
            this.__cateTd.data("this").expand()
            this.status = "expand"
            this.Range.expand()
        } ,
        collapse:function(){
            this.__cateTd.data("this").collapse()
            this.status = "collapse"
            this.Range.collapse()
        }
    })
    Range.fn.extend({
        options:{
            status:"collaspe",
            count:0,
            position:0
        },
        expand:function(){
            this.options.status = "expand"
        },
        collapse:function(){
            this.options.status = "collapse"
        }   ,
        nextPage:function(){

        },
        prePagge:function(){

        }
    })
    Cell.fn.extend({
        options:{
            celltype:"text",
            valuefield:"value",
            labelfield:"label",
            layoutvalues:[]
        },
        __initWidget:function(){
            if(this.options.item){
                this.update(item)
            }
        },
        __customEvent:"edit save",
        update:function(item){
            this.options.item = item
            var name = this.options["cell-name"]
            if(item._iscategroy){
                this.__updateCate()
            }else  if(item[name+"_href"]){
                this.__updateLink()
            }else{
                this.__updateDefault()
            }
        },
        __updateCate:function(){
            var name = this.options["cell-name"],item = this.options.item ,html=[]
            var bt = $("<img src='/icons/expand.gif' name='__expendbt__' >"),subject=("<span>"+ item[name]+"</span>")
            this.expandButtom = bt;
            this.append(bt,subject)
        },
        __updateLink:function(){
            var name = this.options["cell-name"],item = this.options.item
            subject= item[name]
            this.append(subject)
        },
        __updateDefault:function(){
            var name = this.options["cell-name"],item = this.options.item
            subject= item[name]
            this.append(subject)
        },
        expand:function(){

            if(this.expandButtom){
                this.expandButtom.attr("src",'/icons/collapse.gif')
            }
        }  ,
        collapse:function(){
            if(this.expandButtom){
                this.expandButtom.attr("src",'/icons/expand.gif')
            }
        }

    })

    View.fn.extend({
        options:{
            start:1,
            host:window.location.hostname,
            db:dbpath,
            view:undefined,
            count:undefined ,
            stores:[] ,
            scrollBar:undefined
        },
        doms:{
            table:null,
            rowTemplete:null
        },

        __initWidget:function(){
            var _self = this , table = this.doms.table=$("<table cellpadding='1' cellspacing='1'></table>")
            this.append(table)
            this.__initStores() ;

            var res = this.__load()

            this.__initLayout().then(function(layout){

                _self.__initHeader (layout)
                res.then(function(data){
                    _self.__initRowTemplete(layout)
                    _self.__addPage(data)
                })
            })
        },
        __initLayout:function(){

            var def = new $.Deferred()
            if(this.options.layout){
                def.resolve(this.options.layout)
            }else{
                return  loadViewDesign({
                    host:this.options.host,
                    db:this.options.db,
                    view:this.options.view
                })
            }
            return def
        },
        __initHeader:function(layout){
            var head = Head("<thead></thead>",{
                layout:layout,
                parent:this.doms.table
            })
            this.__runHitchs("templete",head,layout)
        },
        __initRowTemplete:function(layout){
            var templete = this.doms.rowTemplete = $("<tr></tr>");
            $.each(layout,function(i,item){
                var col =  $("<td></td>")
                col.attr("data-cell-name",item.name)
                templete.append(col)
            })
            this.__runHitchs("templete",templete,layout)
        },
        __getRow:function(){
            return Row(this.doms.rowTemplete.clone())
        },
        /*!
         *计算数据源，系统支持多数据源。可以实现将多个数据库视图集成到一个视图内
         */
        __initStores:function(){
            var _params="db host view count cate queryengine startkey endkey "          ,  options = this.options

            if(this.options.stores.length==0){
                var obj = {}
                if(this.options.store){
                    obj = this.options.store
                }else{
                    $.each(_params.split(" "),function(i,key){

                        if(key && key!=""){
                            obj[key] = options[key]
                        }
                    })
                }
                this.options.stores[0] =obj
            }

            this.options.stores = $.map(this.options.stores,function(obj,i){

                if(obj instanceof viewStore){

                    return obj
                } else if($.isPlainObject(obj))
                {

                    $.each(_params.split(" "),function(i,key){
                        obj[key] =  obj[key] || options[key]
                    })

                    return  new viewStore(obj)
                }

                return null
            })

        }   ,
        /*!
         *执行页数加载
         */
        __load:function(options){
            var res=[] ,_self = this
            $.each(this.options.stores,function(i,store){
                res[i]= store.load()
                res[i].__store__=store
            })
            return    this.__getDefsPromise(res.length-1,res,[]).pipe(function(data){
                //允许用户对最原书第数据进行处理
                _self.__runHitchs("data",data)
                return data
            });
        } ,
        /*!
         *存在多个数据源时，进行数据源返回的承诺整合
         */
        __getDefsPromise:function(i,defs,res){
            var _self = this;
            var def = defs[i]
            return  def.pipe(function(data){
                data= $.map(data,function(item,i){
                    item.__store__ = def.__store__
                    return item
                })
                res =  res.concat(data)
                if(i==0){
                    return res;
                }else{
                    return _self.__getDefsPromise(i-1,defs,res)
                }
            })
        } ,
        /*!
         *就爱那个数据写入页面
         */
        __addPage:function(data){
            var _self = this;
            $.each(data,function(i,item){
                _self.__runHitchs("item",item)
                _self.__addRow(item)
            })
        },
        addHitch:function(name,fn,type){
            var hitch ={
                name:name,
                type:type||"row",
                args:[] ,
                fn:fn
            }
            this.__hitchs.push(fn)
        } ,
        removeHitch:function(name){
            this.__hitchs= $.grep(this.__hitchs,function(hitch,i){
                return hitch.name!=name
            })
        },
        __hitchs:[],
        __runHitchs:function(){
            if(arguments.length==0) return
            var _self = this
            var args = $.map(arguments,function(arg){return arg})
            var type = args.shift()
            $.each(this.__hitchs,function(i,hitch){
                if(hitch.type.toLowerCase()==type)
                    hitch.fn.apply(_self,args.concat(hitch.args))
            })
        } ,
        __addRow:function(item){
            var _self = this
            var row = this.__getRow();
            row.update(item)
            this.__runHitchs("row",row)
            this.doms.table.append(row)
        } ,
        /*!
         *执行搜索
         */
        __search:function(){
            this.__runHitchs("search",row)
        }   ,
        __customEvent:"refresh expand collapse load sort search  turnpage delete add scrollup scrolldown",
        __initEvent:function(){
            var _self = this;
            this.__initScrollEvent()
            this.on("click","[name=__expendbt__]",function(){
                var row = $(this).parent().parent() .data("this")
                if(row.status  && row.status=="expand"){
                    _self.collapse(row)
                }else{
                    _self.expand(row)
                }

            })
        },
        /*!
         *初始化滚动条时间，如果view设置了 scrollbar，当scrollbar滚动时将会产生一个 scrolltop或者scrolldown事件
         */
        __initScrollEvent:function(){
            var _self = this;
            if(!this.options.scrollBar)return
            var sbar = $(this.options.scrollBar)
            var  s={top:sbar.scrollTop(), left:sbar.scrollLeft() }
            sbar.scroll(function(){
                if(s.top>sbar.scrollTop()){
                    _self.trigger("scrollup")
                }else if(s.top<sbar.scrollTop()){
                    _self.trigger("scrolldown")
                }
                s={top:sbar.scrollTop(), left:sbar.scrollLeft() }
            })
        },
        expand:function(row){
            this.__runHitchs("expand",row)
            // console.log(row.options.item)
            //this.__getChild(row.options.item,"")
            row.expand()
            this.trigger("expand",[row])
        },
        collapse:function(row){
            this.__runHitchs("collapse",row)
            row.collapse()
            this.trigger("expand",[row])
        },
        sort:function(options){},
        search:function(){},
        add:function(){},

        refresh:function(){}
    })
    return View
})