import Button from "../../../shared/ui/Button/Button";

export default function ApplyScheduleButton({ status }) {
  const isRecruiting = status === "recruiting";

  const handleApply = () => {
    const confirmJoin = window.confirm("이 일정에 참여 신청을 하시겠습니까?");
    if (confirmJoin) {
      alert("신청이 완료되었습니다! 주최자의 승인을 기다려주세요.");
      // 추후 여기에 실제 참여 API(axios.post 등)를 연결하면 됩니다.
    }
  };

  return (
    <Button
      variant={isRecruiting ? "accent" : "outline"}
      size="md"
      disabled={!isRecruiting}
      onClick={handleApply}
    >
      {isRecruiting ? "참여 신청하기" : "모집 종료"}
    </Button>
  );
}
