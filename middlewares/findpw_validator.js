const { alert } = require("../lib/common");

/**
* 비밀번호 찾기 유효성 검사 
*
*/
module.exports.findPwValidator = (req, res, next) => {
	try {
		const required = {
			memId : "아이디를 입력하세요",
			memNm : "회원이름을 입력하세요",
			cellPhone : "휴대폰번호를 입력하세요",
			pwHint : "비밀번호 힌드를 입력하세요",
		};
		
		for (key in required) {
			if (!req.body[key]) {
				throw new Error(required[key]);
			}
		}
	} catch (err) {
		return alert(err.message, res, -1);
	}
	
	next();
};

/**
* 비밀번호 변경 유효성 검사 
*
*/
module.exports.changePwValidator = (req, res, next) => {
	try {
		if (!req.session.findPwMemNo) {
			throw new Error("잘못된 접근입니다.");
		}
		
		const memPw = req.body.memPw;
		if (memPw && memPw !== req.body.memPwRe) {
			throw new Error('비밀번호 확인이 일치하지 않습니다.');
		}
				
		if (memPw.length < 8 || memPw.length > 20 || !/[a-z]/.test(memPw) || !/[A-Z]/.test(memPw) || !/[0-9]/.test(memPw) || !/[~!@#$%^&*]/.test(memPw)) {
			throw new Error('비밀번호는 8~20자 알파벳(대소문자 포함), 숫자, 특수문자로 구성해 주세요.');
		}
	} catch (err) {
		return alert(err.message, res);
	}
	
	next();
};