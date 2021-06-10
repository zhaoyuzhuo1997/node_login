const { alert } = require('../lib/common');

/**
* 로그인 유효성 검사
*
*/
module.exports.loginValidator = (req, res, next) => {
		if (!req.body.memId) {
			return alert('아이디를 입력하세요.');
		}
	
		if (!req.body.memPw) {
			return alert('비밀번호를 입력하세요.');
		}
	
		next();
};