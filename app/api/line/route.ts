import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const events = body.events;

    for (const event of events) {
      // 確保只處理文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text; // 這就是你傳給機器人的文字 (例如: "優化排課系統")
        const userId = event.source.userId;     // 你的私人 LINE User ID

        // 🔒 安全機制：只允許你本人的 LINE 帳號留言進資料庫
        if (userId === process.env.MY_LINE_USER_ID) {
          
          // 這裡未來會接「雲端資料庫 (如 Supabase)」
          // 寫入邏輯：把 userMessage 新增為「工作」或「生活」的新項目
          console.log(`收到主人傳來的靈感：${userMessage}`);

          // 自動回傳給你的 LINE，讓你知道記錄成功了
          await replyToLine(event.replyToken, `🛸 收到靈感！已將「${userMessage}」同步至你的 Life HQ 小宇宙。`);
        } else {
          // 如果是外人誤加機器人亂傳訊息，直接不理會
          await replyToLine(event.replyToken, `抱歉，此帳號為私人靈感助手，您沒有權限使用。`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// 輔助函式：發送回覆訊息給 LINE 使用者
async function replyToLine(replyToken: string, text: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` // 填入你的 Token
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: 'text', text: text }]
    })
  });
}