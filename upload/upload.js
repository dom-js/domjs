define(["jquery","base/objectj","upload/swfupload","i18n!upload/nls/upload"],function($,objectj,SWFUpload,i18n){
    var swfupload = objectj.sub();

    function getNiceFileSize(bitnum){
        var _K = 1024;
        var _M = _K*1024;
        if(bitnum<_M){
            if(bitnum<_K){
                return bitnum+'B';
            }else{
                return Math.ceil(bitnum/_K)+'K';
            }

        }else{
            return Math.ceil(100*bitnum/_M)/100+'M';
        }
    }
    var progressbar = $("<div style='position:absolute;filter:alpha(opacity=50);opacity: 0.5;background-color:#7be1e9;'></div>");
    swfupload.fn.extend({
        main:function(selector){
            if(this.data("upload")) return  this.data("upload")

            this.data("upload",this)


            //192.0.0.99
        },
        options:{
            _progressbar_offset:0
        },
        name:"",
        buttonpane:$("<div></div>"),
        swfupload:null,
        showDialog:function(){

            var _self = this;
            if(_self.swfupload)_self.swfupload.destroy();
            //20120619 修改 settings 初始化时序，确保settings每次都是准确有效的
            this.settings = $.extend(true,this.settings_base(),this.handlers(),this.settings_button);
            $.extend(true,this.settings,this.options)
            this.name = this.options.name||this.attr("name")
            this.settings. flash_url= this.options.agentpath+"/js/swfupload.swf"
            this.settings.  upload_url= this.options.agentpath+"/upload.action"
            this.settings.post_params["user_id"] = this.options.username;
            this.settings.post_params["appname"] = this.options.appname;
            this.settings.post_params["wf_unid"] = this.options.unid34;
            this.settings.post_params["flashdoc"] = this.options.flashdoc;
            this.settings.post_params["position"] = this.name;

            require(["widget/jbox"],function(jBox){
                var buttons={};
                buttons[i18n["Select"]]="select";
                if(!_self.settings.auto_upload)//自动上传
                  buttons[i18n["Upload"]]="upload";

                buttons[i18n["Cancel"]]="cancel";
                buttons[i18n["OK"]]="ok";
               // buttons[i18n.upload]="upload";
                var jbox =jBox
                if(window.top){
                   // jbox =  window.top.jBox = jBox;
                }

                jbox("",{
                   width:500,
                   height:250,
                   title:i18n["Select Files"],
                   // bottomText:$("<div ></div>"),
                    buttons:buttons,
                   submit:function(v,h,f){
                       switch(v){
                           case "select":
                               return false;
                           case "upload":
                               if(_self.swfupload.getStats().files_queued === 0){
                                   jBox.tip(i18n["Please Select Files"])
                                   return false;
                               }
                               _self.swfupload.startUpload();
                               $.each( _self.swfupload.buttons,function(i,bt){
                                    bt.attr("disabled",true);
                               })
                               _self.swfupload.buttons.swfselect.width(0)
                               return false;
                               break;
                           case "ok":
                               _self.swfupload.destroy()
                               _self.data("this").getItem();
                               return true;

                           default:
                               _self.swfupload.destroy()
                               return true;
                       }
                    },
                    loaded:function(h){
                        var buttons = {}
                        $("#"+this.id+" .jbox-button-panel button").each(function(i,bt){
                            buttons[$(bt).val()] = $(bt)
                        })

                       // _self.settings.button_placeholder = this.bottomText
                        var placeholder = $("<span ></span>")
                        _self.settings.button_placeholder =placeholder[0];
                        buttons.select.before(placeholder)
                        var top = buttons.select.position().top,left = buttons.select.position().left ,width= buttons.select.outerWidth();
                        h.append("<style type='text/css'>.swfupload { position: absolute;z-index: 1;width:"+width+"px;top:"+top+"px;left:"+left+"px;}.jbox-content *{font-size: 12px;}</style>")
                        var content_panel = $("<table style='width:100%'></table>").appendTo(h);
                        _self.settings.dialog_panel = h
                        _self.settings.content_panel = content_panel;
                        _self.settings.button_window_mode= SWFUpload.WINDOW_MODE.TRANSPARENT

                        _self.swfupload = new SWFUpload(_self.settings);
                        buttons.swfselect =  $(_self.swfupload.movieElement)
                        _self.swfupload.buttons = buttons

                   }
                })
            })

        },
       cancelUpload:function(fileid,flag){

           this.swfupload.cancelUpload(fileid,flag)
       },
       fileprogress:function(file){
        var _self = this;
       // var  upload = this.swfupload
        var el_row = this.swfupload.list_panel.find("tr[data-fileid="+file.id+"]")

        switch(file.filestatus){
            case -1:
                if(el_row.length==0){
                    var suffix_img = $("<img style='border: none;width: 16px;height: 16px;' >")
                    var src
                    suffix_img.on("error",function(){
                        src = require.toUrl(_self.settings.fileicopath+"/unknown.gif")
                        if(this.src !=src)
                             this.src =src
                    })
                    var src = require.toUrl(_self.settings.fileicopath+"/"+file.type.substr(1)+".gif")
                    suffix_img.attr("src",src);
                    var el_row = $("<tr  data-fileid="+file.id+"></tr>").appendTo(this.swfupload.list_panel ),
                        el_handler =$("<td ></td>").appendTo(el_row),
                        el_type = $("<td ></td>").appendTo(el_row).append(suffix_img),
                        el_name = $("<td >"+file.name+"</td>").appendTo(el_row),
                        el_size =  $("<td >"+getNiceFileSize(file.size)+"</td>").appendTo(el_row),
                        el_status =  $("<td >"+i18n["Waiting"]+"</td>").appendTo(el_row);
                    el_handler_end = $("<td></td>");
                    /*
                    if(!this.settings.auto_upload){

                          el_handler_cancel = $("<button class='jbox-button' style=' margin: 0px;' >"+i18n["Cancel"]+"</button>")
                            el_handler_cancel.on("click",function(){

                                try{

                                    _self.cancelUpload();
                                }catch(e){
                                    console.log(e)
                                }

                            })
                         el_handler_end.append(el_handler_cancel)

                    }
                     */
                    el_row.append(el_handler_end);
                    el_row.data("file",{
                        handle:el_handler,
                        type:el_type,
                        name:el_name,
                        size:el_size,
                        status:el_status
                    })
                }
                break;
            case -2:
                var el_file =  el_row.data("file");
                if(file.percent<100){
                    var progresstext = file.percent + "% (" + getNiceFileSize(file.size*(file.percent/100)) + "/" + getNiceFileSize(file.size) +")"
                    el_file.status.text(progresstext);

                } else{
                    el_file.status.text(i18n["Waiting to complete"])
                    el_file.opts  = {
                        type : file.name.match(/\.{1}([^\.]*$)/)[1],
                        url : _self.options.agentpath+"/download.action?fileId="+file.unid,
                        text : file.name,
                        size : getNiceFileSize(file.size),
                        unid : file.unid
                    }


                }

                progressbar.width(this.swfupload.list_panel.width()*(file.percent/100))

                progressbar.height(el_row.height())

                progressbar.css({
                    top:el_file.handle.position().top+(_self.options._progressbar_offset-0),
                    left:"0px",
                    "z-index":9999
                })
                el_file.handle.append(progressbar)
                break;
            case -4:
                var el_file =  el_row.data("file");

                _self.settings.dialog_panel.scrollTop( _self.settings.dialog_panel.scrollTop()+ el_row.height())
                if(file.isSuccess){
                    el_row.css({
                        "background-color":"#e0fae2"
                    })
                    el_file.status.text(i18n["Upload complete"])
                }else{
                    el_row.css({
                        "background-color":"#ff3300"
                    })
                    el_file.status.text(i18n["Upload Error"])
                }
                progressbar.width(0)
                break;
        }

    },
        handlers:(function(){
            //console.log(a)
            var upload = this;
            return {
                swfupload_loaded_handler : function swfUploadLoaded() {

                    clearTimeout(this.customSettings.loadingTimeout);
                    this.list_panel =  this.settings.content_panel;
                    this.list_panel.append("<tr style='background-color: #f6f6f6;'>" +
                        "<td style='width: 5px;'></td>"+
                        "<td style='width: 16px;'>"
                        +i18n["Type"]
                        +"</td><td >"
                        +i18n["Name"]
                        +"</td><td  style='width: 30px;'>"
                        +i18n["Size"]
                        +"</td><td style='width: 150px;'>"
                        +i18n["Status"]
                        +"</td><td style='width:5px'></td></tr>")
                },
                //选择文件
                file_queued_handler : function fileQueued(file) {
                   // FileProgress.call(this,file)

                        upload.fileprogress(file)
                },
                //选择文件失败
                file_queue_error_handler : function fileQueueError(file, errorCode, message) {
                    var _self = this;

                    require(["widget/jbox"],function(jBox){
                    try {

                       //  upload.fileprogress(file)
                        var   errTitle ,   errInfo
                        switch (errorCode) {
                            case  SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
                                errTitle =  i18n["Select Fail"]+":"+i18n["Select too many files"];
                                errInfo =  i18n["You have attempted to queue too many files."]
                                if(message == 0){
                                    errInfo += "<br>"+i18n["You have reached the upload limit."]
                                }else{
                                    if( message > 1){
                                        errInfo += "<br>"+i18n["You may select up to $1 files."].replace(/\$1/,message)
                                    }else{
                                        errInfo += "<br>"+i18n["You may select one file."];
                                    }
                                }
                                break;
                            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                                //progress.setStatus("File is too big.");
                                 errTitle =  i18n["Select Fail"]+":"+i18n["File size exceeds"];
                                 errInfo =  i18n["File name"]+":"+file.name;
                                 errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Size limit"]+":"+ _self.settings.file_size_limit;
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;

                               // this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                                //progress.setStatus("Cannot upload Zero Byte files.");
                                errTitle =  i18n["Select Fail"]+":"+i18n["0-byte file"];
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                               // console.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                                //progress.setStatus("Invalid File Type.");
                                errTitle =  i18n["Select Fail"]+":"+i18n["Invalid File Type"];
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo += "<br>" + i18n["Allow file type"]+":"+ _self.settings.file_types;
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                              //  console.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            default:
                                if (file !== null) {
                                    errTitle =  i18n["Select Fail"]+":"+i18n["Unhandled Error"];
                                    //progress.setStatus("Unhandled Error");
                                    errInfo = errInfo + ":"+i18n["Unhandled Error"];
                                break;
                                }
                                errTitle =  i18n["Error Code"]+":"+errorCode;
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                               // console.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                        }
                        var buttons={};
                        buttons[i18n["OK"]]="ok"
                        jBox.alert(errInfo,errTitle,{
                            icon:"warning",
                            buttons:buttons
                        })
                       //_self.cancelUpload(file.id);
                    } catch (ex) {
                        //console.debug(ex);
                    }
                    })
                },
                //选择文件完成
                file_dialog_complete_handler : function fileDialogComplete(numFilesSelected, numFilesQueued) {

                    try {
                        if (numFilesSelected > 0) {
                          //  document.getElementById(this.customSettings.cancelButtonId).disabled = false;
                        }

                        /* I want auto start the upload and I can do that here */
                        //add by stephen
                        if(this.settings.auto_upload){//是否要上传
                            this.startUpload();
                        }
                        //this.startUpload(); comment by stephen
                    } catch (ex)  {
                       // console.debug(ex);
                    }
                },
                //开始上传
                upload_start_handler : function uploadStart(file) {
                    upload.fileprogress(file)
                    return true;
                },
                upload_progress_handler : function uploadProgress(file, bytesLoaded, bytesTotal) {
                    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
                    file.percent = percent
                    upload.fileprogress(file)
                },
                upload_error_handler : function uploadError(file, errorCode, message) {
                    require(["widget/jbox"],function(jBox){
                    try {
                        var   errTitle ,   errInfo
                        switch (errorCode) {
                            case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:

                                errTitle =  i18n["Upload Error"]
                               // errInfo =  i18n["File name"]+":"+file.name;
                                //errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                                break;
                            case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:

                                errTitle =  i18n["Upload Failed."]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                             //   console.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            case SWFUpload.UPLOAD_ERROR.IO_ERROR:

                                errTitle = i18n["Server (IO) Error"]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;

                              //  console.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
                                break;
                            case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                                errTitle = i18n["Security Error"]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                           //     console.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
                                break;
                            case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                                errTitle = i18n["Upload limit exceeded."]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                             //   console.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                                errTitle = i18n["Failed Validation.  Upload skipped."]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                              //  console.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                            case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:

                                errTitle = i18n["Cancelled"]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                                break;
                            case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:

                                errTitle = i18n["Stopped"]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                                break;
                            default:
                                progress.setStatus("Unhandled Error: " + errorCode);
                                errTitle = i18n["Unhandled Error"]
                                errInfo =  i18n["File name"]+":"+file.name;
                                errInfo += "<br>" + i18n["File size"]+":"+ getNiceFileSize(file.size);
                                errInfo+= "<br>" + i18n["Error Code"]+":"+errorCode;
                                errInfo+= "<br>" + i18n["Error Message"]+":"+message;
                             //   console.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
                                break;
                        }
                    } catch (ex) {
                        console.debug(ex);
                    }
                        var buttons={};
                        buttons[i18n["OK"]]="ok"
                        jBox.alert(errInfo,errTitle,{
                            icon:"warning",
                            buttons:buttons
                        })
                    })
                },
                upload_success_handler : function uploadSuccess(file, serverData) {
                    file.isSuccess = (serverData.indexOf("successed")==0?true:false);

                    try{
                        file.unid = serverData.match(/-([\d\w]*)-/)[1]
                        upload.fileprogress(file)
                    }catch(e){
                     //   file.filestatus = "-9"
                       //     console.log(file)
                        upload.fileprogress(file)
                       require(["widget/jbox"],function(jbox){
                           jbox.alert(serverData,i18n["Upload Error"])
                       })

                    }

                    return true

                },
                upload_complete_handler : function uploadComplete(file) {

                    return true
                   // if (this.getStats().files_queued === 0) {

                      //  document.getElementById(this.customSettings.cancelButtonId).disabled = true;
                     //  return true
                  //  }
                  //  return false
                },
                queue_complete_handler : function queueComplete(numFilesUploaded) {
                    $.each( this.buttons,function(i,bt){
                        switch(i){
                            case "cancel":
                                break;
                                default:
                                    bt.attr("disabled",false);
                        }

                    })
                    this.buttons.swfselect.width(this.settings.button_width)

                },	// Queue plugin event
                //载入flash上传附件前的一些工作

                swfupload_pre_load_handler : function swfUploadPreLoad() {
                    var self = this;

                    var loading = function () {

                        var longLoad = function () {
                        };
                        this.customSettings.loadingTimeout = setTimeout(function () {
                                longLoad.call(self)
                            },
                            15 * 1000
                        );
                    };

                    this.customSettings.loadingTimeout = setTimeout(function () {
                            loading.call(self);
                        },
                        1*1000
                    );
                },
                swfupload_load_failed_handler : function swfUploadLoadFailed() {
                    var _self = this;
                    clearTimeout(this.customSettings.loadingTimeout);
                    require(["widget/jbox"],function(jBox){
                        var errTitle = i18n["Error Message"];
                        var errInfo = i18n["Upload interface failed to load, please ensure that the browser is already open support for JavaScript and Flash plug-in version is already installed can work."];
                         errInfo += "<br><br>"+i18n["Go to the Adobe website Get the latest Flash plug-in."]
                       var buttons={}
                            buttons[i18n["Adobe website"]]="goto";
                             buttons[i18n["Cancel"]]="cancel";
                          jBox.alert(errInfo,errTitle,{
                            buttons:buttons,
                            submit:function(v,h,f){
                                if(v=="goto"){
                                    window.open("http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash","_blank");
                                    return false;
                                }
                                if(v=="cancel"){
                                   // _self.initSWFUpload(_self.settings);
                                    jBox.close(true)

                                    return true
                                }

                            }
                        })
                    })

                }
            }
        }),
        settings_button:{
            fileicopath:"upload/src/fileico",
            button_width: "62",
            button_height: "24",
            button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
            button_cursor: SWFUpload.CURSOR.HAND

        },
        settings_base:function(){
            return {
                // Button settings
                post_params:{
                    "user_id":"",
                    "wf_unid":"",
                    "position":""
                },
                file_size_limit : "50 MB",
                file_types : "*.*",
                file_types_description : "All Files",
                file_upload_limit : 10,
                file_queue_limit : 0,
                file_post_name: "file",
                debug: false,
                auto_upload:false,
                minimum_flash_version : "9.0.28"
            }
        }
    })
    return swfupload;
})
