
define( function(require,exports,module) {

   var $=require("jquery"),obj=require("base/objectj");
    require( "ckeditor/ckeditor");
  //  require("ckeditor/adapters/jquery");
   var Editor = exports = module.exports = obj.sub();

    // [
    // { name: 'document', items : [
    // 'Source','-','Save','NewPage','DocProps','Preview','Print','-','Templates'
    // ] },
    // { name: 'clipboard', items : [
    // 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ]
    // },
    // { name: 'editing', items : [
    // 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
    // { name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField',
    // 'Textarea', 'Select', 'Button', 'ImageButton',
    // 'HiddenField' ] },
    // '/',
    // { name: 'basicstyles', items : [
    // 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat'
    // ] },
    // { name: 'paragraph', items : [
    // 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv',
    // '-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl'
    // ] },
    // { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
    // { name: 'insert', items : [
    // 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','Iframe'
    // ] },
    // '/',
    // { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
    // { name: 'colors', items : [ 'TextColor','BGColor' ] },
    // { name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About' ] }
    // ];

    var config = {
        skin : 'moono',
        resize_enabled:false,
        toolbar : "default",
        toolbar_default : [
            {
                name : 'basicstyles',
                items : [ 'Bold', 'Italic', 'Underline', 'Strike', '-',
                    'RemoveFormat' ]
            },

            {
                name : 'styles',
                items : [ 'Styles', 'Format' ]
            },
            {
                name : 'paragraph',
                items : [ 'NumberedList', 'BulletedList', '-',
                    'Outdent', 'Indent', '-', 'Blockquote' ]
            },
            {
                name : 'links',
                items : [ 'Link', 'Unlink' ]
            },
            {
                name : 'clipboard',
                items : [ 'Cut', 'Copy', 'Paste', 'PasteText',
                    'PasteFromWord', '-', 'Undo', 'Redo' ]
            },
            {
                name : 'editing',
                items : [ 'Find', 'Replace', '-', 'SelectAll', '-',
                    'Scayt' ]
            },
            {
                name : 'insert',
                items : [ 'Image', 'Table', 'HorizontalRule',
                    'SpecialChar', 'PageBreak' ]
            }, {
                name : 'tools',
                items : [ 'Maximize']
            } ],
        toolbar_base : [ {
            name : 'basicstyles',
            items : [ 'Bold', 'Italic', 'Underline', 'Strike', '-',
                'RemoveFormat' ]
        } ]
    }

    Editor.fn.extend( {
        options : config,
        main : function() {
            var _self = this;
            var editor = CKEDITOR.replace(this[0],this.options)
            //this.ckeditor(this.options)
          //  var editor =this.ckeditorGet()
            //this.extend()
           // editor.setData(this.val());
          // $(function(){
           //    $("form").on("beforesubmit",function(){
          //         _self.val(editor.getData())
           //    })
          // })
        }
    })
    return Editor
})