
// server.js
// 스타일 주석: Node.js와 Express.js를 사용한 백엔드 서버 구현

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8000;
const DB_FILE = path.join(__dirname, 'database.db');

// 데이터베이스 초기화
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err.message);
    } else {
        console.log(`데이터베이스 '${DB_FILE}'에 성공적으로 연결되었습니다.`);
        db.serialize(() => {
            // trips 테이블 생성
            db.run(`
                CREATE TABLE IF NOT EXISTS trips (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    data TEXT NOT NULL,
                    saved_at TEXT NOT NULL
                )
            `, (err) => {
                if (err) console.error('trips 테이블 생성 오류:', err.message);
                else console.log("'trips' 테이블이 성공적으로 준비되었습니다.");
            });

            // templates 테이블 생성
            db.run(`
                CREATE TABLE IF NOT EXISTS templates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    data TEXT NOT NULL,
                    saved_at TEXT NOT NULL
                )
            `, (err) => {
                if (err) console.error('templates 테이블 생성 오류:', err.message);
                else console.log("'templates' 테이블이 성공적으로 준비되었습니다.");
            });
        });
    }
});

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json({ limit: '50mb' })); // JSON 요청 본문 파싱 (용량 제한 50MB)
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname))); // 정적 파일 서비스

// API 라우트: 목록 조회 (GET)
app.get('/api/:tableName', (req, res) => {
    const { tableName } = req.params;
    if (!['trips', 'templates'].includes(tableName)) {
        return res.status(404).json({ error: '잘못된 API 엔드포인트입니다.' });
    }

    db.all(`SELECT * FROM ${tableName} ORDER BY saved_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: `서버 오류 (GET): ${err.message}` });
        }
        // 'data' 필드를 JSON 객체로 파싱
        const results = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data),
            savedAt: row.saved_at // 클라이언트 호환성을 위해 savedAt 추가
        }));
        res.json(results);
    });
});

// API 라우트: 항목 저장 (POST)
app.post('/api/:tableName', (req, res) => {
    const { tableName } = req.params;
    if (!['trips', 'templates'].includes(tableName)) {
        return res.status(404).json({ error: '잘못된 API 엔드포인트입니다.' });
    }

    const { name, data, savedAt } = req.body;

    if (!name || !data || !savedAt) {
        return res.status(400).json({ error: '필수 필드(name, data, savedAt)가 누락되었습니다.' });
    }

    // data 객체를 JSON 문자열로 저장
    const dataStr = JSON.stringify(data);

    const sql = `INSERT INTO ${tableName} (name, data, saved_at) VALUES (?, ?, ?)`;
    db.run(sql, [name, dataStr, savedAt], function(err) {
        if (err) {
            return res.status(500).json({ error: `서버 오류 (POST): ${err.message}` });
        }
        res.status(201).json({ status: 'success', id: this.lastID });
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
