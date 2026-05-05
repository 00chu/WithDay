package com.test.withdayback.user.dao;

import com.test.withdayback.user.vo.Terms;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserTerms;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserDao {
    void insertUser(User user);

    void insertUserTerms(UserTerms userTerms);

    User findByEmail(String email);

    List<Terms> getAllTerms();
}