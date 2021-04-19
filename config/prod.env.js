'use strict';

//根据打包参数修改替换api地址
const fs = require('fs');
let param = JSON.parse(process.env.npm_config_argv);
let ENV = param.cooked[1] || 'prod';
let API_URL = param.cooked[2] || '';

ENV = ENV.replace('--','');
API_URL = API_URL.replace('--','');

//============ hook =============//
let baseUrl = 'http://192.168.8.34:8080/api'
let filePath = 'utils/request.js';

if(ENV === 'prod' || ENV === 'build'){
    baseUrl = 'http://gameadmin.pottingmob.com:8001/api'
}

if(API_URL.length>5){
    baseUrl = API_URL.indexOf('http')==-1? 'http://'+API_URL : API_URL;
}

fs.readFile(filePath, function(err, data){
    if(err){
        console.log(err);
        return err;
    }
    let content = data.toString(); 
    let new_content = content.replace(/const baseUrl(.*?)[;]/, `const baseUrl = '${baseUrl}';`);
    // console.log(new_content)
        
    fs.writeFile(filePath, new_content, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("\n\n"+'\u001b[32m 当前Api地址: '+baseUrl+"\u001b[0m \n");
        }
    });
})

//========== hook end ============//

module.exports = {
  NODE_ENV: '"production"'
}
