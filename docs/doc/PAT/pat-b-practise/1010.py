theinput=list(map(int,input().split()))
xishu=[theinput[i] for i in range(len(theinput)) if i%2==0]
zhishu=[theinput[i] for i in range(len(theinput)) if i%2==1]
theinput=dict(zip(zhishu,xishu))
res={}
for i in theinput:
    if i==0:
        continue
    res[i-1]=i*theinput[i]
result=[]
for i in sorted(res.keys(),reverse=True):
    result.extend([str(res[i]),str(i)])
if not result:
    result=["0","0"]
print(" ".join(result))