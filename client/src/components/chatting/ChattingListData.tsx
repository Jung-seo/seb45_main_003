import React, { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue, RecoilState } from "recoil";
import { loginState } from "../../atoms/atoms"; // 필요한 Recoil 상태를 가져옵니다.
import { chatListState } from "./chatState";
import styled from "styled-components";
import { currentChatRoomIdState } from "./chatState";
import FormatTimeOrDate from "./FormatTimeOrDate";
import { COLOR } from "../../constants/color";

import { useQuery } from "react-query";

interface ChatList {
  chatRoomId: number;
  memberId: number;
  productId: number;
  deletedAt: string | null;
  chatRoom: {
    memberId: number;
    deletedAt: string | null;
  };
  message: {
    messageId: number;
    content: string;
    createdAt: string | null;
  } | null;
}

interface MyError {
  message: string;
  // 다른 필드들...
}

const Container = styled.button`
  background: ${COLOR.gray_100};
  display: flex;
  padding: 0.75rem 0.5rem;
  align-items: center;
  gap: 1rem;
  align-self: stretch;
  padding: 0.625rem 0.9375rem;
  min-height: 3rem;
  border-radius: 0.375rem;
  width: 100%;
  font-size: 1rem;
  border: none;
  border-radius: 0.375rem;
  justify-content: start;
  margin-bottom: 1.25rem;

  /* hover 상태일 때의 스타일 */
  &:hover {
    background: #ffcd57;
  }

  .chatRoom {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    /* background-color: #3871a3; */
    align-items: start; // chatRoom 내부의 모든 아이템을 수직으로 중앙 정렬
  }
  .idDate {
    display: flex;
    flex-direction: row;
    gap: 1.25rem;
  }
  .memberId {
    color: var(--cool-gray-90, #21272a);
    font-family: Pretendard Variable;
    font-size: 1rem;
    font-style: normal;
    font-weight: bold;
    line-height: 100%; /* 16px */
  }
  .message {
    color: #616161;
    font-family: Pretendard Variable;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1.5rem; /* 150% */
    letter-spacing: 0.0063rem;
  }
  .createdAt {
    justify-content: end;
    font-size: 0.3125rem;
    font-weight: 400;
    text-align: center;
    align-self: center;
    color: #616161;
  }
`;

const ChattingListData: React.FC = () => {
  const [chatList, setChatList] = useRecoilState(chatListState as RecoilState<ChatList[]>);
  const [currentChatRoomId, setCurrentChatRoomId] = useRecoilState(currentChatRoomIdState);
  console.log(currentChatRoomId);
  const isLoggedIn = useRecoilValue(loginState);

  const fetchChatList = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  const { error, isLoading } = useQuery("chatList", fetchChatList, {
    refetchInterval: 5000,
    enabled: isLoggedIn,
    onError: (err) => {
      console.log("An error occurred:", err);
    },
    onSuccess: (data) => {
      setChatList(data);
    },
  });

  const handleRoomClick = (chatRoomId: number) => {
    setCurrentChatRoomId(chatRoomId);
  };

  useEffect(() => {
    if (isLoggedIn) {
      // 로그인 상태가 true일 때만 API 호출을 합니다.
      const fetchData = async () => {
        // 로컬 스토리지에서 토큰을 가져옵니다.
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          console.log("No access token found");
          return;
        }

        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat`, {
            headers: {
              Authorization: `Bearer ${accessToken}`, // 헤더에 토큰을 추가합니다.
              // 로컬일때만 사용 배포링크 사용시 제거
              // "ngrok-skip-browser-warning": "69420",
            },
          });
          // console.log(response.data);
          setChatList(response.data);
        } catch (error) {
          console.log("Failed to fetch chat list:", error);
        }
      };
      fetchData();
    }
  }, [isLoggedIn]); // 로그인 상태가 변경될 때마다 useEffect를 실행합니다.

  // 로딩 중인 경우
  if (isLoading) return <div>Loading...</div>;

  // 에러가 발생한 경우
  if (error) return <div>Error: {(error as MyError).message}</div>;

  // 로딩도 완료되고 에러도 없는 경우

  return (
    <>
      <ul>
        {chatList.map((chat, index) => (
          <Container key={chat.chatRoomId} onClick={() => handleRoomClick(chat.chatRoomId)}>
            <li key={index}>
              <div className="chatRoom">
                {/* <div>{chat.chatRoomId}</div> */}
                <div className="idDate">
                  <div className="memberId">테스트 아이디{chat.memberId}</div>
                  <div className="createdAt">
                    {FormatTimeOrDate(chat.message ? chat.message.createdAt : null)}{" "}
                  </div>
                </div>

                <div className="message">{chat.message ? chat.message.content : " "}</div>
              </div>
            </li>
          </Container>
        ))}
      </ul>
    </>
  );
};

export default ChattingListData;
