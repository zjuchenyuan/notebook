# kennyloggings ccs2020

Logging to the Danger Zone: Race Condition Attacks and
Defenses on System Audit Frameworks

[[ccs2020]] [[log]] [[audit]]

在被黑后审计日志，至少知道被黑了， 打破之前的假设 事件的发生与日志的写入存在可以攻击的时间窗口，可以条件竞争攻击
防御方案：在内核做密码学commit 日志不可篡改——使用单向hash不断更新key （不可回退），每个event都更新 BLAKE2 hash来更新 SipHash伪随机来签名

需要保证顺序：用已有的critical section即可
为了性能考虑： 预先计算一大批key轮换，用完了就背景thread
还需要考虑关机怎么办：用TPM把当前签名的key给密封起来
对日志的修改、删除、插入重排、截断都能发现，截断的话可以在开始验证之前写一个新的message去验证之前消息的缺失
初始化的时候假设没联网 部署就没有额外的攻击面了

![[Pasted image 20201202205654.png]]
![[Pasted image 20201202205754.png]]

## 单词/写法

be concomitant with 伴随的
challenge this assumption by presenting and validating a ... attack 提出一种攻击来打破之前的假设
snatch 夺取 攻击者可以从buffer中夺取他们入侵行为的事件
incriminating 牵连 日志是入侵行为的证据
考虑有0day的攻击者 when considering a sophisticated adversary in possession of valuable zero-day kernel exploits
backlog 积压
be ingested for processing by ... 被用户态的audit daemon消化 认为是安全的
quiescent 静止的 不活动的
说明服务器有多少个CPU：with 8 logical CPU cores (4.20 GHz Intel Core i7-7700K)
攻击者狡猾 an astute adversary 
footprint 攻击足迹
protect against the perils described above 保护免于上述危险
Analogous to prior work 和前人的工作保持一致
falter 蹒跚地走 之前的方案不行
we extrapolate that 推测
further squeezing performance out of the scheme 挤出性能
Our empirical study of ... serves as a first step towards understanding this security-performance trade-off in practice 我们的研究是第一步
可以互补但需要注意性能 The more sophisticated schemes described here are interoperable with our system design, but careful **vetting** is required to ...
这个领域的攻击和防御都很多 There exist decades of research on highlighting and protecting from the dangers of race conditions in operating systems.

## 新知识

[[市场份额]] 全球日志管理软件 百万级
[[syscall]] 现代主机上每秒就会产生百万系统调用
取证相关audit ruleset: \[32, 60, 68, 89]
前向安全：攻击者获得tn时刻的秘密 不能伪造之前时刻的完整性证明

## 图表

用syscall的burst表示系统负载，测试不同负载下处理的延迟，重复200次 CDF
不同负载重复100次执行 两种攻击（local remote）拦截成功率 和 标准差
Microbenchmarks的syscall延迟 小图不同的系统调用，横坐标线程数量，比较Vanilla和自己
应用测试 还是比较时间算overhead，同时给出syscall events数量 说CPU密集型不受影响
预先计算key的优化效果

## future work

公开验证性 让第三方验证日志的authenticity 而不需要secret key
聚合验证 增加中间层可信验证者 证明中间这一段没有发生日志篡改 让后续的验证更快
后续又新的密码学算法成熟/硬件加速 性能还能提升
不要每个消息都换key 对一个epoch使用相同的key进行签名 攻击者足够快就能不被发现
对其他框架 Windows上
其他攻击策略 塞满buffer导致丢失或dos但这不够stealthy，攻击其他的队列：用户态队列，IO存储队列，网络队列



