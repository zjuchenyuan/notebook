N,M=map(int,input().split())
M=M%N
theinput=input().split()
res=theinput[-M:]+theinput[:-M]
print(" ".join(res))