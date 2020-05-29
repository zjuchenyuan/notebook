#! /bin/bash

## 并发刷新缓存
## 刷新又拍云缓存，代码在https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun
pushd /mnt/d/Seafile/Developer/EasyLogin/examples/upyun/
python3 upyun.py 'https://py3.io/@' &
popd
python3 code/upyun_purge.py &

mkdocs build
cd docs
sed -i 's#https://fonts.googleapis.com/css#/assets/css/fonts.css#g' $(find -type f -name "*.html")
cp assets/css/main.4b9ffd7b.min.css docs/assets/stylesheets/