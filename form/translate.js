define(
    [ "jquery", "./form", "widget/jbox" ,"i18n!nls/form"],
    function($, form, jBox,i18n) {
        var transfer = function() {
            var html = "<table style='margin:5px;width:100%;height:100%'>"
            html += "<tr>"
                + "<td  style='width:100px'>"+i18n["Transfer To"] +"：</td>"
                + "<td style='width:320px' ><input type='text' style='width:300px'  name='temp_wf_transfer'  /></td>"
                + "</tr>"
            html += "<tr>"
                + "<td>"+i18n["Remark"] +"：</td>"
                + "<td><textarea  class='autoresize' style='width:300px'  name='temp_wf_transfermailbody' ></textarea></td>"
                + "</tr>"
            html += "</table>";
            var buttons = {}
            buttons[i18n["Submit"]]="1"
            buttons[i18n["Cancel"]]="0"
            jBox(html, {
                title : i18n["Transfer"],
                top : "20%",
                width : 500,
                buttons :buttons,

                loaded : function(h) {
                    var el = h.find("input[name=temp_wf_transfer]")[0];
                    require( [ "form/fieldnames" ], function(field) {
                        $( function() {
                            $(el).fieldnames()
                        })
                    })
                    require( [ "form/notesname" ], function(notesname) {

                    })
                },
                submit : function(f, h, d) {
                    if (f == 1) {
                        if (d.temp_wf_transfer == "") {
                            jBox.tip(i18n["Please select transfer to"], "info", {
                                focusId : "temp_wf_transfer"
                            })
                            return false;
                        }

                        $("[name=WF_Transfer]").val(d.temp_wf_transfer)
                        $("[name=WF_TransferMailBody]").val(
                            d.temp_wf_transfermailbody)
                        // WF_Transfer
                        // WF_TransferMailBody
                        form.submit( {
                            action : "transfer",
                            jconfirm : false,
                            confirm:function(){return true}
                        });
                    } else {
                        return true;
                     }
                }
            })
        }
        return transfer
    })