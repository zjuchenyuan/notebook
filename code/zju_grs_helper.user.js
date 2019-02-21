// ==UserScript==
// @name         ZJU研究生选课助手
// @namespace    http://grs.zju.edu.cn
// @version      0.6.1
// @description  在“全校开课情况查询”页面可以进入选课；整合查老师分数与评论显示；支持只显示特定校区课程；登录页面验证码自动识别
// @author       zjuchenyuan
// @match        http://grs.zju.edu.cn/*
// @match        https://grs.zju.edu.cn/*
// @grant        GM_xmlhttpRequest
// @connect *
// ==/UserScript==
var CONFIG_XQ=null; //配置校区
// var CONFIG_XQ = "玉泉"
// 例如将上一行取消注释则表示只显示玉泉校区的课程

/*TODO: 将@connect设置为chalaoshi.cn无效，
    目前设置为任意域名(虽然实际上只要访问查老师这一个域名)，会要求用户授权，
    咋修复啊Orz
*/

var bheight = unsafeWindow.bheight;
var $ = unsafeWindow.$;
var Path = unsafeWindow.Path;
function xk(id){ //在全校开课查询页面进入选课
    console.log(id);
    $.get("xkkcss.htm?kcbh="+id.slice(0, -3)+"&kcSearch=%E6%9F%A5%E8%AF%A2", null ,function(data){
        //console.log(data);
        //搜索课程Id
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
unsafeWindow.xk = exportFunction(xk, unsafeWindow);

function run(){
    for(var td of document.querySelectorAll("#lssjCxdcForm > table > tbody > tr > td:nth-child(3)")){
        if(!/<a/.test(td.innerHTML)){
            var id = td.innerText;
            td.innerHTML = "<a onclick='xk(\""+id+"\")'>"+id+"</a>"
        }
    }
}

var teacher_cache = {};

function re_findall(regex, text){
    var matches = new Array();
    var match;
    while((match = regex.exec(text)) !== null){
        matches.push(match[1]);
    }
    return matches;
}

var PHONE_UA = "Mozilla/5.0 (iPhone 84; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.0 MQQBrowser/7.8.0 Mobile/14G60 Safari/8536.25 MttCustomUA/2 QBWebViewType/1 WKType/1";

function chalaoshi_search(teacher_name, callback, td){ //搜索查老师
    if(typeof(teacher_cache[teacher_name])!=="undefined") return callback(td, teacher_cache[teacher_name][0], teacher_cache[teacher_name][1], teacher_cache[teacher_name][2]);
    console.log("chalaoshi_search", teacher_name);
    GM_xmlhttpRequest({
        url:"https://chalaoshi.cn/search?q="+encodeURIComponent(teacher_name),
        method:"GET",
        headers:{"User-Agent": PHONE_UA},
        onload: function (response){
            var html = response.responseText;
            var ids = re_findall(/teacher\/(\d+)\//g, html);
            var scores = re_findall(/<h2>([^<]+)<\/h2>/g, html);
            var names = re_findall(/<h3>([^<]+)<\/h3>/g, html);
            callback(td, ids, scores, names);
            teacher_cache[teacher_name] = [ids, scores, names];
        }
    })
}

function chalaoshi_page_extract(div, selector){
    var tmp = div.querySelector(selector);
    if(!tmp) return "";
    return tmp.innerText.trim().replace(/ /g,"");
}

function show_chalaoshi_page(id){ //显示查老师信息，获取基本信息及评论第一页显示
    GM_xmlhttpRequest({
        url:"https://chalaoshi.cn/teacher/"+id+"/",
        method:"GET",
        headers:{"User-Agent": PHONE_UA},
        onload: function (response){
            var html = response.responseText;
            var div=document.createElement("div")
            div.innerHTML = html;
            var left = chalaoshi_page_extract(div, "div.left");
            var right = chalaoshi_page_extract(div, "div.right");
            var average_gpa = chalaoshi_page_extract(div, "div.main > div:nth-child(2) > div").replace(/\n\n/g,"\n").replace(/\n\n/g,"\n");
            GM_xmlhttpRequest({
                url: "https://chalaoshi.cn/teacher/"+id+"/comment_list?page=0&order_by=rate",
                method:"GET",
                headers:{"User-Agent": PHONE_UA},
                onload: function (response){
                    var tmp = response.responseText;
                    var html;
                    if(tmp){
                        html = tmp.replace(/class="hidden"/g,"").replace(/>举报</g,"><");
                    }else{
                        html = "no comments";
                    }
                    var api = frameElement.api, W = api.opener;
                    W.$.dialog({
                        lock: true,
                        max: true,
                        parent: api,
                        width:800 ,
                        title:null,
                        content: "<pre>"+left+"\n\n"+right+"\n\n"+average_gpa+"</pre><div style='padding-left:30px'>"+html+"</div>",
                    });
                }
            });
        }
    })
}

unsafeWindow.show_chalaoshi_page = exportFunction(show_chalaoshi_page, unsafeWindow);

function callback_modify_teacher_td(td, ids, scores, names){
    var r = td.innerText;
    for(var i=0; i<ids.length; i++){
        if(names[i]!=td.innerText) continue;
        r += "<a onclick='show_chalaoshi_page("+ids[i]+")'>"+scores[i]+"</a>&nbsp;";
    }
    td.innerHTML = r;
}

function test_chalaoshi(){
    for(var td of document.querySelectorAll("#classTable > tbody > tr > td:nth-child(3)")){
        if(/<a/.test(td.innerHTML)) continue;
        chalaoshi_search(td.innerText, callback_modify_teacher_td, td);
    }
}

/* 验证码识别模块CAPTCHA_RECOGNIZE 配置项如下
 * ENDPOINT: api地址
 * IMG_SELECTOR: 验证码图片selector
 * CAPTCHA_INPUT: 验证码识别后填入的input标签selector
 */

var CONFIG_CAPTCHA = {
    "ENDPOINT": "https://api.py3.io/ocr",
    "IMG_SELECTOR": "#yzmImg",
    "CAPTCHA_INPUT": "#authcode",
    "ALLOW_RETRY": 3,
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function logimage(url){
  var image = new Image();
  image.onload = function() {
    var style = [
      'font-size: 1px;',
      'line-height: ' + this.height + 'px;',
      'padding: ' + this.height * .5 + 'px ' + this.width * .5 + 'px;',
      'background-size: ' + this.width + 'px ' + this.height + 'px;',
      'background: url('+ url +');'
     ].join(' ');
     console.log('%c ', style);
  };
  image.src = url;
}

function work(img){
    var postdata = getBase64Image(img);
    GM_xmlhttpRequest({
        method:"POST",
        url:CONFIG_CAPTCHA["ENDPOINT"],
        data: "img="+encodeURIComponent(postdata),
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        responseType:"json",
        onload: function (response) {
            var data = JSON.parse(response.responseText);
            logimage("data:image/png;base64,"+postdata);
            console.log("captcha recognize:",data);
            if(data[0].length==4 && data[1][0]>40){
                document.querySelector(CONFIG_CAPTCHA["CAPTCHA_INPUT"]).value= data[0];
            }else{
                if(CONFIG_CAPTCHA.ALLOW_RETRY>0){
                    img.click();
                    CONFIG_CAPTCHA.ALLOW_RETRY --;
                }
            }
        }});
}

function onchange(){
    setTimeout(work, 100, this);
}

function wait(callback){
    var img = document.querySelector(CONFIG_CAPTCHA["IMG_SELECTOR"]);
    if(img==null){
        setTimeout(wait, 500, callback);
    }else{
        img.addEventListener("click", onchange);
        setTimeout(callback, 100, img);
    }
}

function getXY(callback){
    if(localStorage.getItem("xy")) return callback(localStorage.getItem("xy"));
    $.get("/gl/page/student/studentBaseTwo.htm",null,function(html){
        var result = html.split("学院</dt>")[1].split("</p>")[0].replace('<p class="ml10 content w300 detail">','').replace(/&nbsp;/g,'').trim();
        localStorage.setItem("xy", result);
        callback(result);
    })
}

function lnsjCxdc(){
    var form = document.forms, i=form.length-1;
    for(; i>=0; i--) {
        if(/post/i.test(form[i].method)) form[i].action += "#method-post";
    }
    var is_post = location.hash.indexOf("#method-post") != -1;
    if(!is_post){
        document.querySelector("#kkxn_chzn > ul > li").insertAdjacentHTML('beforeBegin', '<li class="search-choice" id="kkxn_chzn_c_24"><span>2018</span></li>');
        var theyear = new Date().getFullYear();
        var xueqi = 12; //秋冬学期
        $("#kckkxj_chzn > a > span").text("秋冬学期");
        if(new Date().getMonth()<6) {
            theyear--;
            xueqi = 11; //春夏
            $("#kckkxj_chzn > a > span").text("春夏学期");
        }
        $("[name='kkxn']")[0].insertAdjacentHTML('afterBegin', '<option value="'+theyear+'" selected="">'+theyear+'</option>');
        $("#kckkxj>option").attr("selected",false)
        $("#kckkxj>option[value="+xueqi+"]").attr("selected",true);
        getXY(function(xy){
            $("#kkyx>option").attr("selected",false);
            var temp=$("#kkyx>option").filter(function(){return $(this).text()==xy});
            if(temp.length){
                temp.attr("selected", true);
                $("#kkyx_chzn > a > span").text(xy);
            }
        });
    }
}

(function() {
    'use strict';

    if(document.location.pathname=="/py/page/student/lnsjCxdc.htm") setInterval(run,1000);
    else if(document.location.pathname=="/py/page/student/xkbjxxWindow.htm") {
        for(var note of document.querySelectorAll("#classTable > tbody > tr > td:nth-child(7)")){if(/非全日制/.test(note.innerText)||/MBA/.test(note.innerText)||/MPA/.test(note.innerText)) note.parentNode.remove()}
        if(typeof(CONFIG_XQ)!="undefined" && CONFIG_XQ && CONFIG_XQ!="null") for(var xq of document.querySelectorAll("#classTable > tbody > tr > td:nth-child(6)")){if(xq.innerText!=CONFIG_XQ) xq.parentNode.remove()}
        test_chalaoshi();
    }
    var header = document.getElementsByClassName("grs-header-wrap")[0];
    if(typeof(header)!="undefined") header.addEventListener('mouseover',function(e) {e.stopImmediatePropagation(); e.stopPropagation(); }, true);
    if(document.location.pathname=="/cas/login"){ //登录页面识别验证码
        wait(work);
    }else if(document.location.pathname=="/py/page/student/lnsjCxdc.htm"){
        lnsjCxdc();
    }
})();

