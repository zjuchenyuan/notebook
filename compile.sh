#! /bin/bash

## 并发刷新缓存
## 刷新又拍云缓存，代码在https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun
pushd /mnt/d/Seafile/Developer/EasyLogin/examples/upyun/
python3 upyun.py 'https://py3.io/@' &
popd
python3 code/upyun_purge.py &

mkdocs build
cd docs
sed 's#cdnjs.cloudflare.com#cdnjs.loli.net#g' $(find -type f -name "*.html")
sed 's#fonts.googleapis.com#fonts.loli.net#g' $(find -type f -name "*.html")