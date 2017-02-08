import string
s={}
l={}
for i in range(4):
    s[i]=input()
    l[i]=len(s[i])
flag=1
A1={"A":"MON","B":"TUE","C":"WED","D":"THU","E":"FRI","F":"SAT","G":"SUN"}
res=""
for i in range(min(l[0],l[1])):
    if flag==1 and s[0][i]==s[1][i] and s[0][i] in A1:
        res=A1[s[0][i]]+" "
        flag=2
    elif flag==2 and s[0][i]==s[1][i] and s[0][i] in "ABCDEFGHIJKLMN":
        res+="%d:"%(ord(s[0][i])-ord('A')+10)
        flag=3
    elif flag==2 and s[0][i]==s[1][i] and s[0][i] in string.digits:
        res+="%02d:"%(int(s[0][i]))
        flag=3
for i in range(min(l[2],l[3])):
    if s[2][i]==s[3][i] and s[2][i] in string.ascii_letters:
        res+="%02d"%i
        break
print(res)