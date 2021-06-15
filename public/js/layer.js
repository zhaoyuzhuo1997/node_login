/**
* 레이어팝업 
*
*/ 
const layer = {
	/**
	* 팝업 열기 
	*
	*/
	popup : function(url, width, height) {
		width = width || 400;
		height = height || 400;
		
		if ($("#layer_dim").length == 0) {
			$("body").append("<div id='layer_dim'></div>");
		}
		
		if ($("#layer_popup").length == 0) {
			$("body").append("<div id='layer_popup'></div>");
		}

		 
		$("#layer_dim").css({
			position: "fixed",
			width : "100%",
			height : "100%",
			top : 0,
			left : 0,
			background : "rgba(0,0,0,0.5)",
			zIndex : 100,
		});
		
		const xpos = Math.round(($(window).width() - width) / 2);
		const ypos = Math.round(($(window).height() - height) / 2);
		
		$("#layer_popup").css({
			position : "fixed",
			width : width + "px",
			height : height + "px",
			top : ypos + "px",
			left : xpos + "px",
			background : "#ffffff",
			borderRadius : "30px",
			padding: "30px",
			zIndex: 101,
		});
		
		axios.get(url)
			.then(function(response) {
				 $("#layer_popup").html(response.data);
			})
			.catch(function (error) {
				console.error(error);
			});
	},
	/**
	* 팝업 닫기 
	*
	*/
	close : function() {
		$("#layer_popup, #layer_dim").remove();
	},
};

$(function() {
	$("body").on("click", "#layer_dim", function() {
		layer.close();
	});
});