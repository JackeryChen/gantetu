//(function ($) {
var uploader;
var temptasksAndPP = [];
$("#myModal_4").on("shown.bs.modal", function () {
    // 实例化
    uploader = WebUploader.create({
        pick: {
            id: '#filePicker',
            label: '添加文件',
            multiple: false
        },
        formData: {
            projectId: projectId,
            userId: userId,
            jwt: jwt
        },
        dnd: '#dndArea',
        paste: '#uploader1',
        // swf文件路径
        swf: '../webuploader/Uploader.swf',
        chunked: false,
        chunkSize: 512 * 1024,
        // 文件接收服务端。
        server: zyfUrl + '/mpp/upload',
        // runtimeOrder: 'flash',
        //传入文件格式限制，只能上传doc,docx,pdf格式的文件
        accept: {
            title: 'Applications',
            extensions: 'mpp',
            mimeTypes: 'application/mpp'
        },
        // accept: {
        //     title: 'intoTypes',
        //     extensions: 'rar,zip,doc,xls,docx,xlsx,pdf',
        //     mimeTypes: '.rar,.zip,.doc,.xls,.docx,.xlsx,.pdf'
        // },
        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: true,
        fileNumLimit: 1,
        fileSizeLimit: 200 * 1024 * 1024, // 200 M
        fileSingleSizeLimit: 50 * 1024 * 1024    // 50 M
    });
    // 当domReady的时候开始初始化
    $(function () {

        // uploader.addButton({
        //     id: '#filePicker',
        //     innerHTML: '添加文件'
        // });
        var $wrap = $('#uploader1'),
            // 图片容器
            //$queue = $('<ul class="filelist"></ul>').appendTo($('#fileList')),
            $queue = $wrap.find('#fileList'),
            // 状态栏，包括进度和控制按钮
            $statusBar = $wrap.find('.statusBar'),
            // 文件总体选择信息。
            $info = $statusBar.find('.info'),
            // 上传按钮
            $upload = $('#myModal_4 .uploadBtn'),
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
        //uploader;

        if (!WebUploader.Uploader.support('flash') && WebUploader.browser.ie) {
            // flash 安装了但是版本过低。
            if (flashVersion) {
                (function (container) {
                    window['expressinstallcallback'] = function (state) {
                        switch (state) {
                            case 'Download.Cancelled':
                                alert('您取消了更新！')
                                break;

                            case 'Download.Failed':
                                alert('安装失败')
                                break;

                            default:
                                alert('安装已成功，请刷新！');
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
            alert('Web Uploader 不支持您的浏览器！');
            return;
        }

        // 拖拽时不接受 js, txt 文件。
        // uploader.on('dndAccept', function (items) {
        //     var denied = false,
        //         len = items.length,
        //         i = 0,
        //         // 修改js类型
        //         unAllowed = 'text/plain;application/javascript ';
        //
        //     for (; i < len; i++) {
        //         // 如果在列表里面
        //         if (~unAllowed.indexOf(items[i].type)) {
        //             denied = true;
        //             break;
        //         }
        //     }
        //
        //     return !denied;
        // });

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

        uploader.on('ready', function () {
            window.uploader = uploader;
        });

        // 当有文件添加进来时执行，负责view的创建
        function addFile(file) {
            var $li = $('<li id="' + file.id + '">' +
                '<p class="title">' + file.name + '</p>' +
                '<p class="imgWrap" style="display: none;"></p>' +
                '</li>'),
                $prgress = $li.find('p.progress span'),
                $wrap = $li.find('p.imgWrap'),
                $info = $('<p class="error"></p>'),
                showError = function (code) {
                    switch (code) {
                        case 'exceed_size':
                            // text = '文件大小超出';
                            toastr.error('文件大小超出');
                            break;

                        case 'interrupt':
                            // text = '上传暂停';
                            toastr.error('上传暂停');
                            break;

                        default:
                            // text = '上传失败，请重试';
                            toastr.error('上传失败，请重试');
                            break;
                    }

                    // $info.text(text).appendTo($li);
                };

            if (file.getStatus() === 'invalid') {
                showError(file.statusText);
            } else {
                // @todo lazyload
                $wrap.text('预览中');
                uploader.makeThumb(file, function (error, src) {
                    var img;

                    if (error) {
                        $wrap.text('不能预览');
                        return;
                    }

                    if (isSupportBase64) {
                        img = $('<img src="' + src + '">');
                        $wrap.empty().append(img);

                    } else {
                        $.ajax('../preview.php', {
                            method: 'POST',
                            data: src,
                            dataType: 'json'
                        }).done(function (response) {
                            if (response.result) {
                                img = $('<img src="' + response.result + '">');
                                $wrap.empty().append(img);
                            } else {
                                $wrap.text("预览出错");
                            }
                        });
                    }
                }, thumbnailWidth, thumbnailHeight);

                percentages[file.id] = [file.size, 0];
                file.rotation = 0;
            }

            file.on('statuschange', function (cur, prev) {
                if (prev === 'progress') {
                    $prgress.hide().width(0);
                } else if (prev === 'queued') {
                    $li.off('mouseenter mouseleave');
                    //$btns.remove();
                }

                // 成功
                if (cur === 'error' || cur === 'invalid') {
                    console.log(file.statusText);
                    showError(file.statusText);
                    percentages[file.id][1] = 1;
                } else if (cur === 'interrupt') {
                    showError('interrupt');
                } else if (cur === 'queued') {
                    percentages[file.id][1] = 0;
                } else if (cur === 'progress') {
                    $info.remove();
                    $prgress.css('display', 'block');
                } else if (cur === 'complete') {
                    $li.append('<span class="success"></span>');
                }

                $li.removeClass('state-' + prev).addClass('state-' + cur);
            });

            $li.on('mouseenter', function () {
                //$btns.stop().animate({height: 30});
            });

            $li.on('mouseleave', function () {
                //$btns.stop().animate({height: 0});
            });

            console.log($li)
            $("#fileList").append($li);
            //$li.appendTo($queue);
        }

        // 负责view的销毁
        function removeFile(file) {
            var $li = $('#' + file.id);

            delete percentages[file.id];
            updateTotalProgress();
            $li.off().find('.file-panel').off().end().remove();
        }

        function updateTotalProgress() {
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
            updateStatus();
        }

        function updateStatus() {
            var text = '', stats;
            $info.html(text);
        }

        function setState(val) {
            var file, stats;

            if (val === state) {
                return;
            }

            $upload.removeClass('state-' + state);
            $upload.addClass('state-' + val);
            state = val;
            console.log(state)
            switch (state) {
                case 'pedding':
                    $placeHolder.removeClass('element-invisible');
                    $queue.hide();
                    $statusBar.addClass('element-invisible');
                    uploader.refresh();
                    break;

                case 'ready':
                    $placeHolder.addClass('element-invisible');
                    $('#filePicker').removeClass('element-invisible');
                    $queue.show();
                    $statusBar.removeClass('element-invisible');
                    uploader.refresh();
                    break;

                case 'uploading':
                    $('#filePicker').addClass('element-invisible');
                    $progress.show();
                    //$upload.text('暂停上传');
                    break;

                case 'paused':
                    $progress.show();
                    //$upload.text('继续上传');
                    break;

                case 'confirm':
                    $progress.hide();
                    $('#filePicker').removeClass('element-invisible');
                    //$upload.text('开始上传');

                    stats = uploader.getStats();
                    if (stats.successNum && !stats.uploadFailNum) {
                        setState('finish');
                        return;
                    }
                    break;
                case 'finish':
                    stats = uploader.getStats();
                    if (stats.successNum) {
                        toastr.success('上传成功');
                        // setTimeout(function () {
                        //     location.reload();
                        // },1000)

                    } else {
                        // 没有成功的图片，重设
                        state = 'done';
                        location.reload();
                    }
                    break;
            }

            updateStatus();
        }

        uploader.onUploadProgress = function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress span');

            $percent.css('width', percentage * 100 + '%');
            percentages[file.id][1] = percentage;
            updateTotalProgress();
        };

        uploader.onFileQueued = function (file) {
            fileCount++;
            fileSize += file.size;
            console.log(fileSize);
            console.log(fileCount);

            if (fileCount === 1) {
                $placeHolder.addClass('element-invisible');
                $statusBar.show();
            }

            addFile(file);
            setState('ready');
            updateTotalProgress();

            //
            $("#uploader1 .default_img").hide();
            $(".after_img").show();
            $("#uploader1 .webuploader-pick").hide();
            $(".file_text").hide();
        };

        uploader.onFileDequeued = function (file) {
            fileCount--;
            fileSize -= file.size;

            if (!fileCount) {
                setState('pedding');
            }

            removeFile(file);
            updateTotalProgress();

        };

        uploader.on('all', function (type) {
            var stats;
            switch (type) {
                case 'uploadFinished':
                    setState('confirm');
                    break;

                case 'startUpload':
                    setState('uploading');
                    break;

                case 'stopUpload':
                    setState('paused');
                    break;

            }
        });

        uploader.onError = function (code) {
            if (code == "Q_EXCEED_NUM_LIMIT") {
                toastr.error("只能选择一份文件！");
            } else if (code == "Q_TYPE_DENIED") {
                toastr.error("请上传MPP格式文件");
            } else {
                toastr.error("上传出错！请检查后重新上传！错误代码" + code);
            }
            // else if(code=="F_EXCEED_SIZE"){
            //     alert("文件大小不能超过xxx KB!");
            // }
        };

        $upload.on('click', function () {
            console.log($("#filelist>li"))
            console.log(state)
            if ($(".after_img").css("display") == "block") {
                // uploader.upload();
                if (state === 'ready') {
                    uploader.upload();
                    // $('#myModal_4').hide();
                    // $('#myModal_5').modal('show');
                } else if (state === 'paused') {
                    uploader.upload();
                    // $('#myModal_4').hide();
                    // $('#myModal_5').modal('show');
                } else if (state === 'uploading') {
                    uploader.stop();
                }
                //$(".modal-backdrop.in").css("display", "none");
                // $('#myModal_4').modal('hide');
                // $('#myModal_5').modal('show');

            } else {
                toastr.error("请先导入文件！");
            }
            if ($(this).hasClass('disabled')) {
                return false;
            }

            // if (state === 'ready') {
            //     console.log(1111111111111)
            //     uploader.upload();
            // } else if (state === 'paused') {
            //     uploader.upload();
            // } else if (state === 'uploading') {
            //     uploader.stop();
            // }
        });

        $info.on('click', '.retry', function () {
            uploader.retry();
        });

        $info.on('click', '.ignore', function () {
            alert('todo');
        });

        $upload.addClass('state-' + state);
        updateTotalProgress();
    });
    uploader.onUploadSuccess = function (file, response) {
        $('#myModal_4').hide();
        $(".modal-backdrop.in").css("display", "none");
        //$('#myModal_5').modal('show');

        loadFromServer();
        console.log(response);
        temptasksAndPP = response;
        scailFile.items = response.tlist

    };


    // $('#myModal_4 .btn-success').click(function () {
    //     console.log($("#filelist>li"))
    //     if ($(".after_img").css("display")=="block") {
    //         // uploader.upload();
    //         $(".modal-backdrop.in").css("display", "none");
    //         $('#myModal_4').modal('hide');
    //         $('#myModal_5').modal('show');
    //     } else {
    //         toastr.error("请先导入文件！");
    //     }
    // })


//})(jQuery);
})


function uploadSure() {
    $.ajax({
        type: "POST",
        url: zyfUrl + "/mpp/sure",
        contentType: "application/json",
        data: JSON.stringify({"tlist": temptasksAndPP.tlist, "ulist": temptasksAndPP.ulist}),
        dataType: 'json',
        success: function (msg) {
            if (msg == true) {
                toastr.success("解析成功");
                setTimeout(function () {
                    location.reload();
                }, 1000)
            } else {
                toastr.error("解析失败");
            }
        },
        error: function (message) {
            console.log(message);
        }
    });

}

var scailFile = new Vue({
    el: "#scailFile",
    data: {
        items: ""
    },
    filters: {
        formatTime: function (time) {
            return formatDateTime(new Date(time));
        }
    }
});

