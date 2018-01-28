#! /bin/bash

## 并发刷新缓存
## 刷新又拍云缓存，代码在https://github.com/zjuchenyuan/EasyLogin/tree/master/examples/upyun
pushd /mnt/d/Seafile/Developer/EasyLogin/examples/upyun/
python3 upyun.py 'https://py3.io/@.html' &
popd
python3 code/upyun_purge.py &

mkdocs build
echo "<hr><small>Last updated: `date --iso-8601=seconds`&nbsp;&nbsp;&nbsp;<a href=http://www.miitbeian.gov.cn/>浙ICP备15043819号-2</a>&nbsp;&nbsp;<a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33010602007826"><img src="beian.png" height="14px">浙公网安备 33010602007826号</p></a></small>" >> index.html
