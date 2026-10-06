import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ensina o sistema a procurar o token no cabeçalho da requisição
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Usa a mesma chave secreta para validar se o token é autêntico
      secretOrKey: process.env.JWT_SECRET || 'super_chave_secreta_site_erika_2026',
    });
  }

  // Se o token for válido, esta função extrai os dados do utilizador
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}