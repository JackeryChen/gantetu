function JSONToExcelConvertor(JSONData, FileName, ShowLabel) {
//先转化json
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var excel = '<table border="1">';

//设置表头
    var row = "<tr>";
    for (var i = 0, l = ShowLabel.length; i < l; i++) {
        row += "<td>" + ShowLabel[i] + '</td>';
    }


//换行
    excel += row + "</tr>";

//设置数据
    for (var i = 0; i < arrData.length; i++) {
        var row = "<tr>";

        // for (var index in arrData[i]) {
        //     var value = arrData[i][index] === "." ? "" : arrData[i][index];
        //     row += '<td>' + value + '</td>';
        // }

        row += '<td>' + (i+1) + '</td>';

        row += '<td>' + arrData[i].taskLeave + '</td>';
        row += '<td>' + arrData[i].code + '</td>';
        row += '<td>' + arrData[i].name + '</td>';
        if(arrData[i].taskType!=0){
            row += '<td>' + "里程碑" + '</td>';
        }else {
            row += '<td>' + "一般任务" + '</td>';
        }

        row += '<td>' + formatDateTime(new Date(arrData[i].start)) + '</td>';
        row += '<td>' + formatDateTime(new Date(arrData[i].end)) + '</td>';
        if(arrData[i].activeStartTime!=null){
            row += '<td>' + arrData[i].activeStartTime + '</td>';
        }else {
            row += '<td>' + "" + '</td>';
        }

        if(arrData[i].activeFinishTime!=null){
            row += '<td>' + arrData[i].activeFinishTime + '</td>';
        }else {
            row += '<td>' + "" + '</td>';
        }

        row += '<td>' + arrData[i].duration + '</td>';
        row += '<td>' + arrData[i].planstatus + '</td>';
        row += '<td>' + arrData[i].activeStatus + '</td>';
        row += '<td>' + arrData[i].compareStatus + '</td>';
        if(arrData[i].chargeGroupName!=null){
            row += '<td>' + arrData[i].chargeGroupName + '</td>';
        }else {
            row += '<td>' + "" + '</td>';
        }

        if(arrData[i].chargeUserName!=null){
            row += '<td>' + arrData[i].chargeUserName + '</td>';
        }else {
            row += '<td>' + "" + '</td>';
        }

        excel += row + "</tr>";
    }

    excel += "</table>";

    var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>";
    excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
    excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
    excelFile += '; charset=UTF-8">';
    excelFile += "<head>";
    excelFile += "<!--[if gte mso 9]>";
    excelFile += "<xml>";
    excelFile += "<x:ExcelWorkbook>";
    excelFile += "<x:ExcelWorksheets>";
    excelFile += "<x:ExcelWorksheet>";
    excelFile += "<x:Name>";
    excelFile += "{worksheet}";
    excelFile += "</x:Name>";
    excelFile += "<x:WorksheetOptions>";
    excelFile += "<x:DisplayGridlines/>";
    excelFile += "</x:WorksheetOptions>";
    excelFile += "</x:ExcelWorksheet>";
    excelFile += "</x:ExcelWorksheets>";
    excelFile += "</x:ExcelWorkbook>";
    excelFile += "</xml>";
    excelFile += "<![endif]-->";
    excelFile += "</head>";
    excelFile += "<body>";
    excelFile += excel;
    excelFile += "</body>";
    excelFile += "</html>";


    var uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile);

    var link = document.createElement("a");
    link.href = uri;

    link.style = "visibility:hidden";
    link.download = FileName + ".xls";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



