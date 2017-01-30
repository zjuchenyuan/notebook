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

要考虑到负数的结果啊~和C一致

### 数组

声明引用、初始化之后才能用

不允许int a[5]; 只能int[] a = new int [5];

如果要初始化 int[] b = new int[]{1,2}; 可以简化为 int c[] = {1,2};

### switch

boolean是不行的；String是可以的！

### ==

一定是比较地址，如果"haha"在代码中出现两次，他们的地址是一样的