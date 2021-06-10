const { sequelize, Sequelize : { QueryTypes }  } = require("./index");
const logger = require("../lib/logger");

/**
* 게시판 Model
*
*/
const board = {
	/**
	* 게시판 생성
	*
	* @param String id 게시판 아이디
	* @param String boardNm 게시판명
	*
	* @return Boolean 생성 성공시 true
	*/
	create : async function(id, boardNm) {
		try {
			const sql = "INSERT INTO board (id, boardNm) VALUES (:id, :boardNm)";
			await sequelize.query(sql, {
				replacements : { id, boardNm },
				type : QueryTypes.INSERT,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	*
	*
	*
	*/
	getBoards : async function() {
		try {
			const sql = "SELECT * FROM board ORDER BY regDt DESC";
			const rows = await sequelize.query(sql, {
				type : QueryTypes.SELECT,
			});
			
			return rows;
		} catch (err) {
			logger(err.stack, 'error');
			return [];
		}
	},
	/**
	* 게시판 설정 조회
	*
	* @params String id 게시판 아이디
	* @return Object
	*/
	getBoard : async function(id) {
		try {
			const sql = "SELECT * FROM board WHERE id = ?";
		} catch(err) {
			logger(err.stack, 'error');
			return {};
		}
	},
};

module.exports = board;