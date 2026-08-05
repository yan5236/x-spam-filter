// ==UserScript==
// @name         X 垃圾机器人过滤器
// @namespace    https://github.com/yan5236/x-spam-filter
// @version      2.0.0
// @description  基于远程规则集过滤 X 垃圾机器人评论和帖子
// @match        https://x.com/*
// @match        https://twitter.com/*
// @license      MIT
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==


(function(){

"use strict";



const FILTER_URL =
"https://raw.githubusercontent.com/yan5236/x-spam-filter/main/filters.json";



let FILTER={

    hard_patterns:[],
    keywords:[],
    name_patterns:[],
    username_rules:[],
    structure_rules:[],
    emoji_limit:{
        count:4,
        score:1
    }

};





// ===============================
// 加载远程规则
// ===============================

function loadFilter(){


return new Promise((resolve)=>{


GM_xmlhttpRequest({

    method:"GET",

    url:
    FILTER_URL+
    "?t="+Date.now(),


    timeout:8000,


    onload:function(res){


        try{


            let json=
            JSON.parse(
                res.responseText
            );


            console.log(
                "[X Spam Filter] 规则加载成功",
                json.version
            );


            resolve(json);


        }
        catch(e){

            console.error(
                "[X Spam Filter] JSON解析失败",
                e
            );

            resolve(FILTER);

        }


    },


    onerror:function(){


        console.warn(
            "[X Spam Filter] 规则加载失败，使用本地规则"
        );


        resolve(FILTER);


    },


    ontimeout:function(){


        console.warn(
            "[X Spam Filter] 规则加载超时"
        );


        resolve(FILTER);


    }


});


});


}







function regexMatch(pattern,text){


try{


return new RegExp(
pattern,
"i"
)
.test(text);


}
catch(e){

return false;

}


}









// ===============================
// 垃圾评分
// ===============================


function spamScore(article){


let score=0;



const text =
article.innerText
.replace(/\s+/g,"");




// 固定模板

for(
const rule of FILTER.hard_patterns || []
){


if(
regexMatch(
rule.pattern,
text
)
){


score += rule.score || 1;


console.log(
"[命中模板]",
rule.reason
);


}


}






// 关键词


for(
const rule of FILTER.keywords || []
){


if(
text.includes(
rule.word
)
){


score += rule.score || 1;


}


}







// 用户名


const name =
article.querySelector(
'[data-testid="User-Name"]'
)?.innerText || "";



for(
const rule of FILTER.name_patterns || []
){


if(
regexMatch(
rule.pattern,
name
)
){


score += rule.score || 1;


}


}







// 用户ID


const username =
text.match(
/@[A-Za-z0-9_]+/
)?.[0];



if(username){


const u =
username.substring(1);



for(
const rule of FILTER.username_rules || []
){


if(
regexMatch(
rule.pattern,
u
)
){


score += rule.score || 1;


}


}


}








// 结构规则


for(
const rule of FILTER.structure_rules || []
){


if(
regexMatch(
rule.pattern,
text
)
){


score += rule.score || 1;


}


}







// emoji数量


let emoji =
text.match(
/[\u{1F300}-\u{1FAFF}]/gu
)
||[];




if(
FILTER.emoji_limit &&
emoji.length >= FILTER.emoji_limit.count
){


score += FILTER.emoji_limit.score;


}






return score;


}









// ===============================
// 扫描
// ===============================


function scan(){



document
.querySelectorAll("article")
.forEach(article=>{


if(article.dataset.spamChecked)
return;



article.dataset.spamChecked="1";



let score =
spamScore(article);




if(score>=5){


article.style.display="none";


console.log(
"[屏蔽垃圾机器人]",
score,
article.innerText.slice(0,120)
);


}


});


}









async function main(){


FILTER =
await loadFilter();



scan();



new MutationObserver(scan)
.observe(
document.body,
{
childList:true,
subtree:true
}
);


}




main();



})();
