/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-4
 * Time: 下午4:50
 * 部门选择 *
 * 20130806 修复storeview属性在IE8 下无法修改的bug
 */

define(["jquery","widget/_base/widget","m!store/viewstore:1.0.0","appinfo",
    "i18n!nls/system"], function ($,widget,Store,appinfo,i18n) {
    var rdhost = appinfo.rdhost&&appinfo.rdhost!=""?appinfo.rdhost:"rd.xxx.com.cn"
    var store = new Store({
        idproperty:"dept_code",
        host:rdhost,
        db:"/xxx/rdweb/yforg.nsf",
        view:"Department",
        count:999
    })
    var department =widget.sub();
    department.fn.extend({
        options:{
            store:store,
            host:rdhost,
            title:i18n["Select department"],
            db:"/xxx/rdweb/yforg.nsf" ,
            view:"Department",
            idProperty:"dept_code",
            id:"department_select",
            root:"000001",
            rootlabel:i18n["xxx"],
            height:300,
            width:600,
            label:"dept_name",
            multi:false,
            showpath:true,
            preload:true,
            expandone:true,
            labeltype:1,
            valuetype:1,
            hasbt:true,
            map:function(item){
                item.dept_manager = item.dept_manager.replace(/(cn=)|(o=)|(ou=)/gi,"")
                return item
            },
            filter:function(item){
                if(item.dept_name=="历史离职人员") return false
                return true
            }
        },
        selectPanel:null,
        __initWidget:function(){

            var _self = this
            var store = this.options.store
            store.idProperty=this.options.idProperty
            $.extend(store.options,{
                host:this.options.host,
                db:this.options.db,
                view:this.options.view,
                idProperty:this.options.idProperty,
                count:999
            })
            if(!this.options.selecttype){
                this.options.selecttype=this.options.multi?"tree":"level"
            }
            var selectPanel = this.options.selecttype=="level"?"form/department/rdv1/leveldepartment":"m!widget/treeselect:1.0.0"

            require([selectPanel],function(widget){
                _self.selectPanel =  widget(_self,_self.options)
                _self.selectPanel.getdocs=function(items){
                    var defs=[];
                    $.each(items,function(i,item){
                        defs.push(store.get(item));
                    });
                    return $.when.apply($,defs);
                }
                _self.__initInputBox()
            })
        },
        __initInputBox:function(){
            var _self = this
            this.on("dblclick",function(){
                _self.selectPanel.showDialog()
            })

            if(this.options.hasbt!==false){
                var buttons = $("<input type='button' value='"+i18n["Select"]+"'class=formButton/>")
                this.attr("readonly",true)
                buttons.on("click",function(){
                    _self.selectPanel.showDialog()
                })
                this.after(buttons)
                this.width(this.width()-buttons.width()-5)
                buttons.css({
                    "margin-left":"2"
                })
            }

        },
        showDialog:function(){
            _self.selectPanel.showDialog()
        }

    })
    return department;
})