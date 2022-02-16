import axios from 'axios';
import qs from 'qs';
import lrz from 'lrz';

// axios 配置
axios.defaults.timeout = 5000;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
// if (localStorage.mg_token){ axios.defaults.headers['Authorization'] = localStorage.mg_token; }
// axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
// axios.defaults.withCredentials = true;  

//Axios实现请求重试
axios.defaults.retry = 1; //重试次数
axios.defaults.retryDelay = 1000; //重试延时
axios.defaults.shouldRetry = (error) => true; //重试条件，默认只要是错误都需要重试
const baseUrl = 'http://127.0.0.1:8080/api';

export function BASEURL(){
  return baseUrl;
}

/* 封装get方法*/
export function get(url,params={}){
  url = baseUrl+url;
  return new Promise((resolve, reject)=>{
    let config = {};
    if(localStorage.mg_token){
      config.headers = {Authorization:localStorage.mg_token};
    }

    axios.get(url, {
      params: params,
      headers: config.headers
    }).then(response=>{
      resolve(response.data);
    }).catch(err=>{
      console.log(err)
      if(err.response.status==401){
          location.href = "/#/login"
      }
      reject(err);
    })
  })
}

/* 封装put方法*/
export function put(url,params={}){
  url = baseUrl+url+'?cros='+new Date().getTime();
  return new Promise((resolve, reject)=>{
    let config = {};
    if(localStorage.mg_token){
      config.headers = {Authorization:localStorage.mg_token};
    }
    axios.put(url, qs.stringify(params), config).then(response=>{
      resolve(response.data);
    }).catch(err=>{
      reject(err);
      if(err.response.status==401){
         location.href = '/#/login';
      }
    })
  })
}

/* 封装post方法 */
export function post(url,data={},that){
  url = baseUrl+url+'?cros='+new Date().getTime();
  return new Promise((resolve,reject)=>{
    data = qs.stringify(data);
    let config = {};
    if(localStorage.mg_token){
      config.headers = {Authorization:localStorage.mg_token};
    }
    axios.post(url,data,config).then(response=>{
      if(response.data.code==400 || response.data.code==401){
        let msg = '会话过期，请重新登陆';
        this.$alert(msg, {type:'error',close:res=>{
            location.href = "/#/login";
        }});
        
        console.log(response);
        return ;
      }
      if(response.data.code!=200 && response.data.msg){
          that.$message.error(response.data.msg);
          return ;
      }
      resolve(response.data);
    }).catch(err=>{
      if(!err.response){
        console.log('接口不响应', url);
        this.$alert('网络错误，请检查网络或稍后再试！',{type:'error'});
        return ;
      }

      if(err.response.status==500 || err.response.status==404){
        console.log('后端接口不可用', url);
        this.$alert('网络错误或系统繁忙，请稍后再试！',{type:'error'});
        
      }

      if(err.response.status==403){
        console.error('账户没有访问权限或没有授权访问的游戏！');
        this.$alert('账户没有访问权限或没有授权访问的游戏！',{type:'error'});
      }

      if(err.response.status==401){
         location.href = '/#/login';
      }

      if(err.response.status==429){
        this.$alert('您的操作有点频繁，请稍后再试！',{type:'error'});  
      }

      reject(err);
    })
  })
}

//图片上传
export function uploadimg(element, url) {
  let formdata = document.getElementsByClassName(element)[0].files;
  let name = document.getElementsByClassName(element)[0].name;
  if(name==undefined){
    name = 'file';
  }
  if (!formdata[0]) {
    console.log('请重新填数据');
    return ;
  }
  var data = new FormData();
  let isLt2M = formdata[0].size / 1024 / 1024;
  let type = formdata[0].type.replace('application/','');
  // console.log(type)
  let config = {
    headers: {
      'Content-Type': "multipart/form-data"
    }
  };
  if(localStorage.mg_token){
    config.headers.Authorization = localStorage.mg_token;
  }

  // if (isLt2M > 1.5) {
  //   return new Promise((resolve, reject) => {
  //     lrz(formdata[0], {quality: 0.5}).then((res) => { //压缩
  //       let file = new window.File([res.file], new Date().getTime()+'.png', {type: 'image/png'}) //把blob转化成file
  //       data.append(name, file);
  //       data.append("filename", name);
  //       axios.post(url, data, config)
  //         .then(res => {
  //           resolve(res.data);
  //         })
  //         .catch(err => {
  //           reject(err);
  //         });
  //     });
  //   })

  // } else {

    data.append(name, formdata[0]);
    data.append("filename", name);
    return new Promise((resolve, reject) => {
      axios.post(url, data, config)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          if(err.response.status==401){
            location.href = "/#/login"
          }
          reject(err);
        });
    });
  // }
}

//js下载json
export function jsdownload(json_data, name='tmp.json'){
    var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json_data));
    var downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", datastr);
    downloadAnchorNode.setAttribute("download", name);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}



