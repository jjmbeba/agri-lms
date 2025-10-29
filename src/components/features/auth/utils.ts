export const authPages = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];
export const publicPages = ["/", "/about-us", "/contact-us"];

export const isPublicPage = (pathname: string) => {
  return publicPages.includes(pathname);
};

// export const checkUserRole = async () => {
//   "use server";

//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   return session?.user.role ?? "learner";
// };
