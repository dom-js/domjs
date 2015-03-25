/*!
 * Created by JetBrains WebStorm.
 * User: yinkehao
 * Date: 12-6-4
 * Time: 下午4:50
 * 部门选择 *
 */
define(["m!widget/levelselect:1.3.0", "store/viewstore", "appinfo", "i18n!nls/system"], function (levelselect, Store, appinfo, i18n) {
    var rdhost = appinfo.rdhost && appinfo.rdhost != "" ? appinfo.rdhost : "rd.xxxx.com.cn";
    var department = levelselect.sub();
    department.fn.extend({
        main: function (selector, context) {
            this.store = this.options.store;
            this.options.id += "_" + (Math.random().toString().substr(2));
        },
        options: {
            host: rdhost,
            title: i18n["Select department"],
            db: "/xxxx/rdweb/yforg.nsf",
            view: "Department",
            idProperty: "dept_code",
            id: "department_select",
            root: "000001",
            rootlabel: i18n.Label,
            height: 300,
            width: 650,
            label: "dept_name",
            multi: false,
            showcols: 3,
            showpath: true,
            leveldepth: 0,
            selectcate: false,
            pathfieldlabel: "",
            pathfield: "_item_path",
            valuefield: "_item_path",
            valuesplit: ",",
            pathsplit: "\\",
            itemformats: {
                dept_manager: function (val, item) {
                    return val.replace(/(cn=)|(o=)|(ou=)/gi, "");
                }
            },
            onselect: function (selectList) {
                var val = [];
                var _self = this;
                $.each(selectList, function (i, item) {
                    if (_self.options.valuefield == _self.options.pathfield) {
                        val.push(item[_self.options.valuefield].join(_self.options.pathsplit));
                    } else {
                        val.push(item[_self.options.valuefield]);
                    }
                });
                this.val(val.join(_self.options.valuesplit));
                return true;
            },
            __customEvent: "select show close selected",
            map: function (item) {
                item.dept_manager = item.dept_manager.replace(/(cn=)|(o=)|(ou=)/gi, "");
                return item;
            },
            filter: function (item) {
                if (item.dept_name == "历史离职人员") {
                    return false;
                }
                return true;
            },
            infolayout: [[{label: "部门编号", field: "dept_code"}, {label: "部门名称", field: "dept_name"}], [{
                label: "部门路径",
                field: "_item_path",
                format: function (vals) {
                    return vals.join(this.options.pathsplit);
                }
            }]]
        },
        panel: {path: null, lists: null, info: null, select: null},
        firstLevel: 0,
        lastLevel: 0,
        focusLevel: 0,
        focusItemQueue: [],
        selectQueue: [],
        levelQueue: [],
        columnQueue: {},
        resultQueue: {},
        dialog: null,
        _columns: 3,
        _columnwidth: 0,
        _currentResult: null,
        autofields: {},
        _initInputBox: function () {
            var _self = this;
            var buttons = $("<input type='button' value='" + i18n.Select + "'class=formButton/>");
            this.on("dblclick", function () {
                _self.showDialog();
            }).attr("readonly", true);
            buttons.on("click", function () {
                _self.showDialog();
            });
            this.after(buttons);
            this.width(this.width() - buttons.width() - 5);
            buttons.css({"margin-left": "2"});
        }
    });
    return department;
});