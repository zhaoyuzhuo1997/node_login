/**
* 메인메뉴 middleware 
* 
*/
module.exports.mainMenu = function(req, res, next) {
	/*
	res.locals.mainMenu = [
		{name : '스니커', url : '/url1'},
		{name : '커뮤니티', url : '/url2'},
		{name : '갤러리', url : '/url3'},
		{name : '마켓', url : '/url4'},
		{name : '풋셀스토어', url : '/url1'},
	];
	*/
	next();
};