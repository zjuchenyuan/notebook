T=int(input())
for i in range(T):
    A,B,C=map(int,input().split())
    if A+B>C:
        res="true"
    else:
        res="false"
    print("Case #{i}: {res}".format(i=i+1,res=res))