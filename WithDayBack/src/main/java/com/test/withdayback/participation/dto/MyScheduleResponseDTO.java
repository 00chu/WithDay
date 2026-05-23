package com.test.withdayback.participation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("MyScheduleResponse")
public class MyScheduleResponseDTO {
    // 1. 식별자
    private Long scheduleId;      // 일정 PK
    private Long participationId; // 참여 정보 PK (취소/상태변경 시 필요)

    // 2. 일정 기본 정보 (카드 상단 및 본문)
    private String category;      // 카테고리 (travel, food 등)
    private String title;         // 일정 제목
    private String location;      // 장소 (시/도 + 시/군/구 결합 추천)
    private String thumbnail;     // 썸네일 이미지 URL

    // 3. 날짜 정보
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate recruitEndDate;
    // D-Day는 서버에서 계산해서 주거나, 프론트에서 날짜로 계산 (startDate 활용)

    // 4. 인원 정보 (카드 하단)
    private Integer currentPeople; // 현재 확정 인원
    private Integer maxPeople;     // 최대 정원

    // 5. ★ 상태 정보 (핵심!)
    private String dbStatus;       // PENDING, APPROVED, REJECTED, CANCELED, KICKED
    private String scheduleStatus; // recruiting, closed, cancelled, completed

    // 6. 호스트 여부 (이 일정이 내가 만든 건지 참여 신청한 건지 구분)
    // "hosting" 탭 조회를 위해 필요할 수 있음
    private Boolean host;
}
