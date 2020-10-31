# CCF Badge

在dblp搜索结果中高亮显示安全顶会和CCF分类+方向

安装 Chrome插件[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) 后点击安装： [https://blog.chenyuan.me/code/ccfbadge.user.js](https://blog.chenyuan.me/code/ccfbadge.user.js)

效果：

[https://dblp.org/search?q=use-after-free](https://dblp.org/search?q=use-after-free)

![](/assets/img/ccfbadge.png)

## 数据处理过程

- 下载官方目录PDF: [https://www.ccf.org.cn/Academic_Evaluation/By_category/](https://www.ccf.org.cn/Academic_Evaluation/By_category/)
- 转换成Excel: [https://smallpdf.com/pdf-to-excel](https://smallpdf.com/pdf-to-excel)
- Python读取excel处理：部分dblp有链接但pdf中不是dblp链接的需要手工更正，asiaccs的链接需要与ccs区分

```
import xlrd, json
from pprint import pprint
wb=xlrd.open_workbook("中国计算机学会推荐国际学术会议和期刊目录-2019-converted.xlsx")
type = ""
allccf = {}
for sid in range(wb.nsheets):
    s = wb.sheet_by_index(sid)
    data = [tuple([s.cell_value(i,j) for j in range(s.ncols)]) for i in range(s.nrows)]
    for i,line in enumerate(data):
        if line[0]=="序号":
            abc = data[i-1][0].split("、")[1].replace("类", "").strip()
            if i-2>=0:
                type = data[i-2][0].split("\n")[-1].strip().strip("（(）)").replace("／","/").split("/")[0].replace("计算机","")
            table = data[i+1:]
    newtable = []
    for i in table:
        if not any([str(j).strip() for j in i]):
            continue
        id, simple, full, publisher, url = [str(j).replace("\n"," ").replace("  "," ") for j in i[:-1]] # remove last empty column
        #print(i)
        url = {
            "Performance Evaluation: An International Journal":"https://dblp.uni-trier.de/db/journals/pe",
            'Journal of Electronic Testing-Theory and Applications': "https://dblp.uni-trier.de/db/journals/et",
            "Hot Chips: A Symposium on High Performance Chips": "https://dblp.uni-trier.de/db/conf/hotchips/index.html",
            "ACM Transactions on Privacy and Security":"https://dblp.org/db/journals/tissec/",
            "Computer Law and Security Review":"https://dblp.org/db/journals/clsr/",
            "IFIP WG 11.9 International Conference on Digital Forensics":"https://dblp.org/db/conf/ifip11-9/",
            "Computer Animation and Virtual Worlds":"https://dblp.org/db/journals/jvca/index.html",
            "IET Computer Vision":"https://dblp.org/db/journals/iet-cvi/index.html",
            "IET Signal Processing":"https://dblp.org/db/journals/iet-spr/index.html",
            "International Conference on Collaborative Computing: Networking, Applications and Worksharing":"https://dblp.org/db/conf/colcom/index.html",
            "Asia Conference on Computer and Communications Security": "https://dblp.org/db/conf/asiaccs/index.html",
        }.get(full, url)
        if "dblp" not in url:
            #print([id, simple, full, publisher, url])
            pass
        else:
            url = "/".join(url.split("/")[4:6])
            #print(url)
        newtable.append([id, simple, full, publisher, url])
        if url in allccf:
            #print(i, allccf[url]) # we find that aisaccs link is wrong
            assert allccf[url][1] == abc # same item in different categories, should be same in ABC
            allccf[url] = (allccf[url][0]+"/"+type, abc)
        else:
            allccf[url] = (type, abc)
    #print(type, abc, [i[4] for i in newtable])
open("ccf.json","w").write(json.dumps(allccf))
```