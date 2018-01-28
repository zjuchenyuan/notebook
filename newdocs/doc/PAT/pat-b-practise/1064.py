input()
line=input().split()
res=set([])
for i in line:
    res.add(sum([int(j) for j in i]))
print(len(res))
print(" ".join(["%d"%i for i in sorted(res)]),end="")