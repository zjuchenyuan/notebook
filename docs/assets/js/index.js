if(location.pathname=="/README/"){
    window.onload = function(){
        Array.from(document.querySelectorAll("div.md-content > article > blockquote > ul > li")).forEach(function(i){
            i.onclick=function(){
                i.parentNode.parentNode.previousElementSibling.children[0].click()
            }
        });
    }
}