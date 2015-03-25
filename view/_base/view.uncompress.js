/*!
 * User: yinkehao
 * Date: 12-7-31
 * Time: 上午11:46
 * 视图基础类
 */
/** *
 * 2012-10-19 添加isSearch的判断控制tip说明
 * 2013-5-9 实现对url内hash传递查询参数的支持
 * 2013-5-23 调整head宽度计算，取消head在view的基础上宽度减去18px的计算设置
 * 2013-12-19 优化部分方法模式
 */
define(["plugin/jquery.tmpl.min","widget/_base/widget","store/util/readViewDesign","store/viewstore",
    "../util","widget/jbox"
],function($,widget,loadViewDesign,viewStore,viewutil,jbox){

    var View = widget.sub(),Range=widget.sub(),Row=widget.sub(),Cell=widget.sub(),Head=widget.sub()  ,Toolbar = widget.sub();
    var urlinfo = window.location.pathname.match(/[^\?]*\.nsf/)
    var dbpath = urlinfo&&urlinfo[0]
    View.extend({
        Range:Range,
        Row:Row,
        Cell:Cell,
        Head:Head,
        Toolbar:Toolbar
    })
    /*!
     *工具栏
     */
    Toolbar.fn.extend({
        __initStyle:function(){
            this.css({
                height:"30px"
            })
        },
        __initWidget:function(){
            this.__initStyle()
            this.options.view.__runHitchs("toolbar.initWidget")
        },
        __initEvent:function(){

        } ,
        addButton:function(ops){
            ops = $.extend({
                "id":null,
                "class":null,
                "btDom":""
            },ops)
            switch(ops.type){
                case "custom":
                    this.append(ops.btDom)
                    return ops.btDom;
                    break;
                default :
                    var bt = $("<div style='float:left;background-color: #FFFFFF;cursor: pointer;margin: 3px ;" +
                        "height: 20px;line-height: 20px;padding:0px 3px;overflow:visible;white-space:nowrap; border: 1px solid #CCCCCC;width: "+
                        (ops["width"]||"50px")+";text-align:center' " +
                        (ops.id?(" id=\""+ops.id+"\" "):"") +
                        //(ops.class?(" class=\""+ops.class+"\" "):"") +
                        ">"+ops.label+"</div>");
                    this.append(bt);
                    var _self =this,view = this.options.view;
                    bt.on("click",function(e){
                        ops.fn.call(_self,e,view)
                    })
                    return bt;
            }

        }
    })
    /*!
     *视图head部分支持
     */
    Head.fn.extend({
        isfloat:false,
        __initWidget:function(){
            this.addClass("view_head")
            this.doms={}
            this.css("background-color","#FFFFFF")
        }

    })
    /*!
     *视图行类
     */
    Row.fn.extend({
        main:function(){
            this.__init()
        } ,
        options:{
            status:"collapse"
        } ,
        __initWidget:function(){
            this.tds =     this.find("td")
            this.options.item =   $.tmplItem(this.tds[0])

        },
        __getResult:function(){
            if(!this.__result){
                this.__result =  this.options.item.data.__store__.getChildren()
            }


            return this.__result
        } ,
        /**
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
         */
        getRange:function(){
            var def = new $.Deferred()
            if(!this.data("range")){
                var _item = this.options.item
                var item = this.options.item.data

                var view =  this.options.item.range.options.view
                var Range = this.options.item.range.options.view.options.Range||View.Range
                var stores=[item.__store__]

                var layout = this.options.item.layout
                Range(this[0],{
                    stores:stores,
                    parentItem:item,
                    parentRange:this.options.item.range,
                    layout:layout ,
                    view:view,
                    scrollBar:this.options.item.range.options.scrollBar
                })
            }
            return this.data("range")
        },
        expand:function(){
            this.options.status = "expand"

            this.getRange().expand()
        } ,
        collapse:function(){
            this.options.status = "collapse"
            this.getRange().collapse()
        }
    })
    /*!
     *视图 Range类，分类展开是一个独立的区块支持
     */
    Range.fn.extend({

        __parseHTMLParameter:function(selector,ops){
            if(this.length==0) return;
            var _self =this;
            var options = [];
            var _ops
            if(this.length==1){
                _ops = this.__getHTMLParams()
                $.extend(this.options,_ops,ops)
            }else{
                this.each(function(i,el){
                    _ops  = objectj.__getHTMLParams.call($(el))
                    options[i] =   $.extend({},_self.options,_ops,ops)
                })
                $.extend(_self.options,options,ops)
            }
            ops = null   ,_ops = null
            delete ops ,_ops
        },
        options:{
            status:"collaspe",
            stores:[],
            start:1,
            position:0 ,
            scrollBar:window,
            autoload:true
        },
        doms:{
            lastPage:null
        },
        pages:null,
        grid:[],
        cursor:{
            start:0,
            end:false,
            load:[],
            result:null,
            focus:0
        },
        //  cursor:0,
        // cursors:[],
        catelevel:undefined,
        //   cursorResult:null,
        main:function(){
            var _self = this
            this.options.catelevel=  this.options.catelevel
            if(!this.options.catelevel && this.options.parentRange){
                this.options.catelevel = this.options.parentRange.get("catelevel")+1
            }
            this.__isInitData= new $.Deferred()
            this.__isInitData.then(function(){
                _self.__initComplete.resolve()
            })
            this.pages = []

            this.__init()
            this.data("range",this)

        } ,
        getTmpl:function(){
            var _self = this ,view = this.options.view
            var ths =  view.doms.titleHead.find("th")
            if(!view.__layoutWidth){
                view.__layoutWidth = []
            }
            var widths= view.__layoutWidth

            return   this.__isInitData.pipe(function(data){
                var layout = _self.options.layout
                var tmplHTML=[] ;
                if(data.length>0){
                    var item = data[0]
                    tmplHTML.push("<tr tabindex=0>")
                    if(view.options.seltype){
                        var width = ths.filter("[data-colindex=-1]").width()+"px";

                        tmplHTML.push("<td   data-colindex='-1' style='text-align: center");
                        // tmplHTML.push("width: "+width+"px;'> ");
                        tmplHTML.push("'> ");
                        tmplHTML.push("<input type='");
                        tmplHTML.push(view.options.seltype=="multi"?"checkbox":"radio");
                        tmplHTML.push("'");
                        tmplHTML.push(" name='viewGridSelectBox'");
                        tmplHTML.push("/>");
                        tmplHTML.push("</td> ");
                    }
                    //   console.log(layout)
                    //  console.log(item)
                    item._iscategroy=typeof item._iscategroy=="undefined"?!!item._children:item._iscategroy
                    for(i in layout){

                        if(item._iscategroy && _self.options.issearch==false){
                            view.setSortDisable()
                            var colspan=   item._colcolspan[i]
                            if(colspan==0)continue;
                            tmplHTML.push("<td ")
                            tmplHTML.push(" colspan='"+String(colspan)+"'")
                            tmplHTML.push(" style='overflow-x:hidden;")
                            if(item._catecolumn==i){
                                tmplHTML.push("padding-left:"+String( item._catelevel*15)+"px;'")
                                tmplHTML.push(">")
                                tmplHTML.push("<img data-view-expandico src=\"/icons/expand.gif\" class='view_cate_expandico'>")
                            } else{
                                tmplHTML.push("'>")
                            }
                            //if(view.options.celltype=="text")
                            //    tmplHTML.push("{{html "+layout[i].name+"}}")
                            // else
                            tmplHTML.push("{{html "+layout[i].name+"}}")
                            tmplHTML.push("</td>")
                        }else{
                            var th =  ths.filter("[data-colindex="+layout[i].columnnumber +"]")

                            tmplHTML.push("<td")
                            tmplHTML.push(" data-colindex='"+layout[i].columnnumber+"'")
                            tmplHTML.push(" style='")
                            if(layout[i].align){
                                tmplHTML.push("text-align:"+layout[i].align+";")
                            }
                            tmplHTML.push("'")
                            tmplHTML.push(">")

                            if(view.options.celltype=="text")
                                tmplHTML.push("{{html "+layout[i].name+"}}")
                            else               {
                                tmplHTML.push("{{if typeof "+layout[i].name+"_html =='undefined' }}")
                                tmplHTML.push("${"+layout[i].name+"}")
                                tmplHTML.push("{{else}}")
                                tmplHTML.push("{{html "+layout[i].name+"_html}}")
                                tmplHTML.push("{{/if}}")
                            }
                            tmplHTML.push("</td>")
                        }
                    }
                    tmplHTML.push("</tr>")
                }

                return  _self.__tmpl =  "<script type='text/x-domjs-tmpl'>"+tmplHTML.join("")+"</script>"
            })
        },
        __initWidget:function(){
            if(this.options.autoload){
                this.load()
            }else{
                this.__initComplete.resolve()
            }

        },
        __initEvent:function(){
            this.__initScrollEvent()
        },
        /**
         *初始化滚动条时间，如果view设置了 scrollbar，当scrollbar滚动时将会产生一个 scrolltop或者scrolldown事件
         */
        __initScrollEvent:function(){
            var _self = this ,view = this.options.view


            view.on("scroll",function(e){
                return
                var baseheight =view.doms.head.height()
                if(_self.options.parentRange&&_self.options.status=="expand"&&e.top>=0){
                    // if(_self.options.parentRange.doms.virtual)return false;
                    var lastTr =   _self.doms.lastPage &&  _self.doms.lastPage.filter(":last")
                    if(_self.position().top<baseheight&&lastTr.position().top>baseheight){
                        // if(_self.options.parentRange.doms.virtual)return false;
                        if(!_self.doms.virtual){
                            _self.doms.virtual = _self.clone(true)
                        }
                        // _self.doms.virtual.show();
                        //  if(_self.options.parentRange.doms.virtual){
                        //     _self.options.parentRange.doms.virtual.after(_self.doms.virtual)
                        //}else{
                        view.doms.titleHead.append(_self.doms.virtual)
                        //  }

                    }else{
                        if(_self.doms.virtual){
                            //  _self.doms.virtual.hide();
                            _self.doms.virtual.remove()
                            _self.doms.virtual = null
                        }
                    }

                }

            });
            view.on("scroll",function(e){
                //只有向下滚动才加载数据
                if(e.directionY!="down")return;
                var lastTr =   _self.doms.lastPage &&  _self.doms.lastPage.filter(":last")
                if(!lastTr) return
                var viewHeight = $(e.srcElement).height()
                if(lastTr.position().top- e.top<viewHeight){
                    _self.nextPage()
                }
                return
            })
        },
        /**
         *执行页数加载
         */
        __load:function(option){
            var res=[] ,_self = this,view = this.options.view
            this.cursorResult = new $.Deferred()
            this.__loadMessage()

            var baseOption={
                start:1,
                childrenproperty:"_position" ,
                restricttocategory:view.options.cate,
                SearchOrder:view.options.SearchOrder
            }

            option = $.extend(baseOption,option)

            var parentItem = this.options.parentItem||{
                _position: option.expand||0
            }

            $.each(this.options.stores,function(i,store){
                var def ;
                if(  _self.options.issearch){
                    //  store.options.queryEngine ="open"
                    def= store.query(_self.options.query,option)
                }else{
                    //  store.options.queryEngine ="readviewentries"
                    if(option.reload){
                        store.__query={}
                    }
                    //  store.options.queryEngine="readviewentries"
                    //  console.log(store.options.queryEngine)
                    def= store.getChildren(parentItem,option)
                }

                res[i] = new $.Deferred()
                def.then(function(data){
                    data= $.map(data,function(item){
                        $.each(item,function(key,value){
                            if(typeof value=="string"){
                                item[key] = value.replace(/[\[\]]/gi,"")
                            }
                        })
                        return item
                    })
                    res[i].resolve(data)
                },function(){
                    res[i].resolve([])
                })
                // res[i].__store__=store

            })
            if(!  _self._dataTotal){
                _self._dataTotal=[]
            }
            _self.dataTotal=0


            // _self.dataTotal = _self.dataTotal===undefined? []:_self.dataTotal
            return $.when.apply($,res).pipe(function(){
                var data=[]
                // _self.__Tip("数据加载完成,开始绘制视图",0)
                //  console.log((new Date()).getTime() - __time__)
                $.each(arguments,function(i,subdata){
                    var store = _self.options.stores[i]
                    $.each(subdata,function(i,item){
                        item.__store__=store
                    })
                    if(!_self._dataTotal[i])_self._dataTotal[i]=0
                    if(subdata.total==0){
                        _self._dataTotal[i]+=subdata.length
                    }else{
                        _self._dataTotal[i]=subdata.total
                    }
                    _self.dataTotal= _self._dataTotal[i]
                    // _self.dataTotal += _self._dataTotal[i]
                    data = data.concat(subdata)
                })

                $.when.apply($,_self._dataTotal).then(function(){
                    var t = 0
                    $.each(arguments,function(i,subtotal){

                        t += subtotal
                    })
                    _self.dataTotal = isNaN(t)?_self.dataTotal:t;
                })

                return data
            }).pipe(function(data){
                    view.__runHitchs("range.loaddata",[data,_self.dataTotal])
                    _self.trigger("loaded",[data])
                    _self.__isInitData.resolve(data)
                    return data
                },function(e){
                    this.cursorResult.reject(1)
                })

        } ,
        /*
         处理加载消息
         */
        __Tip:function(msg,timeout){
            var _self = this,view =this.options.view
            var parentRange =this.options.parentRange
            this.__isInitData.then(function(data){
                if(!parentRange){
                    var viewtip =   view.doms.tip || $("<div style='float: right; height: inherit; vertical-align: middle;margin: 5px; text-align: center;'></div>")
                    if(!view.doms.tip){
                        view.doms.tip = viewtip
                        view.doms.toolbar.append(viewtip)
                    }
                    viewtip.text(msg)
                }else{
                    var rangetip =   _self.doms.tip ||  $("<div style='float: right; height: inherit; vertical-align: middle; text-align: right;'></div>")
                    if(!_self.doms.tip){
                        _self.doms.tip = rangetip
                        var td = _self.find("td[colspan]:last")

                        td .html("<div  style='float: left;'>"+   td.html()+"</div>")
                        td.append(rangetip)
                    }
                    rangetip.text(msg)
                    // console.log(_self.find("td:last"))
                }

            })


            return

        } ,
        __loadMessage:function(){

            var _self = this,view = this.options.view
            this.__Tip("正在加载数据……")

            $.when(this.cursorResult,this.__isInitData).then(function(type,data){
                var t = "记录"
                if(data[0]&&data[0]._iscategroy){
                    //   t="分类"
                }
                var msg = "",isSearch = _self.options.issearch
                if(type>1||_self.pages.length<view.options.count)
                    msg = "已加载完成,"+(isSearch?"":"可读")+"总"+t+"数:"+_self.pages.length
                else{
                    msg = "加载完成,"+t+"数:"+_self.pages.length
                    msg+=((isNaN(_self.dataTotal)||_self.dataTotal<=_self.pages.length)?"总"+t+"数未知":",总"+t+"数"+(isSearch?"：":"不多于：")+ ( _self.dataTotal))
                }

                _self.__Tip(msg,3000)
            }).fail(function(msg){
                    var msg = "加载失败"
                    switch(type){
                        default :
                            msg+=""
                    }
                    _self.__Tip(msg,1000)
                })
        },
        /**
         * 此段模拟多进程对表格进行计算，用于所有数据表格而不影响用户的其他操作
         * @param data
         * @private
         */
        __addGrid:function(data){
            var workerFor = function(n,length,fn,obj){
                var deferred = this.then?this:new $.Deferred()
                if(n<length){
                    var args1 = Array.prototype.slice.call(arguments, 4)
                    args1 = [n].concat(args1)
                    var item =fn.apply(obj,args1)
                    if(item==false){
                        deferred.resolve()
                    }else{
                        var args2 = Array.prototype.slice.call(arguments, 0);
                        setTimeout(function(){
                            args2[0]++
                            workerFor.apply(deferred,args2)
                        },1)
                    }

                }else{
                    deferred.resolve()
                }
                return deferred
            }
            var grids = []
            var _randerGrid=function(data){
                return ""
            }
            var createGrid=function(i,data){

                var total= data.length,pager=10 ,mod=total % pager,limit= (total-mod)/pager,start,len
                if(i<limit){
                    start=i*pager,len=start+pager

                    var part =  data.slice(start,len)

                    _randerGrid(part)
                    return true
                }else if(mod>0){
                    starttotal-mod,len=total
                    var part =  data.slice(start,len)
                    _randerGrid(part)
                    return true
                }else{
                    return false
                }
            }
            workerFor(0,data.length,createGrid,this,data)
        },
        __addPage:function(data){
            var __time__ =(new Date()).getTime()
            var _self = this  ,view = this.options.view
            if(data.length==0||this.cursor.end){
                this.cursorResult.resolve(3)
                //jbox.messager("已到达最后一页,总记录数"+this.pages.length,null,2000)
                this.cursor.end =true
                return
            }
            var pageOptions =   {myValue:data,range:this,layout:this.options.layout}
            var page =[]


            var page =  $(this.__tmpl).tmpl(data,pageOptions)

            if(this.doms.lastPage){
                if(this.catelevel!=data[0]._catelevel) {
                    this.cursorResult.resolve(4)
                    return []
                }
                this.__getLastRow().after(page)
                this.pages = $([]).pushStack(((this.pages.get&&this.pages.get())||[]).concat(page.get())) // this.pages.pushStack(page.get())
            }else{
                this.catelevel=data[0]._catelevel
                if(this[0].tagName=="TBODY"){
                    this.append(page)
                }   else{
                    this.after(page)
                }
                this.pages = page
            }

            this.doms.lastPage = page
            if(data.length<view.options.count){
                this.cursorResult.resolve(2)
                this.cursor.end=true
            }else{

                this.cursorResult.resolve(1)

                this.cursor.start =  parseInt(this.cursor.start) + parseInt(view.options.count)//this.pages.length

            }



            view.__runHitchs("range.addPage",[page])
            //console.log((new Date()).getTime() - __time__)
            return page
        },
        __getLastRow:function(){
            var _range=  this.doms.lastPage.filter(":last").data("range")
            if(_range){
                return _range.__getLastRow()
            }else{
                return  this.doms.lastPage.filter(":last")
            }
        }  ,
        update:function(){
            if(data){

            }else{
                this.options.data
            }

        },
        __initPage:function(data){
            //this.__initTmpl2()

            var _self =this

            this.pages.remove && this.pages.remove()
            this.pages=[]
            return this.getTmpl().pipe(function(tmpl){

                var page = _self.__addPage(data)

                return [data,page]
            })

        },
        load:function(options){
            var _self = this
            this.doms.lastPage =null
            this.options.issearch = false
            this.options.query = null
            this.cursor.end = false
            this.cursor.load = []

            var hash =  window.location.hash.replace(/^#/,"")
            /**
             * 2013-5-9 实现对url内hash传递查询参数的支持
             * @type {String}
             */
            var querystr = hash  //!=""?hash:typeof this.options.querystr=="string" && this.options.querystr!=""?this.options.querystr:""
            if(querystr!="") {
                return    this.search({
                    query:querystr
                })
            } else {
                // this.__isInitData =  new $.Deferred()
                // this.__initTmpl()
                return this.__load(options).pipe(function(data){

                    return  _self.__isInitData.pipe(function(){
                        return  _self.__initPage(data)
                    })
                })
            }
        }     ,
        search:function(query,options){
            this.options.view.setSortDisable()

            var _self = this;
            this.doms.lastPage =null
            this.options.issearch = true
            if(typeof this.options.querystr=="string" && this.options.querystr!=""){
                if(query.query!=this.options.querystr)
                    query.query = this.options.querystr + " AND " + query.query

            }
            this.options.query = query
            this.cursor.start=0;
            this.cursor.end = false
            this.cursor.load = []
            this.options.view.__runHitchs("range.search",[query])
            //this.__isInitData =  new $.Deferred()
            //this.__initTmpl()、
            //this.options.view.Range.empty()
            return  this.__load(options).pipe(function(data){
                if( _self.options.view.Range&& _self.options.view.Range.empty)
                    _self.options.view.Range.empty();
                return  _self.__initPage(data)
            })
        },
        sort:function(option){
            var _self = this;
            this.doms.lastPage =null
            this.cursor.end = false
            this.cursor.load = []
            return   this.__load(option).pipe(function(data){
                return _self.__initPage(data)
            })
        },
        refresh:function(){

        },
        expand:function(){
            if(this.pages) {
                var ico = this.find("img[data-view-expandico]")
                ico.attr("src","/icons/collapse.gif")
                this.options.status = "expand"
                this.pages.show && this.pages.show()
            }
        },
        collapse:function(){
            if(this.pages&&this.pages.hide) {
                var ico = this.find("img[data-view-expandico]")
                ico.attr("src","/icons/expand.gif")
                this.options.status = "collapse"
                this.pages.hide()
                this.pages.each(function(i,tr){
                    if($(tr).data("range"))$(tr).data("range").collapse();
                })
            }
        }   ,
        nextPage:function(){
            if(this.cursor.end){
                return
            }
            var _self = this
            this.cursorResult.then(function(){

                if($.inArray(_self.cursor.start,_self.cursor.load)>-1) return


                _self.cursor.load.push(_self.cursor.start)
                var __time__ = (new Date()).getTime()
                _self.__load({
                    start:_self.cursor.start+1
                }).pipe(function(data){

                        _self.__addPage(data)

                        //console.log(  (new Date()).getTime()-__time__  )
                    })

            })


        },
        prePagge:function(){

        }
    })
    /*!
     *视图单元格
     */
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
    /*!
     *视图类
     */

    View.fn.extend({
        options:{
            start:1,
            host:window.location.hostname,
            db:dbpath,
            count:100,
            view:undefined,
            stores:[] ,
            Head:View.Head,
            Range:View.Range,
            Row:View.Row,
            Toolbar:View.Toolbar,
            sorttype:"remote" ,  //local
            seltype:false,
            autoload:true,
            SearchOrder:undefined,
            cate:"*"
        },

        __initHitch:function(){
            this.__hitchs = this.__hitchs.concat(this.options.hitchs)
        },
        __tmplLayout:"",
        __initToolbar:function(){
            var toolbar = $("<div style='float: left;width: 100%;'></div>")
            this.doms.head.prepend(toolbar)
            this.doms.toolbar=this.options.Toolbar(toolbar,{
                scrollBar:  this.options.scrollBar,
                view:this
            })
        },
        __initWidget:function(){
            this.doms={
                table:null,
                sort:[],
                rowTemplete:null
            }
            var _self = this
            this.__runHitchs("view.init")
            var _self = this ,  tableBody = this.doms.tableBody =$("<div class='view_body'></div>")

            // this.options.scrollBar = this.options.scrollBar || this.parent()
            var isWindow =  $.isWindow(this.options.scrollBar)
            //(isWindow?"":style='table-layout: fixed;')
            var  table = this.doms.table = $("<table cellpadding='1' cellspacing='1'  style='table-layout: fixed;' ></table>")
            this.css({
                overflow:"hidden"
            })
            this.refreshSize()
            tableBody.append(table)
            this.append(tableBody)
            var Event = jQuery.Event( "scroll" );

            Event.srcElement = tableBody[0];
            tableBody.data("left",0)
            tableBody.data("top",0)
            tableBody.on("scroll",function(e){
                // console.log(tableBody.scrollLeft(),tableBody.scrollTop())
                Event.originalEvent = e
                // var orgleft =  tableBody.data("left"
                Event.left =tableBody.scrollLeft()
                Event.top = tableBody.scrollTop()
                if(tableBody.data("left")> Event.left){
                    Event.directionX="right"
                }else if(tableBody.data("left")<Event.left){
                    Event.directionX="left"
                }else{
                    Event.directionX="none"
                }
                if(tableBody.data("top")> Event.top){
                    Event.directionY="up"
                }else if(tableBody.data("top")< Event.top){
                    Event.directionY="down"
                }else{
                    Event.directionY="none"
                }

                tableBody.data("left",Event.left)
                tableBody.data("top",Event.top)

                $(_self).trigger(Event)
            })
            this.__initStores() ;
            this.__initLayout().pipe(function(layout){
                _self.__runHitchs("view.loadLayout",[layout])
                return layout
            }).pipe(function(layout){
                    _self.options.layout = layout
                    _self.__initHeader (layout)
                    var ths=[]
                    _self.doms.titleHead.find("th").each(function(i,th){
                        var width = $(th).width();
                        $(th).width(width)
                        ths.push("<td style='width: "+width+"px;height:0px;'></td>")
                    })
                    var firstRow =  _self.doms.firstRow =  $("<thead  cellpadding='0' cellspacing='0'><tr class='viewlayoutfirstrow' style='height:auto'>"+ths.join("")+"</tr></thead>")
                    _self.doms.table.append(firstRow)

                    tableBody.css({
                        "margin-top":"-4px",
                        "overflow":"scroll"
                    })

                    return _self.__initPage()
                }).pipe(function(){
                    _self.__runHitchs("view.inited");
                    $(_self).trigger("inited",[_self])
                })

        },
        __getDesign:function(){
            if(!this.__design){
                this.__design =  loadViewDesign({
                    host:this.options.host,
                    db:this.options.db,
                    view:this.options.view,
                    cate:this.options.cate!=""&&this.options.cate!="*"?true:false
                })
            }
            return this.__design;
        },
        __initLayout:function(){
            var _self = this
            return  this.__getDesign().pipe(function(orgLayout){
                _self.__orgLayout = orgLayout
                var layout =[]
                if( _self.options.layout){
                    var _layout  = {}
                    var autoCol
                    $.each(orgLayout,function(i,item){
                        if(item.resize== "true"){
                            if(autoCol)autoCol.resize="false"
                            autoCol = item
                        }
                        _layout[item.columnnumber] = _layout[item.name] = item
                    })
                    if(typeof _self.options.layout == "string"){
                        $.each(_self.options.layout.split(/,/),function(i,key){
                            if(_layout[key])layout.push(_layout[key])
                        })
                    } else{
                        $.each(_self.options.layout,function(i,item){
                            if(_layout[item.name]){
                                layout.push($.extend({},_layout[item.name],item))
                            }else if(_layout[item.columnnumber]) {
                                layout.push($.extend({},_layout[item.columnnumber],item))
                            }
                        })
                    }
                }else{
                    layout   = orgLayout
                }
                return layout
            })
            // }

            //  return def
        },
        __createdTH:function(cell){
            var   th =$("<th data-colindex='"+cell.columnnumber+"' " +
                "style='" +
                "word-break:break-all;" +
                "white-space:nowrap;" +
                "overflow:hidden" +
                "'></th>")

            th.css("width",cell.resize=="true"?"auto":(cell.width+"px"));

            th.text(cell.title)
            th.attr("title",cell.title)
            src =  this.__getCellSortSrc(cell)

            if(src!=""&&(this.options.cate==""||this.options.cate=="*")){
                var  img = $("<img  data-view-head-sort=true  " +
                    "style='" +
                    "cursor: pointer;" +
                    "" +
                    "' src='"+src+"'/>")
                img.data("columninfo",cell)
                th.prepend(img)
                this.doms.sort.push(img.get(0))
            }
            this.__runHitchs("view.initHeadColumn",th,cell)

            return th
        }  ,
        __getCellSortNextStatus:function(cell,status){
            status = typeof status=="undefined"?0:status=="ascending"?1:2

            if(this.options.sorttype=="remote"){
                if(status==0){
                    return cell.resortascending?1:cell.resortdescending?2:0
                }else if(status==1){
                    return cell.resortdescending?2:0
                }else{
                    return 0
                }
            } else if(this.options.sorttype=="local"){
                return  status==2?0:status+1
            }
        },
        __getCellSortSrc:function(cell,status){
            var src=""
            status = typeof status=="undefined"?0:status=="ascending"?1:2
            if(this.options.sorttype=="remote"){
                if(cell.resortascending=="true"&&cell.resortdescending=="true"){
                    src = status==0?"dblsort":status==1?"dbldesc":"dblasc"
                }else if(cell.resortascending=="true") {
                    src = status==0?"ascsort":status==1?"altasc":"ascsort"
                } else if(cell.resortdescending=="true"){
                    src = status==0?"descsort":status==2?"altdesc":"descsort"
                }
            } else if(this.options.sorttype=="local"){
                src = "dblsort"
            }

            return src==""?"":"/icons/"+src+".gif"
        } ,
        __initHeader:function(layout){
            var _self = this;
            var head = $("<table cellpadding='1' cellspacing='1'  style='table-layout: fixed;position: relative; height: 30px;'></table>")
            // head.width(this.width()-18)
            this.doms.sort=[]
            var tr = $("<tr></tr>");
            if(this.options.seltype){
                var cell = "<th data-colindex='-1'" +
                    " style='" +
                    "width:"+(this.options.seltype=="multi"?"20":"25")+"px;" +
                    "'></th>"
                tr.append( cell)
                if(this.options.seltype=="multi"){
                    var sel = this.doms.selectall = $("<input style='margin: 0px;' type='checkbox' name='viewGridselectAllBox'>")
                    tr.find("th").append(sel)
                }
                tr.append( )
            }
            $.each (layout,function(i,cell){
                tr.append(_self.__createdTH(cell)  )
            })
            head.append(tr)

            this.doms.sort = $([]).pushStack(this.doms.sort)
            // this.doms.table.append(head)
            this.doms.head = this.options.Head("<div></div>",{
                view:this
            })

            this.doms.titleHead =  head
            this.doms.head.append(head)
            this.__initToolbar()
            this.prepend(this.doms.head)

            tr.find("th").each(function(i,th){
                $(th).css("width",$(th).width())
            })
            this.doms.head.css({
                "overflow":"hidden"
            })
            this.refreshSize();
        },
        __getRow:function(trs){
            if(!$(trs).data("row")){
                $(trs).data("row",this.options.Row(trs))
            }
            return   $(trs).data("row")
            // return Row(this.doms.rowTemplete.clone())
        },
        /*
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

        /*
         *数据写入页面
         */
        __initPage:function(){
            var _self = this;

            var range =  this.options.Range("<tbody></tbody>",{
                stores:this.options.stores ,
                layout:this.options.layout ,
                scrollBar:this.get("scrollBar"),
                querystr:this.options.querystr,
                autoload:this.options.autoload,
                view:this
            })
            this.doms.table.append(range)
            this.Range=range
            //$.trigger(this.range,)
            _self.refreshSize();
            return  range.__initComplete.pipe(function(){

                _self.refreshSize()

                _self.__initComplete.resolve()
                return true;
            })

        },
        load:function(option){
            this.setSortDisable(false)
            return this.Range.load(option)

        } ,
        /*
         *执行搜索
         */
        __search:function(query){

            this.__runHitchs("view.search",query)
            this.setSortDisable()
            this.Range.search({
                query:query
            }).pipe(function(data){

                })
            var event = $.Event("search")
            this.trigger(event,[query,this,"view"])
        }   ,
        __customEvent:"refresh expand collapse load sort search  turnpage delete add scrollup scrolldown",
        __initEvent:function(){
            var _self = this;
            this.on("click","img[data-view-expandico]",function(){
                var row = _self.__getRow( $.tmplItem(this).nodes)
                if(row.options.status=="collapse") {
                    _self.expand(row)
                }else{
                    _self.collapse(row)
                }
            })

            this.on("click","img[data-view-head-sort]",function(){
                var colinfo =  $(this).data("columninfo")
                var status = _self.__getCellSortNextStatus(colinfo,$(this).data("status"))
                _self.sort(colinfo.columnnumber,status)
            })
            this.on("click","input[name=viewGridselectAllBox]",function(){
                if(this.checked){
                    _self.selectall()
                }else{
                    _self.selectall(false)
                }
            })
            this.on("click","tbody>tr>td>input[name=viewGridSelectBox]",function(){
                _self.__checked($(this),this.checked)

            })
            this.on("scroll",function(e){
                _self.doms.titleHead.css("left",- e.left)
            })
            $(window).on("resize",function(){
                _self.refreshSize();
            })
            $(window).on("scroll",function(){
                //_self.refreshSize();
            })

        },
        refreshSize:function(){
            if(! this.__heightParent){
                this.__heightParent = $(this).parent().height()<200?$(window):$(this).parent();
            }

            this.css({
                "height":this.__heightParent.height(),
                "width":Math.min($(this).parent().width()||$(window).width(),$(window).width())
            });

            if(this.doms.head){
                this.doms.head.width(this.width())
                this.doms.titleHead.width( this.doms.table.width())
                if( this.doms. tableBody){
                    this.doms. tableBody.height(this.height()-this.doms.head.height())
                    this.doms. tableBody.width(this.width())
                }
            }

        },
        __checked:function(els,checked){
            this.__runHitchs("view.selected",els.parent().parent())
        },
        selectall:function(flag){
            var boxs =  $(this.find("tbody>tr>td>input[name=viewGridSelectBox]"))
            this.__checked(boxs,flag===false)
            flag===false? boxs.removeAttr("checked"):boxs.attr("checked","checked")
        },
        getSelectItem:function(){
            var boxs =  $(this.find("tbody>tr>td>input[name=viewGridSelectBox]:checked"))
            return $.map(boxs,function(el){
                return $(el).tmplItem().data
            })
        } ,
        clearSelect:function(){
            var boxs =  $(this.find("tbody>tr>td>input[name=viewGridSelectBox],input[name=viewGridselectAllBox]"))
            boxs.removeAttr("checked")
        },
        expand:function(row){
            this.__runHitchs("expand",row)
            row.expand()
            this.trigger("expand",[row])
        },
        collapse:function(row){
            this.__runHitchs("collapse",row)  ;
            row.collapse()  ;
            this.trigger("expand",[row]);
        },
        sort:function(columnnumber,status){
            status = status==1?"ascending":status==2?"descending":""

            this.setSortHead(columnnumber,status)

            var sort = { column:columnnumber }
            sort[status] = true
            this.Range.sort({
                sort:sort
            })
        },
        setSortHead:function(columnnumber,status){
            var _self = this
            this.doms.sort.each(function(i,el){
                var src = ""
                var colinfo =  $(el).data("columninfo")
                if(columnnumber&&status&&colinfo.columnnumber==columnnumber &&status!=""){
                    $(el).data("status",status)
                }else{
                    $(el).removeData("status")
                }
                src =  _self.__getCellSortSrc(colinfo,$(el).data("status"))
                el.src = src
            })
        },
        setSortDisable:function(flag){
            this.doms.sort[flag===false?"show":"hide"]()
        },
        search:function(query,option){

            this.__search(query,option)
        },
        add:function(){},
        refresh:function(){}
    })
    return View
})