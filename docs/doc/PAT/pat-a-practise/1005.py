line=list(map(int,input()))
translate={0:"zero",1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine"}
ans=[translate[int(i)] for i in "%d"%sum(line)]
print(" ".join(ans),end="")