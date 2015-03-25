/**
 * SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
 *
 * mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
 *
 * SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilz�n and Mammon Media and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
define(["jquery","./src/swfupload","./src/swfobject"],function($){
    var SWFUpload = window.SWFUpload;
    if (typeof(SWFUpload) === "function") {
        SWFUpload.prototype.loadFlash=function(){
            var targetElement, tempParent;

            // Make sure an element with the ID we are going to use doesn't already exist
            if (document.getElementById(this.movieName) !== null) {
                throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
            }

            // Get the element where we will be placing the flash movie
            targetElement = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;

            if (targetElement == undefined) {
                throw "Could not find the placeholder element: " + this.settings.button_placeholder_id;
            }
           // $(targetElement).before(this.getFlashHTML())
            // Append the container and load the flash
            tempParent = document.createElement("div");

             tempParent.innerHTML = this.getFlashHTML();	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)
             targetElement.parentNode.replaceChild(tempParent.firstChild, targetElement);

            // Fix IE Flash/Form bug
            if (window[this.movieName] == undefined) {
                window[this.movieName] = this.getMovieElement();
            }

        }


        SWFUpload.onload = function () {};

        swfobject.addDomLoadEvent(function () {
            if (typeof(SWFUpload.onload) === "function") {
                SWFUpload.onload.call(window);
            }
        });




        SWFUpload.prototype.loadFlash = function (oldLoadFlash) {
            return function () {
                var hasFlash = swfobject.hasFlashPlayerVersion(this.settings.minimum_flash_version);

                if (hasFlash) {
                    this.queueEvent("swfupload_pre_load_handler");
                    if (typeof(oldLoadFlash) === "function") {
                        oldLoadFlash.call(this);
                    }
                } else {
                    this.queueEvent("swfupload_load_failed_handler");
                }
            };

        }(SWFUpload.prototype.loadFlash);

        SWFUpload.prototype.displayDebugInfo = function (oldDisplayDebugInfo) {
            return function () {
                if (typeof(oldDisplayDebugInfo) === "function") {
                    oldDisplayDebugInfo.call(this);
                }

                this.debug(
                    [
                        "SWFUpload.SWFObject Plugin settings:", "\n",
                        "\t",
                        "minimum_flash_version:                      ",
                        this.settings.minimum_flash_version,
                        "\n",
                        "\t",
                        "swfupload_load_failed_handler assigned:     ",
                        (typeof(this.settings.swfupload_load_failed_handler) === "function").toString(),
                        "\n"
                    ].join("")
                );
            };
        }(SWFUpload.prototype.displayDebugInfo);

        SWFUpload.queue = {};
        SWFUpload.prototype.initSettings = (function (oldInitSettings) {
            return function () {
                if (typeof(oldInitSettings) === "function") {
                    oldInitSettings.call(this);
                }
                this.ensureDefault = function (settingName, defaultValue) {
                    this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
                };

                this.ensureDefault("minimum_flash_version", "9.0.28");
                this.ensureDefault("swfupload_load_failed_handler", null);

                this.customSettings.queue_cancelled_flag = false;
                this.customSettings.queue_upload_count = 0;
                this.settings.user_upload_complete_handler = this.settings.upload_complete_handler;
                this.settings.upload_complete_handler = SWFUpload.queue.uploadCompleteHandler;
                this.settings.queue_complete_handler = this.settings.queue_complete_handler || null;
                delete this.ensureDefault;
            };
        })(SWFUpload.prototype.initSettings);

        SWFUpload.prototype.startUpload = function (fileID) {
            this.customSettings.queue_cancelled_flag = false;
            this.callFlash("StartUpload", false, [fileID]);
        };

        SWFUpload.prototype.cancelQueue = function () {
            this.customSettings.queue_cancelled_flag = true;
            this.stopUpload();

            var stats = this.getStats();
            var fileId;//add by stephen
            while (stats.files_queued > 0) {
                fileId=this.getFile().id;//取出上传队列中的一个File的ID add by stephen
                document.getElementById(fileId+"_del").parentNode.innerHTML="&nbsp;";//add by stephen
                document.getElementById(fileId).style.color="red";//add by stephen
                document.getElementById(fileId+"_bar").parentNode.innerHTML="已取消";//add by stephen
                this.cancelUpload();
                stats = this.getStats();
            }
            document.getElementById(this.customSettings.myFileListTarget+"Count").innerHTML=this.getStats().files_queued;//add by stephen
        };

        SWFUpload.queue.uploadCompleteHandler = function (file) {
          //  console.log(3)
            var user_upload_complete_handler = this.settings.user_upload_complete_handler;
            var continueUpload;

            if (file.filestatus === SWFUpload.FILE_STATUS.COMPLETE) {
                this.customSettings.queue_upload_count++;
            }

            if (typeof(user_upload_complete_handler) === "function") {
              //  console.log(user_upload_complete_handler)

                try{
                    continueUpload = (user_upload_complete_handler.call(this, file) === false) ? false : true;
                }catch(e){
                   // console.log(e)
                    continueUpload = true
                }
            } else {
                continueUpload = true;
            }

            if (continueUpload) {
                var stats = this.getStats();
                if (stats.files_queued > 0 && this.customSettings.queue_cancelled_flag === false) {
                    this.startUpload();
                } else if (this.customSettings.queue_cancelled_flag === false) {
                    this.queueEvent("queue_complete_handler", [this.customSettings.queue_upload_count]);
                    //this.customSettings.queue_upload_count = 0; comment by stephen
                } else {
                    this.customSettings.queue_cancelled_flag = false;
                    //this.customSettings.queue_upload_count = 0; comment by stephen
                }
            }
        };
    }

   return SWFUpload
})