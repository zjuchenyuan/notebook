theinput=list(map(int,input()[::-1]))
res=""
for i in range(len(theinput)):
    if i==0:
        res="".join([str(i) for i in range(1,theinput[i]+1)])
    elif i==1:
        res="S"*theinput[i]+res
    else:
        res="B"*theinput[i]+res
print(res)