theinput=list(map(int,input().split()))
del(theinput[0])
T={}
A={}
for i in range(1,6):
    T[i]=[j for j in theinput if j%5==i-1]
    if not T[i]:
        A[i]="N"
    else:
        if i==1:
            A[1]=sum([j for j in T[1] if j%2==0])
            if A[1]==0:
                A[1]="N"
        elif i==2:
            t=1
            A[2]=0
            for x in T[2]:
                A[2]+=t*x
                t=-t
        elif i==3:
            A[3]=len(T[3])
        elif i==4:
            A[4]="%0.1f"%(sum(T[4])/len(T[4]))
        elif i==5:
            A[5]=max(T[5])
print(" ".join([str(A[i]) for i in A]))