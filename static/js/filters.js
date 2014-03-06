var filters = angular.module('filters', []);


//让历史结果按长度排
filters.filter('sortHistory', function(){
    return function(histArr, reverse){
        for(var i=0; i<histArr.length-1; i++){
            for(var j=0;j<histArr.length-1;j++){
                if(histArr[j].length>histArr[j+1].length){
                    var temp = histArr[j];
                    histArr[j] = histArr[j+1];
                    histArr[j+1]=temp;
                }
            }
        }
        if(reverse) histArr.reverse();
        return histArr;
    }
});
