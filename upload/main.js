require.config({
    baseUrl:"/domjs"
})

require(["jquery","upload/upload"],function($,swfupload){
       // var baseurl = "http://192.0.0.99:8088"
    ///http://172.6.9.14:8088
        var settings = {
            flash_url : "http://192.0.0.99:8088/swfUploadDemo/js/swfupload.swf",
            upload_url: "http://192.0.0.99:8088/swfUploadDemo/upload.action",
          //  button_placeholder_id:"spanButtonPlaceholder",
            post_params:{
                "user_id":"test01",
                "wf_unid":"WFBA0133D96AD70B93482579F8000DA631",
                "appname":"工资查询"
            },
            custom_settings : {
                progressTarget : "fsUploadProgress",
                cancelButtonId : "btnCancel",
                uploadButtonId : "btnUpload",
                myFileListTarget : "idFileList"
            }

    };

        swfu =  swfupload("[name=attachment_1]",settings);
   // swfu.setPostParams({
   //     "user_id":"test01",
    //    "wf_unid":"WFBA0133D96AD70B93482579F8000DA631"
   // })
})