define(["appinfo","widget/jbox","app/util","app/excel"],function(appinfo,jbox,apputil,excel){

    var fn = function(){

    }
    fn.prototype.show=function(){
        appinfo.formula({ismanager:"1"}).done(function(res){
            if(res.ismanager){
                jbox("",{
                    title:"请选择模板",
                    bottomText:"<div style='margin-left:25px;text-align:left;'>从选择的文件内导入:<input name='excelfile' type='file' /></div>",
                    loaded:function(h){

                    },
                    submit:function(){}
                })
            } else{
                jbox.alert("对不起，你不是业务管理员，无权导出数据")
            }
        })
    }
    fn.prototype.selecttmpl=function(){
        jbox("<input id='channel' name=channel>",{
            title:"选择通道",
            loaded:function(h){
                appinfo.formula({channel:'@DbColumn(class:"nocache";"":"";"vwChannel";1)'}).then(function(res){
                    var $selCha = apputil.inputToSelect( h.find("#channel"),res.channel);
                })
            },
            submit:function(v,h,f){

                var baseinfo =   appinfo.runrule("C9508F3849D77A8C7AF48257B830079ED2D",{contenttype:"application/json;charset=utf-8",channel:f.channel}).done(function(doc){



                    var channel = doc.channel


                })

            }
        })
    }
    fn.prototype.export=function(){
        var oXL = new ActiveXObject("Excel.Application");
        var oWB = oXL.Workbooks.Add();
        var channelObj={}
        $.each(channel,function(i,item){
            var oSheet
            if(i<3){
                oSheet = oWB.Worksheets(i+1);
            }else{
                oSheet = oWB.Worksheets.Add()
            }
            oSheet.name=item.dengji.replace(/'/,"#")
            oSheet.Cells(1,1).value="员工"
            var j=1
            $.each(item,function(key,value){
                var kinfo = key.match(/xwyx_(\d+)/)
                if(kinfo){
                    oSheet.Cells(1,++j).value=value
                }
            })

            channelObj[item.dengji] = {
                num:i+1,
                rindex:1
            }


        } )

        try{
            $.each(doc.data,function(i,item){
                var oSheet = oWB.Worksheets(item.s6_zgjb.replace(/'/,"#"))
                var rindex = ++ channelObj[item.s6_zgjb].rindex
                oSheet.Cells(rindex,1).value=item.user
                var j=1
                $.each(item,function(key,value){
                    var reg = /^s6_pjdf_/
                    if(reg.test(key)){
                        oSheet.Cells(rindex,++j).value=value
                    }
                })
            })
            oXL.Application.Visible = true;
            oXL.Quit();

        }catch(e){
            jbox.alert("数据导出失败，可能存在错误数据，请联系管理员")
        }
        jbox.closeTip()
        CollectGarbage();
    }

    return fn



    var fn=function(){

        appinfo.formula({ismanager:"1"}).done(function(res){
            if(res.ismanager){
                jbox.tip("正在导出",'loading' ,{timeout:0})
                jbox("<input id='channel' name=channel>",{
                    title:"选择通道",
                    loaded:function(h){
                        appinfo.formula({channel:'@DbColumn(class:"nocache";"":"";"vwChannel";1)'}).then(function(res){
                            var $selCha = apputil.inputToSelect( h.find("#channel"),res.channel);
                        })
                    },
                    submit:function(v,h,f){

                        var baseinfo =   appinfo.runrule("C9508F3849D77A8C7AF48257B830079ED2D",{contenttype:"application/json;charset=utf-8",channel:f.channel}).done(function(doc){



                            var channel = doc.channel


                        })

                    }
                })

            }else{

            }
        })
    }
    return fn

})
/**
 appinfo = require("appinfo")
 appinfo.runrule("C9508F3849D77A8C7AF48257B830079ED2D",{
"contenttype":"application/json; charset=utf-8",
"fields":["s1_username","@NameLookup([NoUpdate];s1_username;\"EmployeeID\")","s1_part","s1_zw","s1_university","s1_xueli","s1_zhuanye","s1_timeby","s1_timegongzuo","s1_timeruzhi","s1_birthday","s1_jixiao","s1_rzlx","s1_dirmanager"],
 "query":"[Form] = fmMain"
 }).then(function(res){
   return $.map(res,function(item){
      $.each(item,function(key,value){

        item[key] = decodeURIComponent(value)
　　　　})
     return item
     })
},function(e){
  console.log(2,e)
}).then(function(res){
 console.log(res)
});""
 */