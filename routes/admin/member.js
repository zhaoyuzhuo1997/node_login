/** /admin/member */
const { adminOnly } = require('../../middlewares/member_only');
const express = require('express');
router = express.Router();

// 관리자 접속 통제 
router.use(adminOnly);

/** 공통 미들웨어 */
router.use((req, res, next) => {
	res.locals.menuCode = 'member';
	next();
});

router.get("/", (req, res, next) => {
	
	return res.render("admin/member/index");
});

module.exports = router;