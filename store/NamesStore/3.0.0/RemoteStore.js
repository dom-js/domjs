define(function (require, exports, module) {
    var $ = require("jquery");
    var api = require("store/api/store");
    var QueryResults = require("store/util/QueryResults");
    var QueryEngine = require("store/util/iNotesNamesQueryEngine");
    var NamesStore = $.extend(function (ops) {
        $.extend(this, ops);
    }, api);
    NamesStore.prototype.queryEngine = QueryEngine;
    NamesStore.prototype.get = function (shortname) {
        var store = NamesStore.localstore;
        var items = store.query({shortname: shortname});
        if (items.length > 0) {
            return items[0];
        } else {
            return null;
        }
    };
    NamesStore.prototype.query = function (query, options) {
        if (options && options.querylength) {
            String.prototype.charlength = function () {
                a = this.match(/[^\x00-\xff]/ig);
                return this.length + (a == null ? 0 : a.length);
            };
            query = $.grep(query, function (q, i) {
                return q.charlength() >= options.querylength;
            });
        }
        var result = this.queryEngine(query.toString().replace(/,/gi, ";").replace(/\s*;/, ";").replace(/\s*$/, "").replace(/^\s*/, ""), {
            host: "develop.xxx.com.cn",
            mailpath: this.mailpath
        });
        return QueryResults(result);
    };
    module.exports = NamesStore;
});