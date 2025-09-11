export const authPages = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];
export const publicPages = ["/"];

export const isPublicPage = (pathname: string) => {
  return publicPages.includes(pathname);
};
