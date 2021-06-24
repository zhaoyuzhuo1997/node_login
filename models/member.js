const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const logger = require('../lib/logger');
const bcrypt = require('bcrypt');

/**
* 회원 Model
*
*/
const member = {
	/**
	* 처리할 데이터
	*
	*/
	params : {},
	session : {},
	/**
	* 처리할 데이터 설정
	*
	*/
	data : function(params, session) {
		this.params = params;
		this.session = session;
		return this;
	},
	/**
	* 회원 가입 처리 
	*
	*/
	join : async function() {
		try {
			const data = this.params;
			const session = this.session;
			
			let snsType = 'none';
			let snsId = "",  hash = ""; 
			if (session.naverProfile) {
				snsType = 'naver';
				snsId = session.naverProfile.id;
			} else {
				hash = await bcrypt.hash(data.memPw, 10);
			}
			
			const sql = `INSERT INTO member (memId, memPw, pwHint, memNm, email, cellPhone, snsType, snsId)
									VALUES (:memId, :memPw, :pwHint, :memNm, :email, :cellPhone, :snsType, :snsId)`;
			
			const replacements = {
					memId : data.memId, 
					memPw : hash,
					pwHint : data.pwHint,
					memNm : data.memNm,
					email : data.email,
					cellPhone : data.cellPhone,
					snsType,
					snsId,
			};
			
			await sequelize.query(sql, {
				replacements, 
				type : QueryTypes.INSERT,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 회원정보 수정 
	*
	* @return Boolean
	*/
	update : async function() {
		try {
			
			const replacements = {
					pwHint : this.params.pwHint || "",
					memNm : this.params.memNm,
					email : this.params.email,
					cellPhone : this.params.cellPhone,
					memNo : this.params.memNo,
			};
			
			let addSet = "";
			if (this.params.memPw) {
				replacements.hash = await bcrypt.hash(this.params.memPw, 10);
				addSet = "memPw = :hash,";
				
			}
			
			const sql = `UPDATE member 
									SET 
										${addSet}
										pwHint = :pwHint,
										memNm = :memNm,
										email = :email,
										cellPhone = :cellPhone
								WHERE 
										memNo = :memNo`;
			
			
			await sequelize.query(sql, {
				replacements, 
				type : QueryTypes.UPDATE,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 로그인 처리 
	*
	*/
	login : async function(memId, memPw, req) {
		try {
			/**
			1. 회원 정보 조회 
			2. 비밀번호 검증 
			*/
			const info = await this.get(memId);
			if (!info) {
				throw new Error(`존재하지 않는 회원입니다. - ${memId}`);
			}
			
			const match = await bcrypt.compare(memPw, info.memPw);
			if (match) { // 비밀번호가 일치 -> 세션 처리 
				req.session.memId = info.memId;
				return true;
			}
			
			return false;
		
		} catch (err) {	
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 회원정보 조회
	*
	*/
	get : async function(memId) {
		try {
			const sql = "SELECT * FROM member WHERE memId = ?";
			const rows = await sequelize.query(sql, {
				replacements : [memId],
				type : QueryTypes.SELECT,
			});
			
			return rows[0] || {};
		} catch (err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/** 
	* 아이디 찾기 
	*
	* @param String memNm 회원명
	* @param String cellPhone 휴대폰번호
	* 
	* @return String|Boolean 회원아이디, 없는 경우는 false
	*/
	findId : async function(memNm, cellPhone) {
		try {
			if (!memNm || !cellPhone) {
				throw new Error('회원명 또는 휴대폰번호는 필수 인수 입니다.');
			}
			
			cellPhone = cellPhone.replace(/[^\d]/g, '').replace(/([\d]{3})([\d]{4})([\d]{4})/, '$1-$2-$3');
			
			const sql = "SELECT memId FROM member WHERE memNm = :memNm AND cellPhone = :cellPhone AND snsType='none'";
			const rows = await sequelize.query(sql, {
					replacements : { memNm, cellPhone },
					type : QueryTypes.SELECT,
			});
			
			if (rows.length == 0) {
				throw new Error('일치하는 아이디 없음');
			}
			
			return rows[0].memId;
		} catch(err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 비밀번호 찾기
	*
	* @return Integer|Boolean memNo, 일치하는 회원이 없는 경우는 false 반환
	*/
	findPw : async function() {
		try {
			const cellPhone = this.params.cellPhone.replace(/[^\d]/g, '').replace(/([\d]{3})([\d]{4})([\d]{4})/, "$1-$2-$3");
			
			const sql = `SELECT memNo FROM member 
									WHERE memId = :memId AND memNm = :memNm AND cellPhone = :cellPhone AND pwHint = :pwHint`; 
			
			const replacements = {
					memId : this.params.memId,
					memNm : this.params.memNm,
					cellPhone,
					pwHint : this.params.pwHint,
			};
			
			const rows = await sequelize.query(sql, {
					replacements,
					type : QueryTypes.SELECT,
			});
			
			if (rows.length == 0) {
				throw new Error("일치하는 회원 없음");
			}
			
			return rows[0].memNo;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 비밀번호 변경 
	*
	* @param Integer memNo 회원번호
	* @param String memPw 변경할 비밀번호
	* 
	* @return Boolean
	*/
	changePw : async function (memNo, memPw) {
		try {
			if (!memNo || !memPw) {
				throw new Error('회원번호, 변경할 비밀번호는 필수 인수');
			}
			
			const hash = await bcrypt.hash(memPw, 10);
			const sql = `UPDATE member 
									SET 
										memPw = :hash
								WHERE 
									memNo = :memNo`;
									
			await sequelize.query(sql, {
				replacements : { hash, memNo },
				type : QueryTypes.UPDATE,
			});
							
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
};

module.exports = member;