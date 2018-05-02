var zNodes;
var ge;  //this is the hugly but very friendly global var for the gantt editor
var tasks = [];
var project = {
    "tasks": [],
    "selectRow": 0,
    "canWrite": true,
    "canWriteOnParent": true
};

$(function () {

    //load templates

    // $("#ganttemplates").loadTemplates();

    // here starts gantt initialization
    ge = new GanttMaster();

    //TODO: 是否自动显示bar
    ge.isBrowserTaskBar = true;

    //TODO: 设置code是否自动编码
    ge.isLevelCode = true;

    var workSpace = $("#workSpace");

    workSpace.css({width: $(window).width(), height: $(window).height() - 100 - 56});

    ge.init(workSpace);

    //inject some buttons (for this demo only)

    // $(".ganttButtonBar div")
    //.append("<button onclick='clearGantt();' class='button'>clear</button>")

    //                .append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
    //
    //     .append("<button onclick='downloadMppToExcel();' class='btn oneBtn export pull-right'>导出</button>");
    // $(".ganttButtonBar div").append("<button class='btn oneBtn' data-toggle='modal' data-target='myModal_4'>导入</button>");
//        $(".ganttButtonBar h1").html("<a href='http://twproject.com' title='Twproject the friendly project and work management tool' target='_blank'><img width='80%' src='/sbimweb/js/plugins/gantt/res/twBanner.jpg'></a>");

    // $(".ganttButtonBar div").addClass('buttons');

    //overwrite with localized ones

    loadI18n();

    //simulate a data load from a server.

    loadGanttFromServer();

    //fill default Teamwork roles if any

    if (!ge.roles || ge.roles.length == 0) {

        setRoles();

    }

    //fill default Resources roles if any

    if (!ge.resources || ge.resources.length == 0) {

        setResource();

    }

    /*/debug time scale

    $(".splitBox2").mousemove(function(e){

      var x=e.clientX-$(this).offset().left;

      var mill=Math.round(x/(ge.gantt.fx) + ge.gantt.startMillis)

      $("#ndo").html(x+" "+new Date(mill))

    });*/

    $(window).resize(function () {

        workSpace.css({width: $(window).width() - 20, height: $(window).height() - 100 - 56});

        workSpace.trigger("resize.gantt");

    })


});

function loadGanttFromServer(taskId, callback) {

    //this is a simulation: load data from the local storage if you have already played with the demo or a textarea with starting demo data

    //loadFromLocalStorage();
    loadFromServer();

    //this is the real implementation
    /*
    //var taskId = $("#taskSelector").val();
    var prof = new Profiler("loadServerSide");
    prof.reset();
    */

}

function saveGanttOnServer() {

    if (!ge.canWrite)

        return;

    //this is a simulation: save data to the local storage or to the textarea

    saveInLocalStorage();

    /*

    var prj = ge.saveProject();



    delete prj.resources;

    delete prj.roles;



    var prof = new Profiler("saveServerSide");

    prof.reset();



    if (ge.deletedTaskIds.length>0) {

      if (!confirm("TASK_THAT_WILL_BE_REMOVED\n"+ge.deletedTaskIds.length)) {

        return;

      }

    }

    */

}

//-------------------------------------------  Create some demo data ------------------------------------------------------

function setRoles() {

    ge.roles = [

        {

            id: "tmp_1",

            name: "Project Manager"

        },

        {

            id: "tmp_2",

            name: "Worker"

        },

        {

            id: "tmp_3",

            name: "Stakeholder/Customer"

        }

    ];

}

function setResource() {

    var res = [];

    for (var i = 1; i <= 10; i++) {

        res.push({id: "tmp_" + i, name: "Resource " + i});

    }
    ge.resources = res;

}

function editResources() {

}

function clearGantt() {

    ge.reset();

}

function loadI18n() {

    GanttMaster.messages = {

        "CANNOT_WRITE": "不能编辑",
        "CHANGE_OUT_OF_SCOPE": "没有超出编辑范围更新父级的权限",
        "START_IS_MILESTONE": "开始是里程碑",
        "END_IS_MILESTONE": "结束是里程碑",
        "TASK_HAS_CONSTRAINTS": "任务包含约束",
        "GANTT_ERROR_DEPENDS_ON_OPEN_TASK": "错误：特定于开放的任务",
        "GANTT_ERROR_DESCENDANT_OF_CLOSED_TASK": "错误：衍生于关闭的任务",
        "TASK_HAS_EXTERNAL_DEPS": "任务包含外部依赖",
        "GANTT_ERROR_LOADING_DATA_TASK_REMOVED": "错误：加载被删除的任务",
        "ERROR_SETTING_DATES": "日期时间设置错误（依赖时间关系或父级任务工期）",
        "CIRCULAR_REFERENCE": "有无限循环参照",
        "CANNOT_DEPENDS_ON_ANCESTORS": "不能依赖父级任务",
        "CANNOT_DEPENDS_ON_DESCENDANTS": "不能依赖子级任务",
        "INVALID_DATE_FORMAT": "无效日期格式",
        "TASK_MOVE_INCONSISTENT_LEVEL": "任务移动非连续级别",
        "GANTT_QUARTER_SHORT": "季度",
        "GANTT_SEMESTER_SHORT": "半年"
    };

}

//-------------------------------------------  Get project file as JSON (used for migrate project from gantt to Teamwork) ------------------------------------------------------

function getFile() {

    $("#gimBaPrj").val(JSON.stringify(ge.saveProject()));

    $("#gimmeBack").submit();

    $("#gimBaPrj").val("");


    /*  var uriContent = "data:text/html;charset=utf-8," + encodeURIComponent(JSON.stringify(prj));

     neww=window.open(uriContent,"dl");*/

}

//-------------------------------------------  LOCAL STORAGE MANAGEMENT (for this demo only) ------------------------------------------------------

Storage.prototype.setObject = function (key, value) {

    this.setItem(key, JSON.stringify(value));

};

Storage.prototype.getObject = function (key) {

    return this.getItem(key) && JSON.parse(this.getItem(key));

};

function loadFromLocalStorage() {

    var ret;

    if (localStorage) {
        if (localStorage.getObject("teamworkGantDemo")) {
            ret = localStorage.getObject("teamworkGantDemo");
        }
    } else {
        $("#taZone").show();
    }

    if (!ret || !ret.tasks || ret.tasks.length == 0) {
        ret = JSON.parse($("#ta").val());
        //actualiza data
        var offset = new Date().getTime() - ret.tasks[0].start;
        for (var i = 0; i < ret.tasks.length; i++)
            ret.tasks[i].start = ret.tasks[i].start + offset;
    }

    console.log("=============");
    console.log(ret);
    console.log("=============");

    ge.loadProject(ret);

    ge.checkpoint(); //empty the undo stack

    //自动编号
    ge.levelCode();

}

function loadFromServer() {
    /* if (localStorage) {
         if (localStorage.getObject("teamworkGantDemo")) {
             ret = localStorage.getObject("teamworkGantDemo");
         }
     } else {
         $("#taZone").show();
     }*/
//        var project ={
//            "tasks":[],
//            "selectRow":0,
//            "canWrite":true,
//            "canWriteOnParent":true
//        };
    console.log("获取所有的任务信息!");
    tasks = getAllProjectTaskInfos();
    project.tasks = tasks;

    /* if (!ret || !ret.tasks || ret.tasks.length == 0) {
         ret = JSON.parse($("#ta").val());
         //actualiza data
         var offset = new Date().getTime() - ret.tasks[0].start;
         for (var i = 0; i < ret.tasks.length; i++)
             ret.tasks[i].start = ret.tasks[i].start + offset;
     }*/

    console.log("=======================================");
    console.log(project);
    console.log("=======================================");

    ge.loadProject(project);

    ge.checkpoint(); //empty the undo stack

    //自动编号
    ge.levelCode();
}

function saveInLocalStorage() {

    var prj = ge.saveProject();

    if (localStorage) {

        localStorage.setObject("teamworkGantDemo", prj);

    } else {

        $("#ta").val(JSON.stringify(prj));

    }

}

//-------------------------------------------  Open a black popup for managing resources. This is only an axample of implementation (usually resources come from server) ------------------------------------------------------

function editResources() {

    //make resource editor

    var resourceEditor = Jquery.JST.createFromTemplate({}, "RESOURCE_EDITOR");

    var resTbl = resourceEditor.find("#resourcesTable");


    for (var i = 0; i < ge.resources.length; i++) {

        var res = ge.resources[i];

        resTbl.append(Jquery.JST.createFromTemplate(res, "RESOURCE_ROW"))

    }


    //bind add resource

    resourceEditor.find("#addResource").click(function () {

        resTbl.append(Jquery.JST.createFromTemplate({id: "new", name: "resource"}, "RESOURCE_ROW"))

    });


    //bind save event

    resourceEditor.find("#resSaveButton").click(function () {

        var newRes = [];

        //find for deleted res

        for (var i = 0; i < ge.resources.length; i++) {

            var res = ge.resources[i];

            var row = resourceEditor.find("[resId=" + res.id + "]");

            if (row.size() > 0) {

                //if still there save it

                var name = row.find("input[name]").val();

                if (name && name != "")

                    res.name = name;

                newRes.push(res);

            } else {

                //remove assignments

                for (var j = 0; j < ge.tasks.length; j++) {

                    var task = ge.tasks[j];

                    var newAss = [];

                    for (var k = 0; k < task.assigs.length; k++) {

                        var ass = task.assigs[k];

                        if (ass.resourceId != res.id)

                            newAss.push(ass);

                    }

                    task.assigs = newAss;

                }

            }

        }


        //loop on new rows

        resourceEditor.find("[resId=new]").each(function () {

            var row = $(this);

            var name = row.find("input[name]").val();

            if (name && name != "")

                newRes.push(new Resource("tmp_" + new Date().getTime(), name));

        });


        ge.resources = newRes;


        closeBlackPopup();

        ge.redraw();

    });


    var ndo = createBlackPage(400, 500).append(resourceEditor);

}

//编辑
/*$(document).on('click', '.myModal_3', function () {
    $('.gdfTable tbody tr').each(function () {
        if ($(this).hasClass('rowSelected')) {
            $('.update_name').val($(this).children('th').siblings('.indentCell').children('input').val());
            console.log($(this).attr('level'));
            var level = $(this).attr('level') - 1;
            var preAll = $(this).prevAll('tr');
            preAll.each(function () {
                if ($(this).attr('level') == level) {
                    $('.lastUpdate_name').html($(this).children('th').siblings('.indentCell').children('input').val());
                    return false;
                }
            })
        }
    })
})*/


function queryfun() {
    console.log("按下了!!!");
    var tempTasks = [];
    var conditon = $("#qaq_search").val().trim();
    /*var group = $("#dept option:selected").val();
    if (group == "-1") {
        tasks.forEach(e => {
            if (e.name.indexOf(conditon) != -1)
                tempTasks.push(e);
        });
    } else {
        tasks.forEach(e => {
            if (e.name.indexOf(conditon) != -1 && e.chargeGroup == group)
                tempTasks.push(e);
        });
    }*/
    for(var i=0;i<tasks.length;i++){
        if(tasks[i].name.indexOf(conditon)!= -1){
            tempTasks.push(tasks[i]);
        }
    }
    project.tasks = tempTasks;
    ge.loadProject(project);
    ge.checkpoint();
    ge.levelCode();
}

// $('.oneBtn').click(function () {
//     $('#myModal_4').show();
// })


var nowTemp = new Date();
var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
//console.log(nowTemp);
//console.log(now.valueOf());
var checkin1 = $('#datetimeStart').fdatepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
//            startView:'2',
//            minView:'0',
    onRender: function (date) {
        return date.valueOf() < now.valueOf() ? 'disabled' : '';
    }
}).on('changeDate', function (ev) {
    if (ev.date.valueOf() > checkout1.date.valueOf()) {
        var newDate = new Date(ev.date)
        newDate.setDate(newDate.getDate());
        //newDate.setDate(newDate.getDate());
        checkout1.update(newDate);
    }
    checkin1.hide();
    //$('#datetimeEnd')[0].focus();
}).data('datepicker');

var checkout1 = $('#datetimeEnd').fdatepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
    onRender: function (date) {
        return date.valueOf() < checkin1.date.valueOf() ? 'disabled' : '';
    }
}).on('changeDate', function (date) {
    checkout1.hide();
    return date.valueOf() < checkin1.date.valueOf() ? 'disabled' : '';
}).data('datepicker');
//end
//})
//updateTask
var nowTemp = new Date();
var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
var checkin2 = $('#updatetimeStart').fdatepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
//            startView:'2',
//            minView:'0',
    onRender: function (date) {
        return date.valueOf() < now.valueOf() ? 'disabled' : '';
    }
}).on('changeDate', function (ev) {
    if (ev.date.valueOf() > checkout2.date.valueOf()) {
        var newDate = new Date(ev.date)
        newDate.setDate(newDate.getDate());
        checkout2.update(newDate);
    }
    checkin2.hide();
    //$('#datetimeEnd')[0].focus();
}).data('datepicker');

var checkout2 = $('#updatetimeEnd').fdatepicker({
    format: 'yyyy-mm-dd',
    language: 'zh-CN',
    onRender: function (date) {
        return date.valueOf() < checkin2.date.valueOf() ? 'disabled' : '';
    }
}).on('changeDate', function (date) {
    checkout2.hide();
    return date.valueOf() < checkin2.date.valueOf() ? 'disabled' : '';
}).data('datepicker');

//  添加核实记录模态框
//确认
$('#myModal_1 .btn-success').click(function () {
    if ($("#checkTime").val() == "") {
        toastr.error("请选择时间")
        return;
    }
    addCheckRecord();
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_1').modal('hide');
})
//取消
$('#myModal_1 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_1').modal('hide');
})
//  添加任务模态框
//确认
$('#myModal_2 .btn-success').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_2').modal('hide');
})
//取消
$('#myModal_2 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_2').modal('hide');
})
//  修改任务模态框
//确认
$('#myModal_3 .btn-success').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_3').modal('hide');
})
//取消
$('#myModal_3 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_3').modal('hide');
})
//  导入 MS Project文件模态框
//确认
//移到addfile.js里面了
//        $('#myModal_4 .btn-success').click(function () {
//            console.log($("#filelist>li"))
//            if ($(".after_img").css("display")=="block") {
//                $(".modal-backdrop.in").css("display", "none");
//                $('#myModal_4').modal('hide');
//                $('#myModal_5').modal('show');
//            } else {
//                toastr.error("请先导入文件！");
//            }
//        })
//取消
$('#myModal_4 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_4').modal('hide');
})
//关闭模态框销毁WebUploader，解决再次打开模态框时按钮越变越大问题
$('#myModal_4').on('hide.bs.modal', function () {
    // $("#responeseText").text("");
    // uploader.destroy();
    $("#fileList").empty("li");
});
//添加文件按钮
$(".addFile_btn").click(function () {
    $(".default_img").show();
    $(".after_img").hide();
    $(".filelist").remove();
    $(".webuploader-pick").show();
    $(".file_text").show();

})
//预览文件
//确认
$('#myModal_5 .btn-success').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_5').modal('hide');
    $('#myModal_4').modal('hide');
    // uploadSure();
    //$('#myModal_5').modal('show');
})
//取消
$('#myModal_5 .btn-default').click(function () {
    //$(".modal-backdrop.in").css("display", "none");
    $('#myModal_5').modal('hide');
    $('#myModal_4').show();
});
//添加前置任务

//显示列任务
//确认
$('#myModal_8 .btn-success').click(function () {
    //显示列
    var listArr = [];
    //不显示列
    var no_listArr = [];
    $(".lists .list_btn").each(function () {
        if ($(this).is(':checked')) {
            listArr.push($(this).siblings(".list_name").html());
        } else {
            no_listArr.push($(this).siblings(".list_name").html());
        }
    })
    no_listArr.forEach(function (item, index) {
        $(".gdfTable>thead>tr>th").each(function (index1, item1) {
            if (item == $(this).html()) {
                $(this).hide();
                $(".gdfTable tr").each(function () {
                    $(this).find('td').eq(index1).hide();
                })
            }
        })
    })
    listArr.forEach(function (item, index) {
        $(".gdfTable>thead>tr>th").each(function (index2, item2) {
            if (item == $(this).html()) {
                $(this).show();
                $(".gdfTable tr").each(function () {
                    $(this).find('td').eq(index2).show();
                })
            }
        })
    })
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_8').modal('hide');
})
//取消
$('#myModal_8 .btn-default').click(function () {
    $(".modal-backdrop.in").css("display", "none");
    $('#myModal_8').modal('hide');
});

//左右控制
$(".progress_center .left1_img").click(function () {
    $(this).hide(0);
    $(".progress_left").show();
    $(".progress_left").animate({width: "150px"}, 600);
    $(".progress_center").animate({left: "150px"}, 600);
})
$(".progress_left .aleft").click(function () {
    $(".progress_left").hide(0);
    $(".progress_center .left1_img").show(600);
    $(".progress_center").animate({left: "0"}, 600);
})
$(".progress_center .right1_img").click(function () {
    $(this).hide(0);
    $(".progress_right").show();
    $(".progress_right").animate({width: "220px"}, 600);
//            $(".progress_center").animate({right: "220px"}, 600);
})
$(".progress_right .aright").click(function () {
    $(".progress_right").hide(0);
    $(".progress_center .right1_img").show().animate({right: "0"}, 600);
    $(".progress_center").animate({right: "0"}, 600);
});
//        右边
$(".progress_right .right_center").on("click", ".top_text", function () {
    $(".progress_right .right_center .top_text").removeClass("green");
    $(this).addClass("green");
});
$(".progress_right .right_center .left_text").click(function () {
    $(".progress_right .task_center").show();
    $(".progress_right .check_center").hide();
})
$(".progress_right .right_center .right_text").click(function () {
    $(".progress_right .task_center").hide();
    $(".progress_right .check_center").show();
});

$('#addModel').click(function () {
    $(".modal-backdrop.in").show();
    $('#myModal_9').modal('show');
    $.ajax({
        type: 'POST',
        data: {
            modelId:"1",
            projectId:projectId,
            userId:userId,
            jwt:jwt
        },
        url: zyfUrl+'/model/getTreeHeader',
        dataType: 'json',
        cache: false,
        success: function(data) {
            console.log(data.data);
            zNodes=data.data;
            // console.log(zNodes);
            $.fn.zTree.init($("#treeDemos"), settingAdd, zNodes);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + ' ' + errorThrown);
        }
    });
});
var settingAdd = {
    async:{
        enable: true,
        url: "http://192.168.3.31:10091/zyfbim/model/getTreeNodeByPid",//异步加载时的请求地址
        autoParam: ["id",'modelId','1'],//提交参数
        type: 'post',
        dataType: 'json',
        dataFilter: filter
    },
    data: {
        key: {
            children: "",
            name: "nodeName",
            title: "",
            url: "url",
            icon: "icon",
            pathname: "nodePath"
        },
        simpleData: {
            enable: true,
            idKey: "nodeId",
//                            pIdKey: "parentId",
//                            rootPId: null
        },
        keep: {
            parent: false,
            leaf: false
        },
    },
    check: {
        enable: true,
       autoCheckTrigger: true,
       nocheckInherit: true,
       chkDisabledInherit: true,
        chkboxType: {
            "Y": "",
            "N": ""
        }
    },
    expandSpeed: "",
    callback: {
        onCheck:zTreeOnClick,
        onAsyncSuccess: onAsyncSuccess,
    }
};
var priId=[];
function zTreeOnClick(event, treeId, treeNode) {
    var flag=false;
    for (var i=0;i< priId.length;i++){
        if(priId[i]==treeNode.priId){
            priId.splice(i,1);
            flag=true;
            break;
        }
    }
    if(flag==false){
        priId.push(treeNode.priId);
    }
    console.log(priId);

}
function filter(treeId, parentNode, childNodes) {
    childNodes=childNodes.data;
    console.log(childNodes);
    return childNodes;
}
function onAsyncSuccess(event, treeId, treeNode, msg) {
    console.log(event);
    console.log(msg);
    var zTree = $.fn.zTree.getZTreeObj("treeDemos");
    zTree.updateNode(treeNode);
}
$(document).ready(function () {
    // $.fn.zTree.init($("#treeDemos"), settingAdd, zNodes);/*空间结构*/
});
$('#addConfirm').click(function () {
    $.ajax({
        type: 'POST',
        contentType:'application/json',
        data: JSON.stringify({
            modelId:"1",
            projectId:projectId,
            userId:userId,
            jwt:jwt,
            t:task_unique_Id,
            x:userId,
            ulist:priId,

        }),
        url: zyfUrl+'/taskPcMap/insert',
        dataType: 'json',
        cache: false,
        success: function(data) {
            if(data.code==10000){
                model_relactiveLog(task_unique_Id);
                $('#myModal_9').modal('hide');
                $(".modal-backdrop.in").css("display", "none");
                priId=[];

            }else{
                console.log('数据添加失败');
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + ' ' + errorThrown);
        }
    });
});
var model_relactive=new Vue({
    el:'#model_relactive',
    data:{
        list:[]
    },
    created:function () {

    },
    methods:{
        delete:function (index) {
            var that=this;
            $.ajax({
                type: 'POST',
                data: {
                    taskId:task_unique_Id,
                    pcId:that.list[index].pcId
                },
                url: zyfUrl+'/taskPcMap/delete',
                dataType: 'json',
                cache: false,
                success: function(data) {
                    console.log(data.data);
                    if(data.code==10000){
                        that.list.splice(index,1);
                    }

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('error ' + textStatus + ' ' + errorThrown);
                }
            })
        }
    }

})
function model_relactiveLog(taskId) {
    $.ajax({
        type: 'POST',
        data: {
            taskId:taskId
        },
        url: zyfUrl+'/taskPcMap/listOneTaskPcInfos',
        dataType: 'json',
        cache: false,
        success: function(data) {
            console.log(data.data);
            model_relactive.list=data.data

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log('error ' + textStatus + ' ' + errorThrown);
        }
    })
}