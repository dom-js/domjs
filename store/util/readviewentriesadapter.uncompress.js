define(
    [ "jquery" ],
    function($) {
        /**
         * 格式化readviewentries返回的数据结构
         */
        var formatdatetime=function(strDate){
            var ret,arrDate;
            //  var arrDate= strDate.match(/(\d{4})\D?(\d2)\D?(\d{2})\D?(\d{2})?\D?(\d{2})?\D?(\d{2})?\D?(\d)?/)

            try{
                if(/^T/.test(strDate)){ //纯时间
                    arrDate = strDate.match(/(\d{2})(\d{2})(\d{2})/)
                    arrDate.shift();
                    ret = new Date(0,0,0,arrDate[0],arrDate[1],arrDate[2])

                    ret.type = "time"
                    ret.date = null;
                    ret.time =   ret.value =arrDate.join(":")
                }
                else if(/\d{8}/.test(strDate)){//纯日期

                    arrDate = strDate.match(/(\d{4})(\d{2})(\d{2})/)
                    arrDate.shift();
                    ret = new Date(arrDate[0],arrDate[1]-1,arrDate[2],0,0,0)

                    ret.type = "date"
                    ret.time = null;

                    ret.date = ret.value =arrDate.join("-")
                }
                else{
                    arrDate = strDate.match(/(\d{4})(\d2)(\d{2})T(\d{2})(\d{2})(\d{2}).*/)
                    arrDate.shift();
                    ret = new Date(arrDate[0],arrDate[1]-1,arrDate[2],arrDate[3],arrDate[4],arrDate[5])
                    ret.type = "datetime"
                    ret.date = arrDate[0]+"-"+arrDate[1] +"-" + arrDate[2]
                    ret.time =  arrDate[3]+":"+arrDate[4] +":" + arrDate[5]
                    ret.value = ret.date +" "+ ret.time
                }
            }catch(e){
                ret =new Date();
                ret.value = strDate;
            }
            ret.org = strDate;
            return ret
        }
        return function(data,opts) {
            if(!data){
                return []
            }
             $.extend(opts,{
                 expand:0
            })
            var originalname, results = [];

            if (!data.viewentry){
                results.total = 0
                return results;
            }
            results.total = data["@toplevelentries"]

            $.each(
                data.viewentry,
                function(_i, entry) {
                    if(opts.expand!=0 && opts.expand!= entry["@position"].replace(/(.*)\.\d+$/,"$1")){
                        return false;
                    }
                    var _j;
                    var item = {
                        _position : entry["@position"], // 唯一
                        _notesid : entry["@noteid"], // 唯一
                        _siblingsCount : entry[ "@siblings" ] // 唯一

                        // 同级元素数量
                    };
                    if(entry[ "@unread" ]){
                        item._unread = true
                    }
                    if (entry["@children"]) {
                        item._childrenCount = entry["@children"];// 直接子元素数量
                        item._descendantsCount = entry["@descendants"]; // 所有后代数量
                        item._children = item._position; // 如果是分类视图，则指定子节点指针
                    } else {
                        item._unid = entry["@unid"];
                    }
                    var _columns=[];
                    for (_j in entry.entrydata) {
                        if(isNaN(_j)) continue;
                        var _val;
                        if (entry.entrydata[_j].text) {
                            _val = entry.entrydata[_j].text[0]
                                .replace(/[\n\r\t]/, "");
                        } else if (entry.entrydata[_j].textlist) {
                            // 文本多值
                            _val = [];
                            var i;
                            for (i in entry.entrydata[_j].textlist.text) {
                                _val
                                    .push(entry.entrydata[_j].textlist.text[i][0]);
                            }
                        } else if (entry.entrydata[_j].number) {
                            // 数字
                            _val = entry.entrydata[_j].number[0];
                        } else if (entry.entrydata[_j].numberlist) {
                            // 数字多值
                            _val = [];
                            var i;
                            for (i in entry.entrydata[_j].numberlist.number) {
                                _val.push(entry.entrydata[_j].numberlist.number[i][0]);
                            }
                        } else if (entry.entrydata[_j].datetime) {
                            // 时间
                            _val = formatdatetime(entry.entrydata[_j].datetime[0]);

                        } else if (entry.entrydata[_j].datetimelist) {
                            // 时间多值
                            _val = [];
                            var i;
                            for (i in entry.entrydata[_j].datetimelist.datetime) {
                                _val.push(formatdatetime(entry.entrydata[_j].datetimelist.datetime[i][0]));
                            }
                        } else {
                            _val = formatdatetime(entry.entrydata[_j]);
                        }
                        // 设置值
                        _columns[_j] = entry.entrydata[_j]["@name"].toLowerCase().replace(/^\$/gi,"_");
                        item._columns=_columns
                        item[_columns[_j]] = _val;
                    }
                    results.push(item);
                });

            return results;
        };
    });
