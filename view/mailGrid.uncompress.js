/*!

 */
define(["plugin/jquery.tmpl.min","appinfo","store/viewstore","store/util/readviewdesign"],function($,app,Store,Design){

        var Grid = function(selector,opts){
            var mailpathinfo=app.mailpath.match(/(\/\/([^\/]*))?(\/.*)/)
            this.doms={};
            this.doms.panel = $(selector)
            this.doms.table = $("<table cellpadding=0 cellspacing=0 ></table>");
            this.doms.panel.append(this.doms.table)
            this.options= $.extend({
                host:mailpathinfo[2],
                db:mailpathinfo[3],
                view:"($Inbox)"
            },opts)
            this.__tmpl  = this.options.tmpl
            this.map = this.options.map
            this.__init()
        }
        Grid.prototype={
            __init:function(){
                this.update()
            },
            __initTmpl:function(){
                if(this.__tmpl)$.when(this.__tmpl)
                    var host=this.options.host,dbpath = this.options.db,view = this.options.view
                return this.getLayout().pipe(function(layout){
                    var tmpl = ["<tr"]
                    tmpl.push("{{if _unready }}")
                    tmpl.push(" class=\"list_newmsg\"")
                    tmpl.push("{{/if}}")
                    tmpl.push(">")
                    $.each(layout,function(i,item){
                        tmpl.push("<td ")
                        tmpl.push("style=\"")
                        tmpl.push("width:")
                        tmpl.push(item.width+";")
                        tmpl.push("\"")
                        tmpl.push(">")
                        if(i==0){
                            tmpl.push("<SPAN class=\"list-dot \"></SPAN>")
                        }
                        tmpl.push("<a href='\/\/"+host+""+dbpath+"\/0\/${_unid}?opendocument' ")
                        tmpl.push(" title=\"${"+item.name+"}\"")
                        tmpl.push(" target=\"_blank\"")
                        tmpl.push(">")
                        tmpl.push("${"+item.name+"}")
                        tmpl.push("</a>")
                        tmpl.push("</td>")
                    })
                    tmpl.push("</tr>")

                    return this.__tmpl="<script type='text/x-domjs-tmpl'>"+tmpl.join("")+"</script>"
                })


            },
            getLayout:function(){
                var _self = this
                //console.log(this.options.layout)
                return Design({
                    host:this.options.host,
                    db:this.options.db,
                    view:this.options.view
                }).pipe(function(layout){
                        return $.map(_self.options.layout,function(item,i){
                            return $.extend(layout[item.columnnumber],item)
                        })
                 })
            },
            getData:function(){
                var _self=this,opts = {
                    host:this.options.host,
                    db:this.options.db,
                    view:this.options.view,
                    count:this.options.count,
                    inotesquery:true,
                    sort:{ascending:true,column:4},
                    unreadonly:1
                }, store = new Store(opts)
                return store.query().pipe(function(data1){
                    if(data1.length<opts.count){
                        data1= $.map(data1,function(item){
                            item._unready=true
                            return item
                        })
                      return   store.query({},{unreadonly:0}).pipe(function(data2){
                          if(data1.length==0)return data2
                          $.each(data2,function(i,item2){
                              var flag = false
                              $.each(data1,function(j,item1){
                                  if(item1._unid!=item2._unid){
                                      flag = true
                                      return false
                                  }
                              })
                              if(flag)data1.push(item2)
                              if(data1.length>=opts.count)return false
                          })
                          return data1
                        })
                    }else{
                        return data1
                    }

                }).pipe(function(data){
                        return _self.map? $.map.call(this,data,_self.map):data
                    })
            },
            update:function(){
                var table = this.doms.table
                $.when(this.__initTmpl(), this.getData()).then(function(tmpl,data){
                    var trs = $(tmpl).tmpl(data)
                    table.empty();
                    table.append(trs)
                },function(e){

                })
            }
        }


        return Grid

})