import Pagination from "../../../shared/ui/Pagination/Pagination";
import styles from "./MemberList.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const MemberList = ({ memberList }) => {
  return (
    <div className={styles.member_list}>
      <label className={styles.member_count}>총 {memberList.length}명</label>
      <ul className={styles.member_item_title}>
        <li className={styles.member_profile}>회원</li>
        <li className={styles.member_email}>이메일</li>
        <li className={styles.member_route}>가입 경로</li>
        <li className={styles.member_gender}>성별</li>
        <li className={styles.member_birthday}>생년월일</li>
        <li className={styles.member_status}>상태</li>
        <li className={styles.member_create}>가입일</li>
      </ul>
      <ul className={styles.member_list_wrap}>
        {memberList.map((member) => {
          return (
            <MemberItem key={`member-list-${member.email}`} member={member} />
          );
        })}
        <div>
          <Pagination></Pagination>
        </div>
      </ul>
    </div>
  );
};

const MemberItem = ({ member }) => {
  return (
    <ul className={styles.member_item}>
      <li className={styles.member_profile}>
        <div className={styles.member_profile_item}>
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt="프로필 이미지"
              className={styles.profileImage}
            />
          ) : (
            <AccountCircleIcon
              sx={{
                fontSize: 40,
              }}
            ></AccountCircleIcon>
          )}

          {member.nickname}
        </div>
      </li>
      <li className={styles.member_email}>{member.email}</li>
      <li className={styles.member_route}>{member.provider}</li>
      <li className={styles.member_gender}>{member.gender ? "남" : "여"}</li>
      <li className={styles.member_birthday}>{member.birthday}</li>
      <li className={styles.member_status}>{member.status}</li>
      <li className={styles.member_create}>{member.createdAt.slice(0, 10)}</li>
    </ul>
  );
};

export default MemberList;
