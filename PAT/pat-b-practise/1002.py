thesum="%d"%sum(map(int,input()))
d=["ling","yi","er","san","si","wu","liu","qi","ba","jiu"]
res=" ".join(map(lambda i:d[int(i)],thesum))
print(res)