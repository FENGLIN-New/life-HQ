import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 後端客戶端（使用 service_role_key 可以繞過 RLS 安全限制，安全地由後端寫入資料）
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
        const userMessage = event.message.text;
        const userId = event.source.userId;
        const replyToken = event.replyToken;

        console.log(`收到來自用戶 ${userId} 的訊息: ${userMessage}`);

        // 🚀【新增步驟】：將收到的靈感訊息存進 Supabase 雲端資料庫
        if (supabase) {
          const { error } = await supabase.from('ideas').insert([
            {
              text: userMessage,
              user_id: userId,
            },
          ]);

          if (error) {
            console.error('儲存至 Supabase 失敗:', error.message);
          } else {
            console.log('成功將靈感存入資料庫！');
          }
        } else {
          console.warn('Supabase 未設定，跳過儲存。');
        }

        // 寄回信給用戶的手機
        const lineAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        if (lineAccessToken) {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${lineAccessToken}`,
            },
            body: JSON.stringify({
              replyToken: replyToken,
              messages: [
                {
                  type: 'text',
                  text: `🛸 收到靈感！已將「${userMessage}」同步至你的 Life HQ 小宇宙。`,
                },
              ],
            }),
          });
        }
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