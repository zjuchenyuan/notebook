"""
If you have a bunch of files in Linux system whose filename is encoded with gbk,
you will find `ls` cannot correctly display them, 
because filenames should be encoded with utf-8 under Linux.

So, let's change the filename to correct encoding 'utf-8'

This script can only work under Python3
"""
try:
    import http #this is only for testing if you're using py3
except:
    print("This script can only work under Python3")
    exit(1)

import os
ok=0
notok = 0
for root, dirs, files in os.walk(b"."):
    for filename in files:
        filename = os.path.join(root, filename).replace(b'`',b'\\`')
        try:
            filename.decode('utf-8')
            ok += 1
        except:
            print(filename)
            notok += 1
            command = b'mv "'+filename+b'" "'+filename.decode('gbk').encode('utf-8')+b'"'
            os.system(command)

print("changed {} files".format(notok))
print("leave {} files untouched".format(ok))