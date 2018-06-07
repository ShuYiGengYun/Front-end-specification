//tab组件;
Vue.component("top-nav", {
  props: {
    title: {
      type: String,
      default: ""
    },
    reloadtext: {
      type: String,
      default: ""
    },
    ishistory: {
      type: Boolean,
      default: false
    }
  },
  template: "<div class='topnav-top'><div class='backnav-top' @click='backapp'></div>{{title}}<div class='refresh' @click='reloadapp'>{{reloadtext}}</div></div>",
  methods: {
    backapp: function () {
      if (this.ishistory) {
        window.history.go(-1);
      } else {
        window.location.href = "appback://";
      }
    },
    reloadapp: function () {
      window.location.reload();
    }
  }
});

// 活动是否结束提示;
Vue.component("miqu-over", {
  props: {
    isover: {
      type: Boolean,
      default: false
    },
    overtext: {
      type: String,
      default: "活动已结束"
    },
    over: {
      type: String,
      default: "已结束"
    }
  },
  template: "<div class='time-over' v-show='isover'><p class='text'>{{overtext}}</p><span class='over'>{{over}}</span></div>"
});

// layer弹层插件;
var layerTemplate =
  "<transition name='fade'>"+
  "<div class='layer-shadow' @click='hidelayer' v-show='visible'>" +
  "<div class='layer-wrapper'>" +
  "<div class='layer-title'>{{layeroption.contentTitle?layeroption.contentTitle:'提示'}}</div>" +
  "<div class='layer-content' v-html='layeroption.contentHTML'></div>" +
  "<div class='layer-bottom'><span class='cancle' @click='cancle'>{{layeroption.leftText?layeroption.leftText:'取消'}}</span><span class='confirm' @click='confirm'>{{layeroption.rightText?layeroption.rightText:'确定'}}</span></div>"+
  "</transition>"
  ;
Vue.component("miqu-layer", {
  props: {
    layeroption: {
      type: Object,
      default: {}
    },
    islayershow: {
      type: Boolean,
      default: false
    }
  },
  watch:{
    islayershow:function(value){
      this.visible = value;
    },
    visible:function(value){
      this.$emit("update:islayershow",value);
    }
  },
  data:function(){
    return{
      visible:this.islayershow
    }
  },
  template: layerTemplate,
  methods: {
    cancle: function () {
      this.visible = false;
      this.$emit('cancle');
    },
    confirm: function (e) {
      this.visible = false;
      this.$emit('confirm');
    },
    hidelayer: function () {
      this.visible = false;
    }
  }
});
//按钮组件;
var  buttonTemplate =
  "<a href='javascript:' @click='confirm' class='miqu-button' :style='cssobj'>{{text}}</a>";
Vue.component("miqu-button", {
  props: {
    text: {
      type: String,
      default: ""
    },
    cssobj: {
      type: Object,
      default: {}
    }
  },
  template: buttonTemplate,
  mounted: function () {
    console.log(this.cssobj);
  },
  methods: {
    confirm: function () {
      this.$emit("confirm");
    }
  }
});


// 消息提示;
var messageTemplate = '<transition name="fade"><div class="miqu-message-shadow" v-show="ismessageshow"><div class="miqu-message"><div class="miqu-message-wrapper">{{messageContentText}}</div><div class="miqu-message-button"><span  @click="messageconfirm">{{messageButtonText}}</span></div></div></div></transition>';
Vue.component("miqu-message",{
  props:{
    "message-button-text":{
      type:String,
      default:"确定"
    },
    "message-content-text":{
      type:String,
      default:""
    },
    ismessageshow:{
      type:Boolean,
      default:false
    }
  },
  template:messageTemplate,
  methods:{
    messageconfirm:function(){
       this.ismessageshow = false;
       this.$emit("messageconfirm");
    }
  }
})


// spinner组件;
Vue.component("miqu-snake",{
  name:"snake",
  props:{
       color:String,
       size:Number,
       isspinnershow:{
           type:Boolean,
           default:false
       }
  },
  template:'<div v-show="isspinnershow" class="spinnercontainer"><div class="snake" :style="{borderTopColor:spinnerColor,borderBottomColor:spinnerColor,borderLeftColor:spinnerColor,width:spinnerSize,height:spinnerSize}"></div></div>',
  computed:{
      spinnerColor:function(){
          return this.color || this.$parent.color || "red";
      },
      spinnerSize:function(){
          return (this.size || this.$parent.size || .8) + "rem";
      },
  }
})


// double-bounce组件;
Vue.component("miqu-bounce",{
  name:"double-bounce",
  props:{
    color:String,
    size:Number
  },
  computed:{
    spinnerColor:function(){
      return this.color || this.$parent.color || "red";
    },
    spinnerSize:function(){
      return (this.size || this.$parent.size || .44)+ "rem";
    }
  },
  template:'<div class="double-bounce" :style="{width:spinnerSize,height:spinnerSize}">'+
            '<div class="double-bounce1" :style="{backgroundColor:spinnerColor}"></div>'+
            '<div class="double-bounce2" :style="{backgroundColor:spinnerColor}"></div>'+
            '</div>',
})


// vue-toast组件;
var toastTemplate = '<transition name="fade"><div class="toast" v-show="visible"><i>{{message}}</i></div></transition>';
var ToastConstructor = Vue.extend({
    data:function(){
        return {
            visible:false,
            message:"",
            position:""
        }
    },
    template:toastTemplate
})
var removeDom = function(event){
    event.target.parentNode.removeChild(event.target);
}

ToastConstructor.prototype.close = function(){
    this.visible = false;
    this.$el.addEventListener("transitionend",removeDom);
}
var options = {};
var Toast = function(options){
    var instance = new ToastConstructor().$mount(document.createElement("div"));
    var duration = options.duration || 2500;
    instance.message = typeof options == "string"?options:options.message;
    instance.position = options.position || "middle";
    document.body.appendChild(instance.$el);
    instance.visible = true;
    Vue.nextTick(function(){
        instance.timer = setTimeout(function(){
            instance.close();
        },duration);
    })
    return instance;
}

//********==封装插件==*********//
// ajax插件
var vAjax = {};
vAjax.install = function (Vue, options) {
  var defaults = {};
  Vue.prototype.$ajax = function (opt) {
    // 创建xhr对象;
    var xhr = createXHR();

    //参数覆盖;
    for (var k in opt) {
      defaults[k] = opt[k];
    }

    var defaultType = defaults.type.toLowerCase();
    var data = params(defaults.data);
    var dataType = defaults.dataType.toLowerCase();


    // 判断是否为jsonp
    if (dataType === 'jsonp') {
      ajaxJsonp(xhr, defaults);
      return
    }
    if (defaultType === 'get') { //判断使用的是否是get方法;
      // 判断url参数是否有？有则直接加参数,没有就加？再加参数;
      if (defaults.url.indexOf('?') > -1) {
        defaults.url = defaults.url + '&' + data;
      } else {
        defaults.url = defaults.url + '?' + data;
      }
    }
    // 是否是异步;
    if (defaults.async === true) {
      // 异步时需要触发onreadychangestate事件;
      xhr.onreadystatechange = function () {
        // 执行完成；
        if (xhr.readyState == 4) {
          callback(xhr, defaults);
        }
      }
    } else if (defaults.async === false) { //同步
      callback(xhr, defaults);
    }
    xhr.open(defaultType, defaults.url, defaults.async);
    if (defaultType === 'get') {
      xhr.send(null);
    } else if (defaultType === 'post') {
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(data);
    }
  };

  //   创建xhr对象;
  function createXHR() {
    if (typeof XMLHttpRequest != "undefined") {
      return new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
      var version = [
        "MSXML2.XMLHttp.6.0",
        "MSXML2.XMLHttp.3.0",
        "MSXML2.XMLHttp"
      ];
      for (var i = 0; i < version.length; i++) {
        try {
          return new ActiveXObject(version[i]);
        } catch (error) {
          //跳过
        }
      }
    } else {
      throw new Error("您的系统或浏览器不支持XHR对象");
    }
  }

  //   拼接字符串;
  function params(data) {
    var arr = [];
    for (var k in data) {
      arr.push(encodeURIComponent(k) + "=" + encodeURIComponent(data[k]));
    }
    return arr.join("&");
  }

  //返回数据;
  function callback(xhr, defaults) {
    if (xhr.status === 200) {
      if (defaults.dataType === 'json') {
        defaults.success(JSON.parse(xhr.responseText));
      } else if (defaults.dataType === 'text') {
        defaults.success(xhr.responseText);
      }
    } else {
      defaults.error("获取数据失败，错误代号为：" + xhr.status + "错误信息为：" + xhr.statusText)
    }
  }
  //jsonp方法;
  function ajaxJsonp(xhr, defaults) {
    if (!defaults.url || !defaults.jsonp) {
      throw new Error("参数不合法");
    }
    // 创建script标签并加入到页面中;
    var callbackName = ('jsonp_' + Math.random()).replace(".", "");
    var oHead = document.getElementsByTagName("head")[0];
    defaults.data[defaults["jsonp"]] = callbackName;
    var param = params(defaults.data);
    var oS = document.createElement("script");
    oHead.appendChild(oS);

    // 创建jsonp回调函数;
    window[callbackName] = function (json) {
      oHead.removeChild(oS);
      window[callbackName] = null;
      defaults.success && defaults.success(json);
    }

    // 发送请求;
    oS.src = defaults.url + "?" + param;
  }
};