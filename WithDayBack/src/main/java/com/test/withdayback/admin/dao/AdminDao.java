package com.test.withdayback.admin.dao;

import com.test.withdayback.admin.dto.AdminDashboardResponse;
import com.test.withdayback.admin.dto.AdminMemberRequest;
import com.test.withdayback.admin.dto.AdminScheduleRequest;
import com.test.withdayback.admin.vo.AdminSchedule;
import com.test.withdayback.admin.vo.Dashboard;
import com.test.withdayback.user.vo.User;
import org.apache.ibatis.annotations.Mapper;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface AdminDao {

    List<User> selectAllMember(AdminMemberRequest dto);

    int selectMemberCount(AdminMemberRequest dto);

    int selectUserCount();

    int selectScheduleCount();

    void insertDashboard(LocalDate statDate, int userCount, int scheduleCount);

    int selectTotalUserCount();

    int selectTotalScheduleCount();

    int selectRecommendedScheduleCount();

    int selectCompletedScheduleCount();

    int selectClosedScheduleCount();

    List<Dashboard> selectDashboardList();

    List<Dashboard> selectDailyDashboard();

    List<Dashboard> selectWeeklyDashboard();

    List<Dashboard> selectMonthlyDashboard();

    List<AdminSchedule> selectAllSchedule(AdminScheduleRequest request);

    int selectAllScheduleCount(AdminScheduleRequest request);
}