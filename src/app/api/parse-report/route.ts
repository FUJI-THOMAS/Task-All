import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import { AiParsedReport } from '@/lib/types';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        intent: {
          type: SchemaType.STRING,
          description: "推測されるユーザーの意図 ('update_task_status', 'add_memo', 'ask_question', 'create_issue', 'unknown')",
          nullable: false,
        },
        storeMentions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "抽出された店舗名やその別名・略称のリスト",
          nullable: false,
        },
        campaignMentions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "抽出された施策名・キャンペーン名のリスト",
          nullable: false,
        },
        status: {
          type: SchemaType.STRING,
          description: "更新後のステータス ('未着手', '対応中', '完了', '保留', '要確認')。完了を匂わせる場合は'完了'とする。",
          nullable: true,
        },
        memo: {
          type: SchemaType.STRING,
          description: "特記事項やメモとして残すべきテキスト",
          nullable: true,
        },
        nextAction: {
          type: SchemaType.STRING,
          description: "AIが推奨する次のアクション",
          nullable: true,
        },
        needsFollowUp: {
          type: SchemaType.BOOLEAN,
          description: "報告内容が不明確で対象店舗やタスクが絞れない場合true",
          nullable: false,
        },
        confidence: {
          type: SchemaType.NUMBER,
          description: "確信度 (0.0 から 1.0)",
          nullable: false,
        },
        ambiguityReason: {
          type: SchemaType.STRING,
          description: "needsFollowUp が true の場合の理由",
          nullable: true,
        }
      },
      required: ["intent", "storeMentions", "campaignMentions", "needsFollowUp", "confidence"],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const prompt = `あなたはSV(スーパーバイザー)の業務報告を解析するAIです。
以下の自然言語の報告テキストから、構造化された情報を抽出してください。
「XX店終わった」などのフランクな入力でも、可能な限り対象店舗とステータスを推測してください。

報告テキスト:
"${text}"
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText) as AiParsedReport;

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Gemini parsing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
