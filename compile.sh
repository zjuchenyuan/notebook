#! /bin/bash

## 并发刷新缓存
## 刷新又拍云缓存，代码在https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun
pushd /mnt/d/Seafile/Developer/EasyLogin/examples/upyun/
python3 upyun.py 'https://py3.io/@' &
popd
python3 code/upyun_purge.py &
for i in *.md; do ln -f $i mdfiles/$i; done
mkdocs build
cd docs
sed -i 's#https://fonts.googleapis.com/css#/assets/css/fonts.css#g' $(find -type f -name "*.html")
cd ..
cp assets/css/main.4b9ffd7b.min.css docs/assets/stylesheets/
sed -i 's#https://d.py3.io/btc.html#<div id="realtimeprofit"></div><script>fetch("https://d.py3.io/btc.html").then(r=>r.text()).then(html=>document.getElementById("realtimeprofit").innerHTML=html)</script>#' docs/Bitcoin/index.html