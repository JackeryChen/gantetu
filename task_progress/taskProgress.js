//全局的变量，是用来共用的，需要小心赋值，或更改
//var projectId = window.localStorage.getItem('activeProjectId');
var parent_unique_Id = 0;    //父节点的id
var parent_name = "";        //父节点的名字
var task_unique_Id = 0;      //自己的id
//============================================
var cretate_unique_Id = 0;   //创建任务时的taskId
//============================================
var task_name = "";          //自己的名字
var create_task_name = "";   //创建任务时的taskName
var task_groupId = 0;        //负责组的id
var task_group_name = "";    //负责组的名字
var task_changerId = 0;      //负责人的id
var task_changer_name = "";  //负责人的名字
var task_type = 0;           //任务的类型
var task_level = 0;          //任务的优先级
var task_start_time = "";    //任务的开始时间
var task_end_time = "";      //任务的结束时间
var task_plan_status = 0;    //任务的计划状态
//==============================================
var task_update_changerId = 0;
var project_name = "";

var editFlag = false;
var currentRow = 1;         //当前的行数
var targetRow = 1;          //目标行数

var task_progress = 0;

//设置升降级，上下移动的置灰装填
// var sure = new Vue({
//     el: '#sure4',
//     data: {
//         sure: !isAdmins(),
//     }
// });
/*var organizationVue = new Vue({
    el: '#organizationVue',
    data: {
        organizationList: "",
    }
});
var organizationVue2 = new Vue({
    el: '#organizationVue2',
    data: {
        organizationList2: "",
    }
});
var peopleVue = new Vue({
    el: '#peopleVue',
    data: {
        userList: "",
    }
});*/

var AccessoryVue = new Vue({
    el: '#AccVue',
    data: {
        accList: "",
    },
    filters: {
        formatTime: function (time) {
            return formatDateTime(new Date(time));
        }
    }
});


var CheckInfoVue = new Vue({
    el: '#CheckInfoVue',
    data: {
        checkList: "",
    },
    filters: {
        formatTime: function (time) {
            return formatDateTime(new Date(time));
        }
    }
});


var peopleVue2 = new Vue({
    el: '#peopleVue2',
    data: {
        userList2: "",
    }
});


var judge_P = new Vue({
    el: '#judge_permission',
    data: {
        ok: editFlag,
    }
});


//右边显示任务的vue
var taskRight = new Vue({
    el: '#task_right',
    data: {
        id: "1",
        task: "",
        prevTasks: ""
    },
    filters: {
        formatTimeStart: function (time) {
            return formatDateTime(new Date(time));
        },
        formatTimeEnd: function (time) {
            return formatDateTime2(new Date(time));
        }
    }
});

//前置任务的vue实例
var preTask = new Vue({
    el: "#pre_task",
    data: {
        taskList: ""
    },
    methods: {
        openOrClose: openClose,
        mouseDown: md
    }
});

//获取项目的名字
function getProjectInfo() {

    //组装数据
    var data = {
        "projectId": projectId,
        'userId': userId,
        'jwt': jwt
    }

    //发送ajax方法
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/getProjectInfo",
        data: data,
        dataType: 'json',
        success: function (msg) {
            project_name = msg.data;
        },
        error: function (message) {
            console.log(message);
        }
    });
}

//一加载就执行的方法
getProjectInfo();

$(function () {

    //创建新的任务进度的完成事件
    $("#myModal_2").on("click", ".modal-footer .btnSuccess", function () {
        //（1）获取页面上的所有数据
        //获取弹出框中的数据
        //要创建的任务进度的父节点的id就是当前节点的id
        var parent_Id = cretate_unique_Id;
        //获取当前任务进度的名字
        var taskProcessName = $("#myModal_2 .modal-content .modal-body .add_name").val().trim();
        if (taskProcessName == "") {
            toastr.options.timeOut = "2500";
            toastr.error("任务进度名字不能为空!");
            return false;
        }
        //任务进度的类型
        var taskType = task_type;
        //任务进度的优先级
        var tasklevel = task_level;
        //任务进度的负责群组
        //var groupId = task_groupId;
        //任务进度的负责人
        //var chargeUserId = task_changerId;
        //计划开始时间
        var planStartTime = $("#myModal_2 .modal-content .modal-body .time_row #datetimeStart").val().trim();
        if (planStartTime == "") {
            toastr.options.timeOut = "2500";
            toastr.error("开始时间不能为空!");
            return false;
        }
        if (!planStartTime.match(/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)) {
            toastr.options.timeOut = "2500";
            toastr.error("日期格式不对!必须是xxxx-xx-xx!");
            return false;
        }
        //console.log("planStartTime1:" + planStartTime);
        //计算开始时间
        var planStartDate = new Date(planStartTime);
        //获取毫秒值
        planStartTime = planStartDate.getTime();
        //console.log("planStartTime2:" + planStartTime);
        //排除假期的计算时间的毫秒值
        planStartTime = computeStart(planStartTime);
        //console.log("planStartTime3:" + planStartTime);

        //计划结束时间
        var planEndTime = $("#myModal_2 .modal-content .modal-body .time_row #datetimeEnd").val().trim();
        if (planEndTime == "") {
            toastr.options.timeOut = "2500";
            toastr.error("结束时间不能为空!");
            return false;
        }
        if (!planEndTime.match(/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)) {
            toastr.options.timeOut = "2500";
            toastr.error("日期格式不对!");
            return false;
        }
        //console.log("planEndTime1:" + planEndTime);
        //计算结束时间
        var planEndDate = new Date(planEndTime);
        //获取毫秒值
        planEndTime = planEndDate.getTime();
        //console.log("planEndTime2:" + planEndTime);
        //排除假期的计算时间的毫秒值
        planEndTime = computeEnd(planEndTime);
        //console.log("planEndTime3:" + planEndTime);

        //就是相隔的工作日
        var workday = computerDuration(planStartTime, planEndTime);

        //组装数据
        var data = {
            "projectId": projectId,
            "parenet_unique_Id": parent_Id,
            "taskProcessName": taskProcessName,
            "taskType": taskType,
            "tasklevel": tasklevel,
            "planStartTime": planStartTime,
            "planEndTime": planEndTime,
            "workday": workday,
            'userId': userId,
            'jwt': jwt
        }
        //console.log(data);

        //发送ajax方法
        $.ajax({
            type: "POST",
            url: zyfUrl + "/TaskProcess/newTaskProcess",
            data: data,
            dataType: 'json',
            success: function (msg) {
                console.log(msg);
                if (msg.code == 10000) {

                    $('#myModal_2').modal('hide');
                    /* $(".modal-backdrop.in").css("display", "none");*/
                    $(".modal-backdrop.in").hide();

                    //创建新的任务进度成功
                    loadFromServer();

                } else if (msg.code == 20002) {
                    toastr.options.timeOut = "2500";
                    toastr.error("任务不能同名!");
                } else {
                    toastr.options.timeOut = "2500";
                    toastr.error("服务器异常!");
                }
            },
            error: function (message) {
                console.log(message);
                toastr.options.timeOut = "2500";
                toastr.error("服务器忙,稍后再试!");
            }
        });

    });

    //每一行的点击事件
    $(document).on("mousedown", ".progress_center #workSpace .splitterContainer .splitBox1 .gdfTable .taskEditRow ", function () {
        //console.log('-----------------------');
        //找父节点的id
        var level = $(this).attr('level') - 1;
        if (level < 0) {
            parent_unique_Id = 0;
            parent_name = "";
        } else {
            $(this).prevAll('tr').each(function () {
                if ($(this).attr('level') == level) {
                    if ($(this).attr("taskid")) {
                        parent_unique_Id = $(this).attr("taskid");
                    }
                    if ($(this).children("td:eq(3)").children("input").val()) {
                        parent_name = $(this).children("td:eq(3)").children("input").val();
                    }
                    return false;
                }
            });
        }
        //parent_unique_id
        //console.log("父节点的id:" + parent_unique_Id);
        //父节点的名字
        //console.log("父节点的名字:" + parent_name);
        //taskId:唯一id
        if ($(this).attr("taskid")) {
            task_unique_Id = $(this).attr("taskid");
            cretate_unique_Id = task_unique_Id;
        }
        else {
            initProjectTask();
            return;
        }
        //console.log("任务进度的id:" + task_unique_Id);
        //任务的编号
        var taskNumber = 0;
        if ($(this).children("td:eq(2)").children("input").val()) {
            taskNumber = $(this).children("td:eq(2)").children("input").val();
        }
        //console.log("任务进度的编号:" + taskNumber);
        //任务进度的名字
        if ($(this).children("td:eq(3)").children("input").val()) {
            task_name = $(this).children("td:eq(3)").children("input").val();
            create_task_name = task_name;
        }
        //console.log("任务进度的任务:" + task_name);
        //任务的类型
        if ($(this).children("td:eq(4)").children("input").val()) {
            if ($(this).children("td:eq(4)").children("input").val().trim() == "一般任务") {
                task_type = "0";
            } else {
                task_type = "1";
            }
        }

        //console.log("任务的类型:" + task_type);
        //任务的优先级
        if ($(this).children("td:eq(1)").html()) {
            task_level = $(this).children("td:eq(1)").html();
        }
        //console.log("任务的优先级:" + task_level);
        //负责的群组的名字
        if ($(this).children("td:eq(13)").attr("id")) {
            task_groupId = $(this).children("td:eq(13)").attr("id");
            getPeopleByGroupId2(task_groupId);
        }
        //console.log("负责组的id:" + task_groupId);
        if ($(this).children("td:eq(13)").html()) {
            task_group_name = $(this).children("td:eq(13)").html()
        }
        //console.log("负责组的名字:" + task_group_name);

        //负责人的名字
        if ($(this).children("td:eq(14)").attr("id")) {
            task_changerId = $(this).children("td:eq(14)").attr("id");
        }
        if ($(this).children("td:eq(14)").attr("id")) {
            task_update_changerId = $(this).children("td:eq(14)").attr("id");
        }
        //console.log("负责人的id:" + task_changerId);
        if ($(this).children("td:eq(14)").html()) {
            task_changer_name = $(this).children("td:eq(14)").html();
        }
        //console.log("负责人的名字:" + task_changer_name);
        //任务的开始时间
        if ($(this).children("td:eq(5)").children("input").val()) {
            task_start_time = $(this).children("td:eq(5)").children("input").val();
        }
        //console.log("任务的开始时间:" + task_start_time);
        //任务的结束时间
        if ($(this).children("td:eq(6)").children("input").val()) {
            task_end_time = $(this).children("td:eq(6)").children("input").val();
        }
        //console.log("任务的结束时间:" + task_end_time);
        //console.log('---------------------');

        //获取第几行
        if ($(this).children("td:eq(0)").children("span").html()) {
            var row = $(this).children("td:eq(0)").children("span").html();
            currentRow = row;
            taskRight.id = row;
            taskRight.task = allTask[row - 1];
        }
        //console.log("row:"+row);

        getAllProjectTaskAccessoryByTaskId(task_unique_Id);
        getAllProjectTaskCheckInfoByTaskId(task_unique_Id);
        model_relactiveLog(task_unique_Id)
        //getPrevTasks(task_unique_Id);

        editFlag = true;
        judge_P.ok = true;

        //添加黄色的行数
        $('.splitElement.splitBox2 .ganttHighLight').css("background-color", "yellow");
    });

    //一开始就加载部门的信息
    /* function getDepartment() {
         $.ajax({
             type: "POST",
             url: zyfUrl + "/TaskProcess/getAllDepartment",
             data: {"projectId": projectId},
             async: true,
             dataType: 'json',
             success: function (msg) {
                 if (msg && msg.length > 0) {
                     organizationVue.organizationList = msg;
                     task_groupId = msg[0].organizationId;
                     //填充默认的人员
                     getPeopleByGroupId(task_groupId);
                 } else {
                     task_groupId = 0;
                     //填充默认的人员
                     getPeopleByGroupId(task_groupId);
                 }
             },
             error: function (message) {
                 console.log(message);
             }
         });
     }*/

    //修改任务的部门点开的事件
    /* function getUpdateDepartment() {
         $.ajax({
             type: "POST",
             url: projectName + "/TaskProcess/getAllDepartment",
             data: {"projectId": projectId},
             async: true,
             dataType: 'json',
             success: function (msg) {
                 if (msg && msg.length > 0) {
                     organizationVue2.organizationList2 = msg;
                     //填充默认的人员
                     getPeopleByGroupId2(msg[0].organizationId);
                 }
             },
             error: function (message) {
                 console.log(message);
             }
         });
     }*/

    //getDepartment();
    //getUpdateDepartment();

    //修改任务的完成事件
    $("#myModal_3").on("click", ".modal-footer .btnSuccess", function () {
        //（1）获取页面上的所有数据

        //获取当前任务进度的名字
        var taskProcessName = $("#myModal_3 .modal-content .modal-body .update_name").val().trim();
        if (taskProcessName == "") {
            toastr.options.timeOut = "2500";
            toastr.error("任务进度名字不能为空!");
            return false;
        }

        //任务进度的类型
        var taskType = $("#myModal_3 .modal-content .modal-body .typeSel_update option:selected").val();
        //任务进度的优先级
        var tasklevel = $("#myModal_3 .modal-content .modal-body .classSel_update option:selected").val();
        //任务进度的负责群组
        var groupId = $("#myModal_3 .modal-content .modal-body .groupSel_update option:selected").val();
        //任务进度的负责人
        var chargeUserId = task_update_changerId;

        //计划开始时间
        var planStartTime = $("#myModal_3 .modal-content .modal-body .time_row #updatetimeStart").val().trim();
        if (planStartTime == "") {
            toastr.options.timeOut = "2500";
            toastr.error("开始时间不能为空!");
            return false;
        }
        if (!planStartTime.match(/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)) {
            toastr.options.timeOut = "2500";
            toastr.error("日期格式不对!必须是xxxx-xx-xx!");
            return false;
        }
        //console.log("planStartTime1:" + planStartTime);
        //计算开始时间
        planStartTime = new Date(planStartTime);
        //获取毫秒值
        planStartTime = planStartTime.getTime();
        //console.log("planStartTime2:" + planStartTime);
        //排除假期的计算时间的毫秒值
        planStartTime = computeStart(planStartTime);
        //console.log("planStartTime3:" + planStartTime);

        //计划结束时间
        var planEndTime = $("#myModal_3 .modal-content .modal-body .time_row #updatetimeEnd").val().trim();
        if (planEndTime == "") {
            toastr.options.timeOut = "2500";
            toastr.error("结束时间不能为空!");
            return false;
        }
        if (!planEndTime.match(/^((?:19|20)\d\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)) {
            toastr.options.timeOut = "2500";
            toastr.error("日期格式不对!");
            return false;
        }
        //console.log("planEndTime1:" + planEndTime);
        //计算结束时间
        planEndTime = new Date(planEndTime);
        //获取毫秒值
        planEndTime = planEndTime.getTime();
        //console.log("planEndTime2:" + planEndTime);
        //排除假期的计算时间的毫秒值
        planEndTime = computeEnd(planEndTime);
        //console.log("planEndTime3:" + planEndTime);

        //就是相隔的工作日
        var workday = computerDuration(planStartTime, planEndTime);

        //组装数据
        var data = {
            "projectId": projectId,
            "taskId": task_unique_Id,
            "taskProcessName": taskProcessName,
            "taskType": taskType,
            "tasklevel": tasklevel,
            //"groupId": groupId,
            //"chargeUserId": chargeUserId,
            "planStartTime": planStartTime,
            "planEndTime": planEndTime,
            "workday": workday,
            'userId': userId,
            'jwt': jwt
        }
        /* console.log("=====================");
         console.log(data);
         console.log("=====================");*/

        //发送ajax方法
        $.ajax({
            type: "POST",
            url: zyfUrl + "/TaskProcess/updateTaskProcess",
            data: data,
            dataType: 'json',
            success: function (msg) {
                if (msg.code == 10000) {
                    $('#myModal_3').modal('hide');
                    $(".modal-backdrop.in").hide();
                    //修改任务进度成功
                    loadFromServer();
                } else if (msg.code == 20002) {
                    toastr.options.timeOut = "2500";
                    toastr.error("任务不能同名!");
                } else {
                    toastr.options.timeOut = "2500";
                    toastr.error("服务器异常!");
                }
            },
            error: function (message) {
                console.log(message);
                toastr.options.timeOut = "2500";
                toastr.error("服务器忙,稍后再试!");
            }
        });
    });

    //删除任务
    //确认删除
    $(".del-example").on("click", function () {
        if (task_unique_Id == 0) {
            toastr.error("请选中任务");
            return
        }

        if (allTask[currentRow - 1].activeStatus == "100%") {
            toastr.error("任务已完成，不可删除");
            return;
        }

        layer.confirm('确定删除当前任务及子任务吗？删除后不可恢复！', {
            time: 0 //不自动关闭
            , btn: ['取消', '删除'],
            icon: 7,
            title: "操作提示"
        }, function () {
            //取消操作
            layer.closeAll();
        }, function () {
            //删除操作
            $('#workSpace').trigger('deleteCurrentTask.gantt');
            //初始化
            //console.log("当前的task:")
            var task = ge.currentTask;
            //console.log(task);
            //console.log("======
            if (task) {
                cretate_unique_Id = task.id;
                task_unique_Id = task.id;
                task_name = task.name;
                create_task_name = task.name;
                task_level = task.taskLeave;
                task_type = task.taskType;
                task_update_changerId = task.chargeUser;
                task_changerId = task.chargeUser;
                task_changer_name = task.chargeUserName;
                task_groupId = task.chargeGroup;
                task_group_name = task.chargeGroupName;
                task_start_time = formatDateTime(new Date(task.start));
                task_end_time = formatDateTime(new Date(task.end));
                //右边的显示
                taskRight.id = task.getRow() + 1;
                taskRight.task = task;
                //当前的行数
                currentRow = task.getRow() + 1;
                //父节点的名字
                var parentTask = task.getParent();
                //console.log(parentTask);
                if (parentTask) {
                    parent_name = parentTask.name;
                } else {
                    parent_name = "";
                }
            } else {
                //数据初始化
                initDate();
                //右边的显示为空
                taskRight.id = "";
                taskRight.task = null;
            }
            layer.closeAll();
        });

    });

    //前置任务的点击事件
    $("#addPreTask").click(function () {
        preTaskId = allTask[0].id;
        targetRow = 1;
        //改变样式
        $("#myModal_7 .table-striped #preTr").each(function (index, ele) {
            //console.log("index:" + index);
            var td = $(ele).children("td:eq(2)");
            var level = td.attr("level");
            td.css("padding-left", (level * 20) + "px");
            //console.log("level:" + level);
        });
    });
});

//初始化数据
function initDate() {
    parent_unique_Id = 0;    //父节点的id
    parent_name = "";        //父节点的名字
    task_unique_Id = 0;      //自己的id
//============================================
    cretate_unique_Id = 0;   //创建任务时的taskId
//============================================
    task_name = "";          //自己的名字
    create_task_name = ""     //创建任务时的taskName
    task_groupId = 0;        //负责组的id
    task_group_name = "";    //负责组的名字
    task_changerId = 0;      //负责人的id
    task_changer_name = "";  //负责人的名字
    task_type = 0;           //任务的类型
    task_level = 0;          //任务的优先级
    task_start_time = "";    //任务的开始时间
    task_end_time = "";      //任务的结束时间
    task_update_changerId = 0;
    //======================================
    currentRow = 0;
}

//前置任务的伸缩
function openClose(code, event) {
    //console.log("伸缩:" + code);
    /*console.log(this);
    console.log($(event));*/
    //获取的是点击的元素
    var element = event.target;
    //获取该行，tr
    var parentTr = $(element).parent("td").parent("tr");
    var level = parentTr.attr("level");
    console.log('level:' + level);
    console.log(parentTr);
    //判断当前是收缩还是伸展
    var src = $(element).attr("src");
    console.log("src:" + src);
    if (src) {
        if (src.indexOf("down_btn.png") != -1) {
            //console.log("收缩!");
            //更改图标
            $(element).attr("src", projectName + "/img/up_btn.png");
            //获取所有的兄弟节点
            parentTr.nextAll("tr").each(function (index, ele) {
                /*console.log(index);
                console.log(ele);*/
                var childeCode = $(ele).children("td:eq(1)").html();
                if ($(ele).attr("level") > level) {
                    $(ele).children("td:eq(2)").children("img").attr("src", projectName + "/img/up_btn.png");
                }
                if (childeCode.indexOf(code) == 0) {
                    //说明包含该子元素，隐藏
                    $(ele).hide();
                }
            });
        } else {
            //console.log("伸展!");
            //伸展
            //更改图标
            $(element).attr("src", projectName + "/img/down_btn.png");
            //获取所有的兄弟节点
            parentTr.nextAll("tr").each(function (index, ele) {
                /*console.log(index);
                console.log(ele);*/
                var childeCode = $(ele).children("td:eq(1)").html();
                if ($(ele).attr("level") > level) {
                    $(ele).children("td:eq(2)").children("img").attr("src", projectName + "/img/down_btn.png");
                }
                if (childeCode.indexOf(code) == 0) {
                    //说明包含该子元素，隐藏
                    $(ele).show();
                }
            });
        }
    }
}

//前置任务的每行的点击事件
var preTaskId = 0;

function md(tasId, index, event) {
    var element = event.target;
    //console.log(element);
    $(element).parent("tr").siblings("tr").removeClass("bgColor");
    $(element).parent("tr").toggleClass("bgColor");
    //console.log("taskId:" + tasId);
    preTaskId = tasId;
    //获取前置任务的行数
    targetRow = index + 1;
}

var preTaskType = 3;

//前置任务的确认事件
$('#myModal_7 .btn-success').click(function () {

    /*console.log("currentRow:" + currentRow);
    console.log("taskId:" + task_unique_Id);
    console.log("targetRow:" + targetRow);
    console.log("preTaskId:" + preTaskId);*/

    /*if (currentRow == 1) {
        toastr.options.timeOut = "2500";
        toastr.error("根任务不能添加前置任务!");
        return false;
    }*/

    /* if (targetRow == 1) {
         toastr.options.timeOut = "2500";
         toastr.error("不能将根任务作为前置任务!");
         return false;
     }*/

    if (task_unique_Id == preTaskId) {
        toastr.options.timeOut = "2500";
        toastr.error("不能填加自己为前置任务!");
        return false;
    }

    //判断是否能添加前置任务
    //当前任务
    var currentTask = ge.tasks[currentRow - 1];
    //目标任务，即前置任务
    var targetTask = ge.tasks[targetRow - 1];
    //console.log(currentTask);
    //console.log(targetTask);
    //保存原始的依赖关系
    var tempDepends = currentTask.depends;
    var currentCode = currentTask.code + "";
    var targetCode = targetTask.code + "";
    if (currentCode.indexOf(".") == -1) {
        //说明没有.的话，就是根任务
        toastr.options.timeOut = "2500";
        toastr.error("根任务,不能填加前置任务!");
        return false;
    }
    if (targetCode.indexOf(".") == -1) {
        //说明没有.的话，就是根任务
        toastr.options.timeOut = "2500";
        toastr.error("前置任务不能为根任务!");
        return false;
    }
    if (currentTask.hasChild) {
        //说明有孩子不能添加，前置任务
        toastr.options.timeOut = "2500";
        toastr.error("父任务,不能填加前置任务!");
        return false;
    }
    if (targetTask.hasChild) {
        //说明有孩子不能添加为前置任务
        toastr.options.timeOut = "2500";
        toastr.error("前置任务不能为父任务!");
        return false;
    }

    /*if (currentTask.depends == "") {
        currentTask.depends = targetRow + "";
    } else {
        currentTask.depends += "," + targetRow;
    }*/
    //当前任务只能有一个前置任务
    if (tempDepends != "") {
        //不为空
        toastr.options.timeOut = "2500";
        toastr.error("该任务已经有前置任务了!");
        return false;
    } else {
        //currentTask.depends = targetRow + "";
    }

    // console.log(currentTask);
    // console.log("前置任务:" + currentTask.depends);
    // console.log(ge.tasks);
    // console.log(ge.updateLinks(ge.tasks[currentRow - 1]));
    if (!ge.updateLinks(ge.tasks[currentRow - 1])) {
        //恢复原始的依赖关系
        currentTask.depends = tempDepends;
        return false;
    }

    //前置任务的类型
    preTaskType = $("#pretaskTypeSel option:selected").val();

    /*
     * todo 根据任务的类型来执行相关的操作
     */
    switch (preTaskType) {
        case "3":
            ss(ge.tasks, currentRow, targetRow);//开始-开始
            break;
        case "2":
            sf(ge.tasks, currentRow, targetRow);//开始-结束
            break;
        case "1":
            fs(ge.tasks, currentRow, targetRow);//结束-开始
            break;
        case "0":
            ff(ge.tasks, currentRow, targetRow);//结束-结束
            break;
    }
    //更新前置任务的状态
    //更新添加前置任务后的时间
    /* var Maxtime = getMaxTime(ge.tasks, currentRow, currentTask.depends);
     var start = Maxtime;
     var end = currentTask.end;
     //判断当前任务的开始时间和Maxtime的大小
     if (currentTask.start < Maxtime) {
         //小于的话，那就变成Maxtime的后一天的时间
         start = computeStart(start);
         end = computeEndByDurationByMyself(start, currentTask.duration);
         //赋值
         ge.tasks[currentRow - 1].start = start;
         ge.tasks[currentRow - 1].end = end;
     } else {
         //大于的话，不做什么
     }*/
    //重新绘制
    //ge.redraw();

});

//开始-开始
function ss(tasks, currentRow, targetRow) {
    //前置任务是开始-开始的节奏，当前的开始时间必须和前置任务的开始时间一样
    var start = tasks[targetRow - 1].start;
    var duration = tasks[currentRow - 1].duration;
    //计算结束时间
    var end = computeEndByDurationByMyself(start, duration);
    //发送ajax方法
    preTaskCommon(start, end);
}


//开始-结束
function sf(tasks, currentRow, targetRow) {
    //开始-结束：当前任务的结束时间要在前置任务的前面一天
    //计算结束时间
    var end = computEndBySF(tasks[targetRow - 1].start).getTime();
    //通过结束时间和工作日来计算开始时间
    var start = computeStartByDurationByMyself(end, tasks[currentRow - 1].duration);
    //发送ajax方法
    preTaskCommon(start, end);
}

//结束-开始
function fs(tasks, currentRow, targetRow) {
    //结束-开始：当前任务的开始时间是前置任务的结束时间的后一天时间
    /* console.log("targetTask:");
     console.log(tasks[targetRow - 1]);
     console.log("end1:" + tasks[targetRow - 1].end);*/
    var start = computStartByFS(tasks[targetRow - 1].end).getTime();
    //console.log("start:" + start);
    //console.log("duration:" + tasks[currentRow - 1].duration);
    //根据开始时间和工作日来计算结束时间
    var end = computeEndByDurationByMyself(start, tasks[currentRow - 1].duration);
    console.log("end:" + end);
    //发送ajax方法
    preTaskCommon(start, end);
}

//结束-结束
function ff(tasks, currentRow, targetRow) {
    //结束-结束:当前任务的结束时间与前置任务的结束时间一致
    var end = tasks[targetRow - 1].end;
    var d = new Date(end);
    d.setDate(d.getDate() - 1);
    d.setHours(23, 59, 59, 59);
    end = d.getTime();
    //console.log('end:' + end);
    //计算开始时间
    var start = computeStartByDurationByMyself(end, tasks[currentRow - 1].duration);
    //发送ajax方法
    preTaskCommon(start, end);
}

function preTaskCommon(start, end) {
    //组装数据
    var data = {
        "projectId": projectId,
        "taskId": task_unique_Id,
        "preTaskId": preTaskId,
        "preTaskType": preTaskType,
        "start": start,
        "end": end,
        'userId': userId,
        'jwt': jwt
    };
    console.log("---------------");
    console.log(data);
    console.log("---------------");
    //发送ajax方法
    $.ajax({
        type: "POST",
        url: projectName + "/TaskProcess/addPreTaskProcess",
        data: data,
        dataType: 'json',
        success: function (msg) {
            if (msg >= 0) {
                $(".modal-backdrop.in").css("display", "none");
                $('#myModal_7').modal('hide');
                //重新加载
                loadFromServer();
            } else if (msg == -1) {
                toastr.options.timeOut = "2500";
                toastr.error("前置任务只能有一个!");
            } else if (msg == -2) {
                toastr.options.timeOut = "2500";
                toastr.error("前置任务不能是父任务!");
            } else if (msg == -3) {
                toastr.options.timeOut = "2500";
                toastr.error("已经有了相同的前置任务!");
            } else if (msg == -4) {
                toastr.options.timeOut = "2500";
                toastr.error("出现异常");
            } else if (msg == -5) {
                toastr.options.timeOut = "2500";
                toastr.error("前置任务添加失败!");
            } else {
                toastr.options.timeOut = "2500";
                toastr.error("服务器忙,稍后再试!");
            }
        },
        error: function (message) {
            console.log(message);
            toastr.options.timeOut = "2500";
            toastr.error("服务器忙,稍后再试!");
        }
    });
}

function getMaxTime(task, currentRow, dependIds) {
    //console.log(task);
    //console.log(currentRow);
    //console.log(dependIds);
    //找到所有依赖中的最大的结束时间
    var arrayIds = dependIds.split(",");
    var maxTime = task[arrayIds[0] - 1].end;
    for (var i = 0; i < arrayIds.length; i++) {
        if (maxTime < task[arrayIds[i] - 1].end) {
            maxTime = task[arrayIds[i] - 1].end;
        }
    }
    //console.log("最长的结束时间:" + maxTime);
    return maxTime;
}

//取消
$('#myModal_7 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_7').modal('hide');
});

//选中任务的类型
function selectType() {
    task_type = $("#myModal_2 .modal-content .modal-body .typeSel option:selected").val();
}

//选中优先级的
function selectLevel() {
    task_level = $("#myModal_2 .modal-content .modal-body .classSel option:selected").val();
}

//创建新的任务进度的显示事件
function showAddTask() {

    //将创建新的任务进度的模态框弹出来
    //初始化的操作
    init_task();

    //alert("显示!");
    $('#myModal_2').modal('show');
    /*$(".modal-backdrop.in").css("display", "block");*/
    $(".modal-backdrop.in").show();


}

function showMyMOdal7() {

    if (task_unique_Id == 0) {
        toastr.error("请选中任务");
        return
    }
    /*  if (!editFlag) {
          toastr.error("您没有修改权限");
          return;
      }*/

    $('#myModal_7').modal('show');
    /*$(".modal-backdrop.in").css("display", "block");*/
    $(".modal-backdrop.in").show();

}

//update任务进度的显示事件
function showUpdateTask() {
    if (task_unique_Id == 0) {
        toastr.error("请选中任务");
        return;
    }
    if (allTask[currentRow - 1].activeStatus == "100%") {
        toastr.error("任务已完成，不可修改");
        return;
    }

    /* if (!editFlag) {
         toastr.error("您没有修改权限");
         return;
     }*/

    //todo
    //初始化的操作
    init_updateTask();

    $('#myModal_3').modal('show');
    /*$(".modal-backdrop.in").css("display", "block");*/
    $(".modal-backdrop.in").show();

}

//创建任务的初始化的方法
function init_task() {

    //console.log("name:"+create_task_name);

    if (create_task_name == "") {
        create_task_name = project_name;
    }
    //给父级任务的名字赋值
    $("#myModal_2 .modal-content .modal-body .last_name").html(create_task_name);
    //当前任务节点的名字清空
    $("#myModal_2 .modal-content .modal-body .add_name").val("");
    //任务的类型
    $("#myModal_2 .modal-content .modal-body .typeSel").val("0");
    task_type = 0;
    //任务的优先级
    $("#myModal_2 .modal-content .modal-body .classSel").val("0");
    task_level = 0;

    //计划开始的时间清空
    $("#myModal_2 .modal-content .modal-body .time_row #datetimeStart").val("");
    //计划结束的时间清空
    $("#myModal_2 .modal-content .modal-body .time_row #datetimeEnd").val("");

}

//修改任务的初始化的方法
function init_updateTask() {

    if (parent_name == "") {
        parent_name = project_name;
    }
    //进行初始化的操作
    //给父节点名字赋值
    $("#myModal_3 .modal-content .modal-body .lastUpdate_name").html(parent_name);
    //给当前任务名字赋值
    $("#myModal_3 .modal-content .modal-body .update_name").val(task_name);
    //任务的类型
    $("#myModal_3 .modal-content .modal-body .typeSel_update").val(task_type);
    //任务的优先级
    $("#myModal_3 .modal-content .modal-body .classSel_update").val(task_level);

    //负责群组
    //创建群组
    /* var optionGroup = $("<option value=" + task_groupId + " selected>" + task_group_name + "</option>");
     //首先删除儿子
     $("#myModal_3 .modal-content .modal-body .groupSel_update").empty();*/
    //console.log("负责组的id:" + task_groupId);
    $("#myModal_3 .modal-content .modal-body .groupSel_update").val(task_groupId);

    //负责人
    /* //创建负责人
     var optionPeople = $("<option value=" + task_changerId + " selected>" + task_changer_name + "</option>");
     //首先删除孩子
     $("#myModal_3 .modal-content .modal-body .personSel_update").empty();*/
    //console.log("负责人的id:" + task_update_changerId);
    $("#myModal_3 .modal-content .modal-body #peopleVue2 .personSel_update").val(task_update_changerId);

    //判断当前的task是否有子孩子或者是有前置任务
    if (allTask[currentRow - 1].hasChild || allTask[currentRow - 1].depends != "") {
        //有孩子，则不能修改时间
        $("#myModal_3 .modal-content .modal-body .time_row #updatetimeStart").prop("disabled", true);
        $("#myModal_3 .modal-content .modal-body .time_row #updatetimeEnd").prop("disabled", true);
    } else {
        $("#myModal_3 .modal-content .modal-body .time_row #updatetimeStart").prop("disabled", false);
        $("#myModal_3 .modal-content .modal-body .time_row #updatetimeEnd").prop("disabled", false);
    }
    //计划开始的时间赋值
    $("#myModal_3 .modal-content .modal-body .time_row #updatetimeStart").val(task_start_time);
    //计划结束的时间赋值
    $("#myModal_3 .modal-content .modal-body .time_row #updatetimeEnd").val(task_end_time);
}

//部门选择框点击事件后，人员也跟着变化
function getPeople() {
    var groupId = $("#myModal_2 .modal-content .modal-body .groupSel option:selected").val();
    //console.log("groupId:" + groupId);
    task_groupId = groupId;
    getPeopleByGroupId(groupId);
}

//封装的填充人员的方法
/*function getPeopleByGroupId(groupId) {
    //发送ajax请求来填充人员
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/getAllPeopleByGroupId",
        data: {"groupId": groupId, "projectId": projectId},
        async: true,
        dataType: 'json',
        success: function (msg) {
            if (msg && msg.length > 0) {
                peopleVue.userList = msg;
                task_changerId = msg[0].userId;
            } else {
                peopleVue.userList = msg;
                task_changerId = 0;
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
    //-------------------------------------------------------
    /!* if (peopleVue.userList && peopleVue.userList != "") {
         task_changerId = peopleVue.userList[0].userId;
     } else {
         task_changerId = 0;
     }*!/
    //-------------------------------------------------------
}*/

//选中负责人的方法
function selectPeople() {
    task_changerId = $("#myModal_2 .modal-content .modal-body .personSel option:selected").val();
}

function getPeople2() {
    var groupId = $("#myModal_3 .modal-content .modal-body .groupSel_update option:selected").val();
    getPeopleByGroupId2(groupId);
}

function getPeopleByGroupId2(groupId) {
    //console.log("填充组内中的人员~~");
    //发送ajax请求来填充人员
    $.ajax({
        type: "POST",
        url: projectName + "/TaskProcess/getAllPeopleByGroupId",
        data: {"groupId": groupId, "projectId": projectId},
        async: false,
        dataType: 'json',
        success: function (msg) {
            if (msg && msg.length > 0) {
                //console.log("有数据~~");
                peopleVue2.userList2 = msg;
            } else {
                peopleVue2.userList2 = msg;
                task_update_changerId = 0;
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
    //console.log("出来了~");
}

function selectPeople2() {
    task_update_changerId = $("#myModal_3 .modal-content .modal-body .personSel_update option:selected").val();
    //console.log("task_update_changerId:" + task_update_changerId);
}


//////////////////// judge add update delete permission/////////////////////////

/*function judgePermission(code) {
    var flag = false;

    $.ajax({
        type: "POST",
        url: projectName + "/TaskProcess/isHasPermission",
        data: {
            "projectTaskInfoId": task_unique_Id,
            "code": code,
            "projectId": window.localStorage.getItem('activeProjectId')
        },
        async: false,
        dataType: 'json',
        success: function (msg) {
            //console.log(msg)
            if (msg == true) {
                flag = true;
                console.log("1")
            } else if (msg == false) {
                console.log("2");
            } else {
                window.location = projectName + "/user/login";
                console.log("3");
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
    return flag;
}*/

/*function isAdmins() {
    var flag = false;
    $.ajax({
        type: "POST",
        url: projectName + "/TaskProcess/isAdmin",
        data: {"projectId": window.localStorage.getItem('activeProjectId')},
        async: false,
        dataType: 'json',
        success: function (msg) {
            console.log(msg)
            if (msg == true) {
                flag = true;
            } else if (msg == false) {

            } else {
                window.location = projectName + "/user/login"
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
    return flag;
}*/

function getAllProjectTaskAccessoryByTaskId(id) {
    if (id == 0) {
        return;
    }
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/getAllAccessoryByProjectTaskId",
        data: {
            "projectId": projectId,
            "processTaskId": id,
            'userId': userId,
            'jwt': jwt
        },
        async: false,
        dataType: 'json',
        success: function (msg) {
            //console.log("附件的信息!!!!!");
            //console.log(msg);
            AccessoryVue.accList = msg.data;
        },
        error: function (message) {
            console.log(message);
        }
    });

}

function addCheckRecord() {
    var checkTime = $("#checkTime").val();
    var num = $("#check_Num").html().trim();
    // if(checkTime==""){
    //     toastr.error("请选择时间")
    //     return ;
    // }

    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/verify/add",
        // contentType: "application/json",
        data: {
            "projectId": projectId,
            "processTaskId": task_unique_Id,
            "checkTime": checkTime,
            "num": num,
            'userId': userId,
            'jwt': jwt
        },
        dataType: 'json',
        success: function (msg) {
            if (msg.code == 10000) {
                toastr.success("添加记录成功");
                loadFromServer();
            }
        },
        error: function (message) {
            console.log(message);
        }
    });

}

function judgeTaskIsExits() {
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/judgeTaskIsExits",
        data: {
            "projectId": projectId,
            'userId': userId,
            'jwt': jwt
        },
        async: false,
        dataType: 'json',
        success: function (msg) {
            if (msg.data == true) {
                toastr.error("该项目已有任务了，不能上传！");
            } else {
                $('#myModal_4').modal('show');
                /*$(".modal-backdrop.in").css("display", "block");*/
                $(".modal-backdrop.in").show();
            }
        },
        error: function (message) {
            console.log(message);
        }
    });

}


//导出excel
// function downloadMppToExcel() {
//     if (task_unique_Id == "0") {
//         toastr.error("没有任务");
//         return;
//     } else {
//         var param = '&projectId=' + window.localStorage.getItem("activeProjectId");
//         download(projectName + "/mpp/toExcel", param, 'get');
//     }
//
//
// }
//
function downloadMppToExcel() {
    /*if (task_unique_Id == "0") {
        toastr.error("没有任务");
        return;
    }*/
    JSONToExcelConvertor(allTask, allTask[0].name, ["序号", "优先级", "编号", "名称", "里程碑", "计划开始", "计划结束", "实际开始", "实际结束", "工作日", "计划状态", "实际状态", "对比状态"]);
}


var download = function (url, data, method) {
    // 获取url和data
    if (url && data) {
        // data 是 string 或者 array/object
        data = typeof data == 'string' ? data : jQuery.param(data);
        // 把参数组装成 form的  input
        var inputs = '';
        jQuery.each(data.split('&'), function () {
            var pair = this.split('=');
            inputs += '<input type="hidden" name="' + pair[0] + '" value="' + pair[1] + '" />';
        });
        // request发送请求
        jQuery('<form action="' + url + '" method="' + (method || 'post') + '">' + inputs + '</form>')
            .appendTo('body').submit().remove();
    }
    ;
}


$(document).on('click', '.splitElement.splitBox2 .ganttSVGBox', function () {
    //初始化
    initProjectTask();
});


$(document).on('click', '.progress_center .ganttButtonBar.noprint', function (e) {
    var targetElement = $('.progress_center .ganttButtonBar.noprint .buttons button').add('.progress_center .ganttButtonBar.noprint .buttons input').add('.progress_center .ganttButtonBar.noprint .buttons select').add('.progress_center .ganttButtonBar.noprint .buttons img');
    //初始化
    if (!targetElement.is($(e.target))) {
        initProjectTask();
    }
});


function initProjectTask() {
    var _con = $('tbody tr');
    $(_con).removeClass('rowSelected');
    $('.splitElement.splitBox2 .ganttHighLight').css("background-color", "white");
    //初始化
    cretate_unique_Id = 0;
    create_task_name = "";
    task_unique_Id = 0;
    //console.log("点击了，右边的空白处!!");
    //右侧清空
    taskRight.id = "";
    taskRight.task = "";
    taskRight.prevTasks = "";
}


//andCheck
//分段
var thisW = 498 / 100 * 25;
$(".span25").css("left", thisW + "px");
var thisW = 498 / 100 * 50;
$(".span50").css("left", thisW + "px");
var thisW = 498 / 100 * 75;
$(".span75").css("left", thisW + "px");
var thisW = 498;
$(".span100").css("left", "488px");

var tag = false, ox = 0, left, bgleft = 0;
$('.progress_btn').mousedown(function (e) {
    ox = e.pageX - left;//pageX是鼠标指针相对于文档的左边缘的位置
    console.log(left)
    console.log(ox)
    tag = true;
});
$(document).mouseup(function () {
    tag = false;
});
$('.progress').mousemove(function (e) {//鼠标移动
    if (tag) {
        left = e.pageX - ox;
        console.log(e.pageX)
        console.log(ox);
        console.log(left);
        if (left <= 498 / 100 * task_progress) {
            left = 498 / 100 * task_progress;
        } else if (left > 498) {
            left = 498;
        } else if (left == 498) {
            $(".progress .text").css('margin-left', "488px");
        }
        $('.progress_btn').css('left', left);
        $('.progress_bar').width(left);
        $('.progress .text').html(parseInt((left / 498) * 100));
        if (left < 498) {
            $(".progress .text").css('margin-left', left);
        } else if (left == 498) {
            $(".progress .text").css('margin-left', "488px");
        }
    }
});
$('.progress_bg').click(function (e) {//鼠标点击
    if (!tag) {
        bgleft = $('.progress_bg').offset().left;
        left = e.pageX - bgleft;
        if (left <= 498 / 100 * task_progress) {
            left = 498 / 100 * task_progress;
        } else if (left > 498) {
            left = 498;
        }
        $('.progress_btn').css('left', left);
        $('.progress_bar').animate({width: left}, 498);
        $('.progress .text').html(parseInt((left / 498) * 100));
        if (left < 498) {
            $(".progress .text").css('margin-left', left);
        } else if (left == 498) {
            $(".progress .text").css('margin-left', "488px");
        }
    }
});
//左右控制
$(".progress_center .left1_img").click(function () {
    $(this).hide(0);
    $(".progress_left").show();
    // $(".progress_left").animate({width: "300px"}, 600);
    // $(".progress_center").animate({left: "300px"}, 600);
})
$(".progress_left .aleft").click(function () {
    $(".progress_left").hide(0);
    // $(".progress_center .left1_img").show(600);
    // $(".progress_center").animate({left: "0"}, 600);
})
$(".progress_center .right1_img").click(function () {
    $(this).hide(0);
    $(".progress_right").show();
    // $(".progress_right").animate({width: "300px"}, 600);
//            $(".progress_center").animate({right: "220px"}, 600);
})
$(".progress_right .aright").click(function () {
    $(".progress_right").hide(0);
    // $(".progress_center .right1_img").show().animate({right: "0"}, 600);
    // $(".progress_center").animate({right: "0"}, 600);
})
//        右边
$(".progress_right .right_center").on("click", ".top_text", function () {
    $(".progress_right .right_center .top_text").removeClass("green");
    $(this).addClass("green");
})
$(".progress_right .right_center .left_text").click(function () {
    $(".progress_right .task_center").show();
    $(".progress_right .check_center").hide();
    $(".progress_right .model_relactive").hide();
})
$(".progress_right .right_center .right_text").click(function () {
    $(".progress_right .task_center").hide();
    $(".progress_right .check_center").show();
    $(".progress_right .model_relactive").hide();
})
$(".progress_right .right_center .rr_text").click(function () {
    $(".progress_right .task_center").hide();
    $(".progress_right .check_center").hide();
    $(".progress_right .model_relactive").show();
})
//checkTime
var checkin1 = $('#checkTime').fdatepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
    pickerPosition: 'bottom-right',
    startDate: new Date(),
}).on('changeDate', function (ev) {
    //if (ev.date.valueOf() > checkout1.date.valueOf()) {
    var newDate = new Date(ev.date)
    newDate.setDate(newDate.getDate() + 1);
}).data('datepicker');


function getAllProjectTaskCheckInfoByTaskId(id) {
    if (id == 0) {
        return;
    }
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/verify/getRecords",
        data: {
            "processTaskId": id,
            "projectId": projectId,
            'userId': userId,
            'jwt': jwt
        },
        async: false,
        dataType: 'json',
        success: function (response) {
            //console.log(response);
            var msg = response.data;
            //console.log(msg);
            CheckInfoVue.checkList = msg;
            if (msg.length > 0) {
                task_progress = msg[0].taskCheckProcess;
                left = 498 / 100 * task_progress;
                console.log(left)
                $(".progress_btn").css('pointer-events', 'auto');
                $(".progress_bg").css('pointer-events', 'auto');

            } else {
                task_progress = 0;
                left = 0;
                $(".progress_btn").css('pointer-events', 'none');
                $(".progress_bg").css('pointer-events', 'none');


            }
            $('.progress_btn').css('left', left);
            $('.progress_bar').width(left);
            $('.progress .text').html(parseInt((left / 498) * 100));
            if (left < 498) {
                $(".progress .text").css('margin-left', left);
            } else if (left == 498) {
                $(".progress .text").css('margin-left', "488px");
            }
        },
        error: function (message) {
            console.log(message);
        }
    });

}


$("#addCheckRecord").click(function () {
    if (task_unique_Id == 0) {
        toastr.error("请选中任务");
        return
    }
    if (allTask[currentRow - 1].hasChild) {
        toastr.error("请选中子任务");
        return;
    }

    /* if (!editFlag) {
         toastr.error("您没有修改权限");
         return;
     }*/

    $('#myModal_1').modal('show');
    /*$(".modal-backdrop.in").css("display", "block");*/
    $(".modal-backdrop.in").show();

});


function deleteAcc(index) {
    /*if (!editFlag) {
        toastr.error("您没有权限");
        return;
    }*/
    var id = AccessoryVue.accList[index].taskAccessoryId;
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/accessory/delete",
        data: {
            "taskAccessoryId": id,
            "projectId": projectId,
            'userId': userId,
            'jwt': jwt
        },
        dataType: 'json',
        success: function (msg) {
            if (msg.code == 10000) {
                toastr.success("删除成功");
                getAllProjectTaskAccessoryByTaskId(task_unique_Id);

            } else {
                toastr.error("删除失败");
            }
        },
        error: function (message) {
            console.log(message);
        }
    });

}


function downloadAcc(index) {
    /* if (!editFlag) {

         toastr.error("您没有权限");
         return;
     }*/
    var id = AccessoryVue.accList[index].taskAccessoryId;

    var param = '&accessoryId=' + id;
    download(zyfUrl + "/TaskProcess/accessory/download", param, 'get');
}

/*function getPrevTasks(id) {
    if (id == 0) {
        return;
    }
    //console.log("getPrevTasks");
    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/prevTask/get",
        data: {"taskInfoId": id, "projectId": projectId},
        dataType: 'json',
        success: function (msg) {
            // console.log("getPrevTasks============");
            taskRight.prevTasks = msg.data;
        },
        error: function (message) {
            console.log(message);
        }
    });

}*/

function deletePrevTask(index) {
    /*if (!editFlag) {

        toastr.error("您没有权限");
        return;
    }*/
    var prevId = taskRight.prevTasks[index].processUniqeId;

    $.ajax({
        type: "POST",
        url: zyfUrl + "/TaskProcess/prevTask/delete",
        data: {
            "selfId": task_unique_Id,
            "prevId": prevId,
            "projectId": projectId,
            'userId': userId,
            'jwt': jwt
        },
        dataType: 'json',
        success: function (msg) {
            if (msg == true) {
                toastr.success("删除成功")
                loadFromServer();
                // getPrevTasks(task_unique_Id);

            } else {
                toastr.error("删除失败")
            }
        },
        error: function (message) {
            console.log(message);
        }
    });
}

function alertMsg() {
    toastr.error("没有权限");
}