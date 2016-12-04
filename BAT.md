#写在前面

在没有接触到C和Python之前，我也常用BAT和一堆第三方的exe做事情

年少无知的岁月呀~

----
#来一个死循环吧 for

> 用于结束进程，或者DNS查询（买了个域名tmd咋解析还没好

    for /l %i in (1,1,9999999) do ...

----
#结束进程 taskkill

> woc，咋我开了这么多cmd，一个个结束太烦了，不如taskkill一波

    taskkill /f /im cmd.exe
    
----
#内存整理 free

> 微软自己出的一个内存整理工具，需要管理员权限；原理我没搞懂

> exe在download/empty.exe

    empty *

----
#睡一会 sleep

> 程序需要等待一定时间再继续运行就可以sleep啦

> exe在download/sleep.exe，来自GNU coreutils

    sleep 10
    
----
