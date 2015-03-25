/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-4-9
 * Time: 上午9:55
 * 一个Object对象，可以通过jQuery进行扩展继承，并且可以定义Main函数，在实例化时进行调用，第一个参数为Key，第二个参数为Object对象
 *20120705 添加对 objectj对象参数的支持，如果一个字符串指向一个 data-id 属性的objectj对象，则会在该对象被完成早入后进行相应处理。
 * 并保证main函数在载入完成后才被调用
 * 20120813 将 new Function 放在 获取属性名称之后执行
 * 如果属性名是一些特殊的全局参数，将会作为字符串处理，如open（window默认全局函数）
 */
define(["jquery"], function (jQuery,undefined) {
    var objectj =  jQuery.sub();
    objectj.extend({
        sub: function() {
            function jQuerySub(selector,context ) {
                if(arguments.length>3){
                    throw Error("对象只能接收3个参数 selector 和 context,options, context和options是可选参数，options用于辅助使用")
                }
                var obj =new jQuerySub.fn.init( selector, context );
                obj.__initComplete =  new $.Deferred()
                if(arguments.length>0 && jQuerySub.fn.main ){
                    var args = arguments
                    jQuerySub.fn.__parseHTMLParameter.apply(obj,args);
                    var   isDeferred = typeof obj.resolve =="function"

                    if(!isDeferred){
                        obj.extend(new $.Deferred())
                    }
                    //事件处理
                    var _initEvent = function(){
                        if(typeof obj.__customEvent == "string")
                            obj.on(obj.__customEvent,function(e){
                                var eventName ="on" + e.type
                                if(typeof obj[eventName]=="function"){
                                    obj[eventName].apply(obj,arguments)
                                }
                                if(typeof obj.options[eventName]=="function"){
                                    obj.options[eventName].apply(obj,arguments)
                                }
                            })
                    }

                    //处理参数
                    if(obj.options.deferred){
                        obj.options.deferred.then(function(){
                            _initEvent()

                            var objmain = jQuerySub.fn.main.apply(obj,args);
                            if(!isDeferred){
                                obj.resolve()
                            }
                        })
                        return obj;
                    }else{
                        _initEvent()
                        var objmain = jQuerySub.fn.main.apply(obj,args);
                        if(!isDeferred){
                            obj.resolve()
                        }
                        return objmain == undefined?obj:objmain;
                    }
                } else{
                    return obj;
                }
            }
            jQuery.extend( true, jQuerySub, this );
            jQuerySub.superclass = this;
            // console.log(this)
            jQuerySub.fn = jQuerySub.prototype =this();

            jQuerySub.fn.constructor = jQuerySub;

            jQuerySub.sub = this.sub;
            //定义父父类
            //将prototype复制到父类上,由于直接使用 this.superclass.prototype 将会获得意想不到的错误，因此此处需要对superclass进行处理。
            jQuerySub.fn.superclass = jQuerySub.fn.init
            $.extend( jQuerySub.fn.superclass,jQuerySub.fn.init.prototype);

            jQuerySub.fn.init = function init( selector, context ) {
                // 此处代码可以保证通过原型设置的属性全部进行重新分配内存
                var __proto__ =  this.__property__//this;

                //console.log(this.options)
                for(var i in __proto__){
                    // 对属性进行深度copy，以防止使用对象的引用而不是实例
                    var __p__ = __proto__[i]
                    if(jQuery.isArray(__p__)){
                        this[i] = $.extend(true,[],__p__)
                    }else if(jQuery.isPlainObject(__p__)){
                        this[i] = $.extend(true,{},__p__)
                    }
                }


                if(this.superclass){
                    this.options = $.extend(true,{},this.superclass.options,this.options)
                }

                if(jQuery.isPlainObject(selector)) selector == undefined;

                if(jQuery.isPlainObject(context)) {
                    // $.extend(this.options,context)

                    context == undefined;
                }
                //处理对于Dom对象，由于原型结构的HTMLElement中间会有Tag属性，通过此方法将TagName替换掉
                var objStr = Object.prototype.toString.call(context).replace(/(.*HTML).*(Element)/,"$1$2");
                switch( objStr){
                    case "[object Object]":
                        //如果不是jQuery的一个实例，则设置为 undefined;
                        if (!(context instanceof jQuery )) {
                            context = undefined;
                        }
                        break;
                    case "[object String]":
                    case "[object HTMLDocument]":
                    case "[object HTMLElement]":
                        context = jQuery(context);
                        break;
                    case "[object Undefined]":
                    case "[object Array]":
                    default:
                        context = undefined;
                }
                //ru


                return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
            };
            jQuerySub.fn.init.prototype = jQuerySub.fn;
            var rootjQuerySub =  new jQuerySub.fn.init( document);
            return jQuerySub;
        }
    })
    objectj.fn.extend  = function(){
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }
        var __property__=[];
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
                        if ( copyIsArray ) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them

                        target[ name ] = jQuery.extend( deep, clone, copy );

                        // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }

                    //原型继承因其特殊性导致在PlainObject 是直接引用，在同一继承多次实例化后多个实例会共享引用，使用此方法避免共享引用
                    //同样数组也存在此问题，因此此处将所有非Function作为属性记录，在对象初始化的时候，将原型内地属性重新copy给对象实例，而不是直接使用
                    if(!jQuery.isFunction(target[ name ])){
                        __property__[name] = target[ name ]
                    }
                }

            }
        }
        this.__property__ = __property__;
        // Return the modified object
        return target;
    }
    objectj.fn.extend({
        //解析el标签的属性
        __property__:[],
        __parseHTMLParameter:function(selector,ops){
            if(this.length==0) return;
            var _self =this;
            var options = [];

            if(this.length==1){
                $.extend(true,this.options,this.__getHTMLParams(),ops)
            }else{
                this.each(function(i,el){
                    options[i] =   $.extend(true,{},_self.options,objectj.__getHTMLParams.call($(el)),ops)
                })
                $.extend(_self.options,options,ops)
            }



        },
        //20120605 结局data-xxx为字符串类型，且属性值为 000123 格式时自动转换成123的问题
        __getHTMLParams:function(){
            return objectj.__getHTMLParams.call(this)
        },
        options:{},
        set:function(attrname,attrvalue){
            if (typeof (this["__set"+attrname]) == "undefined" )
                jQuery.set.apply(this,arguments);
            else
                this["__set"+attrname](attrvalue);
        },
        get:function(attrname)  {

            if(typeof (this["__get"+attrname]) == "undefined" ||arguments.length>1)
                return jQuery.get.apply(this,arguments);
            else
                return this["__get"+attrname];
        },
        __setoptions:function(ops){
            for(name in ops){
                this.options[name]=ops[name];
            }
        },
        callsuperclass:function(fn,args){
            if(this.superclass.superclass[fn]){
                this.superclass.callsuperclass(fn,args)
            }else{
                this.superclass[fn].apply(this,args)
            }
        }
    })
    objectj.extend({
        modeltype:"objectj",
        //20120605 结局data-xxx为字符串类型，且属性值为 000123 格式时自动转换成123的问题
        __getHTMLParams:function(){
            var _self =this;
            var options = {};
            jQuery.each(this[0].attributes,function(a,attr){
                var propertyname = attr.name //||attr.nodeName

                var property = attr.value //||attr.nodeValue
                //var property = attr.nodeValue
                switch(propertyname){
                    case "dataSrc":
                    case "dataFld":
                    case "dataFormatAs":
                    case "dataPageSize":
                        break;
                    default:
                        var _property = property , _propertyname;


                        if(/^data-.+/.test(propertyname)){
                            // _propertyname = propertyname.replace(/^data-/,"").toLowerCase()
                            _propertyname = propertyname.replace(/^data-/,"")
                            //  options[propertyname.replace(/^data-/,"").toLowerCase()]=property
                        }else if(/^data.+/.test(propertyname)){
                            if(typeof console !="undefined"){
                                console.warn("属性"+propertyname+"已被废弃，请使用"+propertyname.replace(/(^data)/,"$1-")+"替代");
                            }
                            //_propertyname = propertyname.replace(/^data/,"").toLowerCase()
                            _propertyname = propertyname.replace(/^data/,"")
                            // options[propertyname.replace(/^data/,"").toLowerCase()]=property;
                        }
                        if(_propertyname){

                            /*!
                             * 20120813 将 new Function 放在 获取属性名称之后执行
                             * 如果属性名是一些特殊的全局参数，将会作为字符串处理，如open（window默认全局函数）
                             */
                            switch (property){
                                case "open":
                                    options[_propertyname] = property
                                    break;
                                default:
                                    try{
                                        property = (new Function("return  " + property)).call(_self);
                                    }catch(e){}
                                    options[_propertyname] = property
                                    switch(typeof property){
                                        case "number":
                                            if(property!==_property){
                                                options[_propertyname] = _property
                                            }
                                            break;
                                        case "undefined":
                                            options[_propertyname] = _property
                                            break;
                                    }
                            }

                        }


                }

            })
            var paramsDom
            if(options["params-name"]){
                // console.log($("script[data-params-name='"+_self.options["params-name"]+"']")[0].innerHTML)
                paramsDom =    $("script[data-params-name='"+options["params-name"]+"']")
            }
            if(!paramsDom || paramsDom.length==0)  {
                paramsDom = _self.find(">script[type=text\\/x-domjs-params]")
            }
            if(paramsDom.length>0){
                var  fnStr = paramsDom[0].innerHTML
                // console.log(fnStr.replace(/^[\n\s]*/g,"").replace(/[\n\s]*$/g,""))
                fnStr = "return "+fnStr.replace(/^[\n\s\t]*(return)?/,"")
                var params = (new Function(fnStr))()
                $.extend(options,params)
            }
            return  objectj.__computerParams.call(this,options)
        },
        __computerParams:function(options){
            var _self = this;
            options.deferred=new $.Deferred()
            var _accumulator=0
            var _start=function(){
                _accumulator++
            }
            var _end=function(){
                _accumulator--

                if(_accumulator<=0){
                    options.deferred.resolve()

                }
            }
            _start()
            //此处对属性处理，需要进行start/end 调用
            if (typeof options.store =="string"){
                _start()

                var sotreDom = $("[data-id="+options.store+"]")
                delete options.store
                if(sotreDom.data("deferred")){

                    sotreDom.data("deferred").pipe(function(){
                        return  sotreDom.data("this")
                    }).then(function(store){
                            //此处通过this关键字传递才可以
                            _self.options.store = store
                            _end()

                        })
                }else{
                    _end()
                }
            }
            if(_accumulator<=0){
                options.deferred.resolve(options)
            }

            _end()

            return options
        }
    })
    return objectj;
})