const fileUpload = require("../models/file_upload");
const { alert } = require("../lib/common");

/**
* 파일 유효성 검사 
*
*/
module.exports.fileTypeCheck = async (req, res, next) => {
		try {
			const mode = req.body.mode; 
			/**
			* 이미지 형식이 아닌 경우는 기존 파일 삭제,  파일 기록 삭제 
			* 에러 메세지 
			*/
			if (req.file && mode == 'image') { 
				if (req.file.mimetype.indexOf("image") == -1) { // 이미지가 아닌 경우 
					await fileUpload.delete(req.file.idx);
					
					throw new Error('이미지 형식의 파일만 업로드 가능합니다.');
				}
			}
		} catch (err) {
			return alert(err.message, res);
		}
		
		next();
};