primes={2:True,3:True}
theinput=int(input())
for i in range(2,theinput//2+1):
    j=2
    if primes.get(i,True)==False:
        continue
    while i*j<theinput:
        if i*j not in primes:
            primes[i*j]=False
        j+=1
theprime=[]
for i in range(2,theinput+1):
    if primes.get(i,True):
        theprime.append(i)
res=0
for i in range(1,len(theprime)):
    if theprime[i]-theprime[i-1]==2:
        res+=1
print(res)