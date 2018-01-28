N=int(input())
data={}
for i in range(N):
    line=list(map(int,input().split()))
    data[line[0]]=line[1]
    data[line[1]]=line[0]
input()
line=set(map(int,input().split()))
res=[]
for i in line:
    if i not in data or data.get(i,-1) not in line:
        res.append(i)
print(len(res))
print(" ".join(["%05d"%i for i in sorted(res)]),end="")