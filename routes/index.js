const board = require('../models/board');
const express = require('express');
const router = express.Router();

router.get("/", async (req, res, next) => {
	const photoList = await board.getLatest('photo', '분류1', 10, true);
	const data = {
		photoList,
	};
	
	res.render("main/index", data);
});

module.exports = router;