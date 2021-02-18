## ETH

学习一下以太坊，目前可以在区块链上刻字了，每个交易可以存储30K的内容

## 获取测试网络ropsten的ETH

目前的faucet列表，不过有可能他们工作在fork上，获得的eth不能在etherscan上看到

> 近期以太坊Ropsten测试网的Istanbul升级由于大部分算力没有升级节点软件，实际上已经发生了分叉

- https://faucet.ropsten.be
- https://faucet.metamask.io
- http://faucet.bitfwd.xyz

## 生成一堆与MetaMask兼容的地址

MetaMask等钱包的工作原理是从一串seed phrase生成一系列私钥

使用[lightwallet](https://github.com/ConsenSys/eth-lightwallet)这个npm包来生成MetaMask兼容的1000个地址

```
# 需要使用版本2，更新的版本修改了API需要提供salt
$ npm install eth-lightwallet@2.5.6

# 修改node_modules\_bitcore-lib@8.14.4@bitcore-lib\index.js添加一个return
# bitcore.versionGuard = function(version) {return;

var lightwallet = require("eth-lightwallet");
var secretSeed = 从metamask复制
var password = 随意设置一个密码，在内存中存储的是使用这个密码加密后的私钥
var hdPathString = "m/44'/60'/0'/0";
var ks; 
lightwallet.keystore.deriveKeyFromPassword(password, function (err, pwDerivedKey) {
    ks = new lightwallet.keystore(secretSeed, pwDerivedKey, hdPathString);
    //console.log(ks);
    ks.generateNewAddress(pwDerivedKey, 1000, hdPathString);
    for(var i of ks.getAddresses(hdPathString)){
        console.log(i, ks.exportPrivateKey(i, pwDerivedKey, hdPathString));
    }
})
```

## Python发起交易(Web3.py)

pip3 install web3，需要python3.7 （[在Ubuntu16.04上安装Python 3.7](https://py3.io/Python/#ubuntu1604python37)）

在infura.io注册，得到一个project id，设置为环境变量WEB3_INFURA_PROJECT_ID

```
import os
os.environ["WEB3_INFURA_PROJECT_ID"]="从infura.io复制"
from web3.auto.infura.ropsten import w3
from base64 import b16encode
def senddata(privatekey, data, to=None, nonce=None):
    addr = w3.eth.account.privateKeyToAccount(privatekey).address
    if not to:
        to = addr
    if not to.startswith("0x"):
        to = "0x"+to
    if len(data)>30*1024:
        raise Exception("data too big")
    if nonce is None:
        nonce=w3.eth.getTransactionCount(addr)
    tx=dict(nonce=nonce, gasPrice=2000000000, gas=5940000, to=to, value=0, data=data)
    stx=w3.eth.account.sign_transaction(tx, privatekey)
    return b16encode(w3.eth.sendRawTransaction(stx.rawTransaction)).decode().lower()
```

## 地址交易查询API


注意etherscan.io使用了cloudflare，必须设置一个User-Agent才能调用

目前还不需要apikey就能直接调用

```
import requests
def gettx(addr):
    return requests.get("https://api-ropsten.etherscan.io/api?module=account&action=txlist&address="+addr+"&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken", headers={"User-Agent":"ethquery"}).json()["result"]
```

返回的数组可能每个交易都重复了两次，需要去重：

```
seenhash = []
for tx in gettx(addr):
    if len(tx["input"])>2 and tx["hash"] not in seenhash:
        # 处理tx["input"]
        seenhash.append(tx["hash"])
```

## 时间戳转block id

有些时候我们需要知道特定时间点的区块高度，来查询当时的合约数据

不依赖etherscan的方法可以按照当前区块高度、已经流逝的时间和[出块速度](https://etherscan.io/chart/blocktime)进行计算，算出来的blockid再调用web3 API查询timestamp再次计算，直到误差小于阈值即可

etherscan提供了这个API: https://etherscan.io/apis#blocks

```
cache={}
apikey=""
def timestamp2blockid(ts, retry=3):
    cachekey = "timestamp2blockid_"+str(ts)
    if cachekey in cache:
        #print("cache used")
        return cache[cachekey]
    x = sess.get("https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp="+str(ts)+"&closest=before&apikey="+apikey)
    #print(x.json())
    if 'result' not in x.json():
        if retry:
            print("[retry] timestamp2blockid", ts)
            return timestamp2blockid(ts, retry=retry-1)
        else:
            print(x.json())
    res = x.json()["result"]
    cache[cachekey] = res
    return res
```

## 根据函数名调用合约

标记了view的函数可以直接在etherscan读取合约调用，但有些函数不会涉及写操作，我们也可以自己调用而不用发起链上交易（即使交易也拿不到返回值）

首先我们需要了解eth_call的data 前4个字节就是函数签名的哈希，哈希算法是keccak_sha3取前4个字节

这东西叫做ABI， 文档： [https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html](https://solidity.readthedocs.io/en/v0.5.3/abi-spec.html)

例如balanceOf函数只接受一个地址作为参数，它的签名就是`balanceOf(address)`，哈希是`70a08231`，你可以观察metamask后台发送的流量就可以确认这一点

使用Python不依赖web3计算这个哈希： 你可能需要`python3 -m pip install pycryptodome`

```
from Crypto.Hash import keccak
def function_hash(func_str):
    return keccak.new(digest_bits=256).update(func_str.encode("utf-8")).hexdigest()[:8]
```

有了函数哈希后 再拼接函数调用参数就能发起eth_call了，比如我们需要把地址在左边补0补齐到64字节（也就是256bit）

```
import requests
sess = requests.session()
sess.headers.update({"Content-Type":"application/json"})
WEB3_ENDPOINT = "" #change to your infura.io project url

def addrtoarg(addr):
    return addr.lower().rjust(64, "0")

cache={}
def callfunction(addr, func_str, args_str, blockid, returnint=True, usecache=False):
    cachekey = "_".join(("callfunction", addr, func_str, args_str, str(blockid)))
    try:
        height = hex(int(blockid))
    except:
        height = blockid
    if usecache and cachekey in cache and blockid!="latest":
        res = cache[cachekey]
    else:
        data = {
            "id":1, "jsonrpc":"2.0",
            "method":"eth_call",
            "params":[{"data": "0x"+function_hash(func_str)+args_str, "to": addr,}, height]
        }
        x = sess.post(WEB3_ENDPOINT, json=data)
        print(x.json())
        res = x.json()["result"]
        if usecache:
            cache[cachekey] = res
    if not returnint:
        return res
    else:
        return int(res, 16)
```

其中WEB3_ENDPOINT可以是infura自己注册一个APIKEY后得到的地址

要获取最新的数据还需要知道当前的区块高度：

```
def eth_blockNumber():
    return int(sess.post(WEB3_ENDPOINT, data='{"id":1,"jsonrpc":"2.0","method":"eth_blockNumber","params":[]}').json()["result"], 16)
```

调用很简单：`mybalance = callfunction(contract_address, "balanceOfUnderlying(address)", addrtoarg(my_address), eth_blockNumber())`

### 更复杂的参数类型

对于string这种可变长度类型，还是使用python包`eth-abi`吧，例如：

NFT-Hero里随机数用的blockhashMgr到底是什么合约呢：

https://github.com/nfthero/SuperHero/blob/c87346f36efb09667ad8f0eeaf8df04a710bbecd/Package.sol#L87

就想要查询一下members这个字典，其类型是`mapping(string => address) public members`，也就意味着可以调用`members(string)`这个函数进行查询：

```
>>> callfunction("https://http-mainnet-node.huobichain.com/", "0x42C1aC2AeAEc52E1cc9dC8057b089FA91fa84FC7", "members(string)", base64.b16encode(eth_abi.encode_abi(["string"], ["blockhashMgr"])).decode().lower(), "latest", False)
'0x0000000000000000000000003e259bfe720093abb26a2c3fe57670259b2ebea2'
```

-----

## 实例：获取Cake持仓价值

!!! warning 风险警示
    本文不作为投资建议，本项目合约代码2020/11/05也出过[漏洞导致挖矿奖励代币超发](https://www.cailu.net/article/13144343855663958.html)

币安智能链上有个抄了Uniswap的[pancakeswap](https://pancakeswap.finance/pools), 网页上当前(2021/01/06)显示质押CAKE的年化228%，那当然是尝试一下咯，于是自然有了需求：计算自己持仓CAKE的实时价值，持仓包含质押奖励的部分

那么实现这个需求就需要解决两个问题：如何获取自己的CAKE奖励数量，如何获取CAKE的价格信息

第一个问题好解决，按照上面调用合约即可，合约调用需要两个参数，即使不知道函数选择器和函数参数怎么写，也可以让etherscan来帮我们调用[合约](https://bscscan.com/address/0x73feaa1ee314f8c655e354234017be2193c9e24e#readContract) 看流量即可

```
WEB3_ENDPOINT='https://bsc-dataseed.binance.org/'
callfunction(contract_address, "pendingCake(uint256,address)", "0"*64+addrtoarg(my_address), "latest", usecache=False)/10**18
```

第二个问题：获取CAKE的价值 可以在[pancakeswap.info的token页面](https://pancakeswap.info/token/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82)看到 当前CAKE的价值显示为$0.64

通过仔细翻流量+F12看前端js+学GraphQL的写法，发现这个图查询可以一次返回两个内容：

[https://api.bscgraph.org/subgraphs/name/wowswap/graphql](https://api.bscgraph.org/subgraphs/name/wowswap/graphql)

```
{
  tokens(where: {id: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82"}) {
    id
    name
    symbol
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
    txCount
    __typename
  }
  bundles(where: {id: 1}) {
    id
    ethPrice
    __typename
  }
}
```

查询到：

```
{
  "data": {
    "bundles": [
      {
        "__typename": "Bundle",
        "ethPrice": "40.4164616943543110107673755202366",
        "id": "1"
      }
    ],
    "tokens": [
      {
        "__typename": "Token",
        "derivedETH": "0.01577253120396104706816941010842497",
        "id": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "name": "PancakeSwap Token",
        "symbol": "Cake",
        "totalLiquidity": "17457173.064252540875767782",
        "tradeVolume": "529331425.317628506590140745",
        "tradeVolumeUSD": "270335080.4687124727090581348114777",
        "txCount": "659265",
        "untrackedVolumeUSD": "331587403.3835248774831009549837749"
      }
    ]
  }
}
```

将其中的`ethPrice`(实际上是BNB的价格)和`derivedETH`乘起来就是我们需要的价格了，算出来是`$0.6375`

通用一点还需要调用合约`userInfo(uint256,address)`查询自己的持仓，最后合在一起：

```
(自己的持仓+pendingpendingCake)*derivedETH*ethPrice
```
