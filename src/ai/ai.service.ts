import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor() {
    // Inicializa o SDK passando explicitamente a chave de ambiente
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Crie uma descrição comercial, vendedora, atrativa e otimizada para SEO para um produto de e-commerce chamado "${productName}" na categoria "${category}". Inclua benefícios e uma chamada para ação.`,
      });

      return response.text || 'Descrição não gerada.';
   } catch (error: any) {
      console.error('Erro ao gerar descrição com Gemini:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Falha ao comunicar com o Google AI Studio: ${errorMessage}`);
    }
  }
}