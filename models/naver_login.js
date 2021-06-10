const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const querystring = require('querystring');
const axios = require('axios');
const logger = require('../lib/logger');

/**
* 네이버 로그인 
*
*/
const naverLogin = {
	clientId : 'P78Vj1Hp_UBEisn_PtLq',
	secret : 'gUFQ5V8mFP',
	redirectUri : 'http://code-factory.co.kr:3000/member/login_callback',
	
	/** 
	* code 발급 요청 URL 
	*
	*/
	getCodeUrl : function() {
		const params = {
			response_type : 'code',
			client_id : this.clientId,
			redirect_uri : this.redirectUri,
			state : new Date().getTime(),
		};
		
		const url = "https://nid.naver.com/oauth2.0/authorize?" + querystring.stringify(params);
	
		return url;
	},
	/**
	* access_token 발급 요청 
	*
	*/
	getAccessToken : async function(code, state) {
		try {
			const url = "https://nid.naver.com/oauth2.0/token";
			let params = {
				grant_type : 'authorization_code',
				client_id : this.clientId,
				client_secret : this.secret,
				code, 
				state,
			};
			params = querystring.stringify(params);
			const res = await axios.post(url, params);
			
			if (!res.data.access_token) {
				return false;
			}
			
			return res.data.access_token;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 회원정보 조회
	*
	*/
	getProfile : async function(accessToken) {
		if (!accessToken) 
			return {};
		
		const options = {
			headers : { Authorization : `Bearer ${accessToken}` },
		};
		
		try {
			const url = 'https://openapi.naver.com/v1/nid/me';
			const res = await axios.get(url, options);
			if (res.data.resultcode != '00') {
				throw new Error('네이버 로그인 회원정보 조회 실패');
			}
			
			return res.data.response;
		} catch (err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 네이버 로그인 회원 가입이 이미 되어있는지 여부 체크 
	*
	*/
	checkExists : async function(code, state, req) {
		/**
		1. acccess_token 발급  - O 
		2. profile 정보를 추출 - O
		3. profile 정보를 session에 담아서 보관 - O
		4. member 테이블에 profile['id'] 정보와 snsType 이 'naver'인 정보가 있으면 
			이미 회원가입, 없으면 미 가입
		5. 회원 가입이 되어 있으면 true, false - O 
		*/
		let isExists = false;
		const accessToken = await this.getAccessToken(code,state);
		if (accessToken) {
			const profile = await this.getProfile(accessToken);
			if (profile) {
				req.session.naverProfile = profile;
				
				const sql = "SELECT COUNT(*) as cnt FROM member WHERE snsType='naver' AND snsId = ?";
				const rows = await sequelize.query(sql, {
					replacements : [profile.id],
					type : QueryTypes.SELECT,
				});
				
				if (rows[0].cnt > 0) isExists = true;
			} // endif 
		} // endif 
		
		return isExists;
	},
	/**
	* 네이버 로그인 처리 
	*
	*/
	login : async function(req, res) {
		/**
		snsType - naver 
		 req.session.naverProfile.id --  snsId 
		*/
		if (!req.session.naverProfile)
			return false;
		
		try {
			const sql = "SELECT * FROM member WHERE snsType='naver' AND snsId = ?";
			const rows = await sequelize.query(sql, {
					replacements : [req.session.naverProfile.id],
					type : QueryTypes.SELECT,
			});
			
			if (rows.length == 0) {
				throw new Error('네이버 로그인 - 존재하지 않는 snsId');
			}
				
			/** 로그인 처리 */
			req.session.memId = rows[0].memId;
			
			/** 세션 삭제 */
			delete req.session.naverProfile;
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
		
	},
};

module.exports = naverLogin;