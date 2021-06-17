/**
* Front 게시판 라우터 
* /board
*/
const board = require('../models/board');
const { boardConfig } = require('../middlewares/board_config');
const { writeValidator, permissionCheck, guestOnly, commentValidator, commentPermissionCheck, memberOnlyCheck } = require('../middlewares/board_validator');
const { alert, go, reload, getUid, getBrowserId } = require('../lib/common');
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const router = express.Router();


/** 댓글  */
router.route("/comment")
		/** 댓글 작성 처리 */
		.post(commentValidator, async (req, res, next) => {
			const idx = await board
											.data(req.body, req.session)
											.writeComment();
			
			if (idx) { // 댓글 작성 성공 				
				const url = `/board/view/${req.body.idxBoard}/?comment_done=${idx}`;
				return go(url, res, "parent");
			}
			
			// 댓글 작성 실패
			return alert("댓글 작성 실패하였습니다.", res);
		})
		/** 댓글 수정 */
		.patch(commentValidator, async (req, res, next) => {
			const result = await board.data(req.body).updateComment();
			if (result) { // 댓글 수정 성공 -> 새로고침 
				const data = await board.getComment(req.body.idx);				
				return go("/board/view/" + data.idxBoard, res, "parent");
			}
			
			return alert("댓글 수정 실패하였습니다.", res);
		});

/** 댓글 수정 양식 */
router.get("/comment/:idx", commentPermissionCheck, async (req, res, next) => {
	const idx = req.params.idx;
	const data = await board.getComment(idx);
	data.addCss = ["board"];
	return res.render("board/comment_form", data);
});

/** 댓글 삭제 처리 */
router.get("/comment/delete/:idx", commentPermissionCheck, async (req, res, next) => {
	try {
		const idx = req.params.idx;
		const data = await board.getComment(idx);
		if (!data.idx) {
			throw new Error('댓글이 존재하지 않습니다.');
		}
		
		const result = await board.deleteComment(idx);
		if (!result) { 	// 삭제 실패 -> 이전페이지로 이동
			throw new Error("댓글 삭제 실패하였습니다.", -1);
		} 
		
		// 삭제 성공 -> 게시글 목록 
		return res.redirect("/board/view/" + data.idxBoard);

	} catch (err) {
		return alert(err.message, res, -1);
	}
});	

/**
* 댓글 비밀번호 체크
*
*/
router.route("/comment/password/:idx")
		/** 비밀번호 양식 */
		.get(guestOnly, async (req, res, next) => {
			const data = {
				idx : req.params.idx,
				addCss : ['board'],
				isComment : true,
			};
			return res.render("board/password", data);
		})
		/** 비밀번호 체크 처리 */
		.post(async (req, res, next) => {
			try {
				const idx =req.params.idx;
				const password = req.body.password;
				if (!idx) {
					throw new Error('잘못된 접근입니다.');
				}
				
				if (!password) {
					throw new Error('비밀번호를 입력하세요.');
				}
				
				const data = await board.getComment(idx);
				if (!data.idx) {
					throw new Error('존재하지 않는 게시글 입니다.');
				}
				
				const match = await bcrypt.compare(password, data.password);
				if (match) { // 비회원 비밀번호 일치 
					const key = `comment_${idx}`;
					const keyUrl = key + "_url";
					req.session[key] = true;
					if (req.session[keyUrl] && req.session[keyUrl].indexOf('delete') != -1) { // 삭제  -> 댓글 삭제  -> 게시글 보기 페이지 이동
						await board.deleteComment(idx);
					} else {
						const url = `/board/view/${data.idxBoard}?idx_comment=${idx}`;
						return go(url, res, "parent");
					}
				} else { // 비회원 비밀번호 불일치 
					return alert("비밀번호가 일치하지 않습니다.", res);
				}
				
				return go("/board/view/" + data.idxBoard, res, "parent");
				
			} catch (err) {
				return alert(err.message, res);
			}
		});

/** 게시글 검색 */
router.get("/search", async (req, res, next) => {
	try {
		const sopt = req.query.sopt || 'all'; // 없는 경우는 기본값 'all' -> 통합 검색
		const skey = req.query.skey; 
		if (!skey) {
			throw new Error('검색어를 입력하세요.');
		}
		
		/** 검색어 처리 */
		const where = {
			binds : [],
			params : {},
		};
		if (sopt && skey) {
			let column = "";
			switch (sopt) {
				case "all" : 
					where.binds.push("(CONCAT(a.subject, a.contents, a.poster) LIKE :skey OR b.memId LIKE :skey)");
					break;
				case "subject_contents":
					column = "CONCAT(a.subject, a.contents)";
					break;
				default: 
					column = sopt;
			}
			if (sopt != 'all') {
				where.binds.push(column + " LIKE :skey");
			}
			
			where.params.skey = "%" + skey + "%";
		}
		
		/** 검색 처리 E */
		
		const rowsPerPage = 20;
		const data = await board
								.addWhere(where)
								.getList(undefined, req.query.page, rowsPerPage, req.query);
								
		const skin = "default";
		data.skinPath = path.join(__dirname, "../views/board/skins/" + skin + "/_list.html");
		data.addCss = ['board'];
		data.isSearchPage = true;
		data.sopt = sopt;
		data.skey = skey;
		
		return res.render("board/search", data);
	} catch (err) {
		return alert(err.message, res, -1);
	}
});


/** 게시글 작성(양식, DB 처리), 수정, 삭제  - /board */
router.route('/:id')
		/** 작성 양식 - id (게시판 아이디) */
		.get(boardConfig, memberOnlyCheck, async (req, res, next) => {
			const data = { 
				config : req.boardConfig,
				addScript : ['board'],
				addCss : ['board'],
				gid : getUid(),
			};
			
			return res.render('board/form', data);
		})
		/** 작성 처리 - id (게시판 아이디) */
		.post(boardConfig, writeValidator, async (req, res, next) => {
			/* 작성 완료시 게시글 번호 */
			const idx = await board.data(req.body, req.session)
											 .write();
			
			if (idx === false) { // 게시글 작성 실패 
				return alert('게시글 작성 실패 하였습니다', res);
			}
			
			// 게시글 작성 성공시 게시글 보기 페이지로 이동 
			return go("/board/view/" + idx, res, "parent");
		})
		/** 수정 - id (게시글 번호) */
		.patch(boardConfig, writeValidator, async (req, res, next) => {
			const result = await board.data(req.body, req.session)
												.update();
			if (result) { // 게시글 작성 성공시 -> 게시글 보기 페이지 이동 
				return go("/board/view/" + req.body.idx, res, "parent");
			}
		
			// 실패시 실패 메세지
			return alert('게시글 수정 실패하였습니다', res);
		})
		/** 삭제 - id (게시글 번호) */
		.delete(permissionCheck, async (req, res, next) => {
			try {
				const idx = req.params.id;
				const data = await board.get(idx);
				if (!data.idx) {
					throw new Error('존재하지 않는 게시글 입니다.');
				}
				
				const result = await board.delete(idx);
				if (!result) { // 게시글 삭제 실패 
					throw new Error('게시글 삭제 실패하였습니다');
				}
				
				return res.json({erorr : false, message : "게시글 삭제 되었습니다.", boardId : data.id });
				
			} catch (err) {
				return res.json({ error : true, message : err.message });
			}
		});


/** 게시글 목록 */
router.get("/list/:id", boardConfig, async (req, res, next) => {

	const id = req.params.id;
	/** 검색 처리 S */
	const where = {
		binds : [],
		params : {},
	};
	
	let category = "";
	if (req.query.category) {
		where.binds.push("a.category = :category");
		category = where.params.category = req.query.category;
	}
	
	/** 검색어 처리 */
	const sopt = req.query.sopt; // 검색 조건 
	const skey = req.query.skey; // 검색어 
	
	if (sopt && skey) {
		let column = "";
		switch (sopt) {
			case "all" : 
				where.binds.push("(CONCAT(a.subject, a.contents, a.poster) LIKE :skey OR b.memId LIKE :skey)");
				break;
			case "subject_contents":
				column = "CONCAT(a.subject, a.contents)";
				break;
			default: 
				column = sopt;
		}
		if (sopt != 'all') {
			where.binds.push(column + " LIKE :skey");
		}
		
		where.params.skey = "%" + skey + "%";
	}
	
	/** 검색 처리 E */
	
	const rowsPerPage = req.boardConfig.rowsPerPage || 20;
	const data = await board
								.addWhere(where)
								.getList(id, req.query.page, rowsPerPage, req.query);
								
	data.config = req.boardConfig;
	data.addCss = ['board'];
	data.category = category;
	
	data.sopt = sopt;
	data.skey = skey;
	
	return res.render('board/list', data);
});	


/** 게시글 보기 */
router.get("/view/:idx", async (req, res, next) => {
	
	let data;
	const idx = req.params.idx;
		
	try {
		if (!idx) {
			throw new Error('잘못된 접근입니다');
		}
		
		data = await board.get(idx, req);
		if (!data.idx) {
			throw new Error('존재하지 않는 게시글입니다.');
		}
		
		data.idx_comment = req.query.idx_comment;
	} catch (err) {
		return alert(err.message, res, -1);
	}
	
	data.addCss = ["board"];
	data.addScript = ["board"];
	
	// 게시글 보기 하단에 게시글 목록 노출 
	if (data.config.useViewList) {
		const rowsPerPage = data.config.rowsPerPage || 20;
		
		/** 검색 처리 S */
		const where = {
			binds : [],
			params : {},
		};
		
		let category = "";
		if (data.category) {
			where.binds.push("a.category = :category");
			category = where.params.category = data.category;
		}
		/** 검색 처리 E */
		
		const boardList = await board
										.addWhere(where)
										.getList(data.boardId, req.query.page, rowsPerPage, req.query);
		
		for (key in boardList) {
			data[key] = boardList[key];
		}
	}
	
	/** 댓글 사용하는 경우 작성된 댓글 목록 조회 S */
	if (data.config.useComment) {
		data.comments = await board.getComments(idx, req);
	}
	/** 댓글 사용하는 경우 작성된 댓글 목록 조회 E */
	
	/** 게시글 조회수 업데이트 */
	await board.updateViewCount(idx, req);
	
	return res.render("board/view", data);
});

/** 게시글 수정 */
router.get("/update/:idx", permissionCheck, async (req, res, next) => {
	try {
		const idx = req.params.idx;
		if (!idx) {
			throw new Error('잘못된 접근입니다.');
		}
		
		const data = await board.get(idx);
		if (!data.idx) {
			throw new Error('존재하지 않는 게시글 입니다.');
		}
		
		data.addCss = ['board'];
		data.addScript = ['board'];
		
		return res.render("board/form", data);
		
	} catch(err) {
		return alert(err.message, res, -1);
	}
});

/** 비회원 게시글 수정, 삭제 비밀번호 확인 */
router.route("/password/:idx")
		/** 비밀번호 확인 양식 */
		.get(guestOnly, (req, res, next) => {
			const data = {
					idx : req.params.idx,
					addCss : ['board'],
			};
			return res.render("board/password", data);
		})
		/** 비밀번호 확인 처리 */
		.post(async (req, res, next) => {
			try {
				const idx = req.params.idx;
				const password = req.body.password;
				if (!idx) {
					throw new Error('잘못된 접근입니다.');
				}
				
				if (!password) {
					throw new Error('비밀번호를 입력하세요.');
				}
				
				// 댓글이면 
				
			
				const data = await board.get(idx);
				if (!data.idx) {
					throw new Error('존재하지 않는 게시글 입니다.');
				}
			
				const match = await bcrypt.compare(password, data.password);
				if (match) { // 비회원 비밀번호 일치 
					const key = `board_${data.boardId}_${idx}`;
					const keyUrl = key + "_url";
					req.session[key] = true;
					if (req.session[keyUrl]) {
						if (req.session[keyUrl].indexOf("delete") != -1) { // 게시글 삭제인 경우 바로 삭제 -> 목록 이동 
							await board.delete(idx);
						} else {
							return go(req.session[keyUrl], res, "parent");
						}
					}
					
					return go("/board/list/" + data.boardId, res, "parent");
					
				} else { // 비회원 비밀번호 불일치
					return alert('비밀번호가 일치하지 않습니다.', res);
				}
			} catch (err) {
				return alert(err.message, res);
			}
		});

module.exports = router;