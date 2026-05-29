package com.test.withdayback.user.dao;

import com.test.withdayback.user.vo.Interest;
import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserInterest;
import com.test.withdayback.user.vo.UserTerms;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

// @Mapper: 스프링 부트와 MyBatis(SQL 도구)를 연결해주는 어노테이션, 스프링이 알아서 XML 파일(user-mapper.xml)에 가서 SQL 쿼리 실행하게 연결해줌.
@Mapper
public interface UserDao {

    // 유저 정보 저장
    void insertUser(User user);

    // 이메일로 유저찾기
    User findByEmail(String email);

    // 이메일로 유저 ID 찾기
    Long findUserIdByEmail(String email);

    // 약관 동의 내역 저장
    void insertUserTerms(UserTerms userTerms);

    // 약관 리스트 전체 가져오기
    List<Terms> getAllTerms();

    // 아이디로 유저찾기
    User findById(Long userId);
    
    // 관심사 리스트 전체 가져오기
    List<Interest> getAllInterests();

    // 유저의 관심사 선택 내역 저장
    void insertUserInterest(UserInterest userInterest);

    // 유저가 선택한 관심사 id 목록 가져오기
    List<Long> getUserInterestIds(Long userId);

    // 유저의 알림 동의 여부 가져오기
    Boolean getNotificationAgreed(Long userId);

    // 마이페이지 유저 기본 정보 수정
    void updateMypageUser(User user);

    // 유저의 기존 관심사 전체 삭제
    void deleteUserInterests(Long userId);

    // 특정 유저가 특정 약관에 대한 동의 내역을 가지고 있는지 확인
    int countUserTerms(
            @Param("userId") Long userId,
            @Param("termsId") Long termsId
    );

    // 유저의 특정 약관 동의 여부 수정
    void updateUserTermsAgreed(UserTerms userTerms);
}
