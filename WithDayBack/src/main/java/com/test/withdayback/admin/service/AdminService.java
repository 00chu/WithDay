package com.test.withdayback.admin.service;

import com.test.withdayback.admin.dao.AdminDao;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {
    @Autowired
    private AdminDao adminDao;

    public List<User> selectAllMember(String keyword, String gender, String provider, String status) {
        List<User> list = adminDao.selectAllMember(keyword, gender, provider, status);
        return list;
    }
}
