let selectedBook = null;
let searchHistory = [];

// 초기화
window.addEventListener('load', () => {
    const apiUrl = localStorage.getItem('apiUrl');
    const aladinKey = localStorage.getItem('aladinKey');
    const notionToken = localStorage.getItem('notionToken');
    const notionDatabase = localStorage.getItem('notionDatabase');

    if (apiUrl) document.getElementById('apiUrl').value = apiUrl;
    if (aladinKey) document.getElementById('aladinKey').value = aladinKey;
    if (notionToken) document.getElementById('notionToken').value = notionToken;
    if (notionDatabase) document.getElementById('notionDatabase').value = notionDatabase;

    // 검색 이력 불러오기
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
        searchHistory = JSON.parse(savedHistory);
        displaySearchHistory();
    }

    // 설정이 없으면 모달 자동 열기
    if (!aladinKey || !notionToken || !notionDatabase) {
        openSettings();
    }
});

function displaySearchHistory() {
    const historyDiv = document.getElementById('searchHistory');
    
    if (searchHistory.length === 0) {
        historyDiv.innerHTML = '';
        return;
    }

    historyDiv.innerHTML = `
        <div class="search-history-title">최근 검색</div>
        <div class="history-items">
            ${searchHistory.map((query, index) => `
                <div class="history-item" onclick="searchFromHistory('${query.replace(/'/g, "\\'")}')">
                    <span class="history-item-text">${query}</span>
                    <span class="history-item-delete" onclick="event.stopPropagation(); deleteHistoryItem(${index})">×</span>
                </div>
            `).join('')}
        </div>
    `;
}

function addToSearchHistory(query) {
    // 중복 제거
    searchHistory = searchHistory.filter(item => item !== query);
    // 맨 앞에 추가
    searchHistory.unshift(query);
    // 최대 10개만 유지
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    // 저장
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

function deleteHistoryItem(index) {
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

function searchFromHistory(query) {
    document.getElementById('searchQuery').value = query;
    searchBooks();
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
    localStorage.setItem('apiUrl', document.getElementById('apiUrl').value.trim());
    localStorage.setItem('aladinKey', document.getElementById('aladinKey').value.trim());
    localStorage.setItem('notionToken', document.getElementById('notionToken').value.trim());
    localStorage.setItem('notionDatabase', document.getElementById('notionDatabase').value.trim());
    
    showMessage('설정이 저장되었습니다', 'success');
    closeSettings();
}

function showMessage(text, type = 'loading') {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

async function searchBooks() {
    const apiUrl = localStorage.getItem('apiUrl');
    const aladinKey = localStorage.getItem('aladinKey');
    const query = document.getElementById('searchQuery').value.trim();
    const resultsDiv = document.getElementById('results');

    if (!aladinKey) {
        showMessage('설정에서 알라딘 API 키를 입력해주세요', 'error');
        openSettings();
        return;
    }

    if (!query) {
        showMessage('검색어를 입력해주세요', 'error');
        return;
    }

    showMessage('검색 중...');
    resultsDiv.innerHTML = '';
    selectedBook = null;
    document.getElementById('addButton').classList.remove('show');
    
    // 검색 이력 숨기기
    document.getElementById('searchHistory').style.display = 'none';

    try {
        let data;
        const baseUrl = apiUrl ? apiUrl.replace('/api/search', '') : window.location.origin;
        const searchApiUrl = `${baseUrl}/api/search`;

        const response = await fetch(`${searchApiUrl}?ttbkey=${aladinKey}&query=${encodeURIComponent(query)}`);
        
        if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
        data = await response.json();

        if (!data.item || data.item.length === 0) {
            showMessage('검색 결과가 없습니다', 'error');
            resultsDiv.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">검색 결과가 없습니다</div></div>';
            return;
        }

        showMessage(`${data.item.length}개의 책을 찾았습니다`, 'success');
        
        // 검색 이력에 추가
        addToSearchHistory(query);
        
        resultsDiv.innerHTML = `
            <div class="book-grid">
                ${data.item.map((book, index) => `
                    <div class="book-item" onclick="selectBook(${index})">
                        <div class="book-cover-wrapper">
                            <img src="${book.cover}" alt="${book.title}" class="book-cover" 
                                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2216%22%3E이미지 없음%3C/text%3E%3C/svg%3E'">
                        </div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">${book.author}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // 검색 결과 저장
        window.searchResults = data.item;

    } catch (error) {
        console.error('Error:', error);
        showMessage('검색 중 오류가 발생했습니다. 설정을 확인해주세요', 'error');
    }
}

function selectBook(index) {
    selectedBook = window.searchResults[index];
    
    // 모든 선택 해제
    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 선택한 책 표시
    document.querySelectorAll('.book-item')[index].classList.add('selected');
    
    // 추가 버튼 표시
    document.getElementById('addButton').classList.add('show');
}

async function addSelectedToNotion() {
    if (!selectedBook) {
        showMessage('책을 선택해주세요', 'error');
        return;
    }

    const apiUrl = localStorage.getItem('apiUrl');
    const notionToken = localStorage.getItem('notionToken');
    const notionDatabase = localStorage.getItem('notionDatabase');

    if (!notionToken || !notionDatabase) {
        showMessage('설정에서 노션 정보를 입력해주세요', 'error');
        openSettings();
        return;
    }

    showMessage('노션에 추가 중...');
    document.getElementById('addButton').classList.remove('show');

    try {
        const baseUrl = apiUrl ? apiUrl.replace('/api/search', '') : window.location.origin;
        const notionApiUrl = `${baseUrl}/api/add-to-notion`;

        const response = await fetch(notionApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: notionToken,
                databaseId: notionDatabase,
                book: selectedBook
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage('✓ 노션에 추가되었습니다!', 'success');
            
            // 검색 결과 초기화
            selectedBook = null;
            window.searchResults = [];
            document.getElementById('results').innerHTML = '';
            document.getElementById('searchQuery').value = '';
            
            // 검색 이력 다시 표시
            document.getElementById('searchHistory').style.display = 'block';
            
            // 선택 해제
            document.querySelectorAll('.book-item').forEach(item => {
                item.classList.remove('selected');
            });
        } else {
            showMessage(`추가 실패: ${result.error || '설정을 확인해주세요'}`, 'error');
            document.getElementById('addButton').classList.add('show');
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('노션 추가 중 오류가 발생했습니다', 'error');
        document.getElementById('addButton').classList.add('show');
    }
}

// 모달 외부 클릭시 닫기
document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target.id === 'settingsModal') {
        closeSettings();
    }
});
