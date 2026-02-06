// DOM 요소들을 선택합니다.
const announcementTitleInput = document.getElementById('announcementTitle');
const announcementContentInput = document.getElementById('announcementContent');
const announcementAuthorInput = document.getElementById('announcementAuthor');
const registerButton = document.getElementById('registerButton');
const announcementsListContainer = document.querySelector('.announcements-list');
const totalCountElement = document.getElementById('totalCount');
const searchInput = document.getElementById('searchInput');

// 공지 상세 내용을 표시할 DOM 요소들
const announcementDetailContainer = document.querySelector('.announcement-detail');
const detailTitle = document.getElementById('detailTitle');
const detailAuthorDate = document.getElementById('detailAuthorDate');
const detailViews = document.getElementById('detailViews');
const detailContent = document.getElementById('detailContent');

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'militaryAnnouncements';

// 전역 변수
let announcements = []; // 모든 공지사항을 담는 원본 배열
let editingAnnouncementId = null; // 수정 모드 추적

/**
 * 로컬 스토리지에서 공지사항 데이터를 불러옵니다.
 * @returns {Array} 저장된 공지사항 배열
 */
function getAnnouncementsFromLocalStorage() {
    const storedAnnouncements = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
}

/**
 * 공지사항 배열을 로컬 스토리지에 저장합니다.
 * @param {Array} announcementsToSave - 저장할 공지사항 배열
 */
function saveAnnouncementsToLocalStorage(announcementsToSave) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(announcementsToSave));
}

/**
 * 주어진 공지사항 데이터로 HTML 요소를 생성합니다.
 * @param {Object} announcement - 생성할 공지사항 객체
 * @returns {HTMLElement} 생성된 공지사항 HTML 요소
 */
function createAnnouncementElement(announcement) {
    const announcementItem = document.createElement('div');
    announcementItem.classList.add('announcement-item');
    announcementItem.dataset.id = announcement.id;

    const formattedDate = new Date(announcement.date).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });

    announcementItem.innerHTML = `
        <h3>${announcement.title}</h3>
        <p>작성자: ${announcement.author} | 조회수: ${announcement.views || 0}</p>
        <p>등록일: ${formattedDate}</p>
        <div class="button-group">
            <button class="view-button">보기</button>
            <button class="edit-button">수정</button>
            <button class="delete-button">삭제</button>
        </div>
    `;

    // 각 버튼에 이벤트 리스너 추가
    announcementItem.querySelector('.view-button').addEventListener('click', () => viewAnnouncementDetails(announcement.id));
    announcementItem.querySelector('.edit-button').addEventListener('click', () => editAnnouncement(announcement.id));
    announcementItem.querySelector('.delete-button').addEventListener('click', () => deleteAnnouncement(announcement.id));

    return announcementItem;
}

/**
 * 화면에 공지사항 목록을 렌더링합니다.
 * @param {Array} [listToRender=announcements] - 렌더링할 공지사항 배열 (기본값은 전체 공지사항)
 */
function renderAnnouncements(listToRender = announcements) {
    announcementsListContainer.innerHTML = '';
    
    // 검색 결과가 없을 때 메시지 표시
    if (listToRender.length === 0 && announcements.length > 0) {
        announcementsListContainer.innerHTML = '<p>검색 결과가 없습니다.</p>';
    } else {
        listToRender.forEach(announcement => {
            const announcementElement = createAnnouncementElement(announcement);
            announcementsListContainer.appendChild(announcementElement);
        });
    }

    // 총 공지 수는 항상 전체 배열 길이를 기준으로 업데이트
    totalCountElement.textContent = `총 공지 수: ${announcements.length}건`;

    if (announcements.length === 0) {
        announcementDetailContainer.style.display = 'none';
    }
}

/**
 * '등록' 또는 '수정 완료' 버튼 클릭을 처리합니다.
 */
function handleRegisterOrUpdate() {
    const title = announcementTitleInput.value.trim();
    const content = announcementContentInput.value.trim();
    const author = announcementAuthorInput.value.trim();

    if (!title || !content || !author) {
        alert('모든 필드를 입력해주세요 (제목, 내용, 작성자).');
        return;
    }

    if (editingAnnouncementId) { // 수정 모드
        const announcementToUpdate = announcements.find(ann => ann.id === editingAnnouncementId);
        if (announcementToUpdate) {
            announcementToUpdate.title = title;
            announcementToUpdate.content = content;
            announcementToUpdate.date = new Date().toISOString(); // 수정일 업데이트
        }
    } else { // 등록 모드
        const newAnnouncement = {
            id: Date.now() + Math.random(),
            title,
            content,
            author,
            date: new Date().toISOString(),
            views: 0 // 조회수 초기화
        };
        announcements.unshift(newAnnouncement);
    }
    
    // 정렬: 최신 날짜순으로 정렬
    announcements.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveAnnouncementsToLocalStorage(announcements);
    resetForm();
    renderAnnouncements();
}

/**
 * 입력 폼을 초기화하고 수정 모드를 해제합니다.
 */
function resetForm() {
    announcementTitleInput.value = '';
    announcementContentInput.value = '';
    announcementAuthorInput.value = '';
    editingAnnouncementId = null;
    registerButton.textContent = '등록';
    announcementAuthorInput.disabled = false;
}

/**
 * 공지사항 수정을 위해 폼을 채웁니다.
 * @param {number} idToEdit - 수정할 공지사항 ID
 */
function editAnnouncement(idToEdit) {
    const announcement = announcements.find(ann => ann.id === idToEdit);
    if (announcement) {
        announcementTitleInput.value = announcement.title;
        announcementContentInput.value = announcement.content;
        announcementAuthorInput.value = announcement.author;
        
        registerButton.textContent = '수정 완료';
        editingAnnouncementId = idToEdit;
        announcementAuthorInput.disabled = true; // 작성자는 수정 불가

        announcementDetailContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * 공지사항을 삭제합니다.
 * @param {number} idToDelete - 삭제할 공지사항 ID
 */
function deleteAnnouncement(idToDelete) {
    if (!confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;

    announcements = announcements.filter(ann => ann.id !== idToDelete);
    saveAnnouncementsToLocalStorage(announcements);
    
    // 삭제 후 검색창이 비어있으면 전체 목록, 아니면 필터링된 목록을 다시 렌더링
    handleSearch();

    if (announcementDetailContainer.dataset.currentId == idToDelete) {
        announcementDetailContainer.style.display = 'none';
    }
    if (editingAnnouncementId === idToDelete) {
        resetForm();
    }
}

/**
 * 공지사항 상세 내용을 표시합니다.
 * @param {number} idToView - 상세 내용을 볼 공지사항 ID
 */
function viewAnnouncementDetails(idToView) {
    const announcement = announcements.find(ann => ann.id === idToView);
    if (announcement) {
        // 조회수 증가 및 저장
        announcement.views = (announcement.views || 0) + 1;
        saveAnnouncementsToLocalStorage(announcements);

        announcementDetailContainer.style.display = 'block';
        announcementDetailContainer.dataset.currentId = idToView;

        const formattedDate = new Date(announcement.date).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        detailTitle.textContent = announcement.title;
        detailAuthorDate.textContent = `작성자: ${announcement.author} | 등록일: ${formattedDate}`;
        detailViews.textContent = `조회수: ${announcement.views}`;
        detailContent.innerHTML = announcement.content.replace(/\n/g, '<br>');

        // 상세 보기 시 수정 모드 취소
        resetForm();
        
        // 현재 목록을 다시 렌더링하여 조회수 업데이트 반영
        handleSearch();
    }
}

/**
 * 검색 입력을 처리합니다.
 */
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredList = announcements.filter(ann => ann.title.toLowerCase().includes(searchTerm));
    renderAnnouncements(filteredList);
}


// ==========================================================
// 초기화 및 이벤트 리스너 설정
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    announcements = getAnnouncementsFromLocalStorage();
    announcements.sort((a, b) => new Date(b.date) - new Date(a.date)); // 항상 최신순으로 정렬
    renderAnnouncements();
});

registerButton.addEventListener('click', handleRegisterOrUpdate);
searchInput.addEventListener('input', handleSearch);