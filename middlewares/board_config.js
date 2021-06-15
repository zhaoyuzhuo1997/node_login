const { alert } = require('../lib/common');
const board = require('../models/board');

/**
* 게시판 설정 조회 및 체크 
*
*/
module.exports.boardConfig = async (req, res, next) => {
		const id = req.params.id || req.query.id || req.body.id;
		try {
			if (!id) {
				throw new Error('게시판 아이디가 누락되었습니다.');
			}
			
			const config = await board.getBoard(id);
			if (!config.id) {
				throw new Error('존재하지 않는 게시판 입니다.');
			}
			
			req.boardConfig = config;
			
			req.body.id = id;
			
		} catch (err) {
			return alert(err.message, res, -1);
		}
		
		next();
};