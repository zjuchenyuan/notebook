# 写在前面

一点关于C的建议咯，也包含C++

----

## 关于Dev C++

* 有时候会发生改了代码但运行起来是旧版本的情况，需要检查是否关闭了正在运行的exe，如果是工程需要按F12全部重新编译清空缓存

* 编译工程错误定位在Makefile说明有函数声明了但没有定义，或者可能是出现了多个文件同名函数，小心其创建工程的时候自动产生的main.c

* 如果单纯只需要编译一个C文件，为追求编译速度可以考虑使用tcc (Tiny C Compile)编译器，参见[https://qs1401.com/?post=18](https://qs1401.com/?post=18)

* 不要在一个项目中混用.c和.cpp，将导致`ld`链接的时候函数找不到。因为编译.cpp的时候是C++的编译，由于要支持重载，编译器会自动修改函数名称，导致代码中同样名字的函数编译出来的.o文件里面函数名称是不同的，这样.c找不到.cpp的函数，自然无法链接

----

## 输入的问题

我建议所有的输入全部使用gets完成，然后再用sscanf读取到变量，可以有效防止scanf在一行出错波及到下一行

当然更安全的是 `fgets(buf,9999,stdin);` 但这种方法会得到\n字符

另外，无论是scanf还是sscanf，赋值给int/double等类型的变量一定要写&符号！

以下代码演示这种输入方法，对输入的n个数调用qsort排序；输入格式：第一行 N表示数的个数，第二行 N个需要排序的数(N<1000)

```cpp
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

----

## 解决g++省略拷贝构造函数的问题

g++为了防止在函数返回值是对象的时候，拷贝构造被调用多次，即使拷贝构造函数有副作用，也会被优化掉（直接就不调用拷贝构造函数了）

为了解决这个问题，从而证明教材上的正确性/语言的特性，需要在编译（不是链接）的时候加入以下开关：

```
-fno-elide-constructors
```

----

## [数据结构]树的遍历

允许不确定个元素的子节点个数，要求给出所有从根节点开始到叶节点的路径

我是这么写的遍历循环（伪代码），其中p1和p2是指向节点的指针：

```
路径=[根节点]
while(循环条件):
    while (p2=p1的下一个没有遍历过的子节点)不为空:
        把p2加入路径
        p1=p2
    if p1为叶节点:
        得到了一条从根节点到一个叶节点的路径
    路径pop，换言之，删掉最后加入的节点
    p1=p1的父节点（就是回溯）
```

其中关键的**p1的下一个没有遍历过的子节点**的实现是这样子的：

```
if 当前孩子的下标>=孩子总数:
    return NULL
else return 子节点数组[当前下标++]
```

卖个关子。。。请思考一下循环条件应该写啥？

### 遍历的循环条件

一开始我写的是：“根节点还有未遍历过的子节点”，但是这么写在这里就出了问题，由于标记已经遍历的子节点发生在真正遍历完子节点之前（我用的return 数组[下标++]），在循环根节点的最后一个子节点的时候会提前结束循环，导致没能遍历所有节点！

正确的写法是：**路径的元素个数>=1**

路径可以用vector实现，元素个数就是vector的size()，只有遍历完成了整个树之后，根节点才会被pop出来，结束循环。

### 使用面向对象的思想

这个题目我使用了C++来写，果然比C好多了。。。只要想好接口就能很方便地实现需要的功能啦（不过还是Python内置的list好多了，C++的vector各种const的坑

这里分享一下我设计的接口：

```
class Node{
	public:
		Node();
		void setChildNum(int num); //为子节点的指针的数组分配空间
		void addOneChild(Node* child);
		void setData(int data);
		int getData();
		void setParent(Node* parent);
		Node* getParent();
		Node* getCurrentChild(); //获得当前还没走过的子节点，并且把返回的子节点标记为走过了
		bool hasChildToGo(); //这个节点是不是所有的子节点都完成了
		bool isLeafNode(); //这个节点是不是叶节点
	private:
		//...省略咯...
};
class Nodes{ //存储路径的Nodes
	public:
		void append(Node* x); //把节点加入路径
		void pop(); //删掉最后加入的那个节点
		int getSumData(); //路径上所有节点的data的和
		int length(); //路径当前的长度
		friend bool cmp(const Nodes& a,const Nodes&b); //用于对路径进行排序
		friend ostream& operator<<(ostream& out,Nodes& x); 
	private:
		vector<Node*> data;
};
```