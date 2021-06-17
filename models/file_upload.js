const fs = require('fs').promises;
const constants = require('fs').constants;
const logger = require('../lib/logger');
const { sequelize, Sequelize : { QueryTypes } } = require('./index');
const path = require('path');

/**
* 파일 업로드 
*
*/
const fileUpload = {
	/**
	* 파일 정보 저장 
	*
	* @params Object params 업로드 된 파일 정보
	* @return Object - 추가된 idx와 현재 업로드될 폴더 경로 
	*/
	registerFileInfo : async function(params) {
		try {
			if (!params.gid) {
				throw new Error('gid 누락');
			}
			
			const sql = "INSERT INTO filedata (gid, fileName, mimeType, isAttached) VALUES (:gid, :fileName, :mimeType, :isAttached)";
			const replacements = {
					gid : params.gid,
					fileName : params.originalname, 
					mimeType : params.mimetype,
					isAttached : params.isAttached,
			};
			
			const result = await sequelize.query(sql, {
				replacements,
				type : QueryTypes.INSERT,
			});
			
			const idx = result[0];
			const folder = "public/upload/" + (idx % 10);
		
			return { idx, folder };
		} catch (err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 파일 삭제 
	*
	* @param Integer idx 파일 등록 번호
	* @return Boolean 
	*/ 
	delete : async function (idx) {
		try {
			const sql = "DELETE FROM filedata WHERE idx = ?";
			await sequelize.query(sql, {
				replacements : [idx],
				type : QueryTypes.DELETE,
			});
			const filePath = path.join(__dirname, "../public/upload/" + (idx % 10) + "/file_" + idx);
			await fs.unlink(filePath);
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	/**
	* 파일 정보 추출 
	*
	* @param Integer idx 
	* @return Object
	*/
	get : async function (idx) {
		try {
			const sql = "SELECT * FROM filedata WHERE idx = ?";
			const rows = await sequelize.query(sql, {
				replacements : [idx],
				type : QueryTypes.SELECT,
			});
			
			const data = rows[0] || {};
			if (data) {
				data.fileUrl = "/upload/" + (data.idx % 10) + "/file_" + data.idx;
				data.filePath = path.join(__dirname, "../public/upload/" + (data.idx % 10) + "/file_" + data.idx);
			}
			
			return data;
		} catch (err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 업로드된 파일 목록
	*
	* @param String gid 그룹 ID 
	* @return Object
	*/
	gets : async function(gid) {
		try {
			const sql = 'SELECT * FROM filedata WHERE gid = ? AND isDone=1';
			const rows = await sequelize.query(sql, {
				replacements : [gid],
				type : QueryTypes.SELECT,
			});
			
			const data = {};
			rows.forEach((v) => {
				/**
				* isAttached - 0 -> 에디터 파일 
				* 				  - 1 -> 첨부파일 
				*
				*/
				
				v.fileUrl = "/upload/" + (v.idx % 10) + "/file_" + v.idx;
				v.filePath = path.join(__dirname, "../public/upload/" + (v.idx % 10) + "/file_" + v.idx);
				
				if (v.isAttached) { // 첨부 파일 
					data.attached = data.attached || [];
					data.attached.push(v);
				} else { // 에디터 파일 
					data.editor = data.editor || [];
					data.editor.push(v);
				}
			});
			
			return data;
			
		} catch(err) {
			logger(err.stack, 'error');
			return {};
		}
	},
	/**
	* 파일 업로드 완료 처리 
	*
	* @param Integer idx 파일 등록번호 
	* @return Boolean 
	*/
	finish : async function (idx) {
		try {
			const sql = "UPDATE filedata SET isDone=1 WHERE idx = ?";
			await sequelize.query(sql, {
				replacements : [idx],
				type : QueryTypes.UPDATE,
			});
			
			return true;
		} catch (err) {
			logger(err.stack, 'error');
			return false;
		}
	},
	
};

module.exports = fileUpload;