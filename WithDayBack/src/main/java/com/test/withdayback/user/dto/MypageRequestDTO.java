package com.test.withdayback.user.dto;

import com.test.withdayback.user.vo.Interest;
import com.test.withdayback.user.vo.User;
import com.test.withdayback.user.vo.UserInterest;
import com.test.withdayback.user.vo.UserTerms;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MypageRequestDTO {
    private User user;
    private List<UserTerms> userTerms;
    private List<Interest> interests;
}
