package com.test.withdayback.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

// @Configuration: 스프링 부트가 켜질 때 "아, 이건 서버 전체 설정 파일이구나!" 하고 제일 먼저 읽게 하는 어노테이션.
@Configuration
// @EnableWebSecurity: "지금부터 스프링 시큐리티가 이 서버의 모든 API 출입 통제를 맡는다!"라고 선언.
@EnableWebSecurity
public class SecurityConfig {

    // @Bean: 스프링 부트의 공용 창고에 이 객체(메서드 결과물)를 미리 만들어두고,
    // 나중에 UserService 등에서 @Autowired로 달라고 할 때마다 알아서 꺼내주는 역할.
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // 비밀번호 단방향 암호화 도구
    }

    // ==========================================
    // 핵심 보안 성문 (FilterChain): 누가 들어올 수 있고 없는지 규칙을 정함
    // ==========================================
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정 적용 (아래에 만들어둔 corsConfigurationSource 규칙을 따름)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 방어 비활성화
                // (REST API 방식의 서버에서는 프론트가 JWT 토큰을 직접 관리하므로 CSRF 방어를 꺼두는 것이 일반적입니다.)
                .csrf(csrf -> csrf.disable())

                // 3. API URL 출입 명부(권한) 설정
                .authorizeHttpRequests(auth -> auth
                        // 프론트엔드 브라우저가 본 요청을 보내기 전에 찔러보는 사전 요청(OPTIONS, Preflight)은 모두 무사통과시킴. (CORS 에러 방지)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 로그인(토큰) 없이도 누구나 자유롭게 들어올 수 있는 주소들 (화이트리스트)
                        .requestMatchers(
                                "/users/signup",           // 회원가입
                                "/users/login",            // 일반 로그인
                                "/users/terms",            // 약관 조회
                                "/users/google-login",     // 구글 로그인 통신
                                "/users/social-signup",    // 소셜 가입
                                "/users/email-verification", // 이메일 인증
                                "/schedules/**",           // 일정 상세/조회 기능
                                "/participations/**",      // 참여 기능
                                "/region/**"               // 지역 검색 기능
                        ).permitAll()

                        // 위에 적힌 주소가 아닌 "나머지 모든 주소(.anyRequest())"는
                        // 무조건 인증(JWT 토큰 검사 통과)을 거쳐야만 들어올 수 있게 철통 방어!
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // ==========================================
    // CORS (교차 출처 리소스 공유) 설정
    // ==========================================
    // 포트가 다른 프론트엔드(localhost:5173)와 백엔드(localhost:8080)가 서로 데이터를 주고받을 수 있도록 브라우저에게 "허락장"을 써주는 곳.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. 데이터를 요청할 수 있는 프론트엔드 주소 (Vite 기본 포트 허용)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // 2. 프론트엔드가 사용할 수 있는 통신 방법 (조회, 등록, 전체수정, 부분수정, 삭제, 사전요청)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 3. 프론트엔드가 보낼 수 있는 헤더 종류 (토큰 등을 받기 위해 일단 모든 헤더(*)를 허용함)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 4. 프론트엔드에서 인증 정보(쿠키, Authorization 헤더 등)를 실어 보낼 수 있게 허락함
        configuration.setAllowCredentials(true);

        // 5. 위에서 정한 1~4번 규칙을 백엔드의 모든 주소("/**")에 일괄 적용함
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}