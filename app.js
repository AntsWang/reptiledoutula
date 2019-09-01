
const page = 1;
const Koa = require('koa2'),
    Router = require('koa-router'),
    cheerio = require('cheerio'),
    app = new Koa(),
    router = new Router(),
    superagent = require('superagent'),
    views = require('koa-views'),
    pug = require('pug'),
    path = require('path'),
    http = require('http'),
    fs = require("fs"),
    images = require("images");
require('superagent-charset')(superagent);

// 配置模板文件目录和后缀名
app.use(views(path.join(__dirname + '/views'), {
  extension: 'pug'
})).use(router.routes())
   .use(router.allowedMethods());

router.get('/', async function(ctx,next){
   let imgUrls = [];
   function getUrl(page){
        let url = 'http://www.doutula.com/photo/list?page='+page;
       return new Promise((resolve)=>{
            superagent.get(url).charset('utf-8').end((err,html)=>{
                console.log(err,html)
                let text = html.text,
                $ = cheerio.load(text),url = '',imgName = '';
                $('a img').each(function(i){
                    url = $(this).attr("data-original");
                    if(url){
                        imgName = url&&url.split('.')[url.split('.').length-1];
                        imgUrls.push(url);
                        saveImage(url,"image/"+i+'.'+imgName);
                    }      
                });
                    resolve(1);
            })
       })
   }
    for(let i = 0;i<page;i++){
       await getUrl(i);
    }
   await ctx.render('image.pug', {
  "imgUrls": imgUrls
});
})


//保存图片
function saveImage(url,path) {
    http.get(url,function (req,res) {
        var imgData = '';
        req.on('data',function (chunk) {
            imgData += chunk;
        })
		//req.setEncoding('UTF-8');
        req.on('end',function () {
            try{
                fs.writeFile(path,imgData,'binary',function (err) {
                    console.log('保存图片成功'+path)
                })
            }catch(e){
               console.log(e)
            }

        })
    })
}

function reSize(paths){
    images(paths)                                                         
    .size(100)                                                             
    .save(paths, {               
        quality : 50                  
    });
}
app.listen(3000, () => {
    console.log('[服务已开启,访问地址为：] http://127.0.0.1:3000/');
});


