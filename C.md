# C语言

一点关于C的建议咯，也包含C++

顺带附上几个题目和我写的解答


----

## 关于Dev C++

* 有时候会发生改了代码但运行起来是旧版本的情况，需要检查是否关闭了正在运行的exe，如果是工程需要按F12全部重新编译清空缓存

* 编译工程错误定位在Makefile说明有函数声明了但没有定义，或者可能是出现了多个文件同名函数，小心其创建工程的时候自动产生的main.c

* 如果单纯只需要编译一个C文件，为追求编译速度可以考虑使用tcc (Tiny C Compile)编译器，参见[https://qs1401.com/?post=18](https://qs1401.com/?post=18)；另外你可以修改编译的优化参数，不要用`-O3`这种更适合正式发布时的优化选项

* 不要在一个项目中混用.c和.cpp，将导致`ld`链接的时候函数找不到。因为编译.cpp的时候是C++的编译，由于要支持重载，编译器会自动修改函数名称，导致代码中同样名字的函数编译出来的.o文件里面函数名称是不同的，这样.c找不到.cpp的函数，自然无法链接；不过还是有技巧的：extern "C"包住即可

* 注意指针的星号别少写：想一次写两个指针？不能写`FILE* fp1,fp2;`而是每个变量前面都要带上星号！正确写法：`FILE *fp1,*fp2; char *s1,*s2;`

----

## 输入的问题

在开发真实用户会使用的命令行程序时，我建议所有的输入全部使用gets完成，然后再用sscanf读取到变量，可以有效防止scanf在一行出错波及到下一行

当然更安全的是 `fgets(buf,9999,stdin);` 指定最多读取多少个字节避免栈溢出，但这种方法会得到\n字符

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

## 对一个const的vector使用迭代器要用const_iterator

有时候函数参数就规定了必须是const的，如sort的比较函数，而比较的对象又是vector

方法就是用`vector<你的类型>::const_iterator`

----

### 小心未初始化的变量

写代码的时候最好声明的时候就立刻初始化，未初始化的变量是未定义行为，可能出现加了个printf就好了，去掉printf就炸了的情况。

你可以在Linux上使用`gcc -fsanitize=undefined`编译，让Undefined Sanitizer为你找出错误；顺带一提，ASAN也很有用，[参见](https://www.freebuf.com/news/83811.html)

----

## 获取文件大小

Python里很简单 你可以os.path.getsize(filename) 这个本质上调用的是os.stat；下面的方法是打开文件，用fseek跳转到文件结束

Learned from: http://blog.csdn.net/chenglibin1988/article/details/8750480

```
long int get_file_size(char* filename){
    /*
     * 使用fseek和ftell获取文件大小，失败时返回-1 
     */
    int filesize;
    FILE* fp = fopen(filename,"rb");
    if( NULL == fp ) return -1;
    fseek(fp,0,SEEK_END);
    filesize = ftell(fp);
    fclose(fp);
    return filesize;
}
```


----

## C程习题解答

学习一下各种坑爹的题目也是很不错的嘛（其实我就是为了把我的解析发上来。。。

### 1.结构指针

#### 题目

```
对于以下结构定义，p->str++中的++加在____。
struct {int len; char *str}*p;
A.指针str上     B.指针p上    C.str指向的内容上   D.语法错误
```

#### 答案

D

#### 一句话解释

你再仔细看看？是不是少了个分号？

#### 详细解释

这个题目这么写编译存在语法问题的，而且运行也会炸

你试试复制到Dev C++编译看看？

```
[Error] expected ';' at end of member declaration
```

这个错误很显然的嘛，缺少了分号，正确写法：

```
struct {int len; char *str;} *p;
```

#### 这就够了吗？

p是一个指针，对指针使用->运算符之前必须要给指针一个空间(正确的值)，否则就会导致*null而段错误炸掉

另外 这个struct没有名字，也就意味着无法给他赋值，不能被赋值的指针有什么用呢？

正确的写法如下：

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(){
    char string[666]="abcd"; //准备一个字符串
    struct name {int len; char *str;} s;//首先要给struct取一个名字name，顺带用这个名字创建一个实例s
    s.str = string; //对这个实例的str赋值为string的地址
    struct name *p = &s; //然后是用struct name来创建一个指向结构的指针p
    p->str++;//相当于s的str++了，str原来指向"abcd"字符串的'a'，现在指向'b'
    puts(p->str);//输出bcd
}
```

#### 回顾一下

1. struct必须要有一个名字

2. struct大括号中的每一项都必须**以分号结尾**

3. 使用指针取值 如`*p` , `p->something`之前指针的值必须设置好

4. 遇到不会的题目，为啥不自己问问编译器呢？

----

### 2.结构数组

#### 题目

```
对于以下的变量定义，表达式____是正确的。
struct node {
    char s[10];
    int k;
} p[4];
A. p->k=2
B. p[0].s="abc";
C. p[0]->k=2;
D. p->s='a';
```

#### 答案

A

#### 解析

`p[0].num` 与 `(*(p+0)).num` 等价, 所以 `p[0].num` 与 `(p+0)->num` 等价

编译一下确实A是可以的

B选项错在结构体里面的s是一个有内存空间的char数组，**不能把有内存空间的数组名称放到赋值的等号左边** (编译器把数组名称当成常量，编译器这么设计的原因也许是：不然这个内存空间不就弄丢了嘛)

字符串正确的"赋值"操作是： 

```
strcpy(p[0].s,"abc");
```

C选项 p[0]是结构，而不是指针，直接写`p[0].k=2`


D选项 还是相同的道理 **不能把有内存空间的数组名称放到赋值的等号左边**

正确的写法 `p->s[0]='a'`, 也可以写 `p[0].s[0]='a'`


#### 指针，数组各种玩法

如果要写`p[1].s[2]='a'`, 等价的写法有：

```
(p+1)->s[2]='a';
*((p+1)->s + 2)='a';
*((char*)p+1*sizeof(struct node)+2)='a';
```

此代码供你测试：

```
#include <stdio.h>
int main(){
    struct node{
        char s[10];
        int k;
    } p[4];
    p[1].s[2]='a';
    printf("%c\n",p[1].s[2]);
    (p+1)->s[2]='b';
    printf("%c\n",p[1].s[2]);
    *((p+1)->s + 2)='c';
    printf("%c\n",p[1].s[2]);
    *((char*)p+1*sizeof(struct node)+2)='d';
    printf("%c",p[1].s[2]);
    return 0;
}
```

### 数组的数组

题目：

```
 以下程序的输出结果是_________________。
	#include <stdio.h>
	#include <string.h>
	typedef char (*AP)[5];
	AP defy(char *p)
	{
	   int i;
	   for(i=0; i<3; i++)
	      p[strlen(p)] = 'A';
	   return (AP)p + 1;
	}
	void main()
	{
	   char a[]="FROG\0SEAL\0LION\0LAMB";
	   puts( defy(a)[1]+2 );
	}
```

解答：

搞清楚指针的类型这个题目就很简单了，另外记住这个公式：

```
x[i] = *(x+i)
```

p[strlen(p)] = 'A'; 就是把\0的地方改成了字符A

所以我们的a是这样子的：

从一维数组来看a是 FROGASEALALIONALAMB

从5字节char的数组的数组来看是 

```
    "FROGA", //虽然这里写的是字符串，但末尾没有\0
    "SEALA",
    "LIONA",
    "LAMB\0"
```

defy(a)[1]就等价于`*(defy(a) +1)`，就是`*( ((AP)a)+1 +1)`，就是((AP)a)[2]

AP这个类型是指针，指向的元素是 5字节大小的数组，

所以((AP)a)[2]的类型是`char*`，指向的是"LIONA"这个元素

但是当我们把这个元素当成`char*`用puts输出的时候，由于末尾没有`\0`，所以要继续输出，就是"LIONALAMB"

再+2就是要跳过两个字节，得到答案"ONALAMB"

举一反三：

1. puts(((AP)a)[0])输出啥？假设没有调用defy(a)
2. puts(((AP)a)[0])输出啥？假设已经做了defy(a)
3. puts(((AP)a)[0]+3)输出啥？假设已经做了defy(a)
4. defy(a)[2][1]+1是什么类型？值是多少？
5. puts(&defy(a)[2][1])输出啥？
6. defy(a)之后再puts(&defy(a)[2][1])输出啥？

答案：

1. FROG
2. FROGASEALALIONALAMB
3. GASEALALIONALAMB
4. char类型 'B' 这个是char的'A'再加一
5. AMB
6. 发生了数组越界读写，这是undefined behaviour

