import { NextRequest, NextResponse } from 'next/server';
import { transcribe } from '../../transcribe';
import { generateResponse } from '../../llm';
import {
  MAX_AUDIO_FILE_SIZE,
  ALLOWED_AUDIO_MIME_TYPES,
} from '../../constants';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const historyJson = formData.get('history') as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { message: 'Áudio não enviado. Envie o arquivo no campo "audio".' },
        { status: 400 },
      );
    }

    if (audioFile.size > MAX_AUDIO_FILE_SIZE) {
      return NextResponse.json(
        {
          message: `Arquivo muito grande. Máximo: ${MAX_AUDIO_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 },
      );
    }

    const baseMimeType = audioFile.type?.split(';')[0] ?? '';
    if (!(ALLOWED_AUDIO_MIME_TYPES as readonly string[]).includes(baseMimeType)) {
      return NextResponse.json(
        {
          message: `Formato não suportado. Use: ${ALLOWED_AUDIO_MIME_TYPES.join(', ')}`,
        },
        { status: 400 },
      );
    }

    let history: ConversationMessage[] = [];
    try {
      history = historyJson ? JSON.parse(historyJson) : [];
    } catch {
      history = [];
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const userTranscript = await transcribe(audioBuffer);

    if (!userTranscript) {
      return NextResponse.json({
        userTranscript: '',
        assistantResponse: '',
        error: 'Não foi possível transcrever o áudio. Tente gravar novamente.',
      });
    }

    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    messages.push({ role: 'user' as const, content: userTranscript });

    const assistantResponse = await generateResponse(messages);

    return NextResponse.json({
      userTranscript,
      assistantResponse,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao processar áudio';
    const isConfigError =
      message.includes('não configurada') ||
      message.includes('OPENROUTER') ||
      message.includes('OPENAI') ||
      message.includes('GEMINI') ||
      message.includes('API Gemini') ||
      message.includes('API OpenRouter');

    return NextResponse.json(
      { message },
      { status: isConfigError ? 503 : 400 },
    );
  }
}
