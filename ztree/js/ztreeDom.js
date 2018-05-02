/**
 * Created by Administrator on 2017/8/18.
 */

//获取项目号
// var projectId = window.localStorage.getItem("activeProjectId");

var zNodes = [
    {
        "nodeId": "0",
        "nodeName": "木质",
        "parentId": "",
    },
    {
        "nodeId": "1",
        "nodeName": "1",
        "parentId": "0",
    },
    {
        "nodeId": "11",
        "nodeName": "墙",
        "parentId": "1",
    },
    {
        "nodeId": "111",
        "nodeName": "装饰",
        "parentId": "11",
    },
    {
        "nodeId": "2",
        "nodeName": "书具",
        "parentId": "1",
    },
    {
        "nodeId": "22",
        "nodeName": "窗帘",
        "parentId": "2",
    },
    {
        "nodeId": "3",
        "nodeName": "大理石",
        "parentId": "0",
    },
    {
        "nodeId": "33",
        "nodeName": "洗碗池",
        "parentId": "3",
    }
];


var setting = {
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
            pIdKey: "parentId",
            rootPId: null
        },
        keep: {
            parent: false,
            leaf: false
        }
    },
    callback: {
        onCheck: onClick(),    // zTreeOnCheck
        // onCheck:GetCheckedAll,
        beforeClick: beforeClick
    }
};    //参数配置
var log, className = "dark";

function beforeClick(treeId, treeNode, clickFlag) {
    // showLog(treeNode.nodeName);
    console.log("id:"+treeNode.nodeId+"---Name:"+treeNode.nodeName);
    return (treeNode.click != false);
}

function onClick(event, treeId, treeNode, clickFlag) {
    console.log($(this));
}

function showLog(str) {
    if (!log) log = $("#log");
    alert(str);
}

// var $j = jQuery.noConflict();
$(document).ready(function () {
    $.fn.zTree.init($("#treeDemo"), setting, zNodes);
    $.fn.zTree.init($("#add-treeDemo"), setting, zNodes);
});

