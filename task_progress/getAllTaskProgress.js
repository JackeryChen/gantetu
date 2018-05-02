//全局的ID
// window.zyfUrl = 'http://192.168.3.31:10091/zyfbim';
window.zyfUrl='http://116.62.114.241:8080/zyfbim';
/*window.zyfUrl = 'http://localhost:8787/zyfbim';
window.userId = '123456';
window.projectId = '11';
window.jwt = 'sadasdadsa';*/

/**
 * 获取指定的URL参数值
 * URL:http://www.quwan.com/index?name=tyler
 * 参数：paramName URL参数
 * 调用方法:getParam("name")
 * 返回值:tyler
 */
function getParam(paramName) {
    paramValue = "", isFound = !1;
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
}

var url_jwt = getParam('jwt');
var url_projectId = getParam('projectId');
var url_userId = getParam('userId');

/*localStorage.setItem('jwt',url_jwt);
localStorage.setItem('projectId',url_projectId);
localStorage.setItem('userId',url_userId);

localStorage.getItem("userId");
localStorage.getItem("projectId");
localStorage.getItem("jwt");*/
localStorage.getItem("userId");
localStorage.getItem("projectId");
localStorage.getItem("projectName");
localStorage.getItem("jwt");
localStorage.getItem('modelId');
localStorage.getItem('modelName');
window.userId=localStorage.userId;
window.projectId=localStorage.projectId;
window.projectName=localStorage.projectName;
if(window.projectId==undefined){
    window.projectId='';
}
window.jwt=localStorage.jwt;


// window.onload=getAllDepartment();
var allTask = [];

//var zyfUrl = 'http://192.168.3.31:10091/zyfbim';

function getAllProjectTaskInfos() {
    var tasks = [];
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/getAll",
        data: {
            'projectId': projectId,
            'userId': userId,
            'jwt': jwt
        },
        dataType: 'json',
        async: false,
        success: function (response) {
            // console.log("获得这个进度认读了");
            var msg = response.data;
            if (msg && msg.length > 0) {
                depends(msg);
                // console.log(msg);
                tasks = msg;
                allTask = msg;
                preTask.taskList = msg;
                preTaskId = msg[0].id;

                //修改任务的名字
                task_name = msg[0].name;
                task_unique_Id = msg[0].id;
                task_type = msg[0].taskType;
                task_level = msg[0].taskLeave;
                task_groupId = msg[0].chargeGroup;
                task_group_name = msg[0].chargeGroupName;
                task_changerId = msg[0].chargeUser;

                // console.log("task_changerId:"+task_changerId);
                task_update_changerId = msg[0].chargeUser;
                task_changer_name = msg[0].chargeUserName;
                task_start_time = formatDateTime(new Date(msg[0].start));
                task_end_time = formatDateTime(new Date(msg[0].end));

                //打印
                // console.log("task_name:"+task_name);
                //给右边的任务赋值
                taskRight.id = 1;
                taskRight.task = msg[0];
                getAllProjectTaskAccessoryByTaskId(msg[0].id);
                getAllProjectTaskCheckInfoByTaskId(msg[0].id);
                model_relactiveLog(msg[0].id)
                //getPrevTasks(msg[0].id);
                editFlag = true;
                judge_P.ok = true;
                //=============
                currentRow = 1;
                targetRow = 1;
                create_task_name = "";
                cretate_unique_Id = 0;
            } else {
                currentRow = 0;
                targetRow = 0;
                task_update_changerId = 0;
                // $("#filePicker2").css('pointer-events','none');
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
    return tasks;
}

//将时间转化为自己定义的格式的字符串时间
function formatDateTime(theDate) {
    var _hour = theDate.getHours();
    var _minute = theDate.getMinutes();
    var _second = theDate.getSeconds();
    var _year = theDate.getFullYear()
    var _month = theDate.getMonth();
    var _date = theDate.getDate();
    if (_hour < 10) {
        _hour = "0" + _hour;
    }
    if (_minute < 10) {
        _minute = "0" + _minute;
    }
    if (_second < 10) {
        _second = "0" + _second
    }
    _month = _month + 1;
    if (_month < 10) {
        _month = "0" + _month;
    }
    if (_date < 10) {
        _date = "0" + _date
    }
    //返回：2017-02-02
    return _year + "-" + _month + "-" + _date;
}

//给右边的显示时间使用的格式化时间的，不能通用，注意!!!!!
function formatDateTime2(theDate) {
    var _year = theDate.getFullYear()
    var _month = theDate.getMonth();
    var _date = theDate.getDate() + 1;
    _month = _month + 1;
    if (_month < 10) {
        _month = "0" + _month;
    }
    if (_date < 10) {
        _date = "0" + _date
    }
    //返回：2017-02-02
    var stringTime = _year + "-" + _month + "-" + _date;
    //console.log("time:"+stringTime);
    return stringTime;


    /* var d = new Date(stringTime);
     while (isHolidaySelf(d)) {
         d.setDate(d.getDate() + 1);
     }

     _year = d.getFullYear();
     _month = d.getMonth();
     _date = d.getDate();
     _month = _month + 1;
     if (_month < 10) {
         _month = "0" + _month;
     }
     if (_date < 10) {
         _date = "0" + _date
     }
     return _year + "-" + _month + "-" + _date;*/
}

//判断当前是否是周末
function isHolidaySelf(date) {
    var friIsHoly = false;
    var satIsHoly = true;
    var sunIsHoly = true;
    var day = date.getDay();
    return (day == 5 && friIsHoly) || (day == 6 && satIsHoly) || (day == 0 && sunIsHoly);
}

//处理任务的depends
function depends(tasks) {
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];

        /*  tasks[i].start = formatDateTime(new Date(task.start));
          tasks[i].end = formatDateTime(new Date(task.end));*/

        //console.log(task);
        if (task.activeStartTime) {
            //console.log("更改时间:");
            tasks[i].activeStartTime = formatDateTime(new Date(task.activeStartTime));
        }
        if (task.activeFinishTime) {
            //console.log("更改时间:");
            tasks[i].activeFinishTime = formatDateTime(new Date(task.activeFinishTime));
        }
        //var dependIds = [];
        /* for (var j = 0; j < tasks.length; j++) {
             //切割depends
             /!* var taskIds = task.depends.split(",");
              for (var k = 0; k < taskIds.length; k++) {
                  if (tasks[j].id == taskIds[k]) {
                      dependIds.push(j + 1);
                  }
              }*!/
             if (tasks[j].id == task.depends) {
                 dependIds.push(j + 1);
             }
         }*/
        //console.log(dependIds);
        //tasks[i].depends = dependIds.toString();
        //console.log((i + 1) + " ------- " + dependIds.toString());

        if (new Date().getTime() - tasks[i].start < 0) {
            tasks[i].planstatus = "未开始"
        } else {

            if (new Date().getTime() - tasks[i].end > 0) {
                tasks[i].planstatus = "100%";
                task_plan_status = 100;
            } else {
                var currentWorkDay = recomputeDuration(tasks[i].start, new Date().getTime());

                task_plan_status = Math.floor(currentWorkDay / tasks[i].duration * 100);

                tasks[i].planstatus = Math.floor(currentWorkDay / tasks[i].duration * 100) + "%";
            }


        }

        //console.log("tasks[i].activeStatus" + tasks[i].activeStatus)
        if (tasks[i].activeStatus != null) {
            if (tasks[i].planstatus == "未开始") {
                if (tasks[i].activeStatus == 100) {
                    tasks[i].compareStatus = "提前完成"
                } else {
                    // tasks[i].compareStatus = "进度提前"
                    tasks[i].compareStatus = "/"
                }
            } else {
                if (tasks[i].activeStatus - task_plan_status > 0) {

                    if (tasks[i].activeStatus == 100) {
                        tasks[i].compareStatus = "提前完成"
                    } else {
                        tasks[i].compareStatus = "进度提前"
                    }
                } else if (tasks[i].activeStatus - task_plan_status == 0) {
                    if (tasks[i].activeStatus == 100) {
                        tasks[i].compareStatus = "正常完成"
                    } else {
                        tasks[i].compareStatus = "正常进行"
                    }

                } else {
                    tasks[i].compareStatus = "进度延期"
                }

            }
            tasks[i].activeStatus += "%";

        } else {
            if (tasks[i].planstatus != "未开始") {
                tasks[i].compareStatus = "进度延期"
            } else {
                tasks[i].compareStatus = "未开始"
            }
            tasks[i].activeStatus = "未开始"

        }

        if (tasks[i].activeFinishTime && tasks[i].activeFinishTime - tasks[i].end < 0) {
            tasks[i].compareStatus = "拖延完成";
        } else if (tasks[i].activeFinishTime - tasks[i].end == 0) {
            tasks[i].compareStatus = "正常完成";
        }

        if (tasks[i].hasChild && tasks[i].activeStatus == "0%") {
            tasks[i].activeStatus = "/";
            tasks[i].compareStatus = "/";
        }

    }
}

$(document).ready(function () {
    //getAllDepartment();

    function getAllDepartment() {
        $.ajax({
            type: "POST",
            url: zyfUrl + "/TaskProcess/getAllDepartment",
            data: {'projectId': window.localStorage.getItem('activeProjectId')},
            async: false,
            dataType: 'json',
            success: function (msg) {
                console.log("获得成功========部门");
                var dept_vue = new Vue({
                    el: '#deptM',
                    data: {
                        orgs: msg,
                        sure: !isAdmins(),
                    }
                })

            },
            error: function (message) {
                console.log(message);
            }
        });

    }

});