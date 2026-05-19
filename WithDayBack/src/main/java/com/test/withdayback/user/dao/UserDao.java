package com.test.withdayback.user.dao;

import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserTerms;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

// @Mapper: 스프링 부트와 MyBatis(SQL 도구)를 연결해주는 핵심 어노테이션.
// 이 명찰이 있으면, 스프링이 알아서 "이름이 똑같은 XML 파일(user-mapper.xml)에 가서 SQL 쿼리를 실행해야지!" 하고 연결해 줍니다.
@Mapper
public interface UserDao {
    // 1. 유저 정보 저장 (일반 가입, 소셜 가입 공통)
    void insertUser(User user);

    // 2. 유저 정보 수정 (동적 쿼리용)
    // 💡 소셜 추가 정보 입력뿐만 아니라, 향후 마이페이지 내 정보 수정 등에서도 재사용할 수 있는 아주 좋은 확장성 높은 메서드입니다!
    void updateUser(User user);

    // 3. 약관 동의 내역 저장
    void insertUserTerms(UserTerms userTerms);

    // 4. 이메일로 유저 찾기 (로그인, 중복 가입 검사 시 사용)
    User findByEmail(String email);

    // 5. DB에 있는 약관 리스트 전체 가져오기
    List<Terms> getAllTerms();
}