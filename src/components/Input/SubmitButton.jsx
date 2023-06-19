import React, { useState } from 'react';
import StopGeneratingIcon from '../svg/StopGeneratingIcon';
import { Settings } from 'lucide-react';
import SetTokenDialog from './SetTokenDialog';
import store from '../../store';

export default function SubmitButton({
  endpoint,
  submitMessage,
  handleStopGenerating,
  disabled,
  isSubmitting,
  endpointsConfig
}) {
  const [setTokenDialogOpen, setSetTokenDialogOpen] = useState(false);
  const { getToken } = store.useToken(endpoint);

  const isTokenProvided = endpointsConfig?.[endpoint]?.userProvide ? !!getToken() : true;

  const clickHandler = (e) => {
    e.preventDefault();
    submitMessage();
  };

  const setToken = () => {
    setSetTokenDialogOpen(true);
  };

  if (isSubmitting)
    return (
      <button
        onClick={handleStopGenerating}
        type="button"
        className="group absolute bottom-0 right-0 flex h-[100%] w-[50px] items-center justify-center bg-transparent p-1 text-gray-500"
      >
        <div className="m-1 mr-0 rounded-md p-2 pb-[10px] pt-[10px] group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
          <StopGeneratingIcon />
        </div>
      </button>
    );
  // // previous three dot animation
  // return (
  //   <button
  //     className="absolute bottom-0 right-1 h-[100%] w-[40px] rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:hover:bg-transparent dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:disabled:hover:bg-transparent md:right-2"
  //     disabled
  //   >
  //     <div className="text-2xl">
  //       <span style={{ maxWidth: 5.5, display: 'inline-grid' }}>·</span>
  //       <span
  //         className="blink"
  //         style={{ maxWidth: 5.5, display: 'inline-grid' }}
  //       >
  //         ·
  //       </span>
  //       <span
  //         className="blink2"
  //         style={{ maxWidth: 5.5, display: 'inline-grid' }}
  //       >
  //         ·
  //       </span>
  //     </div>
  //   </button>
  // );
  else if (!isTokenProvided && endpoint !== 'openAI') {
    return (
      <>
        <button
          onClick={setToken}
          type="button"
          className="group absolute bottom-0 right-0 flex h-[100%] w-auto items-center justify-center bg-transparent p-1 text-gray-500"
        >
          <div className="m-1 mr-0 rounded-md p-2 pb-[10px] pt-[10px] align-middle text-xs group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
            <Settings className="mr-1 inline-block w-[18px]" />
            Set Token First
          </div>
        </button>
        <SetTokenDialog
          open={setTokenDialogOpen}
          onOpenChange={setSetTokenDialogOpen}
          endpoint={endpoint}
        />
      </>
    );
  } else
    return (
      <button
        onClick={clickHandler}
        disabled={disabled}
        className="group absolute bottom-0 right-0 flex h-[100%] w-[50px] items-center justify-center bg-transparent p-1 text-gray-500"
      >
        <div className="m-1 mr-0 rounded-md pt-[11px] pb-[9px] pl-[9.5px] pr-[7px] group-hover:bg-gray-100 group-disabled:hover:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:text-gray-400 dark:group-disabled:hover:bg-transparent">
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 h-4 w-4 "
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
      </button>
    );
}

{
  /* <div class="text-2xl"><span class="">·</span><span class="">·</span><span class="invisible">·</span></div> */
}
