package com.test.withdayback.user.dto;

import com.test.withdayback.user.vo.Interest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MypageResponseDTO {
    private Long userId;

    private String email;
    private String nickname;
    private String profileImage;
    private String intro;
    private String createdAt;
    private String status;
    private Integer participatedTravelCount;

    private List<Interest> interests;
}
