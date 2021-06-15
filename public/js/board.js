$(function() {
	if ($("#contents").length > 0) { // contents textarea가 존재하는 경우 에디터 로딩 
		CKEDITOR.replace("contents");
		CKEDITOR.config.height = 350;
	}
	
	/** 게시글 삭제 */
	$(".post_delete").click(function() {
		if (!confirm('정말 삭제하시겠습니까?')) {
			return;
		}
		
		const idx = $(this).data('idx');
		if (!idx) 
			return;
		
		axios.delete("/board/" + idx)
				.then((res) => {
					if (res.data.redirect) {
						location.href= res.data.redirect;
					} else if (res.data.error) {
						alert(res.data.message);	
					} else {
						location.href='/board/list/' + res.data.boardId;
					}
				})
				.catch((err) => {
					console.error(err);
				});
	});
});