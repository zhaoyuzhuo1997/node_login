const board = require('../models/board');
const express = require('express');
const router = express.Router();

router.get("/", async (req, res, next) => {
	/*
	const photoList = await board.getLatest('photo', '분류1', 10, true);
	const data = {
		photoList,
	};
	*/
	const latestPosts = [], latestGPosts = [];
	const boards = [
		{ 'sneaker' : ['스니커뉴스', '조던뉴스', '위키', '리뷰'] },
		{ 'community' : ['스니커톡', '패션톡', 'Q&A',  '핫딜톡', '프리톡'] },
		{'market' : ['스니커마켓', '패션마켓','BUY'] },
		{ 'gallery' : ['착갤', '염갤','셀럽','자갤','릴레이' ] },
	];
	
	const boardIds = [];
	const gBoardCategory = boards[3].gallery;
	
	for await (v of boards) {
		
		const boardId = Object.keys(v)[0];
		if (boardId == 'gallery') {
			for await (category of v.gallery) {
				const list = await board.getLatest(boardId, category, 8, true);
				latestGPosts.push(list);
			}
		} else {
			boardIds.push(boardId);
			latestPosts[boardId] = latestPosts[boardId] || [];
			for await (category of v[boardId]) {
				const list = await board.getLatest(boardId, category, 5);
				latestPosts[boardId].push(list);
			}
		}
	}
	
	const data = {
		boards,
		boardIds, 
		latestPosts,
		gBoardCategory,
		latestGPosts,
	};
	console.log("gBoardCategory", gBoardCategory);
	console.log("latestGPosts", latestGPosts);
	res.render("main/index", data);
});

module.exports = router;