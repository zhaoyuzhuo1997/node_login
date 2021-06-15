/** /admin/board */
const { alert, reload } = require('../../lib/common');
const { adminOnly } = require('../../middlewares/member_only');
const board = require('../../models/board');
const express = require('express');
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
		.get(async (req, res, next) => {
			const list = await board.getBoards();
			return res.render("admin/board/index", { list } );
		})
		/** 게시판 등록 처리 */
		.post(async (req, res, next) => {
			const result = await board.create(req.body.id, req.body.boardNm);
			if (!result) {
				return alert('게시판 생성에 실패하였습니다.', res);
			}
			
			return reload(res, 'parent');
		})
		/** 게시판 수정 처리 */
		.patch(async (req, res, next) => {
			const result = await board.save(req.body);
			
			if (!result) {
				return alert('게시판 설정 저장 실패하였습니다', res);
			}
			
			return alert("저장되었습니다.", res, 'reload', "parent");
			
		})
		/** 게시판 삭제 */
		.delete((req, res, nexxt) => {
			
		});

/** 게시판 수정 양식 */
router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	const data = await board.getBoard(id);
	if (!data) {
		return alert('존재하지 않는 게시판 입니다.', res, -1);
	}
	
	return res.render("admin/board/form", data);
});

module.exports = router;