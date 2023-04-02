import Link from 'next/link';
import Seo from '@/components/Seo';
import React, {useState, useEffect, useRef} from 'react';
import styles from '@/styles/Diary.module.scss';
import { diaryMineAsync } from 'store/api/features/diaryMineSlice';
import { diaryListMineAsync } from 'store/api/features/diaryListMineSlice';
import {useAppDispatch, useAppSelector} from 'store'; 
import DiaryListModal from '@/components/Modal/DiaryListModal'
import { query } from 'express';

export default function Diary() {

  const [DiaryListType, setDiaryListType] = useState<Number>(0);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(diaryMineAsync());
    dispatch(diaryListMineAsync());
  }, []);
  const {diarys} = useAppSelector(state => {
    return state.diaryMine;
  });


  const {diarylists} = useAppSelector(state => {
    return state.diaryListMine;
  });

  // 윈도우 사이즈 CSR로 체크
  interface WindowSize {
    width: number | undefined;
    height: number | undefined;
  }

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0
  });

  const [prevWidth, setPrevWidth] = useState<number | undefined>(undefined);

  // 일기장 div 선택자. transfrom: tranlateY(-400~) 으로 캐러셀 수동 이동
  const caroselDivRef = useRef<HTMLDivElement>(null);
  // 일기장 캐러셀 현재 넘버
  const caroselPage = useRef<number>(1);
  // 일기장 전체 길이
  const [diaryMax, setDiaryMax] = useState<number | undefined>(diarys.length);
  let [diaryCur, setDiaryCur] = useState<number | undefined>(1);

  function handleResize() {
    setPrevWidth(windowSize.width);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    if (windowSize.width && windowSize.width <= 1600) {
      setDiaryMax(diarys.length);
      caroselPage.current = diaryCur ? diaryCur : 1;
      setDiaryCur(caroselPage.current);
    } else {
      setDiaryMax(Math.ceil(diarys.length / 2));
      caroselPage.current = diaryCur ? Math.ceil(diaryCur / 2) : 1;
      setDiaryCur(2 * (caroselPage.current - 1) + 1);
    }

    if (caroselDivRef.current) {
      if (windowSize.width && windowSize.width <= 860) {
        caroselDivRef.current.style.transform = `translateY(-${
          500 * (caroselPage.current - 1)
        }px)`;
      } else {
        caroselDivRef.current.style.transform = `translateY(-${
          436 * (caroselPage.current - 1)
        }px)`;
      }
    }
  }

  useEffect(() => {
    handleResize();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowSize.width, diaryMax, diaryCur]);

  // 캐러셀 이전버튼
  const handleCaroselPrev = () => {
    if (caroselPage.current > 1) {
      caroselPage.current -= 1;
      if (windowSize.width && windowSize.width <= 1600) {
        if (diaryCur) setDiaryCur(diaryCur - 1);
      } else {
        if (diaryCur) setDiaryCur(diaryCur - 2);
      }

      if (caroselDivRef.current) {
        if (windowSize.width && windowSize.width <= 860) {
          caroselDivRef.current.style.transform = `translateY(-${
            500 * (caroselPage.current - 1)
          }px)`;
        } else {
          caroselDivRef.current.style.transform = `translateY(-${
            436 * (caroselPage.current - 1)
          }px)`;
        }
      }
      // console.log(caroselPage.current);
    }
  };

  // 캐러셀 다음버튼
  const handleCaroselNext = () => {
    if (diaryMax && caroselPage.current < diaryMax) {
      caroselPage.current += 1;
      if (windowSize.width && windowSize.width <= 1600) {
        if (diaryCur) setDiaryCur(diaryCur + 1);
        setDiaryMax(diarys.length);
      } else {
        if (diaryCur) setDiaryCur(diaryCur + 2);
        setDiaryMax(Math.ceil(diarys.length / 2));
      }
      if (caroselDivRef.current) {
        if (windowSize.width && windowSize.width <= 860) {
          caroselDivRef.current.style.transform = `translateY(-${
            500 * (caroselPage.current - 1)
          }px)`;
        } else {
          caroselDivRef.current.style.transform = `translateY(-${
            436 * (caroselPage.current - 1)
          }px)`;
        }
      }
    }
    // console.log(caroselPage.current);
  };

  const getModalType = (type:Number) => {
    setDiaryListType(type)
  }


  return (
    <>
      <Seo title="Diary" />

      <div className={styles.diaryNav}>
        <Link href="/diary/create">
          <button>
            {' '}
            <p className="text-2xl ml-0.5">📝</p>{' '}
          </button>
        </Link>
      </div>


      <div className={`${DiaryListType===0?'w-0 h-0':'bg-slate-900 w-[100%] opacity-90 h-[100%] fixed z-[3]'}`} onClick={()=>{setDiaryListType(0)}} >
      </div>
      <DiaryListModal type={DiaryListType} getModalType={getModalType} diaryListId={undefined}/>

      <main className={`
      p-[4rem] pt-[2rem] lg12:pr-[calc(200px)] lg12:pl-[calc(15%+100px)] pb-[240px] text-white flex flex-col min-h-[100vh] pt-[calc(2rem+40px)] bg-gradient-to-t from-blue-900 to-slate-900 `}>

        <div className={styles.description}>
          <h1 className="text-5xl font-bold"> Diary</h1>
        </div>

        <div className={styles.diarySectionTitle}>
          <h2 className="text-2xl font-bold text-sky-400 "> 일기장 </h2>
          <input type="month"></input>
        </div>

        <div className={styles.btDiv}>
          <button className={styles.btleft} onClick={handleCaroselPrev}>
            {' '}
            ◀{' '}
          </button>
          <button className={styles.btright} onClick={handleCaroselNext}>
            {' '}
            ▶{' '}
          </button>
        </div>
        <div className={styles.diarySection}>
          <div className={styles.caroselWrapper} ref={caroselDivRef}>
            {diarys && diarys.length >0 ? diarys.map((diary, id) => (
              <Link href={`/diary/${id}`}>
              <div className={styles.caroselItem} key={id}>
                <div className={styles.caroselDiary}>
                  <h3 className="text-2xl font-bold">
                    {id} : {diary.title}
                  </h3>
                  <p> {(String)(diary.creatDt)}</p>
                  <p> {diary.nickname}</p>
                  <br />
                  <div dangerouslySetInnerHTML={{ __html: diary.content }} />
                </div>
                <div className={styles.caroselMusic}>
                  <div className={`bg-[url('https://image.bugsm.co.kr/album/images/130/40780/4078016.jpg')] bg-no-repeat bg-cover animate-[spin_5s_linear_infinite] pause hover:running ${styles.cdBG}`}>
                  </div>
                  <h3 className="text-2xl font-bold"> 음악 제목</h3>
                  <p> 아티스트 이름</p>

                  <div className={styles.musicBar}></div>

                  <div className={styles.musicUIBar}></div>
                </div>
              </div>
              </Link>
            )):null}
          </div>
        </div>

        <div className={styles.caroselDotDiv}></div>

        <div className={`flex justify-between items-center mt-6`}>
        <h2 className="text-2xl font-bold text-sky-400 "> 일기장 모음 </h2>
        <button 
        onClick={()=> setDiaryListType(1)}
        className={`border rounded-[50%] w-[25px] h-[25px] justify-center text-center items-center bg-slate-700 hover:bg-slate-500 duration-200`}> 
        <p className={`text-lg font-bold p-0`}> + </p> 
        </button>
        </div>
        <div className={styles.diarySection}>
          <div className={`grid lg:grid-cols-6 md:grid-cols-4 grid-cols-2 p-2 gap-2`}>
            {diarylists && diarylists.length >0 ?diarylists.map((diaryList,id)=>(
              <Link href={`/diary/list/${diaryList.id}`}>
              <div className={`h-[calc(10vw+40px)] p-2 flex items-center border rounded-xl justify-center flex-col overflow-hidden
               bg-blue-900 hover:bg-blue-500 bg-opacity-70 duration-200
              `}>
                <p>{diaryList.id}</p>
                <p className={`whitespace-nowrap`}>{diaryList.diaryListTitle}</p>
              </div>
              </Link>
            )):null}

            
          </div>
        </div>
      </main>
    </>
  );
}
