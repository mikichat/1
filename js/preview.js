console.log('미리보기 페이지 로드 시작...');

// --- Main Functions ---

window.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 이벤트 발생');
    const data = getDataFromURL();
    renderData(data);
});

function getDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const compressedData = urlParams.get('data');
    
    let data = null;
    
    try {
        if (mode === 'local') {
            const storedData = localStorage.getItem('previewData');
            if (storedData) data = JSON.parse(storedData);
        } else if (compressedData) {
            const decompressed = LZString.decompressFromEncodedURIComponent(compressedData);
            data = JSON.parse(decompressed);
        }
    } catch (error) {
        console.error('데이터 파싱 오류:', error);
    }
    
    return data;
}

function renderData(data) {
    if (!data || !data.content) {
        document.getElementById('contentArea').innerHTML = `
            <div class="section-box pink">
                <h2 class="text-xl font-bold text-red-600 mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>데이터를 불러올 수 없습니다</h2>
                <p class="text-gray-700">안내문 작성 페이지에서 다시 시도해주세요.</p>
                <button onclick="goBack()" class="btn btn-primary mt-4"><i class="fas fa-arrow-left mr-2"></i>작성 페이지로 돌아가기</button>
            </div>
        `;
        return;
    }
    
    console.log('렌더링할 데이터:', data);
    
    const content = data.content;
    const design = data.design || {};

    // --- 헤더 및 타이틀 ---
    const titleElement = document.getElementById('title');
    const headerSection = document.querySelector('.header-section');
    
    titleElement.textContent = content.title || '여행 안내문';
    if (design.titleFont) titleElement.style.fontFamily = design.titleFont;
    if (design.titleColor) titleElement.style.color = design.titleColor;
    if (design.headerBgColor) headerSection.style.backgroundColor = design.headerBgColor;

    if (content.startDate && content.endDate) {
        document.getElementById('period').textContent = `${formatDate(content.startDate)} ~ ${formatDate(content.endDate)}`;
    }

    if (content.titleImage) {
        const bgDiv = document.createElement('div');
        bgDiv.className = 'header-background';
        bgDiv.style.backgroundImage = `url(${content.titleImage})`;
        headerSection.insertBefore(bgDiv, headerSection.firstChild);
    }
    
    // --- 컨텐츠 영역 생성 ---
    let html = '';
    
    // 타입에 따라 다른 섹션 렌더링
    if (data.type === 'golf') {
        // 골프 여행용 섹션
        if (content.airportMeeting && content.airportMeeting.include) html += renderAirportMeeting(content.airportMeeting);
        if (content.localMeeting && content.localMeeting.include) html += renderLocalMeeting(content.localMeeting);
        if (content.teeTimes && content.teeTimes.length > 0) html += renderTeeTimes(content.teeTimes);
        if (content.schedules && content.schedules.length > 0) html += renderGolfSchedules(content.schedules);
    } else if (data.type === 'travel') {
        // 일반 여행용 섹션
        if (content.meetingPlace) html += renderTravelMeeting(content);
        if (content.schedules && content.schedules.length > 0) html += renderTravelSchedules(content.schedules);
    }

    // 공통 섹션
    if (content.departureAirport || content.arrivalAirport) html += renderFlight(content);
    if (content.accommodation) html += renderAccommodation(content);
    if (content.notes || content.additionalInfo) html += renderNotes(content.notes || content.additionalInfo);
    if (content.companyName) html += renderCompany(content);
    
    document.getElementById('contentArea').innerHTML = html;
}


// --- 렌더링 헬퍼 함수 ---

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

const renderIf = (value, template) => value ? template(value) : '';

function renderAirportMeeting(meeting) {
    return `
        <div class="section-box purple">
            <h2 class="text-2xl font-bold text-purple-700 mb-4"><i class="fas fa-plane-arrival mr-2"></i>공항 미팅</h2>
            ${renderIf(meeting.place, v => `<div class="info-row"><span class="info-label">장소</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.date, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
            ${renderIf(meeting.time, v => `<div class="info-row"><span class="info-label">시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.name, v => `<div class="info-row"><span class="info-label">담당자</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.phone, v => `<div class="info-row"><span class="info-label">전화번호</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.image, v => `<img src="${v}" class="preview-image" alt="공항 미팅">`)}
        </div>
    `;
}

function renderLocalMeeting(meeting) {
    return `
        <div class="section-box purple">
            <h2 class="text-2xl font-bold text-purple-700 mb-4"><i class="fas fa-map-marker-alt mr-2"></i>현지 미팅</h2>
            ${renderIf(meeting.place, v => `<div class="info-row"><span class="info-label">장소</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.date, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
            ${renderIf(meeting.time, v => `<div class="info-row"><span class="info-label">시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.guide, v => `<div class="info-row"><span class="info-label">가이드</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.phone, v => `<div class="info-row"><span class="info-label">전화번호</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(meeting.image, v => `<img src="${v}" class="preview-image" alt="현지 미팅">`)}
        </div>
    `;
}

function renderTravelMeeting(content) {
     return `
        <div class="section-box purple">
            <h2 class="text-2xl font-bold text-purple-700 mb-4"><i class="fas fa-handshake mr-2"></i>미팅 정보</h2>
            ${renderIf(content.meetingPlace, v => `<div class="info-row"><span class="info-label">장소</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.meetingDate, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
            ${renderIf(content.meetingTime, v => `<div class="info-row"><span class="info-label">시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.meetingImage, v => `<img src="${v}" class="preview-image" alt="미팅 장소">`)}
        </div>
    `;
}

function renderFlight(content) {
    return `
        <div class="section-box blue">
            <h2 class="text-2xl font-bold text-blue-700 mb-4"><i class="fas fa-plane mr-2"></i>항공편 정보</h2>
            <h3 class="text-lg font-semibold text-blue-600 mt-4 mb-2">출발편</h3>
            ${renderIf(content.departureAirport, v => `<div class="info-row"><span class="info-label">출발 공항</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.arrivalAirport, v => `<div class="info-row"><span class="info-label">도착 공항</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.departureTime, v => `<div class="info-row"><span class="info-label">출발 시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.arrivalTime, v => `<div class="info-row"><span class="info-label">도착 시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.departureFlight, v => `<div class="info-row"><span class="info-label">항공편명</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.departureFlightDuration, v => `<div class="info-row"><span class="info-label">비행시간</span><span class="info-value">${v}</span></div>`)}
            
            <h3 class="text-lg font-semibold text-blue-600 mt-4 mb-2">귀국편</h3>
            ${renderIf(content.returnDepartureAirport, v => `<div class="info-row"><span class="info-label">출발 공항</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.returnArrivalAirport, v => `<div class="info-row"><span class="info-label">도착 공항</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.returnDepartureTime, v => `<div class="info-row"><span class="info-label">출발 시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.returnArrivalTime, v => `<div class="info-row"><span class="info-label">도착 시간</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.returnFlight, v => `<div class="info-row"><span class="info-label">항공편명</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.returnFlightDuration, v => `<div class="info-row"><span class="info-label">비행시간</span><span class="info-value">${v}</span></div>`)}
            
            ${renderIf(content.flightImage, v => `<img src="${v}" class="preview-image" alt="항공편">`)}
        </div>
    `;
}

function renderTeeTimes(teeTimes) {
    let itemsHtml = teeTimes.map((tee, index) => {
        if (!tee.course) return '';
        return `
            <div class="mb-4 p-4 bg-white rounded-lg ${index > 0 ? 'mt-4' : ''}">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${tee.course}</h3>
                ${renderIf(tee.date, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
                ${renderIf(tee.time, v => `<div class="info-row"><span class="info-label">티업 시간</span><span class="info-value">${v}</span></div>`)}
                ${renderIf(tee.image, v => `<img src="${v}" class="preview-image" alt="${tee.course}">`)}
            </div>
        `;
    }).join('');

    return `<div class="section-box green">
                <h2 class="text-2xl font-bold text-green-700 mb-4"><i class="fas fa-golf-ball mr-2"></i>골프장 & TEE-UP</h2>
                ${itemsHtml}
            </div>`;
}

function renderGolfSchedules(schedules) {
    let itemsHtml = schedules.map((schedule, index) => {
        if (!schedule.includePreview || (!schedule.title && !schedule.detail)) return '';
        return `
            <div class="mb-4 p-4 bg-white rounded-lg ${index > 0 ? 'mt-4' : ''}">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${schedule.title || `Day ${index + 1}`}</h3>
                ${renderIf(schedule.date, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
                ${renderIf(schedule.detail, v => `<div class="mt-3 p-3 bg-gray-50 rounded ql-editor-content">${v}</div>`)}
                ${renderIf(schedule.meals, v => `<div class="mt-3 p-3 bg-yellow-50 rounded ql-editor-content"><strong>식사 및 포함사항:</strong><br>${v}</div>`)}
                ${renderIf(schedule.image, v => `<img src="${v}" class="preview-image" alt="${schedule.title}">`)}
            </div>
        `;
    }).join('');

    return `<div class="section-box sky">
                <h2 class="text-2xl font-bold text-sky-700 mb-4"><i class="fas fa-calendar-check mr-2"></i>일정 및 식사</h2>
                ${itemsHtml}
            </div>`;
}

function renderTravelSchedules(schedules) {
    let itemsHtml = schedules.map((schedule) => {
        if (!schedule.day && !schedule.title) return '';
        return `
            <div class="mb-4 p-4 bg-white rounded-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${schedule.day || schedule.title}</h3>
                ${renderIf(schedule.date, v => `<div class="info-row"><span class="info-label">날짜</span><span class="info-value">${formatDate(v)}</span></div>`)}
                ${renderIf(schedule.title, v => `<div class="info-row"><span class="info-label">일정</span><span class="info-value">${v}</span></div>`)}
                ${renderIf(schedule.detail, v => `<div class="mt-3 p-3 bg-gray-50 rounded">${v.replace(/\n/g, '<br>')}</div>`)}
                ${renderIf(schedule.hotel, v => `<div class="info-row"><span class="info-label">숙소</span><span class="info-value">${v}</span></div>`)}
                ${renderIf(schedule.meal, v => `<div class="info-row"><span class="info-label">식사</span><span class="info-value">${v}</span></div>`)}
                ${renderIf(schedule.image, v => `<img src="${v}" class="preview-image" alt="${schedule.title}">`)}
            </div>
        `;
    }).join('');

    return `<div class="section-box green">
                <h2 class="text-2xl font-bold text-green-700 mb-4"><i class="fas fa-calendar-alt mr-2"></i>간략 일정표</h2>
                ${itemsHtml}
            </div>`;
}

function renderAccommodation(content) {
    return `
        <div class="section-box orange">
            <h2 class="text-2xl font-bold text-orange-700 mb-4"><i class="fas fa-hotel mr-2"></i>숙소 정보</h2>
            ${renderIf(content.accommodation, v => `<div class="info-row"><span class="info-label">숙소명</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.accommodationAddress, v => `<div class="info-row"><span class="info-label">주소</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.accommodationImage, v => `<img src="${v}" class="preview-image" alt="숙소">`)}
        </div>
    `;
}

function renderNotes(notes) {
    return `
        <div class="section-box pink">
            <h2 class="text-2xl font-bold text-pink-700 mb-4"><i class="fas fa-info-circle mr-2"></i>추가 안내사항</h2>
            <div class="text-gray-700 ql-editor-content">${notes.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

function renderCompany(content) {
    const managerHtml = (content.managerName || content.managerPhone || content.managerEmail) ? `
        <div class="mt-4 p-3 bg-purple-50 rounded-lg">
            <h3 class="text-lg font-bold text-purple-700 mb-2"><i class="fas fa-user-tie mr-1"></i>담당자 정보</h3>
            ${renderIf(content.managerName, v => `<div class="info-row"><span class="info-label">담당자명</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.managerPhone, v => `<div class="info-row"><span class="info-label">담당자 전화번호</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.managerEmail, v => `<div class="info-row"><span class="info-label">담당자 이메일</span><span class="info-value">${v}</span></div>`)}
        </div>
    ` : '';

    return `
        <div class="section-box purple">
            <h2 class="text-2xl font-bold text-purple-700 mb-4"><i class="fas fa-building mr-2"></i>문의</h2>
            ${renderIf(content.companyName, v => `<div class="info-row"><span class="info-label">회사명</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.companyPhone, v => `<div class="info-row"><span class="info-label">대표 전화번호</span><span class="info-value">${v}</span></div>`)}
            ${renderIf(content.companyAddress, v => `<div class="info-row"><span class="info-label">회사 주소</span><span class="info-value">${v}</span></div>`)}
            ${managerHtml}
            ${renderIf(content.companyLogo, v => `<img src="${v}" class="preview-image" alt="회사 로고" style="max-height: 100px;">`)}
        </div>
    `;
}


// --- 하단 버튼 기능 ---

function goBack() {
    window.history.back();
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었습니다!');
    }).catch(err => {
        alert('링크 복사에 실패했습니다.');
    });
}

async function saveAsImage() {
    const buttons = document.querySelector('.share-buttons');
    buttons.style.display = 'none';
    
    try {
        const element = document.getElementById('previewContent');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        const title = document.getElementById('title').textContent || '여행안내문';
        link.download = `${title.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('이미지 저장 실패:', error);
        alert('이미지 저장에 실패했습니다.');
    } finally {
        buttons.style.display = 'flex';
    }
}
