package com.test.withdayback.user.dao;

import com.test.withdayback.user.dto.MypageEditRequestDTO;
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

    // 약관
    List<UserTerms> findUserTermById(Long id);
    //관심사
    List<UserInterest> getAllUserInterests(Long id);

    // 마이페이지 유저 기본 정보 수정
    int updateMypageUser(MypageEditRequestDTO dto);

    // 유저 관심사 전체 삭제
    int deleteUserInterests(Long userId);

    // 유저 관심사 추가
    int insertUserInterestById(@Param("userId") Long userId,
                               @Param("interestId") Long interestId);

    // 알림 동의 여부 수정
    int updateNotificationAgreed(@Param("userId") Long userId,
                                 @Param("agreed") Boolean agreed);
}
