function myTest() {
    jQuery.fn.extend({
        showModal: function (options) {
            return this.each(function () {
                var title = options.title || ''; //模态框的名称，显示在 #myModalLabel 处
                var width = options.width || ''; //模态框的宽度
                var buttons = options.buttons || []; //模态框的按钮
                var content = options.content || ''; //模态框的内容，显示在 .modal-body 处
                var contentUrl = options.contentUrl; //以Jquery.load(url)的方式去加载模态框的内容，若设置了这个选项，content 选项将无效
                var modal = $(this);
                modal.find('.modal-title').text(title);
                modal.find('.modal-dialog').width(width);
                if (contentUrl) {
                    modal.find('.modal-body').load(contentUrl);
                } else {
                    modal.find('.modal-body').html(content);
                }

                var footer = '';
                for (var i in buttons) {
                    var btnClass = buttons[i].class || 'btn btn-default';
                    footer += '<button class="' + btnClass + '">' + buttons[i].text + '</button>';
                }
                modal.find('.modal-footer').html(footer);
                modal.find('.modal-footer button').each(function (i, btn) {
                    $(btn).on('click', buttons[i].click);

                });
                $(this).modal("hide");
            });
        }
    });
}
toastr.options = {
    closeButton: false,
    debug: false,
    progressBar: true,
    positionClass: "toast-top-center",
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "1500",//自动关闭超时时间
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut"
};

/*
var $con=$("<img src='../img/失败-ICON.png'>");
$(".layui-layer-title").append($con);*/
