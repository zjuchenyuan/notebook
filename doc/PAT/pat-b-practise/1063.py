import math
N=int(input())
themax=0
for i in range(N):
    ans=list(map(float,input().split()))
    thisone=ans[0]**2+ans[1]**2
    if thisone>themax:
        themax=thisone
print("%.2f"%math.sqrt(themax),end="")