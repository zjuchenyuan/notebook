// ==UserScript==
// @name         ZJU研究生选课助手
// @namespace    http://grs.zju.edu.cn
// @version      0.1
// @description  目前的功能：在“全校开课情况查询”页面可以进入选课
// @author       zjuchenyuan
// @match        http://grs.zju.edu.cn/py/page/student/lnsjCxdc.htm
// @grant        none
// ==/UserScript==
var bheight = window.bheight;
var $ = window.$;
var Path = window.Path;
function xk(id){
    console.log(id);
    $.get("xkkcss.htm?kcbh="+id.slice(0, -3)+"&kcSearch=%E6%9F%A5%E8%AF%A2", null ,function(data){
        //console.log(data);
        var re = /kcId=([^"]+)/g;
        var kcid = re.exec(data)[1];
        console.log(kcid);
        $.dialog({
            fixed:true,
            lock: true,
            max: false,
            width: "1050px",
            height: bheight,
            title:$.i18n.prop("Cultivation_BJCY"),
            content: "url:" +Path.getPath()+"xkbjxxWindow.htm?kcId="+kcid
        });
    });
}
window.xk = xk;

function run(){
    for(var td of document.querySelectorAll("#lssjCxdcForm > table > tbody > tr > td:nth-child(3)")){
        if(!/<a/.test(td.innerHTML)){
            var id = td.innerText;
            td.innerHTML = "<a onclick='xk(\""+id+"\")'>"+id+"</a>"
        }
    }
}

(function() {
    'use strict';

    setInterval(run,1000);
})();