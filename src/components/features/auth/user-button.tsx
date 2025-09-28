"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const UserButton = () => {
  return (
    <>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
};

export default UserButton;
