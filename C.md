#写在前面
一点关于C的建议咯，也包含C++

----
#C++用sstream代替sprintf

```cpp
#include <string>
#include <sstream>
#include <iostream> 
using namespace std;
int main(){
    stringstream s;
    string result;
    int i = 1000;
    s <<"haha"<< i; 
    s >> result; 
    cout << result << endl; // print "haha1000"
    s.clear();
} 
```