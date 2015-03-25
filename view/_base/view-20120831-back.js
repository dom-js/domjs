/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-7-31
 * Time: 上午11:46
 * To change this template use File | Settings | File Templates.
 */
define(["plugin/jquery.tmpl","widget/_base/widget","store/util/readViewDesign","store/viewstore","../util","widget/jbox"],function($,widget,loadViewDesign,viewStore,viewutil,jbox){

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
    Toolbar.fn.extend({
            __initStyle:function(){

            },
          __initEvent:function(){

          }
    })
    Head.fn.extend({
        isfloat:false,
        __initWidget:function(){

            this.doms={}
            this.css("background-color","#FFFFFF")
            this.__initTitleHead()
        } ,

        __initEvent:function(){
           this.__initScrollEvent()
        },
        __initTitleHead:function(){
            var _self = this,view=this.options.view
          //  this.doms.titleHead = $("<table cellpadding='1' cellspacing='1'></table>")
           // this.append(this.doms.titleHead)

        },
        __initScrollEvent:function(){
            var _self = this,view=this.options.view
            var sbar = $(view.options.scrollBar)
            var viewTop = view.position().top
            // var s={top:sbar.scrollTop(), left:sbar.scrollLeft() }
            var isWindow =  $.isWindow(view.options.scrollBar)

            var isIE6 = ($.browser.msie && parseInt($.browser.version) < 0x7)||document.compatMode=="BackCompat"
            var pstop =  sbar.scrollTop()
            var vtop
            $(window).on("resize",function(){
                view.refreshHeadSize()
                _self.width(view.width())
            })
            var _limit = view.position().left
            sbar.on("scroll",function(){

                var stop =  sbar.scrollTop()
                var mtop =   _self.position().top
                var isDown =   pstop<stop,isUp =pstop>stop

                var vtop =isWindow?  view.doms.head.position().top+view.doms.head.height(): view.doms.head.position().top -sbar.scrollTop()
               // if(this.isfloat) {
                    _self.css({
                       left:isWindow?view.position().left-sbar.scrollLeft():view.doms.table.position().left
                    })

              //  }
                if(isUp&&stop==0){
                    _self.css({
                        "position":"static"
                    })
                }else{
                    if(isDown&&mtop<=stop||isUp){
                            if(isWindow){
                                _self.css({
                                    "position": isIE6?"absolute":"fixed",
                                    "top":isIE6? stop: "0px"
                                })
                            }else{
                                _self.css({
                                    "position": "absolute"
                                })
                                if(!$.support.boxModel){
                                    _self.css({
                                        "top": stop
                                    })
                                }
                            }
                    }
                }
                pstop = stop
            })
            if(!isWindow){
                $(window).on("scroll",function(){

                })
            }
        }
    })
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
              this.options.catelevel=  this.options.catelevel
              if(!this.options.catelevel && this.options.parentRange){
                  this.options.catelevel = this.options.parentRange.get("catelevel")+1
              }
              this.__isInitPage= new $.Deferred()
              this.pages = []
              this.__init()
              this.data("range",this)
           } ,
           __structDom:$(""),
           __initHitch:function(){
                this.__hitchs.concat(this.options.hitchs)
            },
          __initTmpl:function(){

               var _self = this
               this.__isInitPage.pipe(function(data){
                   var layout = _self.options.layout
                   var tmplHTML=[] ;
                   if(data.length>0){
                       var item = data[0]
                     //  var _catelevel = 0


                       tmplHTML.push("<tr>")
                       for(i in layout){

                           if(item._iscategroy){
                               if(i<=item._catecolumn){
                                   tmplHTML.push("<td ")
                                   tmplHTML.push(" style='overflow-x:hidden;")
                                   if(item._catecolumn==i){
                                       tmplHTML.push("padding-left:"+String( item._catelevel*15)+"px;'")
                                       tmplHTML.push(" colspan='"+String(layout.length-i)+"'")

                                       tmplHTML.push(">")
                                       tmplHTML.push("<img data-view-expandico src=\"/icons/expand.gif\" >")
                                   } else{
                                       tmplHTML.push("'>")
                                       tmplHTML.push(">")
                                   }
                                   tmplHTML.push("{{html "+layout[i].name+"}}")
                                   tmplHTML.push("</td>")
                               }
                           }else{
                               tmplHTML.push("<td>")
                               tmplHTML.push("{{html "+layout[i].name+"}}")
                               tmplHTML.push("</td>")
                           }

                       }
                       tmplHTML.push("</tr>")

                   }
                   _self.__tmpl =   tmplHTML.join("")
               })

           },
          __initWidget:function(){

             if(this.options.autoload){

                 this.load()
             }
           },
        __initEvent:function(){
            this.__initScrollEvent()
        },
        /*!
         *初始化滚动条时间，如果view设置了 scrollbar，当scrollbar滚动时将会产生一个 scrolltop或者scrolldown事件
         */
        __initScrollEvent:function(){

            var _self = this;
           // if(!this.options.scrollBar)return
            var sbar = $(this.get("scrollBar"))
            var  s={top:sbar.scrollTop(), left:sbar.scrollLeft() }



            sbar.scroll(function(){

                var lastTr =   _self.doms.lastPage &&  _self.doms.lastPage.filter(":last")
                if(s.top>sbar.scrollTop()){
                   // _self.trigger("scrollup",[sbar])
                }else if(s.top<sbar.scrollTop()){
                    if(lastTr)  {
                        if(Math.abs( s.top+sbar.height()-lastTr.position().top)<200) {
                            _self.nextPage()
                        }
                    }
                }
                s={top:sbar.scrollTop(), left:sbar.scrollLeft() }
            })


        },
        /*!
         *执行页数加载
         */
        __load:function(option){
            var res=[] ,_self = this,view = this.options.view
            this.cursorResult = new $.Deferred()
            this.__loadMessage()

            option = $.extend({
                start:1,
                childrenproperty:"_position"
            },option)

            var parentItem = this.options.parentItem||{
                _position: option.expand||0
            }
            $.each(this.options.stores,function(i,store){
                if(  _self.options.issearch){
                    res[i]= store.query(_self.options.query,option)
                }else{
                    res[i]= store.getChildren(parentItem,option)
                }
                res[i].__store__=store

            })

            return  this.__getDefsPromise(res.length-1,res,[]).pipe(function(data){
                //由于hitchs开放给了view。所以此处使用view对hitch进行运行
                view.__runHitchs("range.loaddata",data)
                return data
            },function(){
                this.cursorResult.reject(1)
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
        /*
        处理加载消息
        */
        __loadMessage:function(){
            var _self = this
            jbox.messager("正在加载数据……",null,0,{
                showClose:false  ,
                showType: 'fade'
            })
            this.cursorResult.then(function(type){
                //if(_self.options.showloading)
                var msg = ""
                if(type>1)
                    msg = "已到达最后一页,总记录数:"+_self.pages.length
                else
                    msg = "加载完成,记录数:"+_self.pages.length

                jbox.messager(msg,null,2000,{
                    showClose:false  ,showType: 'fade'
                })
            }).fail(function(msg){
                    var msg = "加载失败"
                    switch(type){
                        default :
                            msg+=""
                    }
                    jbox.messager(msg,null,2000,{
                        showClose:false  ,showType: 'fade'
                    })
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
                 // console.log(data)
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
               // var s=i*pager,l=s+pager
                //console.log(data.slice(s,l))
            }
            workerFor(0,data.length,createGrid,this,data)
          //  for(var i = 0;i<limit;i++){
           //     var s=i*pager,l=s+pager
          //      console.log(data.slice(s,l))
         //   }
         //   if(mod>0)   console.log(data.slice(total-mod,total))
        },
        __addPage:function(data){
             // this.__addGrid(data)
              //console.log(data.length,data.slice(0,10))
              var __time__ =(new Date()).getTime()
               var _self = this
                if(data.length==0){
                    this.cursorResult.resolve(3)
                    //jbox.messager("已到达最后一页,总记录数"+this.pages.length,null,2000)
                    this.cursor.end =true
                    return
                }
               var pageOptions =   {myValue:data,range:this,layout:this.options.layout}

               var page = $(this.__tmpl).tmpl(data,pageOptions)

               if(this.doms.lastPage){
                    if(this.catelevel!=data[0]._catelevel) {
                        this.cursorResult.resolve(4)
                        return []
                    }
                   this.__getLastRow().after(page)
                   this.pages = $([]).pushStack(this.pages.get().concat(page.get())) // this.pages.pushStack(page.get())
               }else{
                   this.catelevel=data[0]._catelevel
                    if(this[0].tagName=="TBODY"){
                        this.append(page)
                    }   else{
                        this.after(page)
                    }
                     this.pages = page
               }
             //  this.doms.lastPage = null
              // delete  this.doms.lastPage
               this.doms.lastPage = page
               if(data.length<_self.options.count){
                   this.cursorResult.resolve(2)
                   this.cursor.end=true
               }else{
                   this.cursorResult.resolve(1)
                   this.cursor.start = this.pages.length
               }
               if(!data[0]._iscategroy&&! this.options.view.templateCol){
                   this.options.view.templateCol = page[0]
               }
               this.options.view.refreshHeadSize()
         //   if(typeof console!="undefined"&&console.log)   console.log("addPage:",(new Date()).getTime()-__time__,"ms")
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
        load:function(){
            var _self = this

          if(typeof this.options.querystr=="string" && this.options.querystr!="" ) {
                this.search({
                    query:this.options.querystr
                })
          } else {
              this.__load(this.get("childOptions")).pipe(function(data){
                  _self.__isInitPage.resolve(data)
                  _self.__isInitPage.then(function(){
                      var page = _self.__addPage(data)
                  })
              })
          }
        }     ,
        search:function(query){
            var _self = this;
            this.doms.lastPage =null
            this.options.issearch = true
            this.options.query = query
            this.cursor.end = false
            this.cursor.load = []
            this.options.view.templateCol = null
            this.__load().pipe(function(data){
                  _self.__isInitPage.resolve(data)
                  _self.pages.remove && _self.pages.remove()
                  _self.pages=[]
                  _self.__addPage(data)
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
                   _self.__load({
                       start:_self.cursor.start+1
                   }).pipe(function(data){
                           _self.__addPage(data)
                   })
              })
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
            stores:[] ,
            Head:View.Head,
            Range:View.Range,
            Row:View.Row,
            Toolbar:View.Toolbar,
            scrollBar:undefined ,
            autoload:true
        },
        doms:{
          table:null,
          rowTemplete:null
        },
        __tmplLayout:"",
        __initTmpt:function(){

         },
        __initScrollBar:function(){
            this.options.scrollBar = this.options.scrollBar || this.parent()
            var tagName =  $(this.options.scrollBar)[0].tagName
            if(tagName=="HTML"||tagName=="BODY" ||tagName==undefined){
                this.options.scrollBar = window
            }
        },
        __initToolbar:function(){
            this.doms.toolbar=this.options.Toolbar("<div></div>",{
                scrollBar:  this.options.scrollBar,
                view:this
            })
            this.doms.head.prepend(this.doms.toolbar)
        },
        __getParentHeight:function(parent){

        },
        __initWidget:function(){
            var _self = this
            this.__runHitchs("view.init")

            this.__initScrollBar()
           // this.options.scrollBar = this.options.scrollBar || this.parent()

            this.__initBodyLayout()
            this.__initStores() ;
            this.__initLayout().pipe(function(layout){
                _self.__runHitchs("view.loadLayout",layout)
                return layout
            }).then(function(layout){
                _self.options.layout = layout
                _self.__initHeader (layout)
                _self.__initPage()
            })

        },
        __initBodyLayout:function(){
            var width= this.width()
            this.width("inherit")
            this.doms.layout={}
            var v1 = $("<div style='height: 100%'></div>"),v2=v1.clone(),v3=v2.clone()

            var _self = this , table = this.doms.table=$("<table cellpadding='1' cellspacing='1'></table>")
            var tableBody = this.doms.tableBody = $("<div data-view-body=body style='height:100%;'></div>")
            var vScrollPane =   this.doms.vScrollPane = $("<div data-view-scroll=scroll  style='height: 100%;width: 100%'></div>")

            var vScrollPanelRight = this.doms.vScrollPanelRight = $("<div data-view-scroll=right style='overflow-y:scroll;height: 100%;width:100%''></div>")

            var vScrollPanelBottom = this.doms.vScrollPanelBottom = $("<div data-view-scroll=bottom   style='overflow-x:scroll;overflow-y:hidden;height: 100%;width: 100%'></div>")
            var panel = this.doms.vPanel = $("<div style='overflow:hidden;width: 100%;height: 100%;'></div>")
            tableBody.append(table)
           // vScrollPane.append(tableBody,vScrollPanelRight,vScrollPanelBottom)
           v1.append(tableBody,vScrollPanelRight)
            v2.append(vScrollPanelBottom)
           // v2.height("20px")
            this.doms.layout.v1=v1
            this.doms.layout.v2=v2

            vScrollPane.append(v1,v2)
           // tableBody.width(width)
            panel.append(vScrollPane)
            this.append(panel)
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
        __createdTH:function(cell){
            var   th =$("<th style='word-break:break-all;white-space:normal;word-break:break-all;'></th>")
            th.width(cell.width)
            th.text(cell.title)
            return th
        }  ,
        __initHeader:function(layout){


            var _self = this;
            var head = $("<table cellpadding='1' cellspacing='1'></table>")

            var tr = $("<tr></tr>");
            $.each (layout,function(i,cell){
                tr.append(_self.__createdTH(cell)  )
            })
            head.append(tr)
           // this.doms.table.append(head)
            this.doms.head = this.options.Head("<div></div>",{
                view:this
            })

            this.doms.titleHead =  head
            this.doms.head.append(head)
            this.__initToolbar()
            this.doms.vScrollPane.prepend(this.doms.head)

            this.doms.table.css({
                "height":this.height(),
                "overflow-y":"scroll"
            })
          //  this.doms.vPanel.height(_self.height()-this.doms.head.height()-20)
        },
        __getRow:function(trs){
           if(!$(trs).data("row")){
               $(trs).data("row",this.options.Row(trs))
           }
           return   $(trs).data("row")
          // return Row(this.doms.rowTemplete.clone())
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
        *就爱那个数据写入页面
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
        },
        load:function(){
            this.Range.load()
        } ,
        /*!
         *初始化滚动条时间，如果view设置了 scrollbar，当scrollbar滚动时将会产生一个 scrolltop或者scrolldown事件
         */


        /*!
        *执行搜索
         */
        __search:function(query){
            this.__runHitchs("search",query)
            this.Range.search({
                query:query
            })
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
        },
        refreshHeadSize:function(){
            this.doms.head.width(this.doms.table.width())
           if(!this.templateCol){
               return
           }
            //this.doms.titleHead.parent().width(this.width())
            var ths = this.doms.titleHead.find("th")
            var tds =    $(this.templateCol).find(">td")
            tds.each(function(i,el){
                $(el).width($(ths.get(i)).width())
            })
            ths.each(function(i,el){
                $(el).width($(tds.get(i)).width())
            })

        },
        expand:function(row){
            this.__runHitchs("expand",row)
            row.expand()

            this.trigger("expand",[row])
        },
        collapse:function(row){
            this.__runHitchs("collapse",row)
             row.collapse()

            this.trigger("expand",[row])
        },
        sort:function(options){
            this.Range.sort(options)
        },
        search:function(query){
            this.__search(query)
        },
        add:function(){},

        refresh:function(){}
    })
    return View
})