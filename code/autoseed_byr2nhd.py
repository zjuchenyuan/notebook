from EasyLogin import EasyLogin
import sys, os, re
from PIL import Image
from resizeimage import resizeimage
from config import byr_cookie, nhd_cookie, byr_proxy, thost, tport, tuser, tpassword
from pprint import pprint
import transmissionrpc
import base64

def img_smaller(filename):
    img = Image.open(open(filename, 'rb'))
    newsize = [img.size[0] * 0.9, img.size[1] * 0.9]
    smallerimg = resizeimage.resize_thumbnail(img, newsize)
    smallerimg.save(filename, smallerimg.format)

def downimgs(a, imgs):
    result = []
    for img in imgs:
        filename = img.split("/")[-1]
        if img.startswith("//"):
            img = "http:"+img
        if not img.startswith("http"):
            img = "http://bt.byr.cn/"+img
        print(img)
        if not os.path.exists(filename):
            data = a.get(img, o=True, result=False).content
            open(filename, "wb").write(data)
        while os.stat(filename).st_size>1024*1024:
            print("size: ",os.stat(filename).st_size/1024,"KB")
            img_smaller(filename)
        result.append(filename)
    return result

def upload_imgs_nhd(a_nhd, filenames):
    result = []
    for filename in filenames:
        x=a_nhd.s.post("http://www.nexushd.org/attachment.php", files={"submit":"上传", "file":open(filename,"rb")})
        attach = x.text.split("[attach]")[1].split("[/attach]")[0]
        result.append(attach)
    return result
source_sel_dict = {"bluray": "1", "blu-ray": "1", "hdtv": "4", "webdl": "7", "web-dl": "7"}
standard_sel_dict = {"1080p": "1", "1080i": "2", "720p": "3", "4K": "1"}
def get_byr(a, torrentid):
    a.get("http://bt.byr.cn/details.php?id={torrentid}&hit=1".format(torrentid=torrentid),cache=True)
    torrent_filename = a.b.find("a",{"class":"index"}).text
    name = a.b.find("h1",{"id":"share"}).text.split("\xa0")[0]
    subtitle = a.b.find("div",{"id":"subtitle"}).text
    name_orignal = name
    subtitle_orignal = subtitle
    if name.count("][")==3:
        name = name_orignal.split("][")[1]
        subtitle = name_orignal.split("][")[0].strip("[")+" "+name_orignal.split("][")[2]+" "+name_orignal.split("][")[3].strip("]") + subtitle
    else:
        name = torrent_filename.replace("[BYRBT].","").replace(".torrent","")
        if len(name.split(".")[-1])<4:
            name = ".".join(name.split(".")[:-1])
        subtitle = name_orignal.replace("[","").replace("]"," ").replace(name, "") + subtitle
    
    # 来源
    source_sel = "0"
    for key, value in source_sel_dict.items():
        if key in name_orignal.lower():
            source_sel = value
            break
    # 分辨率
    standard_sel = "0"
    for key, value in standard_sel_dict.items():
        if key in name_orignal.lower():
            standard_sel = value
            break
    infohtml = a.b.find("div",{"id":"kdescr"})
    infotext = infohtml.text.replace("\xa0","")
    imdblink_tmp = re.findall(r"www.imdb.com/title/tt\d+", infotext)
    imdblink = ""
    if len(imdblink_tmp):
        imdblink = "http://" + imdblink_tmp[0] + "/"
    doubanlink_tmp = re.findall(r"movie.douban.com/subject/\d+", infotext)
    doubanlink = ""
    if len(doubanlink_tmp):
        doubanlink = "https://" + doubanlink_tmp[0]
    infoimgs = [i["src"] for i in infohtml.find_all("img")]
    downloadedimgs = downimgs(a, infoimgs)
    try:
        doubantext = "\n".join(a.text(a.b.find("p",text="豆瓣信息").find_next("td"))).replace("\xa9","").replace("\n，\n","，\n").replace("-=更新=-","")
    except:
        doubantext = ""
    return {"standard_sel":standard_sel, "doubanlink":doubanlink, "imdblink": imdblink, "source_sel":source_sel, "torrentid": torrentid,"name":name, "subtitle":subtitle, "descr": infotext+"\n Douban:"+doubantext, "type":"101"}, downloadedimgs

def download_torrent_byr(a, torrentid, host="bt.byr.cn", short="byr"):
    filename = str(torrentid)+"_"+short+".torrent"
    if not os.path.exists(filename):
        open(filename,"wb").write(a.get("http://"+host+"/download.php?id={torrentid}".format(torrentid=torrentid),result=False,o=True).content)
    return filename

def download_torrent_nhd(a_nhd, torrentid):
    return download_torrent_byr(a_nhd, torrentid, host="www.nexushd.org", short="nhd")

def upload_nhd(a_nhd, filename, torrentid, uploadedimgs, name,subtitle,descr,type, source_sel, imdblink, doubanlink, standard_sel):
    tmpstr = ""
    for item in uploadedimgs:
        tmpstr += ("[attach]"+item+"[/attach]\n")
    descr = tmpstr+descr
    data = {
         "name":name, 
         "small_descr":subtitle+" Autoseed请求协助编辑", 
         "descr":descr.replace("\r","\n").replace("\n\n","\n"), 
         "type":type,
         "url":imdblink,
         "douban_url": doubanlink,
         "source_sel": source_sel, 
         "codec_sel": "1",
         "standard_sel": standard_sel,
    }
    if "禁止转载" in data["small_descr"] or "禁转" in data["small_descr"]:
        data["small_descr"] = subtitle.replace("禁止转载","").replace("禁转","")
        data["uplver"] = "yes"
    data_no_descr = data.copy()
    del(data_no_descr["descr"])
    pprint(data_no_descr)
    input("Sure to upload?")
    x = a_nhd.s.post("http://www.nexushd.org/takeupload.php",files={"file":open(filename,"rb")},
        data=data)
    #open("result.html","wb").write(x.content)
    id = x.text.split("download.php?id=")[1].split('"')[0]
    return id

def upload_transmission(thost, tport, tuser, tpassword, filename):
    tc = transmissionrpc.Client(thost, port=tport, user=tuser, password=tpassword)
    tc.add_torrent(base64.b64encode(open(filename, "rb").read()).decode())

if __name__ == "__main__":
    a = EasyLogin(proxy=byr_proxy,cookiestring=byr_cookie)
    a_nhd = EasyLogin(cookiestring=nhd_cookie) 
    
    id = sys.argv[1]
    data, downloadedimgs = get_byr(a, id) # 获取种子信息
    filename = download_torrent_byr(a, id) # 下载种子文件
    uploadedimgs = upload_imgs_nhd(a_nhd, downloadedimgs) # 下载种子简介中的图片
    nhdid = upload_nhd(a_nhd, filename=filename, uploadedimgs=uploadedimgs, **data) # 上传种子到NHD
    filename_nhd = download_torrent_nhd(a_nhd, nhdid) # 下载刚上传的NHD种子
    upload_transmission(thost, tport, tuser, tpassword, filename_nhd) # 传给transmission开始做种