import os
import re
from bs4 import BeautifulSoup
TEMPLATE_NAMES = [i.replace(".template.html","") for i in os.listdir(".") if ".template.html" in i]
TEMPLATE = {}
for t in TEMPLATE_NAMES:
    TEMPLATE[t] = open(t+".template.html", encoding="utf-8").read()
    if t=="speaker_people": # for person sort by pic src, example: chen_yan.jpg
        soup = BeautifulSoup(TEMPLATE[t],"html.parser")
        data = []
        tmp = []
        for tr in soup.find_all("tr"):
            img = tr.find("img")
            if img is not None:
                if len(tmp):
                    data.append(tmp)
                    tmp=[]
                tmp.append(img["src"])
                tmp.append(tr.find("strong").text)
            else:
                tmp.append(str(tr))
        data.append(tmp)
        speaker_people = ""
        for person in sorted(data):
            speaker_people += """<tr align="left"><th rowspan="2"><div align="center">
           <img src="%s" width="132" height="180" /></div></th> 
         <td class="STYLE13"><strong>%s</strong></td> </tr> %s"""%(person[0], person[1], person[2])
        TEMPLATE[t] = speaker_people
        
navbardata=TEMPLATE["navbar"]

for filename in os.listdir("."):
    if "blade.html" in filename:
        print(filename)
        targetfile = filename.replace(".blade","")
        templatedata = open(filename, "r", encoding="utf-8").read()
        newdata = templatedata
        for name in TEMPLATE_NAMES:
            if name=="navbar": # navbar class active replace
                TEMPLATE["navbar"] = navbardata.replace("""href="{}"s""".format(targetfile), """href="{}" class="active" s""".format(targetfile))
            newdata = newdata.replace("{{"+name+"}}", TEMPLATE[name])
        print(len(newdata))
        newdata = re.sub("(<!--(.|\s|\n)*?-->)", "", newdata, flags=re.MULTILINE)
        print(len(newdata))
        open(targetfile, "w", encoding="utf-8").write(newdata)