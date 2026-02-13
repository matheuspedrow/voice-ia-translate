# Voice-to-Voice AI Chat

Aplicação de chat por voz com IA. Grave um áudio, envie e receba respostas transcritas e faladas em tempo real.

## 🛠 Tecnologias

**Frontend**
| Tecnologia | Uso |
|------------|-----|
| Next.js (App Router) | Framework + API Routes |
| React | Interface de usuário |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização |
| Web Speech API | Sintese de voz (TTS) |
| MediaRecorder API | Gravação de áudio |

**Backend**
| Tecnologia | Uso |
|------------|-----|
| NestJS | Framework Node.js |
| TypeScript | Tipagem estática |
| Express | Servidor HTTP |
| Multer | Upload de arquivos |
| Gemini | Transcrição de áudio |
| OpenRouter | Modelos de linguagem (LLM) |
| Nodemon | Hot reload em desenvolvimento |

---

## 🚀 Como rodar localmente

**Frontend:**
```bash
cd voice-web-app
npm install
npm start
```
Acesse: **http://localhost:3000**

**Backend:**
```bash
cd voice-backend
npm install
npm run dev
```
API: **http://localhost:3001**

> **Requisitos:** Node.js >= 20.9.0

---

## 📁 Estrutura

```
voice-to-voice-ai/
├── voice-web-app/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/voice/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── constants.ts
│   │   │   │   ├── env.ts
│   │   │   │   ├── llm.ts
│   │   │   │   └── transcribe.ts
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.module.css
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── conversation-history/
│   │   │   ├── record-button/
│   │   │   └── voice-chat/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── next.config.ts
│   └── vercel.json
└── voice-backend/
    ├── src/
    │   ├── app/
    │   │   ├── Config/
    │   │   ├── Controllers/
    │   │   ├── Exceptions/
    │   │   ├── Modules/
    │   │   ├── Services/
    │   │   └── Utils/
    │   ├── app.module.ts
    │   └── main.ts
    ├── nest-cli.json
    └── nodemon.json
```
