import datetime
import requests
import hashlib

def md5(src):
    return hashlib.md5(bytes(src,encoding="utf-8")).hexdigest()

def purge_api_request(URLS,BucketName,OperatorName,OperatorPassword):
    urls="\n".join(URLS)
    Time=datetime.datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
    sign=md5("%s&%s&%s&%s"%(urls,BucketName,Time,md5(OperatorPassword)))
    Auth="UpYun %s:%s:%s"%(BucketName,OperatorName,sign)
    headers={"Authorization":Auth,"Date":Time}
    #print("""curl -X POST http://purge.upyun.com/purge/  -H "Authorization: %s" -H "Date: %s" -F purge="%s" """%(Auth,Time,urls))
    x=requests.post("http://purge.upyun.com/purge/",headers=headers,files={"purge":"%s"%urls})
    return x.json()

if __name__=="__main__":
    from config import *
    print(purge_api_request(URLS,BucketName,OperatorName,OperatorPassword))