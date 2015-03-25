
define(['jquery',"store/namesStore","widget/dropdown/0.0.2/dropdown","appinfo","css!"+ requirejs.toUrl("form/theme/css/fieldnames.css")],
    function ($,NameStore,DrowDown,appinfo) {
        //require(["css!"+ requirejs.toUrl("form/theme/css/fieldnames.css")])

        var store=new NameStore({label:"shortname",idProperty:"unid"});
        var fieldnames=function(el,ops){
            var ops=ops?ops:{};
            var dropdown = new DrowDown($.extend({
                idProperty:"unid",
                layout:ops&&ops.layout||[{
                    type:"text",
                    text:"lastname",
                    css:{"float":"left"}
                },{
                    type:"text",
                    text:"shortname",
                    format:"($1)",
                    css:{"float":"left"}
                }
                ],
                scrollbody:["body"] ,
                classname:"namebox"
            },ops.dropdownOptions||{}));
            var me =this;
            this.max=0
            this.matchkey="abbreviate";
            this.filterEvent="enter"

            $.extend(this,$(el));
            $.extend(this,ops);


            this.querys=[];
            this.matchnames=[];

            dropdown.selected=function(item){
                _selected(item);
            }
            function _setCaretPosition(){
                //设置光标位置函数
                var pos = me.val().length;
                var ctrl =me[0]
                if(ctrl.setSelectionRange) {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos,pos);
                }else if (ctrl.createTextRange){
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }
            function _updatematch(){
                var strv=me.val();
                var values = strv.replace(/,{2,/,",").replace(/^,|,$/,"").split(/,|;/)

                me.matchnames = $.grep(me.matchnames,function(val,i){
                    val =  val.toLowerCase().replace(/\s/,"")
                    var isMatch = false;
                    $.each(values,function(index,v){
                        isMatch = val==v.toLowerCase().replace(/\s/,"")
                        if (isMatch)return false;
                    })
                    return isMatch;
                })
            }
            function _updatevalue(item){
                var  matchkey = item[me.matchkey].toLowerCase().replace(/\s/,"");
                if($.inArray(matchkey,me.matchnames)==-1)
                    me.matchnames.push(matchkey)

                var reg=new RegExp("(^|,)"+item.originalname+"(,|$)","gi");
                me.val(me.val().replace(reg,"$1"+item[me.matchkey]+"$2"))

                if((me.val().split(/,|;/).length>=me.max &&me.max!=0))
                    me.val(me.val().replace(/[,;]{1,}/,""))
                else
                    me.val(me.val().replace(/[,;]{2,}/,"")+",")
                _setCaretPosition();
            }
            function _selected (item){
                me.querys = $.grep(me.querys,function(val,i){
                    return val!=item.originalname
                })
                _updatevalue(item)
                if(me.onselected)me.onselected()
                me.filter(me.querys);
                me.focus();
            }
            function _selectfist(){
                if(dropdown.data.length==0)return false;
                var item = dropdown.data[0];

                if(NameStore.isMatch(item))
                    _selected(item)
            }
            //执行查询事，检查匹配的item是否为用户的完全输入
            function _integrated(val){
                var reg = new RegExp("(^|,)"+val+",")
                return  reg.test(me.val())
            }
            this.filter=function(query){

                if(!query)query=me.val().split(/[,;]/)
                me.querys =$.grep(query,function(val,i){
                    val = val.toLowerCase().replace(/\s/,"")
                    return $.inArray(val,me.matchnames)==-1 && val!="";
                });
                if(me.querys.length>0){
                    me.results=store.query(me.querys,
                        $.extend({
                            count:10,
                            sort:[{attribute:"lastname",descending:false}]
                        },me.queryOptions||{}) );
                    me.update();
                }else
                    dropdown.hide();
            }
            this.update=function(){
                var el= me[0]
                //dropdown.hide();
                var resultslength=0;

                this.results.each(function(index,item){

                    if(index==0)dropdown.empty();

                    if(!item[me.matchkey])return
                    var  matchkey = item[me.matchkey].toLowerCase().replace(/\s/,"");

                    if($.inArray(matchkey,me.matchnames)==-1)
                        if(_integrated(item.originalname)&&NameStore.isMatch(item)){
                            _updatevalue(item)
                        }
                        else{
                            resultslength++
                            dropdown.addEntry(item);
                        }

                })
                this.results.done(function(){
                    //查询结果为空，清空查询列表，并隐藏
                    if(resultslength==0){
                        dropdown.empty();
                        dropdown.hide();
                    }
                    if(dropdown.data.length==1&&NameStore.isMatch(dropdown.data[0])){
                        _selected(dropdown.data[0])
                    }else{
                        dropdown.show();
                    }
                })

            }
            this.selected=function(item){
                _selected(item) ;
            }
            //定义对象缓存（用户信息缓存，存在的用户信息无需重新加载）
            this.addClass("fieldname")
            if (me.max==1) {
                this.addClass("usersingle")
            } else{
                this.addClass("usermulti")
            };
            me.width(me.width()-25)
            this.on("focus",function(e){
            })
                .on("dblclick",function(){
                    //jBox.alert("请直接输入用户,多个用返回使用“,”分割,按回车键（自动完成）","用户录入")
                })
                .on("keydown",function(e){

                    switch (e.which){
                        default:

                            _updatematch();
                            return true;
                            break;
                        case 13:

                            return false;
                            break;
                    }
                })
                .on("keyup",this,function(e){

                    if(this.value.replace(/[\s,;]/g,"")==""){
                        dropdown.hide();
                    }
                    var strv=this.value
                    var values = strv.replace(/,{2,/,",").replace(/^,|,$/,"").split(/,|;/)

                    switch (e.which){

                        default:
                            var isbreak = false;
                            switch(me.filterEvent){
                                case "enter":
                                    isbreak = e.which!=13;
                                    break;
                                case "default":
                                    break;
                                default :
                                    isbreak = $.inArray(e.which,me.filterEvent)==-1;
                            }
                            if(isbreak) break;

                            _updatematch();
                            if(me.max!=0&&this.value.split(/,|;/).length>=me.max&&me.matchnames.length>=me.max){
                                this.value = this.value.replace(/,+$/,"")
                                return true;
                            }
                            var values = this.value.split(/,|;/);
                            if(values.length>0){
                                e.data.filter(values)
                            }
                            return false;
                            break;
                        case 59:
                        case 188:
                            _selectfist()
                            return false;
                            break;
                        case 38:
                        case 40:

                            dropdown.selectfirst();
                            return false;
                            break;
                    }
                })
            dropdown.setElement(ops.dropdownOptions&&ops.dropdownOptions.element||this[0]);
        }
        $.fn.fieldnames =function(ops){
            var max =this.attr("data-single")&&(this.attr("data-single")=="false"||this.attr("data-single")=="0"||this.attr("isSingle")=="no")?0:1;
            var o ={
                max:this.attr("max")||max
            }
            if(ops&&ops.isSingle)o.max=1;
            return new fieldnames(this[0],$.extend(o,ops))  ;
        }
        return fieldnames;
    });