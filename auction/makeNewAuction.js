$('#newAuctionForm').submit(function (e) {
    var price = $('#reservePrice input').val();
    if (!(Number(price) > 0)) {
        alert('输入的底价必须大于0！');
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://148.100.244.147:3000/api/org.product.auction.MakeAuctionList", false);
    xhttp.setRequestHeader('Content-type', "application/json");

    var detail = $('#auctionDetail textarea').val();
    if (detail.length == 0) {
        xhttp.send(JSON.stringify({
            "$class": "org.product.auction.MakeAuctionList",
            "reservePrice": price,
            "product": $('#theproduct input').val(),
            "auctioneer": $('#auctioneer input').val()
        }));
    }
    else {
        xhttp.send(JSON.stringify({
            "$class": "org.product.auction.MakeAuctionList",
            "reservePrice": price,
            "detail": detail,
            "product": $('#theproduct input').val(),
            "auctioneer": $('#auctioneer input').val()
        }));
    }

    var status = xhttp.status;
    res = JSON.parse(xhttp.responseText);
    if (status == 200) {
        alert('新拍卖添加成功！');
    }
    else {
        alert('新拍卖添加失败！错误信息：' + res[message]);
    }
});

$('#newOfferForm').submit(function (e) {
    var price = $('#bidPrice input').val();
    if (!(Number(price) > 0)) {
        alert('输入的竞拍价格必须大于0！');
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://148.100.244.147:3000/api/org.product.auction.AuctionOffer", false);
    xhttp.setRequestHeader('Content-type', "application/json");

    xhttp.send(JSON.stringify({
        "$class": "org.product.auction.AuctionOffer",
        "bidPrice": price,
        "auctionList": $('#auctionid input').val(),
        "member": $('#memberemail input').val()
    }));

    var status = xhttp.status;
    res = JSON.parse(xhttp.responseText);
    if (status == 200) {
        alert('竞拍请求添加成功！');
    }
    else {
        alert('竞拍请求添加失败！错误信息：' + res[message]);
    }
});

$('#closeBid').submit(function (e) {
    var bid = $('#closeBidding').val();
    if (bid.length === 0) {
        alert('输入的拍卖场次ID不能为空！');
        return;
    }
    alert('333');
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://148.100.244.147:3000/api/org.product.auction.CloseBidding", false);
    xhttp.setRequestHeader('Content-type', "application/json");

    xhttp.send(JSON.stringify({
        "$class": "org.product.auction.CloseBidding",
        "auctionList": bid
      }));

    alert('222');
    res = JSON.parse(xhttp.responseText);
    alert('111');
    if (xhttp.status == 200) {
        alert('操作成功！拍卖结束信息为：');
    }
    else {
        alert('操作失败！错误信息：');
    }
});