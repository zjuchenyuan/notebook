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