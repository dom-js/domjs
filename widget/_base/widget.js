/**
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-3-30
 * Time: 下午2:56
 * To change this template use File | Settings | File Templates.
 */
define(["jquery","base/objectj"], function ($,obj) {
    var widget = obj.sub();
    widget.fn.extend({
        main:function(){
            if(this.length>1){
                    var _self = this;
                    this.each(function(i,el){
                       // _self.init(el)
                    })
            }else{
                if(this.data("this"))return this.data("this")
                this.data("this",this)
                this.__init()
            }
        },
        options:{
            depend:undefined
        },
        doms:{},
        /**
         * 模板机制
         */
        __tmpl:"",
        __init:function(){
            this.__initHitch();
            this.__runHitchs("beforeinit",this,this.options)
            this.__initTmpl();
            this.__initMember();
            this.__initWidget();
            this.__initEvent();
            this.__runHitchs("afterinit",this,this.options)
        },
        __initTmpl:function(){

        } ,
        setTmpl:function(tmpl){
           this.__tmpl =  tmpl
        },
        __initWidget:function(){},
        __customEvent:"",
        __initEvent:function(){},
        __customMember:[],
        __initMember:function(){
            var _slef = this;
            $.each(this.__customMember,function(i,name){
                if(_slef[name]!==undefined&&_slef[name]!==null) return
                if(typeof _slef.options[name]=="function"){
                     _slef[name]=function(){
                         var _args = arguments
                         _slef.options[name].apply(this,_args)
                       }

                }else if(typeof _slef.options[name]=="undefined"){
                     //donothing
                }else{
                    _slef[name]= _slef.options[name]
                }
            })
        },
        /**
         * 钩子机制
         */
        __initHitch:function(){
             this.__hitchs.concat(this.options.hitchs)
        } ,
        addHitch:function(name,fn,type){
            var hitch ={
                name:name,
                type:type||"fn",
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
            var name = args.shift()

            $.each(this.__hitchs,function(i,hitch){
                try{
                    if(hitch&&hitch.name&&hitch.name.toLowerCase()==name.toLowerCase())  {

                        hitch.fn.apply(_self,args.concat(hitch.args))
                    }
                }catch(e){
                    
                }

            })
        } ,
        attr:function(){
            var name =arguments[0]
            if(name){
                var info = name.match(/(data-)(.*)/)
                if(info&&info[2]){

                    if(arguments.length==1){
                        return  $(this[0]).attr.apply(this,arguments)
                    }else{
                       return  this.set(info[2],arguments[2])
                    }

                }
                return  $(this[0]).attr.apply(this,arguments)
            }

        },
        set:function(){
            var args = arguments,_self = this;
            if(args.length==1){
                if($.isPlainObject(args[0])){
                   for(var name in args[0]){
                       _self.set(name,args[0])
                   }
                }
            }else if(args.length==2){
               var  val = args[1],name=args[0]
                _self.options[name] = args[1];
                args[0]="data-"+name
                return $(this).attr.apply(this,args)
                //_self.attr("data-"+name,val)
            }

        },
        get:function(name){
            return this.options[name.toLowerCase()] || this.options[name];
        }
    })
    return widget;
})