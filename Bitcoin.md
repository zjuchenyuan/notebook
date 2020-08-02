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

历史数据查询： https://futures.huobi.com/zh-cn/swap/info/swap_fee/

爬取一下历史数据：

```
coin="BTC" #可以改成ETH EOS LINK BCH BSV LTC XRP ETC TRX ADA ATOM IOTA NEO ONT XLM XMR DASH ZEC
for i in `seq 1 4`; do curl "https://futures.huobi.com/swap-order/x/v1/swap_funding_rate_page?contract_code=${coin}-USD&page_index=${i}&page_size=100" -H "source:web" | jq -Mr .data.settle_logs[].final_funding_rate; done > ${coin}feelog.txt 2>/dev/null
python3 -c 'from decimal import Decimal;d=[Decimal(i) for i in open("'${coin}'feelog.txt")];print("'${coin}'","%.2f"%(sum(d)/len(d)*3*365*100))'
```

最早的一条记录是2020-03-25 20:00:00，目前是2020-08-02 20:00:00，一共130天，391次结算记录

BTC年化收益7.16%，当然这个计算很有问题，实际上结算是按照当前btc价格换算增加了btc的持仓：比如假设现在资金费率0.01%，当前BTC/USDT价格为10000，持有1张做空在这次结算中会得到(100/10000)*0.01%=0.000001个BTC也就是当前对应0.01美元，但得到的是btc，如果btc后续大跌这0.000001btc值的美元也会降低，也就意味着实际收益会减少。

对所有币种执行结果：（看起来ONT套利收益最高，不过只有34条结算记录不具有代表性）

```
#for coin in BTC ETH EOS LINK BCH BSV LTC XRP ETC TRX ADA ATOM IOTA NEO ONT XLM XMR DASH ZEC; do python3 -c 'from decimal import Decimal;d=[Decimal(i) for i in open("'${coin}'feelog.txt")];print("'${coin}'","%.2f"%(sum(d)/len(d)*3*365*100),len(d))'; done|sort -k2 -r -h
```

|币种|年化收益|结算次数|
|---|---|---|
|ONT|96.49|34|
|IOTA|77.05|34|
|ATOM|60.81|34|
|NEO|56.38|34|
|XLM|48.70|34|
|XMR|39.93|34|
|ZEC|34.49|301|
|BSV|23.86|352|
|DASH|19.79|301|
|LINK|17.75|322|
|EOS|17.62|343|
|BCH|16.83|352|
|LTC|16.11|343|
|TRX|12.87|331|
|ETC|12.41|331|
|XRP|11.68|343|
|ETH|10.01|364|
|BTC|7.16|391|
|ADA|-14.55|301


风险： From [数字币套利简史（下）](https://www.chainnode.com/post/391781)

>需要注意的是，资金费率的套利更加适合趋势上涨的行情，而且要留意行情的反转导致费率趋势的扭转，可能会套利失效；还有就是对于像18年的趋势下跌行情，虽然套利逻辑一样，但操作会更加复杂，因为这里面要涉及到永续合约+交割合约的组合对冲，占用币数也会翻倍，也就是说同样的币量套利年化收益率要打5折；所以，好好珍惜这来之不易的好行情吧。

另外，如果btc持续上涨，在持仓中看到做空亏了百分之多少还是有点心痛的，这就需要良好的心理素质，套利相比于持币动辄一天10%的波动就挣不到多少钱hhh
