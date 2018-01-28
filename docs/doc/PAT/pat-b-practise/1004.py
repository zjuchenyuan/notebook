N=int(input())
data={}
for i in range(N):
    s=input().split()
    data[int(s[2])]=s[0]+" "+s[1]
print(max(data.items(),key=lambda i:i[0])[1])
print(min(data.items(),key=lambda i:i[0])[1])