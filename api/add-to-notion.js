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
                  content: book.title
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
                  content: book.categoryName || ''
                }
              }
            ]
          },
          'Total': {
            number: book.subInfo?.itemPage || null
          }
        },
        cover: book.cover ? {
          external: {
            url: book.cover
          }
        } : undefined,
        children: book.description ? [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: book.description
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
