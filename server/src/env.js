export function getEnv() {
  return {
    apiPort: Number(process.env.API_PORT ?? 3001),
    openai: {
      apiKey: process.env.OPENAI_API_KEY?.trim() || null,
      model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
    },
    sqlite: {
      filename: process.env.SQLITE_FILENAME ?? './dev.sqlite3',
    },
  };
}

