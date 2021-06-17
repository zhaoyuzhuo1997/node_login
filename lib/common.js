const crypto = require('crypto');

/**
* 공통 
*
*/
const commonLib = {
	/**
	* 메세지 출력 
	*
	* @param String msg 알림 메세지
	* @param Object res  Response 객체
	* @param Integer|String action
	*						Integer(정수) -> history.go(정수)
	*						String(링크) -> location.href
	* @param String target 기본값 self, 
	*/
	alert : function(msg, res, action, target) {
		target = target || 'self';
		
		let script = `<script>alert("${msg}");`;
		if (action) {
			if (isNaN(action)) { // 이동 
				if (action == 'reload') {
					script += `${target}.location.reload();`;
				} else {
					script += `${target}.location.href='${action}';`;
				}
			} else { // history.go
				script += `${target}.history.go(${action});`;
			}
		} 
		script += "</script>";

		return res.send(script);
	},
	/**
	* 페이지 이동 
	*
	*/
	go : function(url, res, target) {
		target = target || 'self';
		return res.send(`<script>${target}.location.href='${url}';</script>`);
	},
	/**
	* 페이지 뒤로가기 
	*
	*/
	back : function(res, target) {
		target = target || 'self';
		return res.send(`<script>${target}.history.back();</script>`);
	},
	/**
	* 페이지 앞으로 가기
	*
	*/
	forward : function(res, target) {
		target = target || 'self';
		return res.send(`<script>${target}.history.forward();</script>`);
	},
	/**
	* 페이지 새로고침 
	*
	*/
	reload : function(res, target) {
		target = target || 'self';
		
		return res.send(`<script>${target}.location.reload();</script>`);
	},
	/**
	* Date 생성자 toString 형태를 년, 월, 일, 요일로 분해해서 반환
	*
	*/
	parseDate : function(dateStr) {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		let month = date.getMonth() + 1;
		month = (month < 10)?"0"+month:month;
		let day = date.getDate();
		day = (day < 10)?"0"+day:day;
		
		let hours = date.getHours();
		hours = (hours < 10)?"0"+hours:hours;
		
		let mins = date.getMinutes();
		mins = (mins < 10)?"0"+mins:mins;
		
		let secs = date.getSeconds();
		secs = (secs < 10)?"0"+secs:secs;
		
		//const yoil = this.getYoil(date.getDay());
		
		const str = `${year}.${month}.${day}`;
		const str2 = `${year}.${month}.${day} ${hours}:${mins}`;
		
		return {year, month, day, date : str, datetime : str2 };
	},
	/**
	* 요일 
	*
	*/
	getYoils : function() {
		return ["일", "월", "화", "수", "목", "금", "토"];
	},
	/**
	* 요일 index 번호에 해당하는 요일 반환
	*
	*/
	getYoil : function(yoilIndex) {
		if (typeof yoilIndex == 'undefined') {  // yoilIndex를 지정하지 않으면 오늘 요일 
			yoilIndex = new Date().getDay();
		}
		
		const yoils = this.getYoils();
		
		return yoils[yoilIndex];
	},
	/**
	* Unique ID 생성 
	*
	* @return Integer 밀리초 Timestamp
	*/
	getUid : function() {
		return new Date().getTime();
	},
	/**
	* 브라우져 + IP별 사용자 구분 값
	* @param Object req - Request
	* @return String 
	*/
	getBrowserId : function(req) {
		const data = req.get("User-Agent") + req.ip;
		const hash = crypto.createHash('md5').update(data).digest('hex');
		
		return hash;
	}
};

module.exports = commonLib;