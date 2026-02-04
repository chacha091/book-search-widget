// api/add-to-notion.js
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Notion-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, databaseId, book } = req.body;

    if (!token || !databaseId || !book) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          'Title': {
            title: [
              {
                text: {
                  content: book.title || '제목 없음'
                }
              }
            ]
          },
          'Author': {
            rich_text: [
              {
                text: {
                  content: book.author || ''
                }
              }
            ]
          },
          'Genre': {
            rich_text: [
              {
                text: {
                  // 카테고리에서 마지막 항목만 추출 (예: "국내도서>소설>영미소설" -> "영미소설")
                  content: book.categoryName ? book.categoryName.split('>').pop().trim() : ''
                }
              }
            ]
          },
          'Total': {
            number: (book.subInfo && book.subInfo.itemPage) ? parseInt(book.subInfo.itemPage) : null
          }
        },
        // 커버 이미지 추가
        cover: (book.cover && book.cover.trim()) ? {
          type: 'external',
          external: {
            url: book.cover
          }
        } : undefined,
        // 이모지 제거한 description 추가
        children: book.description ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    // 이모지 및 특수문자 제거
                    content: book.description.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                  }
                }
              ]
            }
          }
        ] : undefined
      })
    });

    if (notionResponse.ok) {
      const data = await notionResponse.json();
      return res.status(200).json({ success: true, data });
    } else {
      const error = await notionResponse.json();
      return res.status(notionResponse.status).json({ error: error.message || 'Notion API error' });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
