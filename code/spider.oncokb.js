var system = require('system');
var NAME=system.args[1];
var page = require('webpage').create();
var fs = require('fs');
var fp = fs.open("output_"+NAME+".html","w");
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
page.viewportSize = { width: 1920, height: 1080 };

url="http://oncokb.org/#/gene/"+NAME;

function capture(){
	console.log("save...");
	page.render('output_'+NAME+'.pdf',{format: 'pdf', quality: '100'});
    fp.write(page.content);
    fp.close();
	phantom.exit();
}
function timeout(){
	console.log("Timeout!");
	var flog=fs.open("tiemout.log","a");
	flog.write(NAME);
	flog.close();
}
page.onResourceReceived = function(response) {
  //console.log('Receive ' + JSON.stringify(response, undefined, 4));
  //console.log(response.url);
  if(response.url.indexOf("http")==0){
	  console.log(response.url);
  }
  if(response.url.indexOf("http://www.cbioportal.org/api-legacy/studies")!=-1){
  	console.log("ok...");
  	setTimeout(capture,5000);
  }
};
page.open(url);
setTimeout(timeout,120000);