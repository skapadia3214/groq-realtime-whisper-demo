import { Message } from "../types";
import React, { MutableRefObject, useEffect } from "react";

const useScroll = (
  messageContainerRef: MutableRefObject<any>,
  history: Message[],
) => {
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [history]);
};

export default useScroll;
