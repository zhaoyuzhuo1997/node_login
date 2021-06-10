const logger = require('../lib/logger');
const { alert } = require('../lib/common');
const { sequelize, Sequelize : { QueryTypes } } = require('../models');

/**
* 회원가입, 수정 유효성 검사
* 
*/
module.exports.joinValidator = async (req, res, next) => {	
	try {
		/**
			유효성검사 - 아이디
				- 자리수 8~20 - O
				- 알파벳, 숫자 - O 
				
				- 중복 아이디인지 체크 
				
				- test - 체크, exec  - 패턴에 맞는 데이터 추출 
		*/
		const memId = req.body.memId;
		if (memId.length < 8 || memId.length > 20 || /[^a-z0-9]/i.test(memId)) {
			throw new Error('아이디는 8~20자의 알파벳과 숫자로 입력해 주세요.');
		}
		
		/** 중복 아이디 체크 */
		const sql = "SELECT COUNT(*) as cnt FROM member WHERE memId = ?";
		const rows = await sequelize.query(sql, {
			replacements : [memId], 
			type : QueryTypes.SELECT,
		});
		
		if (rows[0].cnt > 0) { // 중복 아이디 
			throw new Error('이미 사용중인 아이디 입니다');
		}
		
		/**
			소셜 계정 회원가입은 체크 X
			유효성 검사 - 비밀번호
				0. memPw, memPwRe 일치 여부 - O
				1. 자리수  8 ~ 20  - O 
				2. 알파벳(최소 1자 이상의 대문자 포함) + 1자 이상의 숫자, + 1자 이상의 특수문자
		*/
		if (!req.session.naverProfile) {
			const memPw = req.body.memPw;
			if (memPw && memPw !== req.body.memPwRe) {
				throw new Error('비밀번호 확인이 일치하지 않습니다.');
			}
			
			if (memPw.length < 8 || memPw.length > 20 || !/[a-z]/.test(memPw) || !/[A-Z]/.test(memPw) || !/[0-9]/.test(memPw) || !/[~!@#$%^&*]/.test(memPw)) {
				throw new Error('비밀번호는 8~20자 알파벳(대소문자 포함), 숫자, 특수문자로 구성해 주세요.');
			}
		}
		
		/** 휴대폰 번호 유효성 검사 S */
		if (req.body.cellPhone) {
			let cellPhone = req.body.cellPhone;
			cellPhone = cellPhone.replace(/[^\d]/g, '');
			
			/** 휴대폰 번호인지 체크 */
			const mobilePattern = /01[016789]\d{3,4}\d{4}/;
			
			if (!mobilePattern.test(cellPhone)) {
				throw new Error('휴대폰번호 형식이 아닙니다.');
			}
			
			req.body.cellPhone = cellPhone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
		}
		/** 휴대폰 번호 유효성 검사 E */
		
	} catch (err) {
		return alert(err.message, res);
	}
	
	next();
};