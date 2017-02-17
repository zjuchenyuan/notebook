input()
cache={1:[1]}
def calc(n):
    global cache
    result=[n]
    if n in cache:
        return cache[n]
    if n%2==0:
        result.extend(calc(n//2))
    else:
        result.extend(calc((3*n+1)//2))
    cache[n]=result
    return result
fancha={}
theinput=list(map(int,input().split()))
for i in theinput:
    x=calc(i)
    for t in x:
        if t not in fancha:
            fancha[t]=set([])
        fancha[t].add(i)
print(fancha)
print(" ".join([str(i) for i in sorted([i for i in fancha if len(fancha[i])==1],reverse=True) if i in theinput]))