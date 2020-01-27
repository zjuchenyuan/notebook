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
var password = 随意设置一个密码，在内存中存储的加密后的私钥
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

pip3 install web3，需要python3.7 （[在Ubuntu10.04上安装Python 3.7](https://py3.io/Python/#ubuntu1604python37)）

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
