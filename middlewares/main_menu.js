/**
* 메인메뉴 middleware 
* 
*/
module.exports.mainMenu = function(req, res, next) {
	res.locals.mainMenu = [
		{name : '메뉴1', url : '/url1'},
		{name : '메뉴2', url : '/url2'},
		{name : '메뉴3', url : '/url3'},
		{name : '메뉴4', url : '/url4'},
	];
	
	next();
};