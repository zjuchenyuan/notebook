def judge(s):
    P,A,T=map(s.count,"PAT")
    if P!=1 or T!=1 or P+A+T!=len(s):
        return False
    try:
        A1=len(s.split("P")[0])
        A2=len(s.split("P")[1].split("T")[0])
        A3=len(s.split("T")[1])
    except:
        return False
    if A2==0:
        return False
    if A1==A3==0:
        return True
    if A3-A1*(A2-1)<=0:
        return False
    return True

N=int(input())
for i in range(N):
    s = input()
    if judge(s):
        print("YES")
    else:
        print("NO")