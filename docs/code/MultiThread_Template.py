#coding:utf-8
#Python简单多线程模板,支持Py2,Py3

import threading
from time import sleep

theader = 20

counter = 0 
def work(list):
    global counter
    for i in list:
        counter += 1
        sleep(1)# do something time-costing...


worklist = range(1,100)
for i in range(theader):
    t = threading.Thread(target=work,args=[worklist[i::theader]])
    t.start()

while counter < len(worklist):
    print("Finished: "+str(counter))
    sleep(1)

print("END")