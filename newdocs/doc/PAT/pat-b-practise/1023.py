theinput=list(map(int,input().split()))
s=""
res=""
for i in range(10):
    s+=theinput[i]*str(i)
for i in range(len(s)):
    if s[i]=='0':
        continue
    else:
        res=s[i]+s[:i]+s[i+1:]
        break
print(res)