/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-14
 * Time: 上午11:47
 * AutoComplate *
 */

define(["m!widget/dropdown:1.0.0"], function (dropdown) {
    var autoComplete = dropdown.sub();
    autoComplete.fn.extend({
        main:function (selector, context) {
            //

            this.__initStore();
         //   this.options=$.extend(true,{},this.superclass.options,this.options)
            this.superclass.main.apply(this, arguments)
        },
        store:null,
        panel:null,
        options:{
            store:null
        },
        __initStore:function(){
            var _self = this;
           if (  typeof this.options.store =="string"){
               // console.log($("[data-id="+this.options.store+"]").data("this"))

               var _initerval =  setInterval(function(){
                   var store  =    $("[data-id="+_self.options.store+"]").data("this");
                   if(typeof store !="undefined"){
                       _self.store = _self.options.store = store
                        clearInterval(_initerval)
                   }

               },10)
           }else{
               this.store = this.options.store
           }
       },
        __initPanel:function(){
          this.superclass.__initPanel.call(this)
          this.panel.width(this.width())
          this.__refreshPosition()
        },
        __refreshPosition:function(){
            var _pos = this.position()
            _pos.top+=this.outerHeight()
            this.panel.css(_pos)
        },
        __initEvent:function(){

            var _self = this;
            this.on("keydown",function(e)
            {
                switch(e.keyCode){
                    case 38:
                        _self.moveup(e)

                        break;
                    case 40:
                        _self.movedown(e)
                        break;
                }
                e.stopImmediatePropagation()

            }).on("keyup",function(e)
                {
                    //console.log(e.keyCode)
                    switch(e.keyCode){
                        case 38:
                        case 40:
                            e.stopImmediatePropagation()
                            break;
                        case 13:
                            if(_self.list.length==1){
                                e.target =  _self.__foucsDom = _self.list[0]
                                _self.__select(e)
                            }
                            break;
                        default:
                            var query = _self.__createQueryObj()
                            _self.query(query)
                    }

                })
            $("body").on("scroll",function(){
                     _self.__refreshPosition()
            })
           var __blur=function(e){
               setTimeout(function(){
                   var activeEl =document.activeElement
                   var isblur = activeEl !== _self[0]&&activeEl !== _self.panel[0]
                   if(isblur){
                       //_self.blur()
                       _self.onblur()
                   }
               },100)
           }
           var __focus=function(e){
               //console.log(2)
              if(_self.__foucsDom==null&&_self.list[0]){
                   _self.__foucsDom = $(_self.list[0])
                 _self.__foucsDom.css(_self.options.css.active)
              }
              // _self.onfocus()
           }
            this.on("focus",function(e){
                e.target = _self.panel[0]
                __focus(e)
            })
            this.panel.on("focus",function(e){
                __focus(e)
            })
            this.on("blur",function(e){
                e.target = _self.panel[0]
                __blur(e)
            })
            this.panel.on("blur",function(e){
                __blur(e)
            })
           this.superclass.__initEvent.call(this);
        },
        __select:function(e){
            var item = $(e.target).data("item")
                var _val =item[this.options.valuefield] || item[this.options.label]
                if(!_val){
                    _val = this.getLabel(item)
                }
            this.val(_val)
            this.superclass.__select.call(this,e)
            this.__foucsDom=null
            this.panel.empty()
            this.list=[]
            this.focus()
        },
        __createQueryObj:function(){
            var query ={}
                query[this.options.querykey] = encodeURIComponent(this.val());
            return query
        },
        query:function(query){
            var result = this.store.query(query)
            var _self = this
            result.then(function(data){
                _self.panel.empty();
                if(data.length==0){
                    _self.panel.hide();
                }else{
                    _self.panel.show()
                }
            })
            result.each(function(i,item){

                _self.addItem(item)
            })
           result.then(function(data){
               _self.list = $(_self.panel.find("li"));
           })
        },
        show:function(){
            if(this.list.length>0)
            this.superclass.show.call(this)
        }


    })
    return autoComplete;
})