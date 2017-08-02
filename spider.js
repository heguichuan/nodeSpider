const fs = require('fs')
const superAgent = require('superagent');
const EventProxy = require('eventproxy');
const iconv = require('iconv-lite');

function main() {
    console.log('start success.');
    let contacts = [];
    let contactsUrl = 'http://oa.iot.chinamobile.com/portal/contacts/index/contactsTree';
    httpget(contactsUrl, function (err, pageRes) {
        if (err) {
            console.log(err);
        }
        if(!pageRes.body.data) {
            console.log('Get contactsTree failed: '+contactsUrl, '\nstop.');
            return;
        }
        let depts = pageRes.body.data;
        let deptUrls = [];
        parseDepts(depts, deptUrls);
        //事件代理，当所有url请求完成则执行回调。
        let ep = EventProxy.create(deptUrls, function () {
            writeToJson(contacts);
            writeToCSV(contacts);
        });
        for(let url of deptUrls) {
            console.log('begin get data:'+ decodeURI(url));
            httpget(url, function(err, pageRes){
                if (err) {
                    console.log('Get data failed:'+ decodeURI(url));
                    console.log(err);
                }
                if (pageRes.body.data[0] instanceof Array) {
                    for (let employeesPart of pageRes.body.data) {
                        contacts = contacts.concat(employeesPart);
                    }
                } else {
                    contacts = contacts.concat(pageRes.body.data);
                }
                console.log('Get data success:'+ decodeURI(url));
                ep.emit(url);
            });
        }
    })
    
}
function httpget (url, callback) {
    superAgent.get(url)
        .set({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': 'portal_2_uid=b1a4d368-16c8-4006-969b-ba931a6af131',
            'Referer': 'http://oa.iot.chinamobile.com/',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36'
        })
        .end(callback);
}
function parseDepts (depts, deptUrls) {
    for (let dept of depts) {
        if (dept.subDepts) {
            parseDepts(dept.subDepts, deptUrls);
        }
        deptUrls.push(encodeURI('http://oa.iot.chinamobile.com/portal/contacts/index/userList?deptName='+dept.deptName));
    }
}
function writeToJson (contacts) {
    let ws = fs.createWriteStream('e:\\contacts.json', {start: 0});
    let commonName = contacts[0].commonName;
    let agency = contacts[0].agency;
    let position = contacts[0].position;
    let mobilePhoneNumber = contacts[0].mobilePhoneNumber;
    let email = contacts[0].email;
    let employeeId = contacts[0].employeeId;
    let status = contacts[0].status;
    ws.write('[');
    ws.write(
`
{
"commonName": "${commonName}",
"agency": "${agency}",
"position": "${position}",
"mobilePhoneNumber": "${mobilePhoneNumber}",
"email": "${email}",
"employeeId": "${employeeId}",
"status": "${status}"  
}`
    );
    for (let i=1; i<contacts.length; i++) {
        commonName = contacts[i].commonName || '';
        agency = contacts[i].agency || '';
        position = contacts[i].position || '';
        mobilePhoneNumber = contacts[i].mobilePhoneNumber || '';
        email = contacts[i].email || '';
        employeeId = contacts[i].employeeId || '';
        status = contacts[i].status || '';
        ws.write(
`,
{
"commonName": "${commonName}",
"agency": "${agency}",
"position": "${position}",
"mobilePhoneNumber": "${mobilePhoneNumber}",
"email": "${email}",
"employeeId": "${employeeId}",
"status": "${status}"  
}`
        );
    }
    ws.end(']');
}
function writeToCSV (contacts) {
    let ws = fs.createWriteStream('C:\\Users\\Karl\\Desktop\\dd.CSV', {start: 0});
    ws.write(iconv.encode(`"英文称谓","名","中间名","姓","称谓","单位","部门","职务","商务地址 街道","商务地址 街道 2","商务地址 街道 3","商务地址 市/县","商务地址 省/市/自治区","商务地址 邮政编码","商务地址 国家/地区","住宅地址 街道","住宅地址 街道 2","住宅地址 街道 3","住宅地址 市/县","住宅地址 省/市/自治区","住宅地址 邮政编码","住宅地址 国家/地区","其他地址 街道","其他地址 街道 2","其他地址 街道 3","其他地址 市/县","其他地址 省/市/自治区","其他地址 邮政编码","其他地址 国家/地区","助理的电话","商务传真","商务电话","商务电话 2","回电话","车载电话","单位主要电话","住宅传真","住宅电话","住宅电话 2","ISDN","移动电话","其他传真","其他电话","寻呼机","主要电话","无绳电话","TTY/TDD 电话","电报","Internet 忙闲","办公地点","地点","电子邮件地址","电子邮件类型","电子邮件显示名称","电子邮件 2 地址","电子邮件 2 类型","电子邮件 2 显示名","电子邮件 3 地址","电子邮件 3 类型","电子邮件 3 显示名","附注","工作证号码","关键词","记帐信息","纪念日","经理姓名","类别","里程","敏感度","目录服务器","配偶","其他地址 - 邮箱","商务地址 - 邮箱","身份证编号","生日","私有","缩写","网页","性别","业余爱好","引用者","用户 1","用户 2","用户 3","用户 4","优先级","语言","帐户","职业","助理的姓名","住宅地址 - 邮箱","子女"\r\n`, 'GB 2312'));
    for (let employee of contacts) {
        ws.write(iconv.encode(`"","","","${employee.commonName}","","","","",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,"${employee.mobilePhoneNumber}",,,,,,,,,,"","${employee.email}","SMTP","${employee.commonName}",,,,,,,,,"",,"00/0/0",,,,"普通",,,,,,"00/0/0","False","",,"未指定",,,,,,,"中","",""\r\n`, 'GB 2312'));
    }
    ws.end();
}
main();