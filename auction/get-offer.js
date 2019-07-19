function getTransactions() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://148.100.244.147:3000/api/org.product.auction.AuctionList", false);
    xhttp.send();
    var res = xhttp.responseText;
    res = JSON.parse(res);
    for(var productName in res){
        for(var ii in res[productName].offers){
        $('#4444').append("<tr class ='gradeA'><td>" +res[productName].auctionId+"</td><td>"+res[productName].product.substring(37) + "</td><td>" 
        + res[productName].reservePrice + "</td><td>"+res[productName].auctioneer.substring(40)+"</td><td>"+res[productName].startTime.substring(0,19)+"</td><td>"
        +res[productName].state+"</td><td>"+res[productName].offers[ii].bidPrice+"</td><td>"+res[productName].offers[ii].member.substring(38)+"</td><td>"
        +res[productName].offers[ii].timestamp.substring(0,19));
        }
    }
}
window.onload = getTransactions();
