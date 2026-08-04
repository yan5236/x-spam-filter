// ==UserScript==
// @name         X 垃圾机器人过滤器
// @namespace    https://github.com/yan5236/x-spam-filter
// @version      1.0
// @description  屏蔽 X 上的垃圾推广机器人评论和帖子
// @match        https://x.com/*
// @match        https://twitter.com/*
// @license      MIT
// @grant        none
// ==/UserScript==


(function(){

'use strict';



function spamScore(article){

    let score = 0;


    const text =
        article.innerText
        .replace(/\s+/g,"");


    // 高置信模板
    const hardPatterns=[
        /应该没人比我.*玩.*开/,
        /我福不黑不信你看/,
        /我果然太涩了/,
        /有人想锐评一下/,
        /比我好看的没我骚/,
        /比我骚的没我好看/
    ];


    for(const r of hardPatterns){

        if(r.test(text)){
            score += 5;
        }

    }



    // 作者名字
    const name =
    article.querySelector(
        '[data-testid="User-Name"]'
    )?.innerText || "";



    if(/[🌸♥❤️]/.test(name)){
        score+=2;
    }



    if(
        /同城|上门|丄门|喝茶|选妃/
        .test(text)
    ){

        score+=3;

    }



    // 擦边词（降低权重）

    if(
        /涩|骚/
        .test(text)
    ){
        score+=1;
    }



    // emoji数量

    const emoji =
        text.match(
        /[\u{1F300}-\u{1FAFF}]/gu
        ) || [];


    if(emoji.length>=4){
        score+=1;
    }




    // 随机机器人用户名

    const username =
    text.match(/@[A-Za-z0-9_]+/)?.[0];


    if(username){

        let u=username.substring(1);


        if(
            /^[A-Za-z]+[A-Za-z0-9]{5,}$/
            .test(u)
        ){

            score+=2;

        }

    }



    return score;

}





function scan(){


document.querySelectorAll("article")
.forEach(article=>{


    if(article.dataset.checked)
        return;


    article.dataset.checked="1";


    let score=spamScore(article);



    if(score>=5){

        article.style.display="none";

        console.log(
        "[屏蔽垃圾]",
        score,
        article.innerText.slice(0,80)
        );

    }



});


}





scan();


new MutationObserver(scan)
.observe(
document.body,
{
childList:true,
subtree:true
}
);



})();
