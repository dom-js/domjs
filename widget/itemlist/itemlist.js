define(["jquery"],function($){
    var itemList;
    /**
     *
     * @param ops
     */
    itemList = function(ops){
        var  ops = $.extend({HTMLTemplate:"<ul style='list-style: none;margin: 0px;padding: 0px;'></ul>"},ops)
        $.extend(this,new itemElement(ops));
        $.extend(this,ops)
        var _self =this;
        if(this.store)
        this.store.getChildren({}).each(function(i,item){
            _self.addNode(item);
        })

      if(this.items)
       for(var i =0 ;i< this.items.length ;i++){
            _self.addNode(this.items[i]);
       }
    };
    itemList.prototype = {
        addNode:function(item){
            var node = new itemNode($.extend({
                item:item,
                layout: this.layout,
                _panel:this
            },this.nodeOps))
            this.append(node)
        }
    }

    var itemNode   = function (ops) {
       var  ops = $.extend({HTMLTemplate:"<li style='clear: both;cursor: pointer;border-bottom: 1px solid #EEEEEE;padding: 3px;'></li>"},ops)
        $.extend(this,new itemElement(ops));
        this.id = ops.id ||   this.id;
        this.label= undefined;
        this.value= undefined;
        this.css($.extend({},ops.css));
        //this.on()
        this.layout = ops.layout||[];
        this.item = ops.item;
        this.panel = ops._panel || $("body");
        var _self = this;
        var createEl = function(layout,data){

            for(var i in layout){
                var object = layout[i],length = object.length, isObj = length === undefined || jQuery.isFunction( object );
                if(isObj){
                    var _item = {}
                    for(j in object){
                        _item[j] = (data && data[object[j]])||object[j];
                    }
                    _item.eventTarget=_self;
                    var  el = new itemElement($.extend({},_item));
                    this.append(el)
                }else{
                  //  if(layout.length)
                    var  el = new itemElement($.extend({HTMLTemplate:"<div></div>"},{}));
                    createEl.call(el,object,data)
                    this.append(el);
                }
            }
        }
        createEl.call(this,this.layout,this.item);
    };
    var itemElement = function(ops){

        var  ops = $.extend({HTMLTemplate:"<span></span>"},ops)

        $.extend(this,$(ops.HTMLTemplate));

        this.id = ops.id ||   (""+ Math.random()).substring(2,6);

        ops.text && this.text(ops.text);
        ops.html && this.html(ops.html);
        ops.value && this.val(ops.value)
        ops.className && this.addClass(ops.className);

          var events = ["dblclick","click","menucontext","mouseenter","mouseleave"];
        for(i in events){
            var eventname = events[i];

            if((typeof ops["on"+eventname]) =="function"){

                var eventfun = ops["on"+eventname]
                switch(eventname){
                    case  undefined :
                    case "undefined":
                        break;
                    default:
                        this.on(eventname,function(){

                            if(ops.eventTarget)
                                eventfun.call(ops.eventTarget,this)
                            else
                                eventfun.call(this,this )
                            return false;
                        })
                }
            }
        }
    };
    return itemList;
});