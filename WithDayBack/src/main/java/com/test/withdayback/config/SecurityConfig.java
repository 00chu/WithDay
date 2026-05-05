package com.test.withdayback.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 💡 1. BCrypt 암호화 기계를 스프링 빈으로 등록 (이제 어디서든 꺼내 쓸 수 있음!)
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 💡 2. 시큐리티 기본 설정 무력화
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // REST API 환경이므로 CSRF 보호 비활성화
                .formLogin(form -> form.disable()) // 스프링 기본 로그인 창 안 띄움!
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 일단 지금은 모든 API 요청 통과 (나중에 토큰할 때 막을 예정)
                );

        return http.build();
    }
}