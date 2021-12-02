import sys
sys.path.append("../..")
import sys, time
from EasyLogin import EasyLogin
a=EasyLogin(cookiefile="upyun.status")

def login(username,password):
    global a
    data={"username":username,"password":password}
    print("Login...",end="")
    x=a.post_json("https://console.upyun.com/accounts/signin/",data,save=True)
    status=(x.get("msg",{}).get("messages",["error"])[0]=="登录成功")
    if status:
        print("Success")
    else:
        print("Login Failed")
        print(x)
        exit()
    return status

def islogin():
    global a
    x=a.get("https://console.upyun.com/api/",o=True)
    return "location" not in x.headers

def purge_rule_request(urls):
    """
    urls is multiple urls(must contain *) separated by '\n'
    :param urls: "\n".join([url1,url2])
    """
    global a
    x=a.post_json("https://console.upyun.com/api/buckets/purge/batch/",{"source_url": urls, "nofi": 0, "delay": 3600})
    try:
        result = [i["status"] for i in x["data"]]
    except:
        print(x)
        return "Error"
    return result

def https_domain_list(inuseonly=True, selfonly=True, detail=True):
    global a
    data = a.get("https://console.upyun.com/api/https/certificate/list/?limit=50", o=True).json()["data"]["result"]
    x = {}
    currenttime = int(time.time())
    for id, item in data.items():
        if id=="default":
            continue
        item["expired"] = currenttime > item["validity"]["end"]/1000
        item["expiredin"] = int((item["validity"]["end"]/1000 - currenttime)/86400)
        if selfonly and item["brand"]!="" and not item["expired"]:
            continue
        if (inuseonly and item['config_domain']>0) or (not inuseonly):
            x[id] = item
    if detail:
        for id,item in x.items():
            item["domains"] = a.get("https://console.upyun.com/api/https/certificate/manager/?certificate_id="+id, o=True).json()["data"]["domains"]
    return x

def need_renew_list():
    # {"domain_name": "id"}
    data = https_domain_list(inuseonly=True, selfonly=True, detail=True)
    res = {}
    for id, item in data.items():
        if item["expiredin"]<30:
            for d in item["domains"]:
                if d.get("https", False):
                    res[d['name']] = id
    return res

def add_certificate(cert):
    global a
    data = a.post_json("https://console.upyun.com/api/https/certificate/", cert)
    assert data["data"]["status"]==0
    return data["data"]["result"]

def migrate_certificate(oldid, newid):
    global a
    data = a.post_json("https://console.upyun.com/api/https/migrate/certificate", {"old_crt_id":oldid, "new_crt_id":newid})
    return data["data"]["result"]

def renew(api_func, data):
    # api_func(domain_name): return {"certificate":"-----BEGIN CERTIFICATE-----\n...", "private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
    # api_func can also return False
    handled = set()
    currenttime = int(time.time())
    for domain, id in data.items():
        if id in handled:
            continue
        cert = api_func(domain)
        if not cert:
            continue
        newcert_result = add_certificate(cert)
        newid = newcert_result["certificate_id"]
        print("get new cert for {commonName}, expiredin: {expiredin}, id: {newid}".format(newid=newid, commonName=newcert_result["commonName"], expiredin=int((newcert_result["validity"]["end"]/1000 - currenttime)/86400)))
        if migrate_certificate(id, newid):
            print("migrate success")
            handled.add(id)
        else:
            print("migrate failed")
        

if __name__=="__main__":
    from pprint import pprint
    try:
        import config
        config.USERNAME
        config.PASSWORD
    except:
        print("Please write your USERNAME and PASSWORD in config.py")
        exit(1)
    if len(sys.argv)==1:
        print("Available subcommands:\n  purge\n  https")
        exit(1)
    if not islogin():
        login(config.USERNAME,config.PASSWORD)
    if sys.argv[1] == "https":
            if sys.argv[2] in ["show", "list", "ls"]:
                pprint(https_domain_list())
            elif sys.argv[2] == "expired":
                pprint(need_renew_list())
            elif sys.argv[2] == "renew":
                from config import renew_api
                renew(renew_api, need_renew_list())
    else:
        if sys.argv[1]!="purge":
            sys.argv.insert(1, "purge") # for backward compatibility
        if len(sys.argv)<3:
            print("Example: python3 upyun.py purge https://py3.io/*")
            print("Or you can: python3 upyun.py purge https://py3.io/@.html, @ stands for *")
        else:
            # you can pass @ instead of *
            urls = "\n".join(sys.argv[2:]).replace("@", "*")
            print(purge_rule_request(urls))
    