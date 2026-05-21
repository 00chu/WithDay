package com.test.withdayback.common.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // 256비트 이상의 비밀키 자동 생성 (실무에선 보안을 위해 별도 설정값 사용)
    private final SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 토큰 유효 시간 (1시간) - 일반 로그인용
    private final long SHORT_EXPIRATION_TIME = 60 * 60 * 1000L;

    // 토큰 유효 시간 (7일) - 자동 로그인용
    private final long LONG_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000L;

    // 토큰 생성 함수
    public String createToken(String email, String nickname, boolean autoLogin) {
        Date now = new Date();

        // autoLogin: 자동로그인 여부 (true면 7일 / false면 1시간)
        long expirationTime = autoLogin ? LONG_EXPIRATION_TIME : SHORT_EXPIRATION_TIME;
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(email) // 토큰의 주인 (이메일)
                .claim("nickname", nickname) // 추가 정보 (닉네임)
                .setIssuedAt(now) // 발급 시간
                .setExpiration(expiryDate) // 만료 시간
                .signWith(key) // 비밀키 세팅
                .compact();
    }
}