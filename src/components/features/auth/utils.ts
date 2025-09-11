export const authPages = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export const isAuthPage = (pathname: string) => {
  return authPages.includes(pathname);
};
