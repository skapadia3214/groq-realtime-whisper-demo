'use client'

import React, { ReactNode } from "react";

const Message = ({
  role,
  children,
}: {
  role: "ai" | "user" | string;
  children: ReactNode;
}) => {
  return (
    <>
      {role === "user" ? (
        <div className="max-w-[70%] w-fit p-2 border border-neutral-400 ml-auto text-right">
          {children}
        </div>
      ) : (
        <div className="w-fit p-2 max-w-[70%] text-black border-neutral-400 bg-neutral-300">
          {children}
        </div>
      )}
    </>
  );
};

export default Message;
