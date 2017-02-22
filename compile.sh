#! /bin/bash
rm *.html
bundle exec jekyll build -d docs --no-watch -I
cp docs/*.html ./
echo "<hr><small>Last updated: `date`</small>" >> index.html
cp code/randomstring.html ./p.html
cp doc/python/quickstart.html ./
python3 << PYTHON
import os
import re
replace_css=re.compile(r'/assets/css/style.css\?v=.*"')
for filename in os.listdir("."):
    if filename.endswith(".html"):
        if filename in ("p.html","quickstart.html"):
            continue
        data = open(filename,encoding='utf-8').read()
        data = replace_css.sub('assets/css/style.css"',data)
        if filename != "index.html":
            data = data.replace("View on GitHub</a>","""View on GitHub</a>&nbsp;<a href="http://py3.io" class="btn btn-back"><span class="icon"></span>Back to Index</a>""")
        if filename == "Python.html":
            data = data.replace('<span class="err">','<span class="s">')
        elif filename == "Docker.html":
            data = data.replace("--format '' 容器名称","--format '{{.NetworkSettings.IPAddress}}' 容器名称")
        open(filename,"w",encoding='utf-8').write(data)
PYTHON
