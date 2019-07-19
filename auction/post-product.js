$('#1111').submit(function(e) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://148.100.244.147:3000/api/org.product.auction.Product", false);
    xhttp.setRequestHeader('Content-type', "application/json");
    xhttp.send(JSON.stringify({
        "$class": "org.product.auction.Product",
        "productName": $('#1q').val(),
        "owner": "resource:"+$('#2a').val()
    }));
    if(xhttp.status==200){
        alert("success");
    }
    else{
        alert("failure");
    }
});