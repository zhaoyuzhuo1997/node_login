const express = require('express');
const { alert } = require('../lib/common');
const router = express.Router();
const travel = require('../models/travel');
const { memberOnly } = require("../middlewares/member_only");
const { joinValidator } = require("../middlewares/join_validator");
const member = require("../models/member");

/**
* 마이페이지 
*
*/

// 회원전용 페이지 체크 */
router.use(memberOnly);

router.get("/", (req, res, next) => {
	return res.render("mypage/index");
});


router.get("/reservation", async (req, res, next) => {
	const data = await travel.getReservations(req.query.page, 20, req.query, req.session.memNo);
	return res.render("mypage/reservation", data);
});


/** 회원정보 수정 */
router.route("/myinfo")
	/** 수정 양식 */
	.get((req, res, next) => {
		let isPasswordNotChange = false;
		if (req.member.snsType != 'none') isPasswordNotChange = true;
		const data = {isPasswordNotChange};
		
		return res.render("member/form", data);
	})
	/** 수정 처리 */
	.post(joinValidator, async (req, res, next) => {
		req.body.memNo = req.session.memNo;
		const result = await member.data(req.body).update();
		if (result) { // 회원 정보 수정 성공 
			 return alert("회원정보가 수정되었습니다.", res, "reload", "parent");
		}
		
		// 회원정보 수정 실패
		return alert("회원정보 수정에 실패하였습니다.", res);
	});

module.exports = router;