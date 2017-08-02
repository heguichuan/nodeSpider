# nodeSpider
## 使用方法
npm test 或者 node spider.js
## 背景
因为自己使用的邮箱是outlook，没有公司通讯录，于是决定自己扒拉一个通讯录下来导入到outlook。写爬虫，本来第一反应是上python，不过考虑自己是js程序员，实现功能也简单，最终还是使用node.js。
## 开发过程
### 0. 依赖模块
1. [superagent](http://visionmedia.github.io/superagent/),一个轻量的的 http 方面的库，是nodejs里一个非常方便的客户端请求代理模块，当我们需要进行 get 、 post 、 head 等网络请求时，尝试下它吧。
基本用法：superagent.get():发起网络请求；set():设置请求header等；end()：请求完成的回调。
2. [eventproxy](https://github.com/JacksonTian/eventproxy/), 非常轻量的工具，但是能够带来一种事件式编程的思维变化。主要用于判断多个异步事件完成后，触发回调。
基本用法：let ep = EventProxy.create([事件列表], callback);  ep.emit('event', params);
3. [iconv-lite](https://github.com/ashtuchkin/iconv-lite/), 编码转换；因为nodejs写文件不支持gb2312等编码方式，所以引入iconv-lite做编码转换。
### 1. 身份验证
因为公司网站上的通讯录需要先登录才能访问，因此要先实现登录。由于网站登录页面需要手机验证码，没想到解决这个问题的好办法，所以我使用了一个笨办法，就是先手工登录一次，然后将认证的cookie写入代码，则程序后续请求将会被判定为已登录。
### 2. 网站页面分析
观察页面后发现网站结构很简单，通过url1获取部门目录树，解析后可得到获取每个部门人员名单的url2。所以我们代码基本逻辑就两个步骤。
### 3. 实现
目前初步实现了最基本的需求，代码尚需优化，详见spider.js
## 坑：outlook导入生成的csv文件发生错误
当导出csv文件后，使用outlook做导入发生错误，文件内容格式一切正常却一直报错，研究良久后发现outlook只支持crlf换行符，而之前是lf换行，改之，导入成功。
