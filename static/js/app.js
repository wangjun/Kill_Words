var app = angular.module('killws', []);

app.controller('fetchData', function($scope, $http){
    $scope.loaded = false;
    $scope.isWord = false;

//    请求词义的url（jsonp）
    var url='http://fanyi.youdao.com/openapi.do?keyfrom=Kill-Words&key=679618694&type=data&doctype=jsonp&callback=JSON_CALLBACK&version=1.1&q=';

    $scope.check = function(){
//        显示加载字样
        $scope.loaded = false;
        var q = $scope.query,
            oldurl = url;
        if(q===' '|| q.length===0) return;

        $http.jsonp(oldurl+q).success(function(data){
            display(data);
        });
    }

    function formatter(data){
        var output={
            title: data.query
        };
        if(data.basic){
            output.basic = {};

            var explains = output.basic.explains = [];
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
            output.basic.pronounce = data.basic.phonetic;
            if(data.web){
                output.web = data.web;
            }
            output.mode = 'w';
        }
        else if(data.translation){
            output.translation = data.translation[0];
            output.mode = 's';
        }
        console.log(output);
        return output;
    }

    function display(data){
        $scope.data = formatter(data);
        if($scope.data.mode==='w'){
            $scope.isWord = true;
            $scope.header = {
                mainTitle: '单词释义',
                subTitle: '词义扩展'
            }
        }
        else if($scope.data.mode==='s'){
            $scope.header = {
                mainTitle: '翻译结果'
            }
            $scope.isWord= false;
        }
        $scope.loaded=true;
    }
})