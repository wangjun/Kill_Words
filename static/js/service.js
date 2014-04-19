var services = angular.module('services', []);


//存储历史数据
services.factory('db', function(sortHistoryFilter, checkResult){
    var ls = window.localStorage;
    return {
        store: function(str){
//            如果是短语，那只分析第一个单词
            var w = str.split(' ')[0].toLowerCase(), key, valueList;
            for(var i=1; i<= w.length; i++){
                key = w.slice(0, i);
                if(!ls.getItem(key)){
                    var tempArr = [];
                    tempArr.push(w);
                    tempArr = angular.toJson(tempArr);
                    ls.setItem(key, tempArr);
                }
                else {
                    valueList = angular.fromJson(ls.getItem(key));
//                    如果数组里已存有要存的值，则退出函数
                    if(valueList.indexOf(w)!==-1) return;

                    valueList.push(w);
                    var valueList = angular.toJson(valueList);
                    ls.setItem(key, valueList);
                }
            }
        },
        retrieve: function(str){
            var key = str.split(' ')[0].toLowerCase(),
                value = ls.getItem(key);
            value = angular.fromJson(value);
            if(!value) return null;
            else value = sortHistoryFilter(value);
            return value;
        }
    }
})

//格式化返回的数据
services.factory('dataFormatt', function(checkResult){
    return function(data){
        checkResult.title = data.query
        if(data.basic){
            checkResult.basic = {};
            var explains = checkResult.basic.explains = [];
            angular.forEach(data.basic.explains, function(value){
                var temp = {};
//                当中译英的时候，这里有可能会没有词类前缀
                temp.type = value.match(/\b[a-z]+\./);
                if(temp.type != null){
                    temp.type = temp.type.toString();
                    temp.content = value.slice(temp.type.length, -1);
                }
                else
                    temp.content = value;
                explains.push(temp);
            })
//            中译英有的没有拼音注音
            if(data.basic.phonetic)
                checkResult.basic.pronounce = data.basic.phonetic;
            else
                checkResult.basic.pronounce = '暂无发音';
            if(data.web){
                checkResult.web = data.web;
            }
            checkResult.mode = 'w';
//            单词模式都是可记录的
            checkResult.recordAbility = true;
        }
        else if(data.translation){
            checkResult.translation = data.translation[0];
            //        判断是否该记录词条
            if(checkResult.title.toLowerCase() === checkResult.translation)
                checkResult.recordAbility = false;
            else
                checkResult.recordAbility = true;
            checkResult.mode = 's';
        }
        return checkResult;
    }
});

//决定内容是否出现的service
services.value('isShow', {
    loadCover: true,
    historyList: false
});

//查询结果对象
services.value('checkResult', {});
