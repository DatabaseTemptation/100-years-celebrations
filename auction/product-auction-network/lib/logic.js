/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * 获取新拍卖的ID
 */
async function getNewId() {
    let today = new Date();
    let tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); //后一天
    let todayYear = today.getFullYear();
    let todayMonth = today.getMonth();
    let todayDay = today.getDate();
    let tomYear = tomorrow.getFullYear();
    let tomMonth = tomorrow.getMonth();
    let tomDay = tomorrow.getDate();
    let todayISO = new Date(Date.UTC(todayYear, todayMonth, todayDay, 0, 0, 0));
    todayISO = new Date(todayISO.getTime() - 8 * 60 * 60 * 1000);
    let tomISO = new Date(Date.UTC(tomYear, tomMonth, tomDay, 0, 0, 0));
    tomISO = new Date(tomISO.getTime() - 8 * 60 * 60 * 1000);
    let todayString = new Date(today.getTime() + 8 * 60 * 60 * 1000).toISOString();

    //日期格式yyyymmdd
    let newId = todayString.substr(0, 4) + todayString.substr(5, 2) + todayString.substr(8, 2);

    //查询
    const todayAuction = await query('SelectAuctionByStartTime', { 'startTime': todayISO, 'endTime': tomISO });
    if (todayAuction.length === 0) {
        newId += '_1';
    }
    else {
        newId += '_' + String(todayAuction.length + 1);
    }

    return newId;
}

/**
 * 开启新的拍卖
 * @param {org.product.auction.MakeAuctionList} makeAuctionList - the makeAuctionList transaction
 * @transaction
 */
async function makeAuctionList(makeAuctionList) {  // eslint-disable-line no-unused-vars
    if (makeAuctionList.reservePrice <= 0) {
        throw new Error('底价必须大于0！')
    }

    const saleAuctionList = await query('SelectSaleAuctionList');
    for (let i = 0; i < saleAuctionList.length; i++) {
        var currlist = saleAuctionList[i];
        if (currlist.product.getIdentifier() == makeAuctionList.product.getIdentifier()) {
            throw new Error('此物品正在被拍卖！');
        }
    }

    const newid = await getNewId();

    //创建新的拍卖实例
    let newAuctionList = getFactory().newResource('org.product.auction', 'AuctionList', newid);
    newAuctionList.reservePrice = makeAuctionList.reservePrice;
    newAuctionList.product = makeAuctionList.product;
    newAuctionList.auctioneer = makeAuctionList.auctioneer;
    newAuctionList.startTime = new Date();
    if (makeAuctionList.detail) {
        newAuctionList.detail = makeAuctionList.detail;
    }

    //新拍卖加入注册表
    const auctionListRegistry = await getAssetRegistry('org.product.auction.AuctionList');
    await auctionListRegistry.add(newAuctionList);

    const newAuctionEvent = getFactory().newEvent('org.product.auction', 'NewAuctionNotification');
    newAuctionEvent.auctionList = newAuctionList;
    newAuctionEvent.detail = '成功添加新拍卖！';
    emit(newAuctionEvent);
}


/**
 * 结束本次拍卖，并选择竞拍价格最高的竞拍请求
 * @param {org.product.auction.CloseBidding} closeBidding - the closeBidding transaction
 * @transaction
 */
async function closeBidding(closeBidding) {  // eslint-disable-line no-unused-vars
    const auctionList = closeBidding.auctionList;
    if (auctionList.state !== 'FOR_SALE') {
        throw new Error('本次拍卖已经结束！');
    }

    auctionList.state = 'ENDED';
    let highestOffer = null;
    let buyer = null;
    let seller = null;
    if (auctionList.offers && auctionList.offers.length > 0) {
        //按竞拍价格从高到低排序
        auctionList.offers.sort(function (a, b) {
            return (b.bidPrice - a.bidPrice);
        });
        highestOffer = auctionList.offers[0];
        if (highestOffer.bidPrice >= auctionList.reservePrice) {
            buyer = highestOffer.member;
            seller = auctionList.product.owner;
            auctionList.state = 'SOLD';
            //更新买方余额
            console.log('before auction, buyer balance: ' + buyer.balance);
            buyer.balance -= highestOffer.bidPrice;
            console.log('after auction, buyer balance: ' + buyer.balance);
            //更新卖方余额
            console.log('before auction, seller balance: ' + seller.balance);
            seller.balance += highestOffer.bidPrice;
            console.log('after auction, seller balance: ' + seller.balance);
            //转移物品所有权
            auctionList.product.owner = buyer;
            //清除竞拍信息
            auctionList.offers = null;

        }

    }

    if (highestOffer) {
        //保存产品信息
        const productRegistry = await getAssetRegistry('org.product.auction.Product');
        await productRegistry.update(auctionList.product);
    }

    //保存拍卖信息
    const auctionListRegistry = await getAssetRegistry('org.product.auction.AuctionList');
    await auctionListRegistry.update(auctionList);

    if (auctionList.state === 'SOLD') {
        //保存参与者信息
        const customerRegistry = await getParticipantRegistry('org.product.auction.Customer');
        await customerRegistry.updateAll([buyer, seller]);
    }

    const auctionEvent = getFactory().newEvent('org.product.auction', 'AuctionFinishNotification');
    auctionEvent.auctionList = auctionList;
    if (auctionList.state === 'SOLD') {
        auctionEvent.detail = '本次拍卖成功结束！';
    }
    else {
        auctionEvent.detail = '本次拍卖未成功结束！'
    }
    emit(auctionEvent);
}

/**
 * 竞拍人发起竞拍请求，余额不足者无法发起请求
 * @param {org.product.auction.AuctionOffer} offer - the offer
 * @transaction
 */
async function makeOffer(offer) {  // eslint-disable-line no-unused-vars
    if(offer.bidPrice<=0){
        throw new Error('竞拍价格必须大于0！');
    }
  
    let auctionList = offer.auctionList;
    if (auctionList.state !== 'FOR_SALE') {
        throw new Error('本次竞拍已经结束！');
    }
    if (!auctionList.offers) {
        auctionList.offers = [];
    }

    if (offer.member.balance >= offer.bidPrice) {
        auctionList.offers.push(offer);
    }
    else {
        throw new Error('您的余额不足，无法发起此次竞拍请求！');
    }

    //保存拍卖信息
    const auctionListRegistry = await getAssetRegistry('org.product.auction.AuctionList');
    await auctionListRegistry.update(auctionList);

    const offerEvent = getFactory().newEvent('org.product.auction', 'OfferPostedNotification');
    offerEvent.offer = offer;
    offerEvent.detail = '竞拍请求已成功发出！';
    emit(offerEvent);
}

/**
 * 顾客充值
 * @param {org.product.auction.Recharge} recharge - the recharge transaction
 * @transaction
 */
async function recharge(recharge) {  // eslint-disable-line no-unused-vars
    const amount = recharge.amount;
    if (amount <= 0) {
        throw new Error('充值余额必须大于0！')
    }
    recharge.customer.balance += amount;
    //保存顾客信息
    const customerRegistry = await getParticipantRegistry('org.product.auction.Customer');
    await customerRegistry.update(recharge.customer);

    const rechargeEvent = getFactory().newEvent('org.product.auction', 'RechargeNotification');
    rechargeEvent.customer = recharge.customer;
    rechargeEvent.detail = '充值成功！';
    emit(rechargeEvent);
}