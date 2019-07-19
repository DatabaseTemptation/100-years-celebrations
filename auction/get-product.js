function getTransactions() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://148.100.244.147:3000/api/org.product.auction.Product", false);
    xhttp.send();
    var res = xhttp.responseText;
    res = JSON.parse(res);
    for(var productName in res){
        $('#3333').append("<tr class ='gradeA'><td>" +res[productName].productName + "</td><td>" 
        + res[productName].owner.substring(38) + "</td></tr>");
    }
}
window.onload = getTransactions();
