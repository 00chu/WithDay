package com.test.withdayback.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Alias("MypageEditRequestDTO")
public class MypageEditRequestDTO {

    private Long userId;

    private String email;
    private String nickname;
    private String profileImage;
    private String birthday;
    private Integer gender;
    private String phone;
    private String postcode;
    private String address;
    private String detailAddress;

    // 사용자가 선택한 관심사 id 목록
    private List<Long> interestIds;

    // 알림 활성화 여부
    private Boolean notificationEnabled;
}