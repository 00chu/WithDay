package com.test.withdayback.admin.service;

import com.test.withdayback.admin.dao.AdminDao;
import com.test.withdayback.admin.dto.AdminDashboardResponse;
import com.test.withdayback.admin.dto.AdminMemberRequest;
import com.test.withdayback.admin.dto.AdminMemberResponse;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminDao adminDao;

    public AdminMemberResponse selectAllMember(AdminMemberRequest dto) {

        List<User> memberList = adminDao.selectAllMember(dto);

        int totalCount = adminDao.selectMemberCount(dto);

        int totalPage = (int) Math.ceil(
                (double) totalCount / dto.getSize()
        );

        AdminMemberResponse response = new AdminMemberResponse();

        response.setMemberList(memberList);
        response.setTotalCount(totalCount);
        response.setTotalPage(totalPage);
        response.setPage(dto.getPage());
        response.setSize(dto.getSize());

        return response;
    }

    public AdminDashboardResponse getDashboardData() {
        AdminDashboardResponse response = new AdminDashboardResponse();

        Integer totalUserCount = adminDao.selectTotalUserCount();
        response.setTotalUserCount(
                totalUserCount == null ? 0 : totalUserCount);
        response.setNowTotalUserCount(adminDao.selectUserCount());

        Integer totalScheduleCount = adminDao.selectTotalScheduleCount();
        response.setTotalScheduleCount(
                totalScheduleCount == null ? 0 : totalScheduleCount);
        response.setNowTotalScheduleCount(adminDao.selectScheduleCount());

        response.setRecommendedScheduleCount(
                adminDao.selectRecommendedScheduleCount());

        response.setCompletedScheduleCount(
                adminDao.selectCompletedScheduleCount());

        response.setClosedScheduleCount(
                adminDao.selectClosedScheduleCount());

        return response;
    }
}