$(function() {
	/** 전체 선택 S */
	$(".check_all").click(function() {
		const target = $(this).data("target-name");
		$(this).closest("form")
				.find("input[name='" + target + "']")
				.prop("checked", $(this).prop("checked"));
	});
	/** 전체 선택 E */
});