import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 後端客戶端（使用 service_role_key 繞過 RLS）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = body.events || [];

    // 如果是 LINE Webhook 的驗證請求
    if (events.length === 0) {
      return NextResponse.json({ status: 'ok' });
    }

    for (const event of events) {
      // 確保收到的是文字訊息
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text.trim();
        const userId = event.source.userId;
        const replyToken = event.replyToken;

        console.log(`收到來自用戶 ${userId} 的訊息: ${userMessage}`);

        // 🔒 安全機制：只允許你本人的 LINE 帳號留言進資料庫
        // 如果你沒有設定 MY_LINE_USER_ID，這行會先跳過驗證以確保能通，若要開啟請取消註解以下這段
        /*
        if (userId !== process.env.MY_LINE_USER_ID) {
          await replyToLine(replyToken, `抱歉，此帳號為私人靈感助手，您沒有權限使用。`);
          continue;
        }
        */

        // 🧠 【神奇功能】：解析分類關鍵字
        // 指令範例：「工作#今天要開會」或「學習#背5個單字」
        let category = 'general'; // 預設分類為一般
        let finalContent = userMessage;

        if (userMessage.includes('#')) {
          const parts = userMessage.split('#');
          const prefix = parts[0].trim(); // "工作" 或 "學習"
          finalContent = parts[1].trim(); // "今天要開會"

          if (prefix === '工作') category = 'work';
          if (prefix === '學習') category = 'study';
          // 如果你有第三個領域（例如：生活），可以在這裡加一行：
          // if (prefix === '生活') category = 'life';
        }

        // 🚀 將訊息與分類存進 Supabase 雲端資料庫
        if (supabase) {
          const { error } = await supabase.from('ideas').insert([
            {
              text: finalContent,
              user_id: userId,
              category: category, // 👈 新增寫入分類欄位
            },
          ]);

          if (error) {
            console.error('儲存至 Supabase 失敗:', error.message);
          } else {
            console.log(`成功將靈感存入資料庫！分類為: ${category}`);
          }
        } else {
          console.warn('Supabase 未設定，跳過儲存。');
        }

        // 寄回信給用戶的手機告知儲存成功
        const categoryNotice = category !== 'general' ? ` [分類: ${category}]` : '';
        await replyToLine(
          replyToken, 
          `🛸 收到靈感！已將「${finalContent}」${categoryNotice}同步至你的 Life HQ 小宇宙。`
        );
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('LINE API 路由錯誤:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// 輔助函式：發送回覆訊息給 LINE 使用者
async function replyToLine(replyToken: string, text: string) {
  const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!lineAccessToken) {
    console.error('缺少 LINE_CHANNEL_ACCESS_TOKEN');
    return;
  }

  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lineAccessToken}`,
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: 'text', text: text }],
    }),
  });
}
