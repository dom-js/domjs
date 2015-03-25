/**
 * Created with JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-8-16
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */
define(["jquery","appinfo","./_base/test","plugin/jquery.tmpl.min"],function($,app,baseView,tmpl){
var view =baseView.sub()
    var hitchs=[],

     fn=function(row){
         var item = row.options.item
         if(!item._iscategroy&&item._unid){

             var _self = this, tds = row.find(">td"), td = tds.filter("td:first"),
             dvpath =_self.options.stores[0].options.db
                var preview = $("<button style='float: right;'>预览</button>")
             //
               td.append(preview)

             preview.on("click",function(){
                 if(_self.__foucsPreviewRow && _self.__foucsPreviewRow!=row){
                     _self.__foucsPreviewRow.data("previewRow").hide()
                 }
                 _self.__foucsPreviewRow =  row
                 if(row.data("previewRow")){
                     //row.data("previewRow").show()
                     if(row.data("previewRow").filter(":hidden").length==1)
                    row.data("previewRow").show()
                    else
                    row.data("previewRow").hide()
                     return
                 }
                 var unid =  item._unid , previewTd = $("<td colspan='"+tds.length+"'></td>")
                 var previewRow = $("<tr></tr>")
                 previewRow.append(previewTd)
                 previewRow.hide()
                 row.after(previewRow)
                 row.data("previewRow",previewRow)

                 var layout = _self.get("previewLayout");
                 if(layout){
                     console.log(item)
                     //   app.getdoc(unid,dvpath)
                     item.__store__.get(item).pipe(function(data){
                         //s12_yj1
                         var fields ="s1_bom_name s1_bom_path s1_bomdm s1_bomlx s1_wlms s1_xh s12_name".split(" ")
                         var results=[]
                         $.each(fields,function(i,field){
                             var n = 0;
                             var f=    field
                                 v = data[f]
                             while(typeof v!="undefined"){
                                 delete data[f]
                                 if(!results[n])results[n]={}
                                 var item=results[n]
                                 item[field] = v
                                 f =    field+"_"+(++n)
                                 v =   data[f]
                             }
                         })
                         results = $.grep(results,function(item,i){
                                return item.s1_bom_name!=""
                         })
                         data.child =  results

                         return data
                     }).then(function(data){
                             tmpl(layout).tmpl(data).appendTo(previewTd)
                             previewRow.show()
                     })
                 }

             }).on("dblclick",function(){
                 //   row.data("previewRow") && row.data("previewRow").hide()
             })
         }
     }  ,
     hitch={
        name:"preview",
        type:"row",
        fn:fn,
        args:[]
    }
    hitchs.push(hitch)
    view.fn.extend({
          __hitchs:hitchs
    })
    return view;
})
