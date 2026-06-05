package com.test.withdayback.admin.service;

import com.test.withdayback.admin.dao.AdminDao;
import com.test.withdayback.admin.dto.*;
import com.test.withdayback.admin.vo.AdminSchedule;
import com.test.withdayback.admin.vo.Dashboard;
import com.test.withdayback.user.vo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public AdminDashboardResponse getDashboardData(String period) {
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

        List<Dashboard> dashboardList;

        switch (period) {
            case "weekly":
                dashboardList = adminDao.selectWeeklyDashboard();
                break;

            case "monthly":
                dashboardList = adminDao.selectMonthlyDashboard();
                break;

            default:
                dashboardList = adminDao.selectDailyDashboard();
                break;
        }

        response.setDashboardList(dashboardList);

        return response;
    }

    public Map<String, Object> selectAllSchedule(String keyword, String region, String detailRegion, String status, int page, int size) {
        AdminScheduleRequest request = new AdminScheduleRequest();

        request.setKeyword(keyword);
        request.setRegion(region);
        request.setDetailRegion(detailRegion);
        request.setStatus(status);
        request.setPage(page);
        request.setSize(size);

        // 목록 조회
        List<AdminSchedule> scheduleList =
                adminDao.selectAllSchedule(request);

        // 전체 개수 조회
        int totalCount =
                adminDao.selectAllScheduleCount(request);

        int totalPage =
                (int) Math.ceil((double) totalCount / size);

        AdminScheduleResponse response =
                new AdminScheduleResponse();

        response.setScheduleList(scheduleList);
        response.setTotalCount(totalCount);
        response.setTotalPage(totalPage);
        response.setPage(page);
        response.setSize(size);

        Map<String, Object> result = new HashMap<>();

        result.put("scheduleList", response.getScheduleList());
        result.put("totalCount", response.getTotalCount());
        result.put("totalPage", response.getTotalPage());
        result.put("page", response.getPage());
        result.put("size", response.getSize());

        return result;
    }

    @Transactional
    public int updateSchedulePublic(Long scheduleId) {
        return adminDao.updateSchedulePublic(scheduleId);
    }

    @Transactional
    public int deleteSchedule(Long scheduleId) {
        return adminDao.deleteSchedule(scheduleId);
    }
}