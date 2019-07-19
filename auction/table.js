(function ($) {
    "use strict";
    var mainApp = {

        initFunction: function () {
            alert('init')
        },

        initialization: function () {
            mainApp.initFunction();

        }

    }

    var api = {
        url: "http://148.100.244.147:3000/api/org.product.auction.Auctioneer",
        //拍卖商列表 
        itemList: new Array(),
        request: function () {
            $.get(this.url, function (data, status) {

                for (let i in data) {
                    var obj = {
                        nickName: data[i]['customerName']['nickName'],
                        realName: data[i]['customerName']['realName']
                    };
                    api.itemList[i] = obj;
                }

                for (let i in api.itemList) {
                    var nickName = api.itemList[i]['nickName'];
                    var realName = api.itemList[i]['realName'];

                    $('#tbody').append('<tr><td>' + nickName + '</td><td>' + realName + '</td></tr>')

                }
            })



        },
        callBack: function (data, status) {
            alert("数据: \n" + data + "\n状态: " + status);
        },
        getItemList: function () {
            return this.itemList;
        }

    }

    $(document).ready(function () {
        // mainApp.initFunction();

        api.request();
        // console.log(itemList);
        // console.log(api.itemList.length);
        // console.log(Object.getOwnPropertyNames(itemList));
        // console.log(Object.keys(itemList));
        // console.log(itemList[0]);
        // for (let i in itemList.entries()) {
        //     console.log(itemList[i]);
        // }





    });

}(jQuery));


var myApp = {

    url: "http://148.100.244.147:3000/api/org.product.auction.Auctioneer",
    postData: {
        "$class": "org.product.auction.Auctioneer",
        "email": document.forms['myForm']['email'].value,
        "customerName": {
            "$class": "org.product.auction.CustomerName",
            "nickName": document.forms['myForm']['nickName'].value,
            "realName": document.forms['myForm']['realName'].value
        }
    },
    request: function () {
        this.postData.email = document.forms['myForm']['email'].value;
        this.postData.customerName.nickName = document.forms['myForm']['nickName'].value;
        this.postData.customerName.realName = document.forms['myForm']['realName'].value;

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open('POST', this.url, false);
        xmlHttp.setRequestHeader('Content-type', "application/json");
        xmlHttp.send(JSON.stringify(this.postData));
        // alert(xmlHttp.status)
        if (xmlHttp.status == 200) {
            alert('提交成功');
        } else {
            alert('失败')
        }
        // a

        // xmlHttp.post(this.url, JSON.stringify(this.postData), function (data, status) {
        //     alert("数据: \n" + data + "\n状态: " + status);
        // });
        // alert('提交成功')
    },
    callBack: function (data, status) {
        alert("数据: \n" + data + "\n状态: " + status);
    }
}