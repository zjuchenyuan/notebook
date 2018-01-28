M,N=map(int,input().split())
"""
def mymethod(N):
    primes={2:True,3:True}
    for i in range(2,int(sqrt(N))+1):
        if primes.get(i,True)==False:
            continue
        #while i*j<N:
        for t in range(i*i,N+1,i):
            #if i*j not in primes:
            primes[t]=False
            #j+=1
    theprime=[]
    for i in range(2,N):
        if primes.get(i,True):
            theprime.append(i)
    return theprime
"""
def ola(N):#欧拉筛法
    prime=[]
    isprime=[True]*(N+1)
    isprime[1]=False
    for i in range(2,N):
        if isprime[i]:
            prime.append(i)
        for j in prime:
            if i*j>N:
                break
            isprime[i*j]=False
            if i%j==0:
                break
    return prime
data=ola(105000)
res=data[M-1:N]
while len(res)>10:
    print(" ".join([str(i) for i in res[:10]]))
    res=res[10:]
print(" ".join([str(i) for i in res]))