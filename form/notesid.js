define(
    [ "jquery","i18n!nls/form",
        "/HikCommon/webSource.nsf/source/personnelCommonSelect?openDocument" ],
    function($,i18n) {
        var NotesName = function(el) {
            $.extend(this, new $.Deferred())
            var $el = $(el);

            $el.bind("dblclick", function() {
                var name = $el.attr("name");
                var type = $el.attr("data-listtype") ? $el
                    .attr("data-listtype") : "all"
                var isSingle = !($el.attr("data-multi") && $el
                    .attr("data-multi") == "true")

                selectPeople(name, isSingle, type)
                if($el.attr("data-onselect")){
                    var onselect = (new Function("return "+$el.attr("data-onselect")))()


                    onselect($el.val())
                }
            })
            $el.attr("readonly") == "undefined"
            && $el.attr("readonly", "true")
            if ($el.attr("data-hasbt") && $el.attr("data-hasbt") == "true") {
                var bt = $("<input type=button  value='"+i18n['Select']+"'>")
                    .bind("click", function() {
                        $el.dblclick()
                    })
                $el.after(bt)
                bt.css({
                    "margin-left":"2"
                })
                $el.width($el.width()-bt.width()-2)
                bt.height($el.height())
            }
            this.resolve()
        }
        return NotesName;
    })