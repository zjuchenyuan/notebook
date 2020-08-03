# Bitcoin

我也来试水当个被割的韭菜了

## 期货永续合约介绍

以火币的btc合约为例，交易单位最小是一张100 USD美元（其他币种都是10美元）

交易都是基于btc担保，挣到的也是btc

**买入1张看涨 做多**：相当于按照现在的合约价格用100USD买入btc，也就是借到了币，期待比特币价格上涨；承诺未来会卖出btc平仓得到100USD返还，在平仓时如果真的涨了，那时需要卖出的btc就比当时开仓时的数量少，这个差异的部分就是挣到的btc；如果btc价格一直下跌，账户里所有的btc卖出都不够100USD就爆仓了（实际爆仓规则更复杂）

**卖出1张看跌 做空**：相当于按照现在的合约价格卖出btc手上拿着100USD，也就是借到了美元（然而并不能拿到美元），承诺未来会把这100美元买回btc，如果按预期真的跌了平仓时就能买到更多的btc。注意到买卖这个期货都是基于btc担保的，所以如果不加杠杆做空，就完全等价于卖出持有的btc，不存在爆仓风险，也就是说想真正做空（花人民币赌btc跌）必须上杠杆

## 永续合约资金费率套利

期货合约的交易价格为啥会与现货(BTC/USDT)相差不大呢？因为存在每8个小时的结算机制，如果合约价格>现货价格，说明多方占优，则多方向空方支付资金费，如0.01%（具体数值与价差相关）。[官方说明](https://huobiglobal.zendesk.com/hc/zh-cn/articles/900000106903)

套利操作：先在法币交易用人民币买usdt，然后在币币交易买入10.1usdt的币（多买一点给扣手续费），立刻转入永续合约账户开始1倍做空一张，然后长期持有直到趋势反转（持续支付资金费）。

不要看账户的收益率，这个单单是做空本身相当于持币的收益率，我们并没有持币，正确的收益计算应该是账户权益（币的数量）*当前币币交易价格

历史数据查询： [资金费率](https://futures.huobi.com/zh-cn/swap/info/swap_fee/) [结算价格](https://futures.huobi.com/zh-cn/swap/info/settlement/)

爬取一下历史数据：（看起来ONT套利收益最高，不过上线时间不够长不具有代表性）

计算收益率时已经考虑了币价波动对最后实际收益的影响：假设投入1USD，计算每次结算能收到多少币，累加后按最近一次结算价计算这些币值多少USD，除以结算次数乘以一年的结算次数即为年化收益

```python
import requests, os, sys, time
from decimal import Decimal
from functools import lru_cache

sess = requests.session()

@lru_cache()
def getdata(coin, page=1):
    page = str(page)
    data = [Decimal(i['final_funding_rate']) for i in sess.get("https://futures.huobi.com/swap-order/x/v1/swap_funding_rate_page?contract_code="+coin+"-USD&page_index="+page+"&page_size=100", headers={"source":"web"}).json()["data"]["settle_logs"]]
    settle = [Decimal(i["instrument_info"][0]["settle_price"]) for i in sess.get("https://futures.huobi.com/swap-order/x/v1/swap_delivery_detail?symbol="+coin+"&page_index="+page+"&page_size=100", headers={"source":"web"}).json()["data"]["delivery"]]
    return data, settle

def calc_fullprofit(coin):
    data, settle = [], []
    page = 1
    x = getdata(coin)
    while len(x[0]):
        data.extend(x[0])
        settle.extend(x[1])
        page+=1
        x = getdata(coin, page)
    profit_coin = sum([k/settle[i] for i,k in enumerate(data)])
    profit_usd = profit_coin*settle[0]
    return "%.2f"%(profit_usd/len(data)*3*365*100) + "%", len(data)

data=[]
for i in "BTC ETH EOS LINK BCH BSV LTC XRP ETC TRX ADA ATOM IOTA NEO ONT XLM XMR DASH ZEC".split(" "):
    profit, length = calc_fullprofit(i)
    data.append([i, profit, length])
data.sort(key=lambda i:i[1], reverse=True)
for i,profit,length in data:
    print("",i, profit, length,"", sep="|")
```

|币种|年化收益|结算次数|
|---|---|---|
|ONT|88.71%|35|
|IOTA|75.41%|35|
|ATOM|58.47%|35|
|NEO|52.32%|35|
|ZEC|50.74%|302|
|XLM|50.36%|35|
|XMR|35.45%|35|
|LINK|33.68%|323|
|BSV|26.32%|353|
|DASH|22.16%|302|
|LTC|19.73%|344|
|EOS|19.45%|344|
|BCH|19.02%|353|
|XRP|16.09%|344|
|TRX|14.59%|332|
|ETH|14.22%|365|
|ETC|13.29%|332|
|BTC|7.57%|392|
|ADA|-15.08%|302|

More: [收益推送](https://github.com/zjuchenyuan/arbitrage_notification)

风险： From [数字币套利简史（下）](https://www.chainnode.com/post/391781)

>需要注意的是，资金费率的套利更加适合趋势上涨的行情，而且要留意行情的反转导致费率趋势的扭转，可能会套利失效；还有就是对于像18年的趋势下跌行情，虽然套利逻辑一样，但操作会更加复杂，因为这里面要涉及到永续合约+交割合约的组合对冲，占用币数也会翻倍，也就是说同样的币量套利年化收益率要打5折；所以，好好珍惜这来之不易的好行情吧。

另外，如果btc持续上涨，在持仓中看到做空亏了百分之多少还是有点心痛的，这就需要良好的心理素质，套利相比于持币动辄一天10%的波动就挣不到多少钱hhh
