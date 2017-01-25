#!/usr/bin/python
from os import system as s
import sys
if len(sys.argv)!=3:
    print("""Usage:
    ./getcert.py example example.com,www.example.com,another.example.com
    
Note:
    Please set up nginx conf carefully~
""")
    exit()
name=sys.argv[1]
s("test -e account.key || openssl genrsa 4096 > account.key")
s("test -e acme_tiny.py || curl -O https://raw.githubusercontent.com/diafygi/acme-tiny/master/acme_tiny.py")
s("test -e {name}.key || openssl genrsa 4096 > {name}.key".format(name=name))
DNSstring='DNS:'+',DNS:'.join(sys.argv[2].split(","))
open("tmp.sh","w").write('openssl req -new -sha256 -key {name}.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\\nsubjectAltName={DNSstring}")) > {name}.csr'.format(name=name,DNSstring=DNSstring))
s("bash tmp.sh&&rm -f tmp.sh")
s("python acme_tiny.py --account-key account.key --csr {name}.csr --acme-dir . > {name}_temp.crt".format(name=name))
s("test -e intermediate.pem || wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem")
s("cat {name}_temp.crt intermediate.pem > {name}.crt && rm {name}_temp.crt {name}.csr".format(name=name))
