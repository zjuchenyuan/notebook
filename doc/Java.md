## Java的神奇(keng)

记录一下Java与C的不同点，感受Thinking in Java

### 变量名称

$就是个普通字符，可以int $a; //php表示mdzz

### main函数

必须是public static void main(String[] args)

如果没有static，编译能通过但没有执行结果？// 待考证，eclipse拒绝运行

### if

if中的东西必须是boolean类型的值，不能把int放入if中

if ( a = true )的坑还是存在的，允许赋值作为if条件

### %取余的结果

要考虑到负数的结果啊~（和C一致）

### 数组

声明引用、初始化之后才能用

不允许int a[5]; 只能int[] a = new int [5];

如果要初始化 int[] b = new int[]{1,2}; 可以简化为 int c[] = {1,2};

但不能出现d={1,2}; 不允许大括号这玩意用来赋值，只准用于初始化

### switch

boolean是不行的；String是可以的！

case是不能重复的（和C一致）

### ==

一定是比较地址，如果"haha"在代码中出现两次，他们的地址是一样的

### 类型自动提升

int long float double

最高出现哪个全部提升为哪个，都没有就全部提升为int

所以要这么写才能把byte*2：byte b = (byte)(a*2);

### 内部类

加上static后：可以不用实例化外部类就创建对象，不能访问外部类非静态的数据

不加static：需要先实例化外部类new OuterClass().new InnerClass()