package com.test.withdayback.admin.dao;

import com.test.withdayback.user.vo.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AdminDao {
    List<User> selectAllMember(String keyword, String gender, String provider, String status);
}
