#coding:utf-8
name = None
fasta = None

try:
    raw_input 
except:
    raw_input = input #兼容PY3
    
def handle(name,fasta):
    pass#To Be Impletement Here

while True:
    try:
        line=raw_input().replace("\r","")
    except EOFError:
        handle(name,fasta)
        break
    if len(line)==0:
        continue
    if line[0]=='>':
        if name is not None:
            handle(name,fasta)
        name=line[1:]
        fasta=""
    else:
        fasta+=line
