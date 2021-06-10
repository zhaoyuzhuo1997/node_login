/** /admin/board */
const { alert, reload } = require('../../lib/common');
const { adminOnly } = require('../../middlewares/member_only');
const board = require('../../models/board');
const express = express('express');
router = express.Router();

// 관리자 접속 통제 
router.use(adminOnly);

/** 공통 미들웨어 */
router.use((req, res, next) => {
	res.locals.menuCode = 'board';
	next();
});

router.route("/")
		/** 게시판 등록 양식 */
		.get((req, res, next) => {
			const list = await board.getBoards();
			console.log(list);
			return res.render("admin/board/index", { list } );
		});
		/** 게시판 등록 처리 */
		.post(async (req, res, next) => {
			const result = await board.create(req.body.id, req.body.boardNm);
			if (!result) {
				return alert('게시판 생성에 실패하였습니다.', res);
			}
			
			return reload(res, 'parent');
		})
		/** 게시판 수정 처리 */
		.patch((req, res, next) => {
			
		});
		/** 게시판 삭제 */
		.delete((req, res, next) => {
			
		});
		
/** 게시판 수정 양식 */
router.get("/:id", (req, res, next) => {
	console.log(req.params);
	return res.send("");
});
		
module.exports = router;