//ここに追加したいJavaScript、jQueryを記入してください。
//このJavaScriptファイルは、親テーマのJavaScriptファイルのあとに呼び出されます。
//JavaScriptやjQueryで親テーマのjavascript.jsに加えて関数を記入したい時に使用します。

document.addEventListener("DOMContentLoaded",function(){


const button=document.querySelector("#openBook");

const transition=document.querySelector(".page-transition");

const hero=document.querySelector(".home-hero");



if(button){


button.addEventListener("click",function(e){


e.preventDefault();



/* 星空を暗くする */

hero.classList.add("dark");



/* 紙を表示 */

transition.classList.add("active");



setTimeout(function(){


transition.classList.remove("active");



document.querySelector("#book").scrollIntoView({

behavior:"smooth"

});



},1000);



});

}




/* カテゴリー表示 */

window.addEventListener("scroll",function(){


document.querySelectorAll(".fade").forEach(function(item){


let pos=item.getBoundingClientRect().top;


if(pos < window.innerHeight - 150){

item.classList.add("active");

}


});


});


});

document.addEventListener("click", function(e){

const button = e.target.closest("#darkToggle");

if(!button) return;


document.body.classList.toggle("dark-mode");


if(document.body.classList.contains("dark-mode")){

localStorage.setItem("darkMode","on");

button.innerHTML='<img src="https://life-memory-journal.com/wp-content/uploads/2026/07/sozai_cman_jp_20260722191016.png" alt="sun">';
}else{

localStorage.setItem("darkMode","off");

button.innerHTML='<img src="https://life-memory-journal.com/wp-content/uploads/2026/07/3b7c68b839df31fefc4b933c6211a971.png" alt="moon">';

}

});

// ページ移動後も維持

document.addEventListener("DOMContentLoaded", function(){

if(localStorage.getItem("darkMode") === "on"){

document.body.classList.add("dark-mode");

}

});