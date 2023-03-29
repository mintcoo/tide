import React, {useState, useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector, wrapper} from 'store';
import {profileAsync} from 'store/api/features/profileSlice';
import {getCookie} from 'cookies-next';
import sendURL from 'public/chatting/send.png';
import imageURL from 'public/chatting/imageFile.png';
import cancelURL from 'public/chatting/cancel.png';
import Image from 'next/image';
import {v4 as uuidv4} from 'uuid';

// 파이어베이스
import {dbService, storageService} from '@/firebase';
import {
  query,
  orderBy,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  // uploadBytes,
  getDownloadURL
  // listAll,
} from '@firebase/storage';

// 컴포넌트
import Message from './Message';

const Chat = () => {
  const dispatch = useAppDispatch();
  // 내 이메일 정보
  const myEmail = getCookie('email');
  // 채팅 div
  const chatDiv = useRef<HTMLDivElement>(null);
  // 유저 프로필 데이터
  const {nickname} = useAppSelector(state => {
    return state.profile;
  });
  // 채팅메시지 데이터들
  const [messageDatas, setMessageDatas] = useState<any[]>([]);
  // 파일이미지 데이터
  const [fileUpload, setFileUpload] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);
  // 채팅 데이터들 가져오기
  const getContents = async () => {
    // 유저 정보 요청
    dispatch(profileAsync());

    // 우선 query로 데이터 가져오기 두번째 인자 where로 조건문도 가능
    const content = query(collection(dbService, 'test'), orderBy('createdAt'));

    // 실시간 변화 감지 최신버전
    onSnapshot(content, snapshot => {
      const contentSnapshot = snapshot.docs.map(con => ({
        ...con.data(),
        id: con.id
      }));
      setMessageDatas(prev => [...contentSnapshot]);
    });
  };

  // 메시지 데이터
  const [message, setMessage] = useState<string>('');
  const onChangeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setMessage(event.target.value);
  };

  // 메시지 제출
  const onSubmitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let downLoadUrl = '';
    // 이미지랑 메시지 빈값일떄 무시
    if (fileUpload === '' && message === '') {
      return;
    }
    // 파일 데이터 가져오기
    if (fileUpload !== '') {
      //파일 경로 참조 만들기
      const imageFileRef = ref(storageService, `test/${uuidv4()}`);
      //storage 참조 경로로 파일 업로드 하기
      await uploadString(imageFileRef, fileUpload, 'data_url');
      //storage 참조 경로에 있는 파일의 URL을 다운로드해서 downLoadUrl 변수에 넣어서 업데이트
      downLoadUrl = await getDownloadURL(imageFileRef);
    }
    // 메시지 데이터에 추가
    await addDoc(collection(dbService, 'test'), {
      email: myEmail,
      nickname: nickname,
      content: message,
      createdAt: serverTimestamp(),
      type: 'text',
      downLoadUrl
    });
    setMessage('');
    setFileUpload('');
    fileInput.current!.value = '';
  };
  // 파일 받기
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {files} = event.target;
    const theFile = files![0];
    const reader = new FileReader();

    reader.onloadend = finishedEvent => {
      const {result}: any = finishedEvent.currentTarget;
      setFileUpload(result);
    };
    reader.readAsDataURL(theFile);
  };
  // 파일 지우기
  const deleteImage = () => {
    setFileUpload('');
    fileInput.current!.value = '';
  };

  // 처음 실행하는 곳
  useEffect(() => {
    getContents();
  }, []);

  useEffect(() => {
    // 채팅 스크롤 젤 밑으로
    setTimeout(() => {
      chatDiv.current!.scrollTop = chatDiv.current!.scrollHeight;
    }, 50);
    // 이미지 올라올때를 위한 채팅 스크롤 젤 밑으로
    setTimeout(() => {
      chatDiv.current!.scrollTop = chatDiv.current!.scrollHeight;
    }, 300);
  }, [messageDatas]);

  return (
    <div className="flex justify-center h-full text-white ">
      <h1>Chatting</h1>
      <div className="flex flex-col items-center justify-center w-1/2 h-full bg-black rounded-lg bg-opacity-40">
        {/* 메시지들 보이는 곳 */}
        <div ref={chatDiv} className="w-5/6 h-full overflow-y-auto ">
          {messageDatas.map((msg, index) => {
            // 상대방의 닉네임 처음 한번만
            let checkSameNick = true;
            if (
              index !== 0 &&
              msg.email !== myEmail &&
              msg.email === messageDatas[index - 1].email
            ) {
              checkSameNick = false;
            }
            // 마지막 대화에만 시간뜨게
            let checkLastTime = false;
            if (
              index === messageDatas.length - 1 ||
              (index !== messageDatas.length - 1 &&
                msg.email !== messageDatas[index + 1].email)
            ) {
              checkLastTime = true;
            }

            // 30초동안 대화안했으면 시간뜨게
            let checkSameTime = true;
            if (
              index !== messageDatas.length - 1 &&
              messageDatas[index + 1].createdAt &&
              msg.createdAt.seconds >=
                messageDatas[index + 1].createdAt.seconds - 30
            ) {
              checkSameTime = false;
            }

            return (
              <Message
                key={msg.createdAt}
                data={msg}
                myEmail={myEmail}
                checkSameNick={checkSameNick}
                checkLastTime={checkLastTime}
                checkSameTime={checkSameTime}
              />
            );
          })}
        </div>
        {/* 메시지 보내는 곳 */}
        <form className="flex justify-center w-full my-6" onSubmit={onSubmitMessage}>
          <div className="border-[1px] rounded-lg w-5/6 flex justify-between items-center px-[0.7rem] py-[0.3rem] ">
            {/* 파일 업로드 */}
            <label htmlFor="file">
              {' '}
              <Image
                className={`min-w-9 min-h-8 w-9 h-8 opacity-60 hover:opacity-100 cursor-pointer`}
                src={imageURL}
                alt="imagefile"
              />
            </label>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              id="file"
              onChange={onFileChange}
              ref={fileInput}
            />
            {/* 파일 및 메시지 입력 */}
            {fileUpload && (
              <div className="relative w-20 h-20 border-[0.1rem]">
                <div
                  onClick={deleteImage}
                  className="absolute top-0 right-0 z-10 w-3 h-3 bg-black cursor-pointer hover:scale-105">
                  <Image src={cancelURL} alt="cancel" fill />
                </div>
                <Image src={fileUpload} alt="fileImage" fill />
              </div>
            )}
            <input
              className={`w-3/4 h-10 bg-transparent outline-none px-4`}
              type="text"
              placeholder="메시지 보내기..."
              value={message}
              onChange={onChangeMessage}
              maxLength={50}
            />
            {/* 메시지 전송 */}
            <label htmlFor="sendMsg">
              <Image
                className={`min-w-9 min-h-8 w-9 h-8 opacity-60 hover:opacity-100 cursor-pointer`}
                src={sendURL}
                alt="send"
              />
            </label>
            <input className="hidden" type="submit" id="sendMsg" />
          </div>
        </form>
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 0.6rem; /* 스크롤바의 너비 */
        }
        div::-webkit-scrollbar-thumb {
          // height: 70%;
          background: #2e608c; /* 스크롤바의 색상 */

          border-radius: 10px;
        }
        div::-webkit-scrollbar-track {
          background: #011526;
        }
      `}</style>
    </div>
  );
};

export default Chat;