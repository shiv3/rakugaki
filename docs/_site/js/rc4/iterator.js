(function(){
    const test1 = (K) => {
        return K.split("");
    }

    function* test2(A){
        var i=0;
        while(true){
            A[i] = i;
            i++;
            yield A;
        }
    }


    var a = test1("teststring");
    var gen = test2(a);
    for(var i=0;i<100;i++){
        gen.next().value
    }
    console.log(a);
})();


(function(){
    const test1 = (K) => {
        return K.split("");
    }
    var i=0;
    function test2(A){
        A[i] = i;
        i++;
        return A;
    }
    var a = test1("teststring");
    for(var i=0;i<100;i++){
        test2(a);
    }
    console.log(a);
})();