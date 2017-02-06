# 写在前面

一点关于C的建议咯，也包含C++

----

## 关于Dev C++

* 有时候会发生改了代码但运行起来是旧版本的情况，需要检查是否关闭了正在运行的exe，如果是工程需要按F12全部重新编译清空缓存

* 编译工程错误定位在Makefile说明有函数声明了但没有定义

* 如果单纯只需要编译C，为追求编译速度可以考虑使用tcc (Tiny C Compile)编译器，参见[https://qs1401.com/?post=18](https://qs1401.com/?post=18)

----

## 输入的问题

我建议所有的输入全部使用gets完成，然后再用sscanf读取到变量

当然更安全的是 `fgets(buf,9999,stdin);` 但这种方法会得到\n字符

以下代码演示这种输入方法，对输入的n个数调用qsort排序；输入格式：第一行 N表示数的个数，第二行 N个需要排序的数(N<1000)

```C
#include <stdio.h>
#include <stdlib.h>
char buf[9999];
int data[1005]; //不要在局部变量定义大数组，会炸栈
int cmp(const void* a,const void* b){
    return *(int*)a-*(int*)b;
}
int main(){
    int N,i;
    gets(buf);
    sscanf(buf,"%d",&N);
    gets(buf);
    for(i=0;i<N;i++) {
        sscanf(buf,"%d %[^\n]",&data[i],buf);
    }
    qsort(data,N,sizeof(int),cmp);
    for(i=0;i<N-1;i++) printf("%d ",data[i]);
    printf("%d",data[i]);
}
```

----

## C++用sstream代替sprintf

```cpp
#include <string>
#include <sstream>
#include <iostream> 
using namespace std;
int main(){
    stringstream s;
    string result;
    int i = 1000;
    s <<"haha "<< i; 
    getline(s,result); // the whole line rather than just the first word
    cout << result << endl; // print "haha1000"
    s.clear();
} 
```