# Python程序设计课程

# Python HW1 常见错误

## 先本地测试能通过再提交

PTA没有提供详细的报错，你都不知道错哪了怎么改，建议你试试本文提到的错误，记住错误信息下次遇到也就不慌了

本地Python跑成功再提交提高效率，省点时间

## 全角的符号

```
a=int（input（））
b=int（input（））
print(a+b)
```

报错：

```
  File "<stdin>", line 1
    a=int（input（））
                 ^
SyntaxError: invalid character in identifier
```

看出`(`与`（`的区别了嘛，Python语言的括号要求半角的括号

**解决方案： 关掉中文输入法！**

## input只读取输入的一行

看清楚题目，如果题目有两行输入，就需要两次input()

如果题目只有一行输入，比如一行同时给了两个数空格分隔，你需要`input().split()`

### 扩展一下：你可以使用`map`函数来批量调用函数

用法是`map(目标函数，列表)`

返回 列表每个元素调用目标函数的结果的**迭代器 iterator**，再用list可以得到列表

举个例子题目要在一行中输入多个整数

```
# map实际上返回的是迭代器，被读到的时候才会真正调用目标函数，想得到列表还需要用list
>>> map(int, input().split())
222 444
<map object at 0x000001D87FB4DAC8>

>>> list(map(int, input().split()))
222 444
[222, 444]

>>> a, b = map(int, input().split())
333 555
>>> a
333
>>> b
555
```

## 不要输出任何多余的提示信息

```
A=int(input('被加数'))
B=int(input('加数'))
print(A+B)
```

PTA判题就是判断你程序的输出是否 **和标准答案完全一致 完全一致 完全一致**

题目没有要求你输出`被加数`这种提示信息，你就啥也别输出，不要画蛇添足！ 

**解决方案： 直接input()就行了**

## input函数返回的是字符串

别忘了把字符串转成你需要的类型，比如int()

字符串加字符串是拼接， 字符串不能和整数相加

```
>>> "1"+"2"
'12'
>>> 1+2
3
>>> "1"+2
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: can only concatenate str (not "int") to str
```

## 注意类型转换的int是要调用的 和C语言不一样

这是C语言的语法，Python不支持

```
sum = (int)x + (int)y
```

应该写：

```
sum = int(x) + int(y)
```

另外 不建议命名为sum，因为sum本身是Python的内置函数 你赋值了就不能再调用原来的sum函数了

如果你覆盖了sum之后再去调用sum函数 会报错

```
>>> sum=1
>>> sum([1,2])
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'int' object is not callable
```

你还可以这么做：用map和列表推导式

```
s = sum(map(int, [x,y]))
s = sum([int(i) for i in [x,y]])
```

## 注意括号的匹配

```
a,b,c=map(int,(input().split())
```

多了一个(， 细心一点即可 报错：

```
SyntaxError: unexpected EOF while parsing
```

## 方法是需要调用的

```
a,b,c=input().split
```

末尾少了() 报错：

```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: cannot unpack non-iterable builtin_function_or_method object
```

## 注意缩进 不能有多余空格

```
s="Python语言简单易学"  
     print(s)
```

第二行多了前面的空格，会报错：

```
  File "<stdin>", line 1
    print(s)
    ^
IndentationError: unexpected indent
```

# Python HW2 常见错误

## print的用法

错误示例：

```
print(sum = s)
```

你要站在语言开发者的角度思考，你括号里sum表示的是字面意思上的"sum"字符串呢还是内置的sum函数呢？语言的设计要保证没有歧义

正确的写法：需要原样输出的都要加上引号！

```python
print("sum =", s)
```

这个题目要求等号两边有空格，如果没有注意到这一点会**格式错误**

print可以接受不定数量的参数，在输出的时候**每个参数之间会加上空格**，所以上述字符串里等号**右边是不写空格**的

### 你还可以使用f-string

上述写法可以替换成：

```python
print( f"sum = {s}" )
```

注意到字符串引号前面的f，说明这个字符串是一个模板，Python遇到这个字符串会自动把s的值填进去。

f-string在Python3.7里面引入，PTA是支持的，如果你的Python版本低于3.7，你可以用这些通用的写法（只是不够美观了）：

```python
print("sum = {}".format(s)) # 需要记清楚多个变量之间的顺序 
print("sum = {s}".format(s=s)) # 每个变量都要写一遍
print("sum = {s}".format(**locals())) # 直接把所有局部变量都提供给format 就不用自己写了
# 如果用在函数里，你可能想输出全局变量，未完待续
```

### 注意引号括号的匹配，尤其是变得复杂的时候

错误示例 看看引号的结束位置

```
print(f'f({x:.1f}) = {1/x:.1f'})
```

正确的写法是

```python
print(f'f({x:.1f}) = {1/x:.1f}')
```

## for,if,else右边都要有分号，每个分号的下一行增加缩进

错误示例

```python
num = float(input())
if num < 0 :
    print('Invalid Value!')
elif num <= 50:
    cost = num * 0.53
print("cost = %.2f" %  cost)
else:
    cost = 50*0.53+(num-50)*(0.05+0.53)
print("cost = %.2f" %  cost)
```

elif里面的print没有缩进，else必须和elif和if平级，之间的代码必须更多缩进

修改方法：去掉上面的print或者两处print都增加缩进


## 继续强调 不要出现中文括号

顺带强调不要在PTA里解题，先去Python IDLE或者thonny里**本地做出来再复制粘贴提交**

你的每次错误提交我都会看，你反复出现同一次错误让我很烦

你信不信这个错误下次作业还会出现

错误示例

```python
if（x<0）:
    print("Invalid Value!")
```

Python的if也不需要括号，直接写就行


```python
if x<0:
    print("Invalid Value!")
```

## 不要出现return 0

如果你一定要让程序立刻退出，用`exit(0)`，效果等价于C语言main函数里`return 0;`

## 看清题目

### 输入实数别用int()

题目说 
输入在一行中给出**实数**x

你需要`float(input())`

### 看清题目输入的格式

比如题目输入的例子是这样的

```
  1,  5
```

你就不能用 `a,b=input().split()`

而应该 `a,b=input().split(',')`

也不应该两次input()，只有输入是两行的时候才能调用两次input

### 看清题目的允许范围

题目说 lower≤upper≤100，那么肯定就会有测试点lower等于upper，这是符合要求的 不要错误的输出了
Invalid.

## 复制粘贴题目的文本就行 不要自己敲

自己输入就容易出错，从题目复制多简单

## 不要追求一行写完

```python
cost = float(input())
print("Invalid Value!" if m<0 else "cost = "+str(format(0.53 * cost + (0 if cost <= 50 else 0.05 * (cost-50)),'.2f')))
```

代码是给人看的，这种写法不容易看出哪里出错了，老老实实写if呗

这个错误是未定义的m

另外变量的命名，题目输入的是电量，与cost命名不一致，这会让读者困惑（读者很有可能就是以后的你，不要给自己挖坑）

## 乘法要写乘号

错误写法：`2i` 报错`SyntaxError: invalid syntax`

正确写法：`2*i`

错误写法：`area=sqrt(s(s−a)(s−b)(s−c))`  报错`TypeError: 'int' object is not callable`

正确写法：`area=sqrt(s*(s−a)*(s−b)*(s−c))`

## int用作进制转换 参数是 字符串,整数

你需要给出正确的类型 否则报错：

```python
>>> int("100",2)
4

>>> int(100,2)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: int() can't convert non-string with explicit base

>>> int("100","2")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'str' object cannot be interpreted as an integer
```

## 字符串的join 需要每个元素都是字符串

你不能`",".join([1,2,3])` 会报错：`TypeError: sequence item 0: expected str instance, int found`

你可以先转换成str： `",".join([str(i) for i in [1,2,3]])`

## 注意边缘情况

题目说的 输出格式 要认真体会

首先顺序输出从A到B的所有整数，每5个数字占一行，每个数字占5个字符宽度，向右对齐。最后在一行中按Sum = X的格式输出全部数字的和X。

```
   -3   -2   -1    0    1
    2    3    4    5    6
    7    8
Sum = 30
```

你考虑到最后一行正好凑满5个整数，你会多输出一个空行吗？

另外这个题目暗含着 每行末尾不能有空格 的要求，你能用`end=' '`吗?

-----

# Python Week3 答疑

## 学会自己造数据

不要满足于题目给的样例，发挥主观能动性自己造数据看看，比如边界值（最大最小）、错误值

## 注意输出格式对顺序的要求
例如查验身份证的题目，输出格式的要求是：**按照输入的顺序**每行输出1个有问题的身份证号码

那你就不能这么写两次循环，一遍输出前17位有非数字的，一遍输出校验位不对的，只能一次循环完成

虽然两次循环逻辑上是对的，却没能满足题目的要求，就答案错误了；恰好题目的样例是先非数字错误再校验位错误，但这只是个样例，**样例里的规律只要人家没说一律不算数的！**

## 如何判断一个字符是整数？

最简单的方式： x.isdigit()

也可以： '0'<=x<='9'

不建议的方式： 48<=ord(x)<=57 你不是在写C语言，没必要转换为整数判断

附带知识点：python里 `a<x<b`  等价于 `a<x and x<b` 

## 字符串比较大小是个坑

这个东西是True还是False?

```
"2">"11"
```

答案是True，震惊！2居然比11大？！ 

注意这是两个**字符串之间的比较**，字符串的比较规则是 **逐字符比较，相同就继续比较，遇到一个不相同就得出最终的比较结论**。

这里比较第一个字符2和1，2是大于1的，ok比较完成 "2">"11"。

同理 "2">"199999999"，无论9有多少个都不会参与比较。

举一反三：max("8", "9", "10")是多少？

当题目要求整数的排序的时候，一定要用int转成整数

## 区分.sort()和sorted

```python
x=[3,1,2]
for i in x.sort():
    print(i, end=' ')
```

上述代码正确吗？会输出`1 2 3 `嘛？

.sort()返回的是None，不能用来迭代；这是一个原地排序，直接修改原数组，不会创建新的数组

对于上述代码，你需要用sorted(x)；这不会修改原数组，而是创建了一个新的数组

```python
x=[3,1,2]
for i in sorted(x):
    print(i, end=' ')

print(x)
```

输出是`1 2 3 [3, 1, 2]`，可以看出使用sorted不会修改原来的x

## 格式化字符串们

### "%5.2f"是啥意思

```python
>>> "%5.2f"%1.2
' 1.20'
>>> "{:5.2f}".format(1.2)
' 1.20'
>>> "{:>5.2f}".format(1.2)
' 1.20'
```

点就是小数点，点2就是小数点后保留两位小数，前面还有一个5是啥呢，表示整体不够5位就左边用空格补齐5位，注意上述输出左边是有一个空格的。

如果用format，可以看出写法基本相同，这是右对齐用`>`

```python
>>> "%-5.2f"%1.2
'1.20 '
>>> "{:<5.2f}".format(1.2)
'1.20 '
```

加了一个负号，变成了右边补空格；这是左对齐所以用`<`

### 那我要居中怎么办

```python
>>> "{:^7s}".format("xyz")
'  xyz  '
```

那就用^呗，这是按Shift+6按出来的符号

### 格式化字符串想输出几个变量就要写几个

```python
"{:d}{:>6.1f}".format(fahr, celsius)
```

这里有两个变量要输出，所以要两个格式化字符串

## Thonny的用法

在上半部分写代码，改代码，按F5执行后 在下半部分Shell里输入用户的输入，查看输出

不要在它的Shell里敲入代码，因为它不支持多条语句

## 初始化能在循环体内吗？

比如题目要求没有错误的身份证就输出All Passed!，下面的伪代码错在哪？

```python
对每一个身份证:
    flag = 1 #1表示没错
    if 身份证错了:
        flag = 0 #只要有一个错了 flag置0

if flag:
    print("All Passed!")
```

flag=1是一个初始化语句，放在循环里面就会导致每次循环都进行初始化，就变成了只要最后一个身份证没错最后flag就是1，你会错误的输出All Passed!

**变量的初始化需要在进入循环之前做完**

## 学会拆分问题 大而化小

题目要求实现aa+aaaa+...+aaa……a(n个a)求和

拆分成两个问题：怎么得到n个a？ 怎么循环从2到n求和？

不要把这两个问题混在一起思考，如果你不知道可以用字符串乘以整数，那你可以先假设有这么一个函数getna(n, a)，累加就是：

```python
a='5'
n=4 #实际上需要input()，我们这里就直接写了 需要计算55+5555

s = 0
for i in range(2, n+1, 2):
    s += getna(a, i)
```

然后我们再去实现getna这个函数，这个函数就干一件事情——输入a和n，输出aaa...a(n个a)这么一个整数

输入a='5',n=4，输出5555

这次我用循环乘法，可以看成`5 + 5*10 + 5*10*10 + 5*10*10*10` 每次循环都是5乘以一个数，这个数从1开始 每次循环后乘以10

```python
def getna(a, n):
    # 这里我们需要a也是一个整数
    a, n = int(a), int(n) #防御性编程，你不知道调用者是否给了需要的类型，反正转换一下不费事
    multiply = 1
    res = 0
    for i in range(n):
        res += a*multiply
        multiply *= 10
    return res
```

测试一下自己对不对：

```python
>>> getna("5",4)
5555
```

最后把两部分拼起来就行咯

```python
def getna(a, n):
    # 这里我们需要a也是一个整数
    a, n = int(a), int(n) #防御性编程，你不知道调用者是否给了需要的类型，反正转换一下不费事
    multiply = 1
    res = 0
    for i in range(n):
        res += a*multiply
        multiply *= 10
    return res

a='5'
n=4

s = 0
for i in range(2, n+1, 2):
    s += getna(a, i)

print(s)
```

当然这个题目有简化做法：

n个a这个整数用 字符串乘以数字得到字符串 再int转整数`int(str(a)*int(n))`

从2到n每次递增2，用range(2,n+1,2)

本质上是一个列表求和，所以可以直接用sum函数，range返回的东西可以看成一个列表，**列表转换成另一个列表用列表推导式就行** 写法：[something(i) for i in ...]

```python
a='5'
n=4
print( sum([ int(str(a)*int(i)) for i in range(2,n+1,2) ]) )
```

## 混在一起的and和or

and的优先级比or高

```
x=5
y=False
z=False

print(x or y and z)
```

这个等价于print(x or (y and z)) 先计算False and False是False，然后x or False因为x是真的 结果就是x

输出5

### a and b

返回的只可能是a和b之间的一个，a是真的就返回b，a是假的就返回a

```
>>> 1 and 6
6
>>> [] and 6
[]
```

### a or b

返回的只可能是a和b之间的一个，a是真的就返回a，a是假的就返回b

```
>>> 1 or 6
1
>>> [].sort() or 6
6
```

还记得上面说的.sort()返回None吗？ None是假的噢

### 哪些东西是假的？

0是假的，空的东西`'', [], {}`是假的，False是假的，None是假的，其他的都是真的

搜索python False values可以搜到 https://docs.python.org/3/library/stdtypes.html

> Any object can be tested for truth value, for use in an if or while condition or as operand of the Boolean operations below.

> By default, an object is considered true unless its class defines either a __bool__() method that returns False or a __len__() method that returns zero, when called with the object. 1 Here are most of the built-in objects considered false:

- constants defined to be false: None and False.

- zero of any numeric type: 0, 0.0, 0j, Decimal(0), Fraction(0, 1)

- empty sequences and collections: '', (), [], {}, set(), range(0)

>Operations and built-in functions that have a Boolean result always return 0 or False for false and 1 or True for true, unless otherwise stated. (Important exception: the Boolean operations or and and always return one of their operands.)