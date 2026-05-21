package com.test.withdayback.participation.enums;

import java.util.Locale;

public enum ParticipationStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected"),
    CANCELLED("canceled"),
    KICKED("kicked");

    private final String databaseValue;

    ParticipationStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public static ParticipationStatus fromValue(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("참여 상태가 필요합니다.");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);

        if ("CANCELED".equals(normalized)) {
            return CANCELLED;
        }

        return ParticipationStatus.valueOf(normalized);
    }

    public static String normalizeDatabaseStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        ParticipationStatus status = fromValue(value);

        return status.name();
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public boolean canTransitionTo(ParticipationStatus targetStatus) {
        return switch (this) {
            case PENDING -> targetStatus == APPROVED
                    || targetStatus == REJECTED
                    || targetStatus == CANCELLED;
            case APPROVED -> targetStatus == CANCELLED;
            default -> false;
        };
    }

    public boolean affectsParticipantCountOnApproval() {
        return this == APPROVED;
    }

    public boolean isApproval() {
        return this == APPROVED;
    }
}
