const member = require("../models/member");

/**
* 로그인 세션 처리 
*
*/
module.exports.loginSession = async (req, res, next) => {
		/** 로그인이 된 경우 세션 처리 */
		req.isLogin = res.isLogin = res.locals.isLogin = false;
		if (req.session.memId) { 
			const info = await member.get(req.session.memId);
			delete info.memPw;
			if (info) {
				req.isLogin = res.isLogin = res.locals.isLogin = true;
				req.session.member = req.member = res.member = res.locals.member = info;
				req.session.memNo = info.memNo;
			}
		} // endif 
		
		next();
};