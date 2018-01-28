n=int(input())
res=0
while n>1:
    res+=1
    if n%2==0:
        n=n//2
    else:
        n=(3*n+1)//2
print(res)