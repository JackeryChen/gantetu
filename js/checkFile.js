// var uploader2 ;
// 当domReady的时候开始初始化
//$(function () {

$(function () {

    //$('#filePicker2 div:eq(1)').attr('style','position: absolute; top: 0px; left: 0px; width: 82px; height: 39px; overflow: hidden; bottom: auto; right: auto;');
    // 实例化
    var uploader2 = WebUploader.create({
        auto: true,
        pick: {
            id: '#filePicker2',
            multiple: true
        },
        formData: {
            processTaskId: task_unique_Id,
            projectId: projectId,
            userId: userId,
            jwt: jwt
        },
        //dnd: '#dndArea',
        paste: '#uploader2',
        // swf文件路径
        swf: '/sbimweb/js/plugins/webuploader/Uploader.swf',
        chunked: false,
        chunkSize: 512 * 1024,
        // 文件接收服务端。
        server: zyfUrl + '/TaskProcess/accessory/upload',
        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: true,
        // fileNumLimit: 1,
        fileSizeLimit: 200 * 1024 * 1024, // 200 M
        fileSingleSizeLimit: 50 * 1024 * 1024    // 50 M
    });
    // uploader.addButton({
    //     id: '#filePicker',
    //     innerHTML: '添加文件'
    // });
    var $wrap = $('#uploader2'),
        // 图片容器
        $queue2 = $('<ul class="filelist2"></ul>').appendTo($wrap.find('.queueList2')),
        // 状态栏，包括进度和控制按钮
        $statusBar = $wrap.find('.statusBar'),
        // 文件总体选择信息。
        $info = $statusBar.find('.info'),
        // 上传按钮
        //$upload = $wrap.find('.uploadBtn'),
        // 没选择文件之前的内容。
        $placeHolder = $wrap.find('.placeholder'),
        $progress = $statusBar.find('.progress').hide(),
        // 添加的文件数量
        fileCount = 0,
        // 添加的文件总大小
        fileSize = 0,
        // 优化retina, 在retina下这个值是2
        ratio = window.devicePixelRatio || 1,
        // 缩略图大小
        thumbnailWidth = 110 * ratio,
        thumbnailHeight = 110 * ratio,
        // 可能有pedding, ready, uploading, confirm, done.
        state = 'pedding',
        // 所有文件的进度信息，key为file id
        percentages = {},
        // 判断浏览器是否支持图片的base64
        isSupportBase64 = (function () {
            var data = new Image();
            var support = true;
            data.onload = data.onerror = function () {
                if (this.width != 1 || this.height != 1) {
                    support = false;
                }
            }
            data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            return support;
        })(),
        // 检测是否已经安装flash，检测flash的版本
        flashVersion = (function () {
            var version;

            try {
                version = navigator.plugins['Shockwave Flash'];
                version = version.description;
            } catch (ex) {
                try {
                    version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                        .GetVariable('$version');
                } catch (ex2) {
                    version = '0.0';
                }
            }
            version = version.match(/\d+/g);
            return parseFloat(version[0] + '.' + version[1], 10);
        })(),
        supportTransition = (function () {
            var s = document.createElement('p').style,
                r = 'transition' in s ||
                    'WebkitTransition' in s ||
                    'MozTransition' in s ||
                    'msTransition' in s ||
                    'OTransition' in s;
            s = null;
            return r;
        })();

    // WebUploader实例

    if (!WebUploader.Uploader.support('flash') && WebUploader.browser.ie) {
        // flash 安装了但是版本过低。
        if (flashVersion) {
            (function (container) {
                window['expressinstallcallback'] = function (state) {
                    switch (state) {
                        case 'Download.Cancelled':
                            toastr.error('您取消了更新！')

                            break;

                        case 'Download.Failed':
                            toastr.error('安装失败')
                            break;

                        default:
                            toastr.success('安装已成功，请刷新！');
                            break;
                    }
                    delete window['expressinstallcallback'];
                };

                var swf = './expressInstall.swf';
                // insert flash object
                var html = '<object type="application/' +
                    'x-shockwave-flash" data="' + swf + '" ';

                if (WebUploader.browser.ie) {
                    html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
                }

                html += 'width="100%" height="100%" style="outline:0">' +
                    '<param name="movie" value="' + swf + '" />' +
                    '<param name="wmode" value="transparent" />' +
                    '<param name="allowscriptaccess" value="always" />' +
                    '</object>';

                container.html(html);

            })($wrap);

            // 压根就没有安转。
        } else {
            $wrap.html('<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0"><img alt="get flash player" src="http://www.adobe.com/macromedia/style_guide/images/160x41_Get_Flash_Player.jpg" /></a>');
        }

        return;
    } else if (!WebUploader.Uploader.support()) {
        toastr.error('Web Uploader 不支持您的浏览器！');
        return;
    }
    // 拖拽时不接受 js, txt 文件。
    uploader2.on('dndAccept', function (items) {
        var denied = false,
            len = items.length,
            i = 0,
            // 修改js类型
            unAllowed = 'text/plain;application/javascript ';

        for (; i < len; i++) {
            // 如果在列表里面
            if (~unAllowed.indexOf(items[i].type)) {
                denied = true;
                break;
            }
        }

        return !denied;
    });

    // uploader.on('filesQueued', function() {
    //     uploader.sort(function( a, b ) {
    //         if ( a.name < b.name )
    //           return -1;
    //         if ( a.name > b.name )
    //           return 1;
    //         return 0;
    //     });
    // });

    // 添加“添加文件”的按钮，
    // uploader.addButton({
    //     id: '#filePicker2',
    //     label: '继续添加'
    // });

    uploader2.on('ready', function () {
        window.uploader = uploader2;
    });
    // 当有文件添加进来时执行，负责view的创建
    // function addFile2(file) {
    //     var $li = $('<div id="' + file.id + '" class="file-item thumbnail row">'
    //         + '<img class="file_img">'
    //         + '<div class="info" style="margin-left: 40px;display: inline-block;position: absolute;right: 0px;">'
    //         + '<div class="file_name" style="width: 120px;" title='+file.name+'>' + file.name + '</div>'
    //         + '<span class="file_time pull-right color_9">2017-11-28</span>'
    //         + '</div>'
    //         +'</li>'),
    //         $prgress = $li.find('p.progress span'),
    //         $wrap = $li.find('p.imgWrap'),
    //         $info = $('<p class="error"></p>'),
    //         showError = function (code) {
    //             switch (code) {
    //                 case 'exceed_size':
    //                     text = '文件大小超出';
    //                     break;
    //
    //                 case 'interrupt':
    //                     text = '上传暂停';
    //                     break;
    //
    //                 default:
    //                     text = '上传失败，请重试';
    //                     break;
    //             }
    //
    //             $info.text(text).appendTo($li);
    //         };
    //     $(".filelist2").append($li);
    //     if (file.getStatus() === 'invalid') {
    //         showError(file.statusText);
    //     } else {
    //         // @todo lazyload
    //         $wrap.text('预览中');
    //         //
    //         console.log($li);
    //         var fileType = file.type;
    //         console.log(fileType);
    //         var fileTypename=file.name;
    //         console.log(fileTypename);
    //         fileTypename=fileTypename.substring(fileTypename.lastIndexOf('.')+1);
    //         var $img = $li.find('.file_img');
    //         console.log($img);
    //         // 创建缩略图
    //         uploader2.makeThumb(file, function (error, src) {
    //             if(fileTypename=="pdf"){
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/PDF.png">');
    //             }else if(fileTypename=="doc"||fileTypename=="docx"||fileTypename=="docm") {
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/DOC.png">');
    //             }else if(fileTypename=="xlsx"||fileTypename=="xls"||fileTypename=="xlsm") {
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/EXCEL.png">');
    //             }else if(fileTypename=="ppt"||fileTypename=="pptx"||fileTypename=="pptm") {
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/PPT.png">');
    //             }else if(fileTypename=="max"||fileTypename=="fbx"||fileTypename=="obj"||fileTypename=="mlt"||fileTypename=="rvt"||fileTypename=="dwg") {
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/dwg.png">');
    //             }else if(fileTypename=="jpg"||fileTypename=="jpeg"||fileTypename=="png"||fileTypename=="gif"||fileTypename=="bmp") {
    //                 //
    //             }else{
    //                 $img.replaceWith('<img class="typeImg" src="../img/file/default.png">');
    //                 //$img.replaceWith('<img class="typeImg" style="height: 36px;width:36px;background-color: #efefef;">');
    //             }
    //             $img.attr('src', src);
    //         }, thumbnailWidth, thumbnailHeight);
    //         percentages[file.id] = [file.size, 0];
    //         file.rotation = 0;
    //     }
    //
    //     file.on('statuschange', function (cur, prev) {
    //         if (prev === 'progress') {
    //             $prgress.hide().width(0);
    //         } else if (prev === 'queued') {
    //             $li.off('mouseenter mouseleave');
    //             //$btns.remove();
    //         }
    //
    //         // 成功
    //         if (cur === 'error' || cur === 'invalid') {
    //             console.log(file.statusText);
    //             showError(file.statusText);
    //             percentages[file.id][1] = 1;
    //         } else if (cur === 'interrupt') {
    //             showError('interrupt');
    //         } else if (cur === 'queued') {
    //             percentages[file.id][1] = 0;
    //         } else if (cur === 'progress') {
    //             $info.remove();
    //             $prgress.css('display', 'block');
    //         } else if (cur === 'complete') {
    //             $li.append('<span class="success"></span>');
    //         }
    //
    //         $li.removeClass('state-' + prev).addClass('state-' + cur);
    //     });
    //
    //     $li.on('mouseenter', function () {
    //         //$btns.stop().animate({height: 30});
    //     });
    //
    //     $li.on('mouseleave', function () {
    //         //$btns.stop().animate({height: 0});
    //     });
    //
    //
    //     $li.appendTo($queue2);
    // }
    //
    // // 负责view的销毁
    // function removeFile(file) {
    //     var $li = $('#' + file.id);
    //
    //     delete percentages[file.id];
    //     updateTotalProgress2();
    //     $li.off().find('.file-panel').off().end().remove();
    // }
    function updateTotalProgress2() {
        var loaded = 0,
            total = 0,
            spans = $progress.children(),
            percent;

        $.each(percentages, function (k, v) {
            total += v[0];
            loaded += v[0] * v[1];
        });

        percent = total ? loaded / total : 0;


        spans.eq(0).text(Math.round(percent * 100) + '%');
        spans.eq(1).css('width', Math.round(percent * 100) + '%');
        updateStatus2();
    }

    function updateStatus2() {
        var text = '', stats;
        $info.html(text);
    }

    function setState2(val) {
        var file, stats;

        if (val === state) {
            return;
        }

        //$upload.removeClass('state-' + state);
        //$upload.addClass('state-' + val);
        state = val;

        switch (state) {
            case 'pedding':
                $placeHolder.removeClass('element-invisible');
                //$queue2.hide();
                $statusBar.addClass('element-invisible');
                uploader2.refresh();
                break;

            case 'ready':
                $placeHolder.addClass('element-invisible');
                $('#filePicker2').removeClass('element-invisible');
                //$queue2.show();
                $statusBar.removeClass('element-invisible');
                uploader2.refresh();
                break;

            case 'uploading':
                $('#filePicker2').addClass('element-invisible');
                $progress.show();
                //$upload.text('暂停上传');
                break;

            case 'paused':
                $progress.show();
                //$upload.text('继续上传');
                break;

            case 'confirm':
                $progress.hide();
                $('#filePicker2').removeClass('element-invisible');
                //$upload.text('开始上传');

                stats = uploader2.getStats();
                if (stats.successNum && !stats.uploadFailNum) {
                    setState2('finish');
                    return;
                }
                break;
            // case 'finish':
            //     stats = uploader2.getStats();
            //     if (stats.successNum) {
            //         // toastr.success('上传成功');
            //
            //     } else {
            //         // 没有成功的图片，重设
            //         state = 'done';
            //         location.reload();
            //     }
            //     break;
        }

        updateStatus2();
    }

    uploader2.onUploadProgress = function (file, percentage) {
        var $li = $('#' + file.id),
            $percent = $li.find('.progress span');

        $percent.css('width', percentage * 100 + '%');
        //percentages[file.id][1] = percentage;
        updateTotalProgress2();
    };

    uploader2.onFileQueued = function (file) {
        fileCount++;
        fileSize += file.size;

        if (fileCount === 1) {
            $placeHolder.addClass('element-invisible');
            $statusBar.show();
        }

        // addFile2(file);
        setState2('ready');
        updateTotalProgress2();
    };

    uploader2.onFileDequeued = function (file) {
        fileCount--;
        fileSize -= file.size;

        if (!fileCount) {
            setState2('pedding');
        }
        updateTotalProgress2();
        // removeFile(file);

    };

    uploader2.on('all', function (type) {
        var stats;
        switch (type) {
            case 'uploadFinished':
                setState2('confirm');
                break;

            case 'startUpload':
                setState2('uploading');
                break;

            case 'stopUpload':
                setState2('paused');
                break;

        }
    });

    uploader2.onError = function (code) {
        if (code == "Q_EXCEED_NUM_LIMIT") {
            toastr.error("只能选择一份文件！");
        } else if (code == "Q_TYPE_DENIED") {
            toastr.error("请上传正确格式文件");
        } else {
            toastr.error("上传出错！请检查后重新上传！错误代码" + code);
        }
        // else if(code=="F_EXCEED_SIZE"){
        //     alert("文件大小不能超过xxx KB!");
        // }
    };
    uploader2.on('uploadStart', function (file) {
        uploader2.options.formData.processTaskId = task_unique_Id;
    });

    // $upload.on('click', function () {
    //     if ($(this).hasClass('disabled')) {
    //         return false;
    //     }
    //
    //     if (state === 'ready') {
    //         console.log(state)
    //         uploader2.upload();
    //     } else if (state === 'paused') {
    //         uploader2.upload();
    //     } else if (state === 'uploading') {
    //         uploader2.stop();
    //     }
    // });

    $info.on('click', '.retry', function () {
        uploader2.retry();
    });

    $info.on('click', '.ignore', function () {
        alert('todo');
    });

    // $upload.addClass('state-' + state);
    updateTotalProgress2();
    uploader2.onUploadSuccess = function (file, response) {
        if (response.result != true) {
            toastr.error(response.message);
        } else {
            toastr.success("上传成功")
            getAllProjectTaskAccessoryByTaskId(task_unique_Id);
        }
    };


});


