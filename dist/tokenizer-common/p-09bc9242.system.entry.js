var __awaiter=this&&this.__awaiter||function(t,e,n,r){function o(t){return t instanceof n?t:new n((function(e){e(t)}))}return new(n||(n=Promise))((function(n,i){function u(t){try{s(r.next(t))}catch(e){i(e)}}function a(t){try{s(r["throw"](t))}catch(e){i(e)}}function s(t){t.done?n(t.value):o(t.value).then(u,a)}s((r=r.apply(t,e||[])).next())}))};var __generator=this&&this.__generator||function(t,e){var n={label:0,sent:function(){if(i[0]&1)throw i[1];return i[1]},trys:[],ops:[]},r,o,i,u;return u={next:a(0),throw:a(1),return:a(2)},typeof Symbol==="function"&&(u[Symbol.iterator]=function(){return this}),u;function a(t){return function(e){return s([t,e])}}function s(u){if(r)throw new TypeError("Generator is already executing.");while(n)try{if(r=1,o&&(i=u[0]&2?o["return"]:u[0]?o["throw"]||((i=o["return"])&&i.call(o),0):o.next)&&!(i=i.call(o,u[1])).done)return i;if(o=0,i)u=[u[0]&2,i.value];switch(u[0]){case 0:case 1:i=u;break;case 4:n.label++;return{value:u[1],done:false};case 5:n.label++;o=u[1];u=[0];continue;case 7:u=n.ops.pop();n.trys.pop();continue;default:if(!(i=n.trys,i=i.length>0&&i[i.length-1])&&(u[0]===6||u[0]===2)){n=0;continue}if(u[0]===3&&(!i||u[1]>i[0]&&u[1]<i[3])){n.label=u[1];break}if(u[0]===6&&n.label<i[1]){n.label=i[1];i=u;break}if(i&&n.label<i[2]){n.label=i[2];n.ops.push(u);break}if(i[2])n.ops.pop();n.trys.pop();continue}u=e.call(t,n)}catch(a){u=[6,a];o=0}finally{r=i=0}if(u[0]&5)throw u[1];return{value:u[0]?u[1]:void 0,done:true}}};System.register(["./p-6d5d1df2.system.js"],(function(t){"use strict";var e,n;return{setters:[function(t){e=t.r;n=t.h}],execute:function(){var r="*{-webkit-box-sizing:border-box;box-sizing:border-box}.menu{position:fixed;top:var(--header-height);right:0;bottom:0;width:200px;background-color:var(--panel-selected-color);z-index:1000;color:white}.menu.footer-fixed{bottom:var(--footer-height)}";var o=t("tok_side_menu",function(){function t(t){e(this,t);this.isOpen=false;this.isFooterFixed=false}t.prototype.open=function(t){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){this.isOpen=t;return[2]}))}))};t.prototype.footerFixed=function(t){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){this.isFooterFixed=t;return[2]}))}))};t.prototype.render=function(){if(!this.isOpen){return null}return n("div",{class:{menu:true,"footer-fixed":this.isFooterFixed}},n("slot",null))};return t}());o.style=r}}}));