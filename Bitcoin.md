# Bitcoin

<script>
function showwatch1(){
    localStorage.setItem("watchtab","showwatch1");
    tablebodysort(document.querySelector("#realtimeprofittbody"), 6, 1);
    var idx=1;
    document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(function (i){
        var text = i.querySelector(".headcol").innerText.trim();
        if(text.startsWith("u")||idx>10||i.querySelector("td:nth-child(2)").textContent.indexOf("-")==0||i.querySelector("td:nth-child(3)").textContent.indexOf("-")==0||i.querySelector("td:nth-child(4)").textContent.indexOf("-")==0||i.querySelector("td:nth-child(5)").textContent.indexOf("-")==0){
            i.style.display="none";
            return
        }
        i.style.display="";
        idx+=1;
    })
}
function showwatch2(){localStorage.setItem("watchtab","showwatch2");return showtrs(['DOT','IOST','DOGE','BTM','NEAR','KSM','ZEC','BCH','ONT','FIL','LTC','AAVE','SHIB','oETH','bXLM','bLTC','bETH','bDOGE'])}
function showwatch3(){localStorage.setItem("watchtab","showwatch3");return showtrs(['KSM','DOGE','IOST','DOT','LTC','AAVE','ZEC','BSV','NEAR', 'oATOM', 'bETH', 'bDOGE', 'bDOT', 'bLTC'])}
function showwatch4(){localStorage.setItem("watchtab","showwatch4");return showtrs(['KSM','FIL', 'ONT'])}
function showwatch_huobi(){localStorage.setItem("watchtab","showwatch_huobi");document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(i=>i.style.display=((i.querySelector(".headcol").innerText.trim().startsWith("b")||i.querySelector(".headcol").innerText.trim().startsWith("o")||i.querySelector(".headcol").innerText.trim().startsWith("u"))?"none":""))}
function showwatch_binance(){localStorage.setItem("watchtab","showwatch_binance");return show_prefix("b")}
function showwatch_okex(){localStorage.setItem("watchtab","showwatch_okex");return show_prefix("o")}
</script>

我也来试水当个被割的韭菜了

### 套利实时收益率

以下为实时收益率数据（每天更新一次）：[Code](https://github.com/zjuchenyuan/arbitrage_notification)

预测收益：下一次结算收益（确定值）+下下次结算收益（预估值，随价差波动），单位为千分之

昨日收益：最近三次结算的累计收益

7日年化：最近21次结算平均收益 具体计算见上文**计算收益率**

<a onclick="showfull()">显示全部</a> <a onclick="showwatch1()">关注1</a> <a onclick="showwatch2()">关注2</a> <a onclick="showwatch3()">关注3</a> <a onclick="showwatch4()">关注4</a> <a onclick="showwatch_huobi()">火币</a> <a onclick="showwatch_binance()">币安</a> <a onclick="showwatch_okex()">OKex</a> 

https://d.py3.io/btc.html

## 期货永续合约介绍

以火币的btc合约为例，交易单位最小是一张100 USD美元（其他币种都是10美元）

交易都是基于btc担保，挣到的也是btc

**买入1张看涨 做多**：相当于按照现在的合约价格用100USD买入btc，也就是借到了币，期待比特币价格上涨；承诺未来会卖出btc平仓得到100USD返还，在平仓时如果真的涨了，那时需要卖出的btc就比当时开仓时的数量少，这个差异的部分就是挣到的btc；如果btc价格一直下跌，账户里所有的btc卖出都不够100USD就爆仓了（实际爆仓规则更复杂）

**卖出1张看跌 做空**：相当于按照现在的合约价格卖出btc手上拿着100USD，也就是借到了美元（然而并不能拿到美元），承诺未来会把这100美元买回btc，如果按预期真的跌了平仓时就能买到更多的btc。注意到买卖这个期货都是基于btc担保的，所以如果不加杠杆做空，就完全等价于卖出持有的btc，不存在爆仓风险，也就是说想真正做空（花人民币赌btc跌）必须上杠杆

## 永续合约资金费率套利

这本质上是一个套期保值的操作，是套利，不是高频交易策略，建仓后无需操作，只需要观察是否趋势反转决定平仓时机，例如当七日年化收益为负时平仓卖出

期货合约的交易价格为啥会与现货(BTC/USDT)相差不大呢？因为存在每8个小时的结算机制，如果合约价格>现货价格，说明多方占优，则多方向空方支付资金费，如0.01%（具体数值与价差相关）。[官方说明](https://huobiglobal.zendesk.com/hc/zh-cn/articles/900000106903)

套利操作：用usdt买入币种，立刻下空单无杠杆做空相同数量——这样我们一买一卖相当于没有买入，资产净值不受币价波动影响，只是做空收取资金费

具体操作：先在法币交易用人民币买usdt，然后在币币交易买入10.1usdt的币（多买一点给扣手续费），立刻转入永续合约账户开始1倍做空一张，然后长期持有直到趋势反转（持续支付资金费）。

不要看账户的收益率，这个单单是做空本身相当于持币的收益率，我们并没有持币，正确的收益计算应该是账户权益（币的数量）*当前币币交易价格，收益的基准比较应该是低风险债券而不是高风险持币

历史数据查询： [资金费率](https://futures.huobi.com/zh-cn/swap/info/swap_fee/) [结算价格](https://futures.huobi.com/zh-cn/swap/info/settlement/)

爬取一下历史数据：（看起来ONT套利收益最高，不过上线时间不够长不具有代表性）

**计算收益率**时不能简单对单次收益率求和，应该考虑币价波动对最后实际收益的影响：假设投入1USD，计算每次结算能收到多少币，累加后按最近一次结算价计算这些币值多少USD，除以结算次数乘以一年的结算次数即为年化收益

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


风险： From [数字币套利简史（下）](https://www.chainnode.com/post/391781)

>需要注意的是，资金费率的套利更加适合趋势上涨的行情，而且要留意行情的反转导致费率趋势的扭转，可能会套利失效；还有就是对于像18年的趋势下跌行情，虽然套利逻辑一样，但操作会更加复杂，因为这里面要涉及到永续合约+交割合约的组合对冲，占用币数也会翻倍，也就是说同样的币量套利年化收益率要打5折；所以，好好珍惜这来之不易的好行情吧。

交易期间手速慢或交易不活跃会导致买入现货价格高于做空价格，导致额外的成本损耗；持有期间的最大风险在于美元贬值的风险，例如USDT 7.1买入，最后6.9卖出，即为28.2‰亏损

另外，如果btc持续上涨，在持仓中看到做空亏了百分之多少还是有点心痛的，这就需要良好的心理素质，套利相比于持币动辄一天10%的波动就挣不到多少钱hhh

------

## 套利+网格交易

上述能被选出的资金费率高的套利币种，往往也是涨幅巨大的币种，可能还不如简单持币赚得更多，于是可以尝试更稳妥网格。网格的一个缺点在于资金利用率低，等着抄底买入的资金是闲置的，自然想到可以把上述资金费率套利结合起来，还没买入的部分就等量做空，优点在于：

- 还没买入的抄底资金能赚取资金费率，不完全闲置
- 没有usdt暴雷风险，币本位永续合约挂钩的是美元而不是usdt
- 手续费低，火币现货交易千2，币安合约交易maker只有万1.5

调用币安python sdk自动挂单，代码逻辑是：
获取当前所有的挂单，比对配置的价格数组，找到缺失的价格们。
这些缺失的价格是因为挂单成交导致的，需要补上。
最新成交的那一单价格定为p，p本身是不能补单的（刚突破的网格本身再补上就是白交手续费）。
小于p的缺失价格需要补上buy，大于的补上sell。

在行情剧烈波动的时候，可能一分钟就会成交多次订单需要及时补单，就遇到了具体编码的挑战：

### 如何获取最新的成交订单？

订单号排序？不行，orderId只是按下单时间递增，orderId最大并不一定最近成交

获取当前最新价格，比较哪个缺失价格离最新价格更近？在行情剧烈波动时不可靠

获取历史所有订单，按updateTime排序？实测发现这个api有两个问题：

- 多个订单updateTime相同，无法排序区分
- 数据延迟，最新成交的订单并不一定出现

解决方案是：

- 获取最新成交的成交记录，从中提取包含的orderId，再查询订单。不排除这个REST API也存在数据延迟的问题
- 使用websocket

### 币安Python SDK没有币本位合约接口

现在代码已经有更新补上了REST API的缺失，但websocket订阅账户变动的代码还是得自己来：

client.py里stream_get_listen_key附近加上：

```
    def futures_stream_get_listen_key(self):
        res = self._request_futures_api("post", "listenKey", True, data={})
        return res['listenKey']
```

调用就这样：

```
    def start_websocket(self, handle_order):
        def process_message(msg):
            global conn_key
            if msg['e'] not in ['ACCOUNT_UPDATE'] and not (msg['e']=='ORDER_TRADE_UPDATE' and msg['o']['X']=='NEW'):
                myprint("message:", msg['e'], msg)
            if msg['e'] == 'error':
                bm.stop_socket(conn_key)
                bm.close()
                reactor.stop()
                print("socket stopped, exit now!")
                exit()
            elif msg['e']=='ORDER_TRADE_UPDATE':
                o = msg['o']
                if o['X']!='FILLED':
                    return
                order = {"price":o['p'], "orderId":o['i'], "side":o["S"], "symbol":o["s"], "clientOrderId":o["c"]}
                return handle_order(order)
        
        client = self.client
        client.stream_get_listen_key = client.futures_stream_get_listen_key
        client.FUTURES_URL = client.FUTURES_URL.replace("fapi", "dapi")
        bm = BinanceSocketManager(client)
        bm.STREAM_URL = "wss://dstream.binance.com/"
        conn_key = bm.start_user_socket(process_message)
        bm.start()
```

上述代码直接魔改BinanceSocketManager的常数定义来实现对币本位合约API的调用，订阅账户变动消息，只处理ORDER_TRADE_UPDATE中FILLED的订单，调用handle_order函数进行处理

### 各种异常处理

**避免重复下单**: 下单时指定包含价格信息的newClientOrderId，重复下单自然会失败，避免相同的订单重复下单`APIError(code=-4015): Client order id is not valid.`，但这个保护只针对还在挂单的订单，相同的clientorderid如果前述订单已经成交，不会阻止新的提交。

**已经重复下单**：需要比对当前价格与定义好的网格数组，判断当前应该的仓位是多少，然后使用市价单或者额外在相邻网格下单保证仓位的正确性，注意极端行情下自动补仓依据的仓位价值可能有误。例如买入是靠平仓做空实现的，这是种reduceOnly的订单，必须有足够多的做空仓位才能买，否则报错：`APIError(code=-2022): ReduceOnly Order is rejected.`

已经下的**订单状态变成“已过期”**：这种还是因为已经发生了超买/超卖，保证金不足，官方说明：

> https://www.binance.com/zh-CN/support/faq/360039707291

> 保证金审核不过（针对于止盈止损单）：止盈止损单中需要设置触发价和成交价（市价止盈止损单中，可以根据不同需要设置根据标记价格或最新价格触发），系统会进行两次保证金审核，分别在下单前和成交前。订单触发之后，系统会立即进行第二次保证金审核，若当前发生了亏损或划转出了保证金，导致可用保证金不足，此时订单状态会显示已过期。

**保证金不足**：直接把杠杆倍数变成2可以避免这个问题，即使加杠杆也不会出现强平价格。

**服务器网络不可靠**：在其他地区的服务器同时跑轮询，即使单个服务器挂掉，也有其他服务器靠轮询补上订单，但注意分布式后日志收集是个新的难点

**listenKeyExpired**：收到这种类型的消息需要重新连接，也可以主动轮询的时候调用futures_stream_get_listen_key对现有的Listen Key进行刷新

<script>
function myparseFloat(text){
    var res = parseFloat(text);
    if(text.endsWith("亿")) return res*100000000;
    if(text.endsWith("万")) return res*10000;
    return res;
}
function tdsortn(a,b,n){
    if(myparseFloat(a.querySelector("td:nth-child("+n+")").textContent) > myparseFloat(b.querySelector("td:nth-child("+n+")").textContent) ) 
        return 1; 
    else 
        return -1;
}
function tablebodysort(tbody, n, order){
    var mylist=Array.prototype.slice.call(tbody.querySelectorAll("tr"), 0);
    var sortList = Array.prototype.sort.bind(mylist);
    tbody.innerHTML="";
    for(var i of sortList(function(a,b){return -order*tdsortn(a,b,n)}))
        tbody.appendChild(i)
}
var rememerclick={2:1};
function tablesort_onclick(e){
    var n = Array.from(e.target.parentElement.children).map((element, index)=>({element,index})).filter(({element})=>element==e.target)[0].index+1
    var tbody = document.querySelector("#realtimeprofittbody");
    var order = rememerclick[n]==1?-1:1;
    tablebodysort(tbody, n, order);
    rememerclick[n] = order;
}
function registeronclick(){
    for (var i of Array.prototype.slice.call(document.querySelectorAll("#realtimeprofit > table > thead > tr > th"),1)){
        i.onclick = tablesort_onclick;
        i.style["cursor"]="pointer";
    }
    var tab=localStorage.getItem("watchtab");
    if(tab){eval(tab+"()")}
    rememerclick={2:1};
    document.querySelectorAll("#realtimeprofittbody>tr>td").forEach(function(i){if(i.innerText.trim().startsWith("-")){i.style.backgroundColor="#c0ff90"}})
}
function triggerrefresh(){    
    fetch("https://api.py3.io/trigger_btc_refresh").then(function(response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }).then(function(response) {
        alert("更新成功");
        loadbtctable();
    }).catch(function(error) {
        alert("触发更新失败，请稍后再来")
    });
}
if(/refresh/.test(location.href)) triggerrefresh();
function showfull(){
    localStorage.setItem("watchtab","showfull");
    document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(i=>i.style.display="")
}
function showtrs(coins){
    document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(i=>i.style.display=(coins.indexOf(i.querySelector(".headcol").innerText.trim())==-1?"none":""))
}
function hidetrs(coins){
    document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(i=>i.style.display=(coins.indexOf(i.querySelector(".headcol").innerText.trim())==-1?"":"none"))
}
function show_prefix(prefix){
    document.querySelector("#realtimeprofittbody").querySelectorAll("tr").forEach(i=>i.style.display=(i.querySelector(".headcol").innerText.trim().startsWith(prefix)?"":"none"))
}
</script>
<style>
.md-grid{max-width:69rem;}
.headcol {
  position: sticky;
  position: -webkit-sticky;
  background-color: white;
  width: 3rem;
  min-width: 3rem;
  max-width: 3rem;
  left: 0px;
}
th.headcol {
  background-color: #757575!important;
}
.md-typeset table:not([class]) tr:hover .headcol{
  background-color: #f6f6f6;
}
.md-typeset table:not([class]) th{
  min-width: 4rem;
}
</style>

----------

## 获取交易所价格信息

在统计资产时对价格实时性没有要求，可以缓存60秒；用法：`print(HUOBI_Price.btc)`，返回的是字符串类型

```
class class_CEXPRICE():
    def __init__(self):
        self.updatetime = -1
    def __getattr__(self, token):
        if time.time()-self.updatetime>=60:
            print("fetch", self, end="", flush=True)
            self.data = self.fetchprice()
            print()
            self.updatetime = time.time()
        return self.handleprice(token)

class class_HUOBI_Price(class_CEXPRICE):
    def fetchprice(self):
        return sess.get("https://api.huobi.pro/market/tickers", timeout=5).json()["data"]
    def handleprice(self, token):
        return [i for i in self.data if i["symbol"]==token.lower()+"usdt"][0]["close"]
HUOBI_Price=class_HUOBI_Price()

class class_BINANCE_Price(class_CEXPRICE):
    def fetchprice(self):
        return sess.get("https://api.binance.com/api/v3/ticker/price", timeout=5).json()
    def handleprice(self, token):
        if "busd" not in token.lower():
            token = token.lower()+"usdt"
        return [i for i in self.data if i["symbol"]==token.upper()][0]["price"]
BINANCE_Price=class_BINANCE_Price()

class class_MXC_Price(class_CEXPRICE):
    def fetchprice(self):
        return sess.get("https://www.mxc.com/open/api/v2/market/ticker", timeout=5).json()["data"]
    def handleprice(self, token):
        return [i for i in self.data if i["symbol"]==token.upper()+"_USDT"][0]["last"]
MXC_Price = class_MXC_Price()
```

