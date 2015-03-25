/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-30
 * Time: 下午2:56
 * To change this template use File | Settings | File Templates.
 */
define(["base/objectj","base/template"], function ($,tmpl,undefined) {

    var layout = $.sub();

    layout.fn.extend({
        main:function(selector,ops){
                this.render(ops)
        },
        templateHTML:null,
        templateURL:null,
        items:[],
        render:function( options, parentItem ){
                var widget = this;
              //  var options = $.extend({items:this.items},options)
                this.items = options.items||this.items;
                if(options.items.length>5){
                    throw Error("布局最多可以设置上下左右中5个区块。且布局为“亞”字形")
                        return false;
                }
                this.__processItem();
                var templateURL = options.templateURL||widget.templateURL;
                if(templateURL){
                    require(["text!"+templateURL],function(templateText){
                        widget.templateHTML = templateText;
                        tmpl.tmpl(templateText,this.items).appendTo( widget);
                    })
                }else{
                    var templateText = widget.templateHTML =(options.templateHTML||widget.templateHTML||this.__createdTemplate());

                    tmpl.tmpl(templateText,this.items).appendTo( widget);
                }
                return widget;
            },
        update:function( options, parentItem ){
                this.empty();
                return this.render(options, parentItem);
        },
        /**
         * 渲染前对数据进行加工处理
         */
        __processItem:function(){
            var position=[0,0,0,0,0]
            $.extend(position,{
                "top":0,
                "bottom":1,
                "left":2,
                "right":3,
                "center":4
            })
            var width = this.width(),height = this.height();
            $.each(this.items,function(i,item){
                //记录哪些位置需要显示内容，哪些位置不需要显示内容
                position[ position[item.region]] = 1;
                switch(item.region){
                    case "undefined":
                    case undefined:
                    case "center":
                        break;
                    default:
                        item.height=item.height||"auto";
                }
            })
            this.items.sort(function(item1,item2){
                return position[item1.region]- position[item2.region]
            })

                var _items=[];

                var _self = this;
                var pos = 0;
            $.each(position,function(i,flag){
                    var width = 0, height = 0;
                    switch(position[i]){
                        case 0:
                            _items.push({
                                width:0,
                                height:0
                            })
                            break;
                        case 1:
                            var item = _self.items[pos]
                            _items.push(item);
                            var width = item.width||0;
                            var height = item.height||0;

                            switch(i){
                                case 0:
                                case 1:
                                    item.height = item.height || item.height=="auto" ? _self.height()*0.1:item.height;
                                    item.width = _self.width()
                                    break;
                                case 2:
                                case 3:

                                   item.width = item.width || _self.width()*0.1;
                                    item.height =  _self.height()-_items[0].height - _items[1].height
                                  //  console.log(item)
                                    break;
                                default:
                                     item.width = item.width  || _self.width() - _items[2].width - _items[3].width
                                     item.height =  _self.height() - _items[0].height - _items[1].height
                                break;
                            }
                            break;
                        default:
                    }

                    //
                    pos+=flag
                })

            $.extend(position,{
                "top":0,
                "left":1,
                "center":2,
                "right":3,
                "bottom":4
            })
            this.items.sort(function(item1,item2){
                return position[item1.region]- position[item2.region];
            })

        },
        __createdTemplate:function(){
                //tmpstr=tmpstr||element.HTMLTemplate;
                var html = [];
                html.push("<div");
                //属性
                html.push(" style=\"");
                html.push("border:${border};");
                html.push("{{if region&&(region==\"top\"||region==\"bottom\")}};clear:both;{{else}}float:{{if region&&region==\"right\"}}right{{else}}left{{/if}};{{/if}}");
                html.push("height:${height}px;");
                html.push("width:${width}px;");
                html.push("\"");
                html.push(" >");
                html.push("{{html html}}");
                html.push("</div>");
                return html.join("");
            }
        })

        return layout;



})