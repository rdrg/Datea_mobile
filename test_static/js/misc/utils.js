////////////////MISC////////////////////
//parse form data into a convenient object
    var formDeserialize = function(formdata){
        var output = {};
        formdata.forEach(function(data){
            //console.log(data.name, data.value);
            output[data.name] = data.value;
    });
    return output;
};

