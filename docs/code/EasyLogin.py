# coding:utf-8
from __future__ import with_statement

try:
    from urllib.parse import urlencode, quote, unquote
    PY2 = False
except ImportError:
    from urllib import urlencode, quote, unquote
    PY2 = True
import requests
import pickle
import os
import random
from bs4 import BeautifulSoup
import hashlib
from collections import OrderedDict
import json
try:
    import cchardet as chardet
except: # pragma: no cover
    import chardet

__version__ = 20180118

UALIST = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60",
    "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/2.0 Safari/536.11",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; QQBrowser/7.0.3698.400)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 UBrowser/4.0.3214.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.100 Safari/537.36"]

def mymd5(input):
    if PY2:
        return hashlib.md5(bytes(input)).hexdigest()
    else:
        return hashlib.md5(bytes(input,encoding="utf-8")).hexdigest()

class EasyLogin_ValidateFail(Exception):
    pass

class EasyLogin:
    def __init__(self, cookie=None, cookiestring=None, cookiefile=None, proxy=None, session=None, cachedir=None):
        """
        example: a = EasyLogin(cookie={"PHPSESSID":"..."}, proxy="socks5://127.0.0.1:1080")
        :param cookie: a dict of cookie
        :param cookiefile: the file contain cookie which saved by get or post(save=True)
        :param proxy: the proxy to use, rememeber schema and `pip install requests[socks]`
        :param session: requests.Session()
        :param cachedir: where cache files should be write to
        """
        self.b = None
        self.cookiestack = []
        self.proxies = {'http': proxy, 'https': proxy} if proxy is not None else None
        self.cookiefile = 'cookie.pickle'
        if session is not None:
            self.s = session
            return
        self.s = requests.Session()
        adapter = requests.adapters.HTTPAdapter(pool_connections=100, 
                                            pool_maxsize=1000)
        self.s.mount('http://', adapter)
        self.s.headers.update({'User-Agent': random.choice(UALIST)})
        if cookie is None:
            cookie = {}
        self.s.cookies.update(cookie)
        self.setcookie(cookiestring)
        if cookiefile is not None:
            self.cookiefile = cookiefile
            try:
                with open(cookiefile, "rb") as fp:
                    self.s.cookies = pickle.load(fp)
            except FileNotFoundError:
                pass
        if cachedir is None:
            self.cachedir = ""
        else:
            cachedir = cachedir.replace("\\","/")
            if not cachedir.endswith("/"):
                cachedir = cachedir+"/"
            if not os.path.exists(cachedir):
                try:
                    os.mkdir(cachedir)
                except:
                    if not os.path.exists(cachedir):
                        raise
            self.cachedir = cachedir

    def setcookie(self,cookiestring):
        cookie = {}
        if cookiestring is not None:
            for onecookiestring in cookiestring.split(";"):
                tmp = onecookiestring.split("=", 1)
                if len(tmp)!=2:
                    continue
                a, b = tmp
                a = quote(unquote(a).strip())
                cookie.update({a: b})
            self.s.cookies.update(cookie)

    def showcookie(self):
        """
        show cookie
        :return: str(cookie)
        """
        c = ""
        for i in self.s.cookies:
            c += i.name + '=' + i.value + ";"
        return c
    cookie = property(showcookie)

    def get(self, url, result=True, save=False, headers=None, o=False, cache=None, r=False, cookiestring=None,failstring=None, debug=False, fixfunction=None, encoding=None, **kwargs):
        """
        HTTP GET method, default save soup to self.b
        :param url: a url, example: "http://ip.cn"
        :param result: using BeautifulSoup to handle the page, save to self.b (default True)
        :param save: save cookie or not
        :param headers: more headers to be sent
        :param o: return object or just page text
        :param cache: filename to write cache, if already exists, use cache rather than really get; using cache=True to use md5(url) as cache file name
        :param failstring: if failstring occurs in text, raise an exception
        :param fixfunction: a function receive html (bytes), output fixed html (bytes); this is useful for simple replace to fix dirty html page
        :return page text or object(o=True)
        """
        if debug:
            print(url)
        if cache is True:
            cache = mymd5(url)
        if cache:
            cache_filepath = self.cachedir + cache
        if cache is not None and os.path.exists(cache_filepath): # cache exist, read from cache
            with open(cache_filepath, "rb") as fp:
                if o:
                    obj = pickle.load(fp)
                    page = obj.content
                else:
                    page = fp.read()
            if result:
                page = page.replace(b"<br>", b"\n").replace(b"<BR>", b"\n")
                if fixfunction is not None:
                    page = fixfunction(page)
                if encoding:
                    self.b = BeautifulSoup(page.decode(encoding,errors='replace'), 'html.parser')
                else:
                    self.b = BeautifulSoup(page, 'html.parser')
            if o:
                return obj
            else:
                if not encoding:
                    encoding = chardet.detect(page)["encoding"]
                return page.decode(encoding,errors='replace')
        if r:
            if headers is None:
                headers = {"Accept-Encoding": "gzip, deflate, sdch", "Accept-Language": "zh-CN,zh;q=0.8", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "Upgrade-Insecure-Requests": "1", "DNT": "1"}
            headers["Referer"] = "/".join(url.split("/")[:3])
        if cookiestring is not None:
            if headers is None:
                headers = {}
            headers["Cookie"] = cookiestring
        if "allow_redirects" not in kwargs:
            kwargs["allow_redirects"] = False
        x = self.s.get(url, headers=headers, proxies=self.proxies, **kwargs)
        if encoding:
            x.encoding = encoding
        if failstring is not None:
            if failstring in x.text:
                raise EasyLogin_ValidateFail(x)
        if result:
                page = x.content.replace(b"<br>", b"\n").replace(b"<BR>", b"\n")
                if fixfunction is not None:
                    page = fixfunction(page)
                if encoding:
                    self.b = BeautifulSoup(page.decode(encoding,errors='replace'), 'html.parser')
                else:
                    self.b = BeautifulSoup(page, 'html.parser')
        if save:
            with open(self.cookiefile, "wb") as fp:
                fp.write(pickle.dumps(self.s.cookies))
        if o:  # if you need object returned
            if cache is not None:
                with open(cache_filepath, "wb") as fp:
                    fp.write(pickle.dumps(x))
            return x
        else:
            if cache is not None:
                with open(cache_filepath, "wb") as fp:
                    fp.write(x.content)
            return x.text

    def post(self, url, data, result=True, save=False, headers=None, cache=None, dont_change_cookie=False, **kwargs):
        """
        HTTP POST method, submit data to server
        :param url: post target url
        :param data: the data already quoted
        :param result: the page returned save to a.b
        :param save: save cookie to file
        :param headers: override headers to be sent
        :param cache: filename to write cache, if already exists, use cache rather than really get; using cache=True to use md5(url+data) as cache file name
        :param dont_change_cookie: make the cookie unchanged during this function
        :return: the requests object
        """
        if cache is True:
            cache = mymd5(url+data)
        if cache:
            cache_filepath = self.cachedir + cache
        if cache is not None and os.path.exists(cache_filepath):
            with open(cache_filepath, "rb") as fp:
                obj = pickle.load(fp)
            if result:
                self.b = BeautifulSoup(obj.content.replace(b"<br>", b"\n").replace(b"<BR>", b"\n"), 'html.parser')
            return obj
        postheaders = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        if headers is not None:
            postheaders.update(headers)
        if dont_change_cookie:
            self.stash_cookie()
        x = self.s.post(url, data, headers=postheaders, allow_redirects=False, proxies=self.proxies, **kwargs)
        if dont_change_cookie:
            self.pop_cookie()
        if result:
            page = x.content.replace(b"<br>", b"\n").replace(b"<BR>", b"\n")
            self.b = BeautifulSoup(page, 'html.parser')
        if save:
            with open(self.cookiefile, "wb") as fp:
                fp.write(pickle.dumps(self.s.cookies))
        if cache is not None:
            with open(cache_filepath, "wb") as fp:
                fp.write(pickle.dumps(x))
        return x

    def post_dict(self, url, dict, result=True, save=False, headers=None,cache=None):
        """
        like post but using dict to post
        :param url: post target url
        :param dict: the data to be post, in dict form, example: {"age":"19","name":"chenyuan"}
        :param result: the page returned save to a.b
        :param save: save cookie to file
        :param headers: override headers to be sent
        :return: the requests object
        """
        if cache is True:
            dict = OrderedDict(sorted(dict.items(), key=lambda t: t[0]))
        data = urlencode(dict)
        return self.post(url, data, result=result, save=save, headers=headers,cache=cache)

    def post_json(self, url, jsondata, result=False, save=False, headers=None, cache=None, o=False):
        """
        add a header for json post
        :return the object
        """
        if headers is None:
            headers={}
        headers["Content-Type"]="application/json;charset=UTF-8"
        data=json.dumps(jsondata)
        x=self.post(url, data, result=result, save=save, headers=headers,cache=cache)
        if o:
            return x
        else:
            return x.json()

    def f(self, name, attrs):
        """
        find all tags matches name and attrs
        :param name: Tag name
        :param attrs: dict, exmaple: {"id":"content"}
        :return: list of str(Tag text)
        """
        if self.b is None:
            return []
        return [i.text.replace('\r', '').replace('\n', '').replace('\t', '').replace('  ', '')
                for i in self.b.find_all(name, attrs)]

    def getlist(self, searchString, elementName="a", searchTarget="href", returnType=None):
        """
        get all urls which contain searchString
        Examples:
        get all picture:
            a.getlist("","img","src")
        get all css and js:
            a.getlist("css","link","href")
            a.getlist("js","script","src")

        :param searchString: keywords to search
        :param elementName: Tag name
        :param searchTarget: "href", "src", etc...
        :param returnType: "element" to return the Tag object, None to return element[searchTarget]
        :return: list
        """
        if returnType is None:
            returnType = searchTarget
        if self.b is None:
            return []
        result = []
        for element in self.b.find_all(elementName):
            if searchString in element.get(searchTarget, ""):
                result.append(element[returnType] if returnType != "element" else element)
        return result

    getList = getlist

    def img(self):
        return [i[2:] if i[0:2] == "//" else i for i in self.getlist("", "img", "src")]

    def css(self):
        return [i[2:] if i[0:2] == "//" else i for i in self.getlist("css", "link", "href")]

    def js(self):
        return [i[2:] if i[0:2] == "//" else i for i in self.getlist("js", "script", "src")]

    def VIEWSTATE(self):
        """
        Useful when you crack the ASP>NET website
        :return: quoted VIEWSTATE str
        """
        if self.b is None:
            return ""
        x = self.b.find("input", attrs={"name": "__VIEWSTATE"})
        if x is None:
            return ""
        return quote(x["value"])

    def save(self, filename="EasyLogin.status"):
        """
        save the object to file using pickle
        to avoid RecursionError, not saving self.b
        :param filename:
        :return:
        """
        b = self.b
        self.b = None
        data = pickle.dumps(self)
        with open(filename, "wb") as fp:
            fp.write(data)
        self.b = b
        return
    
    export = save
    
    @staticmethod
    def load(filename='EasyLogin.status'):
        """
        load an object from file
        :param filename: file saved by pickle
        :return: the object
        """
        try:
            with open(filename, "rb") as fp:
                return pickle.load(fp)
        except:
            return EasyLogin()
    
    _import = load
    
    @staticmethod
    def w(filename, content, method='w', overwrite=False):
        """
        just for write more simplely
        :param filename: str
        :param content: str or bytes
        :param method: 'w' or 'wb'
        :param overwrite: boolean
        :return: None
        """
        if not overwrite and os.path.exists(filename):
            return
        with open(filename, method) as fp:
            fp.write(content)

    def text(self, target=None, ignore_pureascii_words=False):
        """
        Get all text in HTML, skip script and comment
        :param target: the BeatuifulSoup object, default self.b
        :param ignore_pureascii_words: if set True, only return words that contains Chinese charaters (may be useful for English version website)
        :return: list of str
        """
        if target is None:
            target = self.b
        from bs4 import Comment
        from bs4.element import NavigableString,Doctype
        result = []
        for descendant in target.descendants:
            if not isinstance(descendant, NavigableString) \
                    or isinstance(descendant,Doctype) \
                    or descendant.parent.name in ["script", "style"] \
                    or isinstance(descendant, Comment) \
                    or "none" in descendant.parent.get("style","")\
                    or "font-size:0px" in descendant.parent.get("style",""):
                continue
            data = descendant.strip()
            if len(data) > 0:
                if not ignore_pureascii_words or any([ord(i)>127 for i in data]):
                    if PY2:
                        result.append(data.encode('utf-8'))
                    else:
                        result.append(data)
        return result

    def find(self, tag, attrs_string, skip=0, text=False):
        """
        find more easily with string, return all matched tag
        :param tag: tag name
        :param attrs_string: tag attrs, fully match
        :param skip: skip first tags
        :param text: need text or tag
        :return: array of tag or text
        """
        tmp_tag = BeautifulSoup("""<%s %s></%s>""" % (tag, attrs_string, tag), "html.parser").find(tag)

        def mysearch(itag):
            if itag.name != tag:
                return False
            if itag.attrs == tmp_tag.attrs:
                return True
            else:
                return False
        data = self.b.find_all(mysearch)
        for i in range(skip):
            if not len(data):
                break
            del(data[0])
        if text is True:
            text = " "
        if text:
            return [text.join(self.text(i)) for i in data]
        else:
            return data

    def d(self,tag,attrs,all=False):
        """
        delete some useless tags
        :param tag: tag name
        :param attrs: tag attrs
        :param all: delete all matches or just the first one
        :return: False when not found any matches
        """
        if self.b is None:
            return False
        if all:
            tags = self.b.find_all(tag,attrs=attrs)
        else:
            tags = [self.b.find(tag,attrs=attrs)]
        if len(tags)==0:
            return False
        for tag in tags:
            tag.extract()
        return True

    @staticmethod
    def safefilename(filename):
        """
        convert a string to a safe filename
        :param filename: a string, may be url or name
        :return: special chars replaced with _
        """
        for i in "\\/:*?\"<>|$":
            filename=filename.replace(i,"_")
        return filename

    def stash_cookie(self):
        """
        stash the cookie status to a stack
        :return: None
        """
        try:
            self.cookiestack
        except AttributeError:
            self.cookiestack = []
        self.cookiestack.append(self.s.cookies.copy())

    def pop_cookie(self):
        """
        pop the cookie from the stack
        :return: False when pop from empty stack, else None
        """
        if len(self.cookiestack) == 0:
            return False
        self.s.cookies = self.cookiestack.pop()

def main():
    # crawl main page of v2ex.com, print hot topics, and return a list of ("/t/637075", "公司让选一本书作为新年礼物，小于 80 元，有什么推荐的吗？")
    a = EasyLogin()
    page = a.get("https://v2ex.com/")
    TopicsHot = a.b.find("div",{"id":"TopicsHot"})
    print("\n".join(a.text(TopicsHot)))
    res = []
    for item in TopicsHot.find_all("a"):
        if not item["href"].startswith("/t/"):
            continue
        res.append((item["href"], item.text))
    return res

EL = EasyLogin

if __name__ == '__main__':  # sample code for get ip by "http://ip.cn"
    print(main())