package com.test.withdayback.user.dao;

import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserTerms;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserDao {
    void insertUser(User user);

    // 💡 소셜 추가 정보 및 향후 유저 정보 수정을 담당할 업데이트 메서드 추가!
    void updateUser(User user);

    void insertUserTerms(UserTerms userTerms);

    User findByEmail(String email);

    List<Terms> getAllTerms();
}