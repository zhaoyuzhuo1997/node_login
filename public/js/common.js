$(function() {
	$("body").on("change", ".file_upload_form input[type='file']", function() {
		$(this).closest("form").submit();
	});
});