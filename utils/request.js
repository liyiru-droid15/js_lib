import axios from 'axios';
import qs from 'qs';

// axios 配置
axios.defaults.timeout = 5000;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
if (localStorage.token){ axios.defaults.headers['token'] = localStorage.token; }
// axios.defaults.headers['Access-Control-Allow-Origin'] = '*';
// axios.defaults.withCredentials = true;

//Axios实现请求重试
axios.defaults.retry = 1; //重试次数
axios.defaults.retryDelay = 1000; //重试延时
axios.defaults.shouldRetry = (error) => true; //重试条件，默认只要是错误都需要重试
const baseUrl = 'https://test.com/api/';

/* 封装get方法*/
export function get(url,params={}){
  url = baseUrl+url+'?cros='+new Date().getTime();
  return new Promise((resolve, reject)=>{
    if(localStorage.token!=undefined){
      params.mgtoken = localStorage.token;
    }

    axios.get(url, {
      params: params
    }).then(response=>{
      // console.log(response.data.msg)
      if(response.data.msg=='请先登录'){
        localStorage.token = '';
        location.href = "/login"
        return ;
      }
      resolve(response.data);
    }).catch(err=>{
      reject(err);
    })
  })
}

/* 封装post方法 */
export function post(url,data={},that){
  url = baseUrl+url+'?cros='+new Date().getTime();
  // if(localStorage.token!=undefined){
  //   data.mgtoken = localStorage.token;
  // }
  return new Promise((resolve,reject)=>{
    data = qs.stringify(data);
    axios.post(url,data).then(response=>{

      if(response.data.msg=='请先登录'){
        localStorage.token = '';
        location.href = "/login"
        return ;
      }
      resolve(response.data);
    }).catch(err=>{
      if(!err.response){
        console.log('接口不响应', url);
        that && that.$alert('网络错误，请检查网络或稍后再试！',{type:'error'});
        return ;
      }

      if(err.response.status==500 || err.response.status==404){
        console.log('后端接口不可用', url);
        that && that.$alert('网络错误或系统繁忙，请稍后再试！',{type:'error'});
        
      }
      reject(err);
    })
  })
}


