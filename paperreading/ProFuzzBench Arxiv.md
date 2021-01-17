## ProFuzzBench
[[协议fuzzing]] [[fuzzing]]

https://github.com/profuzzbench/profuzzbench

协议fuzzing的特别之处：
stateful 不仅仅取决于当前执行的单个消息（已经很大空间了），还可以由之前执行过的消息的组合影响

Research on fuzzing is of experimental nature
依赖于heuristics 比如seed选择 mutator——比如数组越界 那就设计出interger的变异策略

人家选择的协议、实现、描述、状态在哪、相关paper和工业界工具
![[Pasted image 20210117010835.png]]

设计benchmark：
怎么选的目标，实现自动化测试，讨论open question

修改被测程序：
- 去掉随机化 保证可重现性 可比较性
- 减少或移除延迟
- 针对AFLNET的要求 需要加marker表示结束
- fuzzer需要keep track of协议状态 给不同状态不同返回值

### 表达

做benchmark邀请大家来用，来扩展：
We release the benchmark as open-source, inviting the community to use it for evaluation of new fuzzing techniques, and for further extend it with more targets.

用gcov编译的表达：
第二次编译，在fuzzing结束后用来算覆盖率指标
The target software is compiled a second time with support for gcov: this binary will be used in the last stage of the benchmark, in order to compute coverage metrics after fuzzing.

协议fuzzing的open questions:
- 多方协议 配置文件复杂不同配置决定了不同覆盖率上限；VoIP call需要两个client，目前没有工具考虑
- 确定性执行 大量使用线程和基于事件的IO 有些程序的稳定性仍然低于50%
- 执行速度 SIP速度5次/秒 DAAP每次执行都需要2秒初始化
- 确定状态 即使有源码也可能需要推断状态 如RTSP消息里面没有当前状态

每一节讨论了啥：
- Section 3 elaborates on ...
- presents ...
- discusses challenges for ...
- concludes the paper
- the table provides a brief description of ...

