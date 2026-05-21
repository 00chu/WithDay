package com.test.withdayback.user.dao;

import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserTerms;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

// @Mapper: 스프링 부트와 MyBatis(SQL 도구)를 연결해주는 어노테이션, 스프링이 알아서 XML 파일(user-mapper.xml)에 가서 SQL 쿼리 실행하게 연결해줌.
@Mapper
public interface UserDao {

    // 유저 정보 저장
    void insertUser(User user);

    // 이메일로 유저찾기
    User findByEmail(String email);

    // 약관 동의 내역 저장
    void insertUserTerms(UserTerms userTerms);

    // 약관 리스트 전체 가져오기
    List<Terms> getAllTerms();
}