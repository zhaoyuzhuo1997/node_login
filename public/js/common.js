$(function() {
	$("body").on("change", ".file_upload_form input[type='file']", function() {
		$(this).closest("form").submit();
	});
	
	/** 메인 최신글 카테고리 탭 호버시 */
	$(".latest_posts .tab_wrap .tab").mouseenter(function() {
		$(this).closest(".tab_wrap").find(".tab").removeClass("on");
		$(this).addClass("on");
		const num = $(this).data("cate_num");
		const box = $(this).closest(".latest_posts_box");
		box.find(".post_list").removeClass("dn").addClass("dn");
		box.find(".post_list_" + num).removeClass("dn");
	});
});