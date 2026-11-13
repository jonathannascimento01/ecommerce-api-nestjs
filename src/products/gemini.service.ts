import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return `O Perfume Masculino ${productName} (${category}) exala sofisticação e presença marcante para o público exigente.`;
    }

    try {
      const prompt = `Crie uma descrição comercial, envolvente, sofisticada e persuasiva para um produto de e-commerce de beleza/cosméticos chamado "${productName}", que pertence à categoria "${category}". A descrição deve destacar a sofisticação, os benefícios e apelar ao público exigente. Mantenha o texto com cerca de 2 a 3 parágrafos curtos.`;

      // Chamada HTTP direta à API REST do Gemini (v1beta)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text.trim();
      }

      return `O Perfume Masculino ${productName} (${category}) exala sofisticação e presença marcante para o público exigente.`;
    } catch (error: any) {
      console.error('Erro detalhado na API REST do Gemini:', error.response?.data || error.message);
      
      // Retorna uma descrição comercial elegante em vez de falhar
      return `O Perfume Masculino ${productName} (${category}) exala sofisticação e presença marcante. Desenvolvido para o público exigente, une notas nobres e acordes inconfundíveis que garantem elegância e exclusividade em todos os momentos.`;
    }
  }
}